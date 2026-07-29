import assert from "node:assert/strict";
import test from "node:test";
import { updateProfileSchema } from "@medi/types";

test("updateProfileSchema accepts compressed avatar image data URLs", () => {
  const result = updateProfileSchema.safeParse({
    avatarUrl: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
  });

  assert.equal(result.success, true);
});

test("updateProfileSchema rejects non-image avatar data URLs", () => {
  const result = updateProfileSchema.safeParse({
    avatarUrl: "data:text/html;base64,PGgxPk5vdCBhbiBpbWFnZTwvaDE+",
  });

  assert.equal(result.success, false);
});
