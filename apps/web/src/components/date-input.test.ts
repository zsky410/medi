import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const componentSource = readFileSync(new URL("./date-input.tsx", import.meta.url), "utf8");

test("DateInput displays dd/mm/yyyy while opening the picker in Vietnamese locale", () => {
  assert.match(componentSource, /formatDate\(value\)/);
  assert.match(componentSource, /dd\/mm\/yyyy/);
  assert.match(componentSource, /lang="vi-VN"/);
  assert.match(componentSource, /type="date"/);
});
