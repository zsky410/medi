import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pageSource = readFileSync(new URL("../../app/trips/[tripId]/page.tsx", import.meta.url), "utf8");

test("trip detail page renders the chat launcher as a map overlay", () => {
  assert.match(pageSource, /<TripChatPanel\b/);
  assert.match(pageSource, /shouldShowTripChat\(trip\.members\.length\)/);
  assert.match(pageSource, /className="[^"]*relative[^"]*"/);
});

const panelSource = readFileSync(new URL("./trip-chat-panel.tsx", import.meta.url), "utf8");

test("trip chat panel keeps sender names above message groups and hides per-message time", () => {
  assert.match(panelSource, /isFirstMessageInSenderGroup/);
  assert.doesNotMatch(panelSource, /formatMessageTime/);
  assert.doesNotMatch(panelSource, /createdAt/);
});

test("trip chat launcher supports notification animation", () => {
  assert.match(panelSource, /hasNewMessage/);
  assert.match(panelSource, /animate-chat-notify/);
});
