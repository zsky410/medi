import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("explore page keeps a single destination search control", () => {
  assert.equal((pageSource.match(/<LocationSelect\b/g) ?? []).length, 1);
  assert.doesNotMatch(pageSource, /<input\b/);
  assert.doesNotMatch(pageSource, /const \[search, setSearch\]/);
});

test("explore page uses popular destination chips instead of duration chips", () => {
  assert.doesNotMatch(pageSource, /2-3 ngày|4-5 ngày|1 tuần\+/);
  assert.match(pageSource, /Đà Lạt/);
  assert.match(pageSource, /Đà Nẵng/);
  assert.match(pageSource, /Nha Trang/);
  assert.match(pageSource, /Ninh Bình/);
  assert.match(pageSource, /Hà Nội/);
  assert.match(pageSource, /TP\.HCM/);
  assert.match(pageSource, /Huế/);
});
