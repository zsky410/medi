import assert from "node:assert/strict";
import test from "node:test";

import { cleanupLegacyOfflineArtifacts } from "./legacy-offline-artifacts.ts";

function createRegistration(scriptURL: string) {
  let unregistered = false;

  return {
    registration: {
      active: { scriptURL },
      unregister: async () => {
        unregistered = true;
        return true;
      },
    },
    wasUnregistered: () => unregistered,
  };
}

test("unregisters the legacy medi service worker and deletes its caches", async () => {
  const legacy = createRegistration("http://localhost:3002/sw.js");
  const unrelated = createRegistration("http://localhost:3002/firebase-messaging-sw.js");
  const deletedCaches: string[] = [];

  const summary = await cleanupLegacyOfflineArtifacts({
    registrations: [legacy.registration, unrelated.registration],
    cacheStorage: {
      keys: async () => ["medi-static-v1", "next-data", "medi-static-v2"],
      delete: async (name) => {
        deletedCaches.push(name);
        return true;
      },
    },
  });

  assert.equal(legacy.wasUnregistered(), true);
  assert.equal(unrelated.wasUnregistered(), false);
  assert.deepEqual(deletedCaches, ["medi-static-v1", "medi-static-v2"]);
  assert.deepEqual(summary, {
    unregistered: 1,
    deletedCaches: ["medi-static-v1", "medi-static-v2"],
  });
});

test("ignores unrelated workers and caches", async () => {
  const unrelated = createRegistration("http://localhost:3002/worker.js");
  const deletedCaches: string[] = [];

  const summary = await cleanupLegacyOfflineArtifacts({
    registrations: [unrelated.registration],
    cacheStorage: {
      keys: async () => ["next-data", "images-v1"],
      delete: async (name) => {
        deletedCaches.push(name);
        return true;
      },
    },
  });

  assert.equal(unrelated.wasUnregistered(), false);
  assert.deepEqual(deletedCaches, []);
  assert.deepEqual(summary, {
    unregistered: 0,
    deletedCaches: [],
  });
});
