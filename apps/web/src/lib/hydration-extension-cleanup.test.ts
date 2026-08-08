import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import {
  HYDRATION_EXTENSION_ATTRIBUTES,
  createHydrationExtensionCleanupScript,
} from "./hydration-extension-cleanup";

test("hydration extension cleanup removes known injected attributes", () => {
  const removed: string[] = [];
  const script = createHydrationExtensionCleanupScript();

  vm.runInNewContext(script, {
    document: {
      querySelectorAll(selector: string) {
        assert.equal(selector, `[${HYDRATION_EXTENSION_ATTRIBUTES[0]}]`);

        return [
          {
            removeAttribute(name: string) {
              removed.push(name);
            },
          },
          {
            removeAttribute(name: string) {
              removed.push(name);
            },
          },
        ];
      },
    },
  });

  assert.deepEqual(removed, [
    HYDRATION_EXTENSION_ATTRIBUTES[0],
    HYDRATION_EXTENSION_ATTRIBUTES[0],
  ]);
});

test("hydration extension cleanup is defensive when document APIs fail", () => {
  assert.doesNotThrow(() => {
    vm.runInNewContext(createHydrationExtensionCleanupScript(), {
      document: {
        querySelectorAll() {
          throw new Error("extension modified document");
        },
      },
    });
  });
});

test("hydration extension cleanup removes attributes injected after the initial pass", () => {
  const removed: string[] = [];
  let observerCallback: ((mutations: unknown[]) => void) | null = null;
  const attr = HYDRATION_EXTENSION_ATTRIBUTES[0];

  const attributeNode = {
    nodeType: 1,
    hasAttribute(name: string) {
      assert.equal(name, attr);
      return true;
    },
    removeAttribute(name: string) {
      removed.push(`node:${name}`);
    },
  };
  const addedNode = {
    nodeType: 1,
    querySelectorAll(selector: string) {
      assert.equal(selector, `[${attr}]`);
      return [
        {
          removeAttribute(name: string) {
            removed.push(`child:${name}`);
          },
        },
      ];
    },
  };

  vm.runInNewContext(createHydrationExtensionCleanupScript(), {
    document: {
      documentElement: {},
      querySelectorAll() {
        return [];
      },
    },
    MutationObserver: class {
      constructor(callback: (mutations: unknown[]) => void) {
        observerCallback = callback;
      }
      observe() {}
      disconnect() {}
    },
    setTimeout(callback: () => void) {
      callback();
    },
  });

  const callback = observerCallback as ((mutations: unknown[]) => void) | null;
  assert.ok(callback);
  callback([
    { type: "attributes", attributeName: attr, target: attributeNode },
    { type: "childList", addedNodes: [addedNode] },
  ]);

  assert.deepEqual(removed, [`node:${attr}`, `child:${attr}`]);
});
