import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("./page.tsx", import.meta.url), "utf8");

test("AI page collects destination and starting point before async generation", () => {
  assert.match(pageSource, /\/geo\/autocomplete/);
  assert.match(pageSource, /\/geo\/place/);
  assert.match(pageSource, /selectedDestination/);
  assert.match(pageSource, /selectedStartingPoint/);
  assert.match(pageSource, /destination:/);
  assert.match(pageSource, /startingPoint:/);
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
  assert.match(pageSource, /\/ai\/generations\/\$\{generationId\}/);
  assert.match(pageSource, /RESEARCHING/);
  assert.match(pageSource, /VERIFYING/);
  assert.match(pageSource, /NARRATING/);
  assert.match(pageSource, /startDate/);
  assert.match(pageSource, /endDate/);
  assert.match(pageSource, /research nguồn/i);
  assert.match(pageSource, /xác minh Goong/i);
  assert.match(pageSource, /lọc trùng/i);
});
