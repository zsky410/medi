import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const repoRoot = join(import.meta.dirname, "../../..");

test("admin frontend is separated from the main web app", () => {
  assert.equal(existsSync(join(repoRoot, "apps/admin/package.json")), true);
  assert.equal(existsSync(join(repoRoot, "apps/admin/src/app/page.tsx")), true);
  assert.equal(existsSync(join(repoRoot, "apps/web/src/app/admin/page.tsx")), false);

  const webHeader = readFileSync(join(repoRoot, "apps/web/src/components/app-header.tsx"), "utf8");
  assert.equal(webHeader.includes('href="/admin"'), false);
});
