import assert from "node:assert/strict";
import test from "node:test";
import type { UserDto } from "@medi/types";
import { landingPrimaryCtaPath } from "./landing-cta";

const user = { id: "user-1" } as UserDto;

test("landing primary CTA sends signed-in users to trips", () => {
  assert.equal(landingPrimaryCtaPath({ user, hasStoredSession: false }), "/trips");
});

test("landing primary CTA trusts an in-progress stored session", () => {
  assert.equal(landingPrimaryCtaPath({ user: null, hasStoredSession: true }), "/trips");
});

test("landing primary CTA sends guests to registration", () => {
  assert.equal(landingPrimaryCtaPath({ user: null, hasStoredSession: false }), "/register");
});
