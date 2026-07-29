import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { compressCoverImageDataUrl } from "../src/common/compress-image";

test("compressCoverImageDataUrl converts uploaded images to webp data URLs", async () => {
  const png = await sharp({
    create: {
      width: 80,
      height: 60,
      channels: 4,
      background: "#ff6b35",
    },
  })
    .png()
    .toBuffer();

  const result = await compressCoverImageDataUrl(`data:image/png;base64,${png.toString("base64")}`);

  assert.equal(typeof result, "string");
  assert.ok(result?.startsWith("data:image/webp;base64,"));
});
