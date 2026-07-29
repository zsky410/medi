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
