import assert from "node:assert/strict";
import test from "node:test";
import { sendTripMessageSchema } from "./chat";

test("sendTripMessageSchema trims non-empty chat messages", () => {
  const input = sendTripMessageSchema.parse({ body: "  Hẹn nhau ở cổng chính nhé  " });

  assert.deepEqual(input, { body: "Hẹn nhau ở cổng chính nhé" });
});

test("sendTripMessageSchema rejects blank and overly long messages", () => {
  assert.throws(() => sendTripMessageSchema.parse({ body: "   " }), /Tin nhắn không được để trống/);
  assert.throws(() => sendTripMessageSchema.parse({ body: "a".repeat(1001) }), /Tin nhắn tối đa 1000 ký tự/);
});
