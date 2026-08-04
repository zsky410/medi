import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("AI page collects destination-based trip constraints before generation", () => {
  assert.match(pageSource, /\/geo\/autocomplete/);
  assert.match(pageSource, /\/geo\/place/);
  assert.match(pageSource, /selectedDestination/);
  assert.match(pageSource, /destination:/);
  assert.match(pageSource, /import \{ DateInput \} from "@\/components\/date-input"/);
  assert.match(pageSource, /<DateInput[\s\S]*id="ai-start-date"/);
  assert.match(pageSource, /<DateInput[\s\S]*id="ai-end-date"/);
  assert.doesNotMatch(pageSource, /type="date"/);
  assert.match(pageSource, /totalBudget/);
  assert.match(pageSource, /people/);
  assert.match(pageSource, /interests/);
  assert.match(pageSource, /pace/);
  assert.match(pageSource, /textarea/);
  assert.match(pageSource, /notes/);
  assert.match(pageSource, /\/ai\/generate-trip/);
  assert.match(pageSource, /startDate/);
  assert.match(pageSource, /endDate/);
  assert.match(pageSource, /Hiểu yêu cầu/);
  assert.match(pageSource, /Xác minh địa điểm/);
  assert.match(pageSource, /Tối ưu lộ trình/);
  assert.match(pageSource, /web research/i);
});
