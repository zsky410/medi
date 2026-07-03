import assert from "node:assert/strict";
import test from "node:test";

import {
  applyTokensIfUnchanged,
  captureSessionSnapshot,
  clearTokensIfUnchanged,
  type TokenStorageLike,
} from "./session-tokens.ts";

function createStorage(seed: Record<string, string> = {}): TokenStorageLike {
  const store = new Map(Object.entries(seed));
  return {
    getItem(key) {
      return store.get(key) ?? null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

test("does not clear a newer session when a stale request finishes later", () => {
  const storage = createStorage({ "medi.access": "old-access", "medi.refresh": "old-refresh" });
  const snapshot = captureSessionSnapshot(storage);

  storage.setItem("medi.access", "new-access");
  storage.setItem("medi.refresh", "new-refresh");

  assert.equal(clearTokensIfUnchanged(storage, snapshot), false);
  assert.equal(storage.getItem("medi.access"), "new-access");
  assert.equal(storage.getItem("medi.refresh"), "new-refresh");
});

test("does not overwrite a newer session with stale refresh results", () => {
  const storage = createStorage({ "medi.access": "old-access", "medi.refresh": "old-refresh" });
  const snapshot = captureSessionSnapshot(storage);

  storage.setItem("medi.access", "fresh-access");
  storage.setItem("medi.refresh", "fresh-refresh");

  assert.equal(applyTokensIfUnchanged(storage, snapshot, "refreshed-access", "refreshed-refresh"), false);
  assert.equal(storage.getItem("medi.access"), "fresh-access");
  assert.equal(storage.getItem("medi.refresh"), "fresh-refresh");
});
