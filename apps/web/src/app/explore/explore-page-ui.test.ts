import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("explore page keeps a single destination search control", () => {
  assert.equal((pageSource.match(/<LocationSelect\b/g) ?? []).length, 1);
  assert.doesNotMatch(pageSource, /<input\b/);
  assert.doesNotMatch(pageSource, /const \[search, setSearch\]/);
});
