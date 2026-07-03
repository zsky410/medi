import sharp from "sharp";

const DATA_URL_RE = /^data:image\/[a-zA-Z+]+;base64,(.+)$/;

export interface ServerCompressOptions {
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
  initialQuality: number;
  minQuality: number;
}

export const COVER_IMAGE_PRESET: ServerCompressOptions = {
  maxWidth: 640,
  maxHeight: 360,
  maxBytes: 120_000,
  initialQuality: 72,
  minQuality: 42,
};

function isDataUrlImage(value: string): boolean {
  return value.startsWith("data:image/");
}

/** Resize & re-encode uploaded cover images before persisting to the database. */
export async function compressCoverImageDataUrl(
  input: string | null | undefined,
  options: ServerCompressOptions = COVER_IMAGE_PRESET,
): Promise<string | null | undefined> {
  if (input == null) return input;
  if (!isDataUrlImage(input)) return input;

  const match = input.match(DATA_URL_RE);
  if (!match) return input;

  const source = Buffer.from(match[1], "base64");

  async function encode(width: number, height: number, quality: number): Promise<Buffer> {
    return sharp(source)
      .rotate()
      .resize({ width, height, fit: "cover", withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  }

  let quality = options.initialQuality;
  let result = await encode(options.maxWidth, options.maxHeight, quality);

  while (result.length > options.maxBytes && quality > options.minQuality) {
    quality -= 8;
    result = await encode(options.maxWidth, options.maxHeight, quality);
  }

  if (result.length > options.maxBytes) {
    result = await encode(
      Math.round(options.maxWidth * 0.75),
      Math.round(options.maxHeight * 0.75),
      options.minQuality,
    );
  }

  return `data:image/jpeg;base64,${result.toString("base64")}`;
}
