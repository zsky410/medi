export interface CompressImageOptions {
  /** Max width in pixels (keeps aspect ratio). */
  maxWidth: number;
  /** Max height in pixels (keeps aspect ratio). */
  maxHeight: number;
  /** Target max output size in bytes (base64 string length proxy). */
  maxBytes: number;
  /** Initial WebP quality 0-1. */
  initialQuality: number;
  /** Minimum WebP quality before giving up. */
  minQuality: number;
}

export interface CompressImageResult {
  dataUrl: string;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
}

/** Presets tuned for DB storage: client uploads are resized and encoded as WebP. */
export const IMAGE_PRESETS = {
  avatar: {
    maxWidth: 256,
    maxHeight: 256,
    maxBytes: 36_000,
    initialQuality: 0.7,
    minQuality: 0.36,
  },
  tripCover: {
    maxWidth: 640,
    maxHeight: 360,
    maxBytes: 120_000,
    initialQuality: 0.72,
    minQuality: 0.38,
  },
} as const satisfies Record<string, CompressImageOptions>;

const DATA_URL_RE = /^data:image\/[a-zA-Z+]+;base64,/;
const OUTPUT_MIME_TYPE = "image/webp";

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

function encodeCanvasAsWebp(canvas: HTMLCanvasElement, quality: number): string {
  const output = canvas.toDataURL(OUTPUT_MIME_TYPE, quality);
  if (!output.startsWith(`data:${OUTPUT_MIME_TYPE};base64,`)) {
    throw new Error("Trình duyệt không hỗ trợ tối ưu ảnh WebP.");
  }
  return output;
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
  let output = encodeCanvasAsWebp(canvas, quality);

  while (estimateBytesFromDataUrl(output) > options.maxBytes && quality > options.minQuality) {
    quality = Math.max(options.minQuality, quality - 0.08);
    output = encodeCanvasAsWebp(canvas, quality);
  }

  // Last resort: shrink dimensions further
  if (estimateBytesFromDataUrl(output) > options.maxBytes) {
    const smaller = fitInside(width, height, Math.round(width * 0.75), Math.round(height * 0.75));
    canvas.width = smaller.width;
    canvas.height = smaller.height;
    ctx.drawImage(img, 0, 0, smaller.width, smaller.height);
    output = encodeCanvasAsWebp(canvas, options.minQuality);
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

/** Compress an image file for upload (resize + WebP re-encode). */
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
