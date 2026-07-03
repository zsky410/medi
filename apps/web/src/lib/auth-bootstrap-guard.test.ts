import assert from "node:assert/strict";
import test from "node:test";

import { createAuthBootstrapGuard } from "./auth-bootstrap-guard.ts";

test("invalidates an in-flight bootstrap when a newer auth mutation starts", () => {
  const guard = createAuthBootstrapGuard();
  const bootstrapSnapshot = guard.capture();

  guard.invalidate();

  assert.equal(guard.isCurrent(bootstrapSnapshot), false);
});

test("keeps only the latest snapshot current", () => {
  const guard = createAuthBootstrapGuard();

  const initial = guard.capture();
  assert.equal(guard.isCurrent(initial), true);

  guard.invalidate();
  const latest = guard.capture();

  assert.equal(guard.isCurrent(initial), false);
  assert.equal(guard.isCurrent(latest), true);
});
