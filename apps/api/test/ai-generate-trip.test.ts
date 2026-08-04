import assert from "node:assert/strict";
import test from "node:test";
import type { GenerateTripInput } from "@medi/types";
import { AiService } from "../src/ai/ai.service";
import type { AiProvider, GeneratedTripPlan } from "../src/ai/ai.providers";

function config(values: Record<string, string | undefined> = {}) {
  return {
    get: <T = string>(key: string): T | undefined => values[key] as T | undefined,
  };
}

function createGeoStub() {
  const details = new Map([
    [
      "goong:dest",
      {
        providerId: "goong:dest",
        name: "Đà Lạt",
        address: "Lâm Đồng",
        lat: 11.9404,
        lng: 108.4583,
        category: "locality",
      },
    ],
    [
      "goong:coffee",
      {
        providerId: "goong:coffee",
        name: "La Viet Coffee",
        address: "Nguyễn Công Trứ, Đà Lạt",
        lat: 11.9504,
        lng: 108.445,
        category: "cafe",
      },
    ],
    [
      "goong:lake",
      {
        providerId: "goong:lake",
        name: "Hồ Xuân Hương",
        address: "Trung tâm Đà Lạt",
        lat: 11.9416,
        lng: 108.4441,
        category: "tourist_attraction",
      },
    ],
    [
      "goong:market",
      {
        providerId: "goong:market",
        name: "Chợ đêm Đà Lạt",
        address: "Nguyễn Thị Minh Khai, Đà Lạt",
        lat: 11.9427,
        lng: 108.4358,
        category: "restaurant",
      },
    ],
    [
      "goong:garden",
      {
        providerId: "goong:garden",
        name: "Vườn hoa Đà Lạt",
        address: "Trần Quốc Toản, Đà Lạt",
        lat: 11.9462,
        lng: 108.4528,
        category: "tourist_attraction",
      },
    ],
  ]);

  return {
    autocomplete: async (query: string) => {
      if (query.toLowerCase().includes("đà lạt")) {
        return [
          { providerId: "goong:coffee", name: "La Viet Coffee", address: "Đà Lạt", category: "cafe" },
          { providerId: "goong:lake", name: "Hồ Xuân Hương", address: "Đà Lạt", category: "tourist_attraction" },
          { providerId: "goong:market", name: "Chợ đêm Đà Lạt", address: "Đà Lạt", category: "restaurant" },
          { providerId: "goong:garden", name: "Vườn hoa Đà Lạt", address: "Đà Lạt", category: "tourist_attraction" },
        ];
      }
      return [];
    },
    resolve: async (providerId: string) => {
      const detail = details.get(providerId);
      if (!detail) throw new Error(`Missing detail for ${providerId}`);
      return detail;
    },
    distanceMatrix: async () => null,
  };
}

function createPrismaStub() {
  const state: {
    transactionUsed: boolean;
    tripCreateData?: Record<string, unknown>;
    placeCreateManyData?: Record<string, unknown>[];
    checklistCreateManyData?: Record<string, unknown>[];
  } = {
    transactionUsed: false,
  };
  const days = [
    { id: "day-1", order: 0 },
    { id: "day-2", order: 1 },
    { id: "day-3", order: 2 },
  ];

  const prisma = {
    user: {
      findUniqueOrThrow: async () => ({
        id: "user-1",
        plan: "FREE",
        aiGenerationsDate: null,
        aiGenerationsCount: 0,
      }),
      update: async () => ({}),
    },
    trip: {
      create: async (args: { data: Record<string, unknown> }) => {
        state.tripCreateData = args.data;
        return {
          id: "trip-1",
          title: args.data.title,
          destination: args.data.destination,
          days,
        };
      },
    },
    placeCatalog: {
      findMany: async () => [
        {
          id: "catalog-lake",
          providerId: "goong:lake",
          name: "Hồ Xuân Hương",
          address: "Trung tâm Đà Lạt",
          lat: 11.9416,
          lng: 108.4441,
          category: "ATTRACTION",
          sourceMetadata: { source: "seed" },
          qualityScore: 0.8,
          expiresAt: null,
        },
      ],
      upsert: async (args: { create: Record<string, unknown>; update: Record<string, unknown> }) => ({
        id: args.create.providerId === "goong:lake" ? "catalog-lake" : `catalog-${args.create.providerId}`,
        ...args.create,
        ...args.update,
      }),
    },
    place: {
      createMany: async (args: { data: Record<string, unknown>[] }) => {
        state.placeCreateManyData = args.data;
        return { count: args.data.length };
      },
    },
    checklistItem: {
      createMany: async (args: { data: Record<string, unknown>[] }) => {
        state.checklistCreateManyData = args.data;
        return { count: args.data.length };
      },
    },
    $transaction: async (arg: ((tx: typeof prisma) => Promise<unknown>) | Promise<unknown>[]) => {
      state.transactionUsed = true;
      if (typeof arg === "function") return arg(prisma);
      return Promise.all(arg);
    },
  };

  return { prisma, state };
}

