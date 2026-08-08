import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./[tripId]/page.tsx", import.meta.url), "utf8");

test("public trip SSR fetch uses the server API origin instead of the browser proxy path", () => {
  assert.match(pageSource, /process\.env\.API_URL/);
  assert.doesNotMatch(pageSource, /const API_URL = process\.env\.NEXT_PUBLIC_API_URL/);
});
