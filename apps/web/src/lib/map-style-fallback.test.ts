import assert from "node:assert/strict";
import test from "node:test";
import { shouldFallbackToOsmMapStyle } from "./map-style-fallback";

test("shouldFallbackToOsmMapStyle ignores transient Goong tile failures after style load", () => {
  assert.equal(
    shouldFallbackToOsmMapStyle({
      isFallbackStyle: false,
      hasLoadedGoongStyle: true,
      errorText:
        "net::ERR_ABORTED https://tiles.goong.io/tiles/base/10/820/477.pbf?api_key=redacted",
    }),
    false,
  );
});

test("shouldFallbackToOsmMapStyle falls back when the Goong style fails before loading", () => {
  assert.equal(
    shouldFallbackToOsmMapStyle({
      isFallbackStyle: false,
      hasLoadedGoongStyle: false,
      errorText:
        "Failed to fetch https://tiles.goong.io/assets/goong_map_web.json?api_key=redacted",
    }),
    true,
  );
});

test("shouldFallbackToOsmMapStyle ignores unrelated map errors", () => {
  assert.equal(
    shouldFallbackToOsmMapStyle({
      isFallbackStyle: false,
      hasLoadedGoongStyle: false,
      errorText: 'Image "café" could not be loaded',
    }),
    false,
  );
});
