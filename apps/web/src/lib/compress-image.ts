export interface CompressImageOptions {
  /** Max width in pixels (keeps aspect ratio). */
  maxWidth: number;
  /** Max height in pixels (keeps aspect ratio). */
  maxHeight: number;
  /** Target max output size in bytes (base64 string length proxy). */
  maxBytes: number;
  /** Initial JPEG quality 0–1. */
  initialQuality: number;
  /** Minimum JPEG quality before giving up. */
  minQuality: number;
}

export interface CompressImageResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}

/** Presets tuned for DB storage — cover thumbnails on trip cards. */
export const IMAGE_PRESETS = {
  tripCover: {
    maxWidth: 640,
    maxHeight: 360,
    maxBytes: 120_000,
    initialQuality: 0.72,
    minQuality: 0.38,
  },
} as const satisfies Record<string, CompressImageOptions>;

const DATA_URL_RE = /^data:image\/[a-zA-Z+]+;base64,/;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Không đọc được ảnh"));
    img.src = src;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Không đọc được file"));
    reader.readAsDataURL(file);
  });
}

function fitInside(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function estimateBytesFromDataUrl(dataUrl: string): number {
  const base64 = dataUrl.replace(DATA_URL_RE, "");
  return Math.round((base64.length * 3) / 4);
}

async function compressDataUrl(
  dataUrl: string,
  options: CompressImageOptions,
  originalBytes: number,
): Promise<CompressImageResult> {
  const img = await loadImage(dataUrl);
  const { width, height } = fitInside(img.width, img.height, options.maxWidth, options.maxHeight);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không nén được ảnh");

  ctx.drawImage(img, 0, 0, width, height);

  let quality = options.initialQuality;
  let output = canvas.toDataURL("image/jpeg", quality);

  while (estimateBytesFromDataUrl(output) > options.maxBytes && quality > options.minQuality) {
    quality = Math.max(options.minQuality, quality - 0.08);
    output = canvas.toDataURL("image/jpeg", quality);
  }

  // Last resort: shrink dimensions further
  if (estimateBytesFromDataUrl(output) > options.maxBytes) {
    const smaller = fitInside(width, height, Math.round(width * 0.75), Math.round(height * 0.75));
    canvas.width = smaller.width;
    canvas.height = smaller.height;
    ctx.drawImage(img, 0, 0, smaller.width, smaller.height);
    output = canvas.toDataURL("image/jpeg", options.minQuality);
  }

  const compressedBytes = estimateBytesFromDataUrl(output);
  if (compressedBytes > options.maxBytes * 1.15) {
    throw new Error("Ảnh vẫn quá nặng sau khi nén. Hãy chọn ảnh nhỏ hơn.");
  }

  return {
    dataUrl: output,
    originalBytes,
    compressedBytes,
    width: canvas.width,
    height: canvas.height,
  };
}

/** Compress an image file for upload (resize + JPEG re-encode). */
export async function compressImageFile(
  file: File,
  options: CompressImageOptions = IMAGE_PRESETS.tripCover,
): Promise<CompressImageResult> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Chỉ hỗ trợ file ảnh (JPG, PNG, WEBP...)");
  }

  const dataUrl = await readFileAsDataUrl(file);
  return compressDataUrl(dataUrl, options, file.size);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
