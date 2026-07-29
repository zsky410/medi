import assert from "node:assert/strict";
import test from "node:test";
import { BadRequestException } from "@nestjs/common";
import { ShopService } from "../src/shop/shop.service";
import { TripsService } from "../src/trips/trips.service";

const date = new Date("2026-07-30T00:00:00.000Z");

test("publishing a paid guide moves the source trip out of the free explore pool", async () => {
  const tripUpdates: unknown[] = [];
  const prisma = {
    trip: {
      findUnique: async () => ({
        id: "trip-1",
        ownerId: "creator-1",
        visibility: "PUBLIC",
        members: [{ userId: "creator-1", role: "OWNER" }],
      }),
      update: async (args: unknown) => {
        tripUpdates.push(args);
      },
    },
    guide: {
      findFirst: async () => null,
      create: async () => ({
        id: "guide-1",
        title: "Da Nang food guide",
        description: null,
        price: 99000,
        currency: "VND",
        published: true,
        purchaseCount: 0,
        createdAt: date,
        creator: { id: "creator-1", name: "Creator" },
        trip: {
          id: "trip-1",
          destination: "Da Nang",
          coverImage: null,
          _count: { days: 3, places: 12 },
        },
        purchases: [],
      }),
    },
  };
  const service = new ShopService(prisma as never, {} as never);

  await service.publish("creator-1", {
    tripId: "trip-1",
    title: "Da Nang food guide",
    price: 99000,
    currency: "VND",
  });

  assert.deepEqual(tripUpdates, [
    {
      where: { id: "trip-1" },
      data: { distributionMode: "SHOP_PAID" },
    },
  ]);
});

test("Explore only lists public trips that still allow free cloning", async () => {
  let publicWhere: unknown;
  const prisma = {
    trip: {
      findMany: async (args: { where: unknown }) => {
        publicWhere = args.where;
        return [];
      },
      count: async (args: { where: unknown }) => {
        assert.deepEqual(args.where, publicWhere);
        return 0;
      },
    },
  };
  const service = new TripsService(prisma as never, {} as never);

  await service.listPublic({ sort: "cloneCount", limit: 24, offset: 0 });

  assert.deepEqual(publicWhere, {
    visibility: "PUBLIC",
    distributionMode: "EXPLORE_FREE",
  });
});

test("my trips include trips owned by the user even when membership is missing", async () => {
  let listMineWhere: unknown;
  const prisma = {
    trip: {
      findMany: async (args: { where: unknown }) => {
        listMineWhere = args.where;
        return [];
      },
    },
  };
  const service = new TripsService(prisma as never, {} as never);

  await service.listMine("creator-1");

  assert.deepEqual(listMineWhere, {
    OR: [
      { ownerId: "creator-1" },
      { members: { some: { userId: "creator-1" } } },
    ],
  });
});

test("free public clone is blocked after a trip becomes a shop guide", async () => {
  const prisma = {
    trip: {
      findUnique: async () => ({
        id: "trip-1",
        ownerId: "creator-1",
        visibility: "PUBLIC",
        distributionMode: "SHOP_PAID",
        members: [],
        checklist: [],
        days: [],
        places: [],
      }),
      create: async () => {
        throw new Error("shop trips must not be cloned through the free trip endpoint");
      },
    },
  };
  const service = new TripsService(prisma as never, {} as never);

  await assert.rejects(
    () => service.clone("trip-1", "buyer-1"),
    (err) =>
      err instanceof BadRequestException &&
      err.message === "Guide này đang được phân phối qua Creator Shop. Hãy lấy guide trong Shop.",
  );
});

test("shop purchase can still clone a monetized source trip", async () => {
  const clonedTripId = "clone-1";
  const trips = {
    clone: async (tripId: string, userId: string, options?: { allowShopSource?: boolean }) => {
      assert.equal(tripId, "trip-1");
      assert.equal(userId, "buyer-1");
      assert.deepEqual(options, { allowShopSource: true });
      return { id: clonedTripId };
    },
  };
  const prisma = {
    guide: {
      findUnique: async () => ({
        id: "guide-1",
        creatorId: "creator-1",
        tripId: "trip-1",
        price: 99000,
        currency: "VND",
        published: true,
        trip: { id: "trip-1", distributionMode: "SHOP_PAID" },
      }),
      update: async () => undefined,
    },
    guidePurchase: {
      findUnique: async () => null,
      upsert: async () => undefined,
    },
  };
  const service = new ShopService(prisma as never, trips as never);

  const result = await service.purchase("buyer-1", "guide-1");

  assert.deepEqual(result, {
    guideId: "guide-1",
    clonedTripId,
    provider: "mock",
  });
});

test("unpublishing a guide returns the source trip to free explore cloning", async () => {
  const tripUpdates: unknown[] = [];
  const prisma = {
    guide: {
      findUnique: async () => ({
        id: "guide-1",
        creatorId: "creator-1",
        tripId: "trip-1",
        price: 99000,
      }),
      update: async () => ({
        id: "guide-1",
        title: "Da Nang food guide",
        description: null,
        price: 0,
        currency: "VND",
        published: false,
        purchaseCount: 3,
        createdAt: date,
        creator: { id: "creator-1", name: "Creator" },
        trip: {
          id: "trip-1",
          destination: "Da Nang",
          coverImage: null,
          _count: { days: 3, places: 12 },
        },
        purchases: [],
      }),
    },
    trip: {
      update: async (args: unknown) => {
        tripUpdates.push(args);
      },
    },
  };
  const service = new ShopService(prisma as never, {} as never);

  await service.update("creator-1", "guide-1", { price: 0, published: false });

  assert.deepEqual(tripUpdates, [
    {
      where: { id: "trip-1" },
      data: { distributionMode: "EXPLORE_FREE" },
    },
  ]);
});
