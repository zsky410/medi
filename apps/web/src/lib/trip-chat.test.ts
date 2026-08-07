import assert from "node:assert/strict";
import test from "node:test";
import type { TripMessageDto } from "@medi/types";
import {
  appendTripMessage,
  getTripChatExpiryDelay,
  isFirstMessageInSenderGroup,
  pruneExpiredTripMessages,
  shouldShowTripChat,
} from "./trip-chat";

const baseMessage: TripMessageDto = {
  id: "msg-1",
  tripId: "trip-1",
  senderId: "user-1",
  body: "Gặp nhau ở ga nhé",
  createdAt: "2026-08-07T10:00:00.000Z",
  sender: { id: "user-1", name: "Bao", email: "bao@example.com", avatarUrl: null },
};

test("shouldShowTripChat only enables chat for collaborative trips", () => {
  assert.equal(shouldShowTripChat(1), false);
  assert.equal(shouldShowTripChat(2), true);
});

test("appendTripMessage appends new messages and skips duplicates", () => {
  assert.deepEqual(appendTripMessage([], baseMessage), [baseMessage]);
  assert.deepEqual(appendTripMessage([baseMessage], baseMessage), [baseMessage]);
  assert.deepEqual(appendTripMessage([baseMessage], { ...baseMessage, id: "msg-2" }), [
    baseMessage,
    { ...baseMessage, id: "msg-2" },
  ]);
});

test("isFirstMessageInSenderGroup only labels the first message from a sender streak", () => {
  const messages = [
    baseMessage,
    { ...baseMessage, id: "msg-2", body: "Mình tới sau 5 phút" },
    { ...baseMessage, id: "msg-3", senderId: "user-2", sender: { ...baseMessage.sender, id: "user-2" } },
  ];

  assert.equal(isFirstMessageInSenderGroup(messages, 0), true);
  assert.equal(isFirstMessageInSenderGroup(messages, 1), false);
  assert.equal(isFirstMessageInSenderGroup(messages, 2), true);
});

test("trip chat messages expire 15 minutes after the newest message", () => {
  const messages = [
    baseMessage,
    { ...baseMessage, id: "msg-2", createdAt: "2026-08-07T10:10:00.000Z" },
  ];

  assert.deepEqual(pruneExpiredTripMessages(messages, new Date("2026-08-07T10:24:59.000Z")), messages);
  assert.deepEqual(pruneExpiredTripMessages(messages, new Date("2026-08-07T10:25:00.000Z")), []);
  assert.equal(getTripChatExpiryDelay(messages, new Date("2026-08-07T10:24:50.000Z")), 10_000);
});