test("generateTrip resolves provider-backed places and persists the plan transactionally", async () => {
  const { prisma, state } = createPrismaStub();
  const geo = createGeoStub();
  let legacyGenerateTripCalls = 0;
  const throwingProvider: AiProvider = {
    name: "mock",
    generateTrip: async (): Promise<GeneratedTripPlan> => {
      legacyGenerateTripCalls += 1;
      throw new Error("legacy prompt-to-place generation must not run");
    },
    suggestPlaces: async () => [],
    optimizeRouteOrder: () => [],
  };
  const service = new AiService(
    prisma as never,
    config({
      AI_WEB_RESEARCH_ENABLED: "false",
      PLACE_SEARCH_MAX_CANDIDATES: "12",
      TRIP_DEFAULT_PACE: "balanced",
    }) as never,
    geo as never,
  );
  (service as unknown as { provider: AiProvider }).provider = throwingProvider;

  const result = await service.generateTrip("user-1", {
    destination: {
      placeId: "goong:dest",
      name: "Đà Lạt",
      address: "Lâm Đồng",
    },
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    totalBudget: 5000000,
    people: 2,
    interests: ["coffee", "photo", "local-food"],
    description: "Muốn lịch chill và có cà phê",
    pace: "balanced",
  } as GenerateTripInput);

  assert.equal(legacyGenerateTripCalls, 0);
  assert.equal(result.tripId, "trip-1");
  assert.equal(state.transactionUsed, true);
  assert.equal(((state.tripCreateData?.days as { create: unknown[] }).create).length, 2);
  assert.equal((state.tripCreateData?.startDate as Date).toISOString(), "2026-08-10T00:00:00.000Z");
  assert.equal((state.tripCreateData?.endDate as Date).toISOString(), "2026-08-11T00:00:00.000Z");
  assert.equal(state.tripCreateData?.budgetAmount, 5000000);

  const metadata = state.tripCreateData?.generationMetadata as {
    candidateCounts: Record<string, number>;
    fallbacks: string[];
    usedDistanceMatrix: boolean;
  };
  assert.equal(metadata.usedDistanceMatrix, false);
  assert.equal(metadata.candidateCounts.goong > 0, true);
  assert.equal(metadata.candidateCounts.aiWeb, 0);
  assert.equal(metadata.fallbacks.includes("ai_web_research_disabled"), true);

  const places = state.placeCreateManyData ?? [];
  assert.equal(places.length > 0, true);
  assert.equal(places.every((place) => String(place.providerId).startsWith("goong:")), true);
  assert.equal(places.every((place) => typeof place.placeCatalogId === "string"), true);
  assert.equal(places.every((place) => typeof place.generationScore === "number"), true);
  assert.equal(places.some((place) => place.name === "La Viet Coffee"), true);
  assert.equal((state.checklistCreateManyData ?? []).length > 0, true);
});
