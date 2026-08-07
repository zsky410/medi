import assert from "node:assert/strict";
import test from "node:test";
import { NotFoundException } from "@nestjs/common";
import { TripMessagesService } from "../src/trips/trip-messages.service";

const createdAt = new Date("2026-08-07T10:15:00.000Z");

test("VIEWER members can send trip chat messages", async () => {
  const accessCalls: unknown[] = [];
  const createdMessages: unknown[] = [];
  const prisma = {
    tripMessage: {
      findFirst: async () => null,
      create: async (args: unknown) => {
        createdMessages.push(args);
        return {
          id: "msg-1",
          tripId: "trip-1",
          senderId: "viewer-1",
          body: "Có ai đang ở sân bay chưa?",
          createdAt,
          sender: { id: "viewer-1", name: "Viewer", email: "viewer@example.com", avatarUrl: null },
        };
      },
    },
  };
  const access = {
    assertRole: async (...args: unknown[]) => {
      accessCalls.push(args);
      return "VIEWER";
    },
  };
  const service = new TripMessagesService(prisma as never, access as never);

  const message = await service.create("trip-1", "viewer-1", { body: "Có ai đang ở sân bay chưa?" });

  assert.deepEqual(accessCalls, [["trip-1", "viewer-1", "VIEWER"]]);
  assert.deepEqual(createdMessages, [
    {
      data: { tripId: "trip-1", senderId: "viewer-1", body: "Có ai đang ở sân bay chưa?" },
      include: { sender: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    },
  ]);
  assert.deepEqual(message, {
    id: "msg-1",
    tripId: "trip-1",
    senderId: "viewer-1",
    body: "Có ai đang ở sân bay chưa?",
    createdAt: "2026-08-07T10:15:00.000Z",
    sender: { id: "viewer-1", name: "Viewer", email: "viewer@example.com", avatarUrl: null },
  });
});

test("non-members cannot list trip chat messages", async () => {
  const prisma = {
    tripMessage: {
      findFirst: async () => null,
      findMany: async () => {
        throw new Error("non-members must not query messages");
      },
    },
  };
  const access = {
    assertRole: async () => {
      throw new NotFoundException("Không tìm thấy chuyến đi");
    },
  };
  const service = new TripMessagesService(prisma as never, access as never);

  await assert.rejects(
    () => service.list("trip-1", "outsider-1", {}),
    (err) => err instanceof NotFoundException && err.message === "Không tìm thấy chuyến đi",
  );
});

test("trip chat messages are listed newest page with sender dto", async () => {
  let findArgs: unknown;
  const prisma = {
    tripMessage: {
      findFirst: async () => null,
      findMany: async (args: unknown) => {
        findArgs = args;
        return [
          {
            id: "msg-2",
            tripId: "trip-1",
            senderId: "user-2",
            body: "Mình tới rồi",
            createdAt,
            sender: { id: "user-2", name: "Bao", email: "bao@example.com", avatarUrl: "https://example.com/a.png" },
          },
        ];
      },
    },
  };
  const access = { assertRole: async () => "VIEWER" };
  const service = new TripMessagesService(prisma as never, access as never);

  const messages = await service.list("trip-1", "user-1", { limit: 30, cursor: "cursor-msg" });

  assert.deepEqual(findArgs, {
    where: { tripId: "trip-1" },
    orderBy: { createdAt: "desc" },
    take: 30,
    cursor: { id: "cursor-msg" },
    skip: 1,
    include: { sender: { select: { id: true, name: true, email: true, avatarUrl: true } } },
  });
  assert.deepEqual(messages, [
    {
      id: "msg-2",
      tripId: "trip-1",
      senderId: "user-2",
      body: "Mình tới rồi",
      createdAt: "2026-08-07T10:15:00.000Z",
      sender: { id: "user-2", name: "Bao", email: "bao@example.com", avatarUrl: "https://example.com/a.png" },
    },
  ]);
});

test("trip chat is cleared when the newest message is at least 15 minutes old", async () => {
  const calls: unknown[] = [];
  const prisma = {
    tripMessage: {
      findFirst: async () => ({ createdAt: new Date("2026-08-07T10:00:00.000Z") }),
      deleteMany: async (args: unknown) => {
        calls.push(args);
      },
      findMany: async () => [],
    },
  };
  const access = { assertRole: async () => "VIEWER" };
  const service = new TripMessagesService(prisma as never, access as never);
  (service as unknown as { clock: { now: () => Date } }).clock = {
    now: () => new Date("2026-08-07T10:15:00.000Z"),
  };

  const messages = await service.list("trip-1", "user-1", {});

  assert.deepEqual(calls, [{ where: { tripId: "trip-1" } }]);
  assert.deepEqual(messages, []);
});
