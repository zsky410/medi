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
      "goong:start",
      {
        providerId: "goong:start",
        name: "Khách sạn trung tâm",
        address: "Phường 1, Đà Lạt",
        lat: 11.941,
        lng: 108.437,
        category: "lodging",
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
    jobCreateData?: Record<string, unknown>;
    jobUpdates: Array<{ data: Record<string, unknown>; inTransaction: boolean }>;
    jobs: Map<string, Record<string, unknown>>;
    inTransaction: boolean;
    tripCreateData?: Record<string, unknown>;
    placeCreateManyData?: Record<string, unknown>[];
    checklistCreateManyData?: Record<string, unknown>[];
  } = {
    transactionUsed: false,
    jobUpdates: [],
    jobs: new Map(),
    inTransaction: false,
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
    aiTripGenerationJob: {
      create: async (args: { data: Record<string, unknown> }) => {
        state.jobCreateData = args.data;
        const job = {
          id: "generation-1",
          userId: args.data.userId,
          input: args.data.input,
          status: args.data.status ?? "QUEUED",
          stage: args.data.stage ?? "QUEUED",
          progress: args.data.progress ?? 0,
          resultTripId: null,
          errorMessage: null,
          metadata: args.data.metadata ?? {},
          startedAt: null,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.jobs.set(String(job.id), job);
        return job;
      },
      findUnique: async (args: { where: { id: string } }) => state.jobs.get(args.where.id) ?? null,
      findFirst: async (args: { where?: { id?: string; userId?: string } }) => {
        const rows = [...state.jobs.values()];
        return rows.find((job) => {
          if (args.where?.id && job.id !== args.where.id) return false;
          if (args.where?.userId && job.userId !== args.where.userId) return false;
          return true;
        }) ?? null;
      },
      update: async (args: { where: { id: string }; data: Record<string, unknown> }) => {
        const existing = state.jobs.get(args.where.id);
        if (!existing) throw new Error("job not found");
        const next = { ...existing, ...args.data, updatedAt: new Date() };
        state.jobs.set(args.where.id, next);
        state.jobUpdates.push({ data: args.data, inTransaction: state.inTransaction });
        return next;
      },
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
      if (typeof arg === "function") {
        state.inTransaction = true;
        try {
          return await arg(prisma);
        } finally {
          state.inTransaction = false;
        }
      }
      return Promise.all(arg);
    },
  };

  return { prisma, state };
}

test("generateTrip enqueues a job and the worker persists the plan transactionally", async () => {
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
      AI_ALLOW_GOONG_ONLY_FALLBACK: "true",
      AI_TRIP_WORKER_AUTOSTART: "false",
      PLACE_SEARCH_MAX_CANDIDATES: "12",
      TRIP_DEFAULT_PACE: "balanced",
    }) as never,
    geo as never,
  );
  (service as unknown as { provider: AiProvider }).provider = throwingProvider;

  const queued = await service.generateTrip("user-1", {
    destination: {
      placeId: "goong:dest",
      name: "Đà Lạt",
      address: "Lâm Đồng",
    },
    startingPoint: {
      placeId: "goong:start",
      name: "Khách sạn trung tâm",
      address: "Phường 1, Đà Lạt",
    },
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    totalBudget: 5000000,
    people: 2,
    interests: ["coffee", "photo", "local-food"],
    description: "Muốn lịch chill và có cà phê",
    pace: "balanced",
  } as GenerateTripInput);

  assert.equal(queued.generationId, "generation-1");
  assert.equal(queued.status, "QUEUED");
  assert.equal(state.tripCreateData, undefined);

  await service.processGenerationJobForTest(queued.generationId);
  const result = await service.getGeneration("user-1", queued.generationId);

  assert.equal(legacyGenerateTripCalls, 0);
  assert.equal(result.status, "SUCCEEDED");
  assert.equal(result.resultTripId, "trip-1");
  assert.equal(result.result?.tripId, "trip-1");
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
  assert.equal(metadata.startingPoint.name, "Khách sạn trung tâm");
  assert.equal(metadata.fallbacks.includes("ai_web_research_disabled"), true);

  const statuses = state.jobUpdates.map((update) => update.data.status);
  assert.deepEqual(statuses, ["RESEARCHING", "VERIFYING", "PLANNING", "ROUTING", "NARRATING", "SUCCEEDED"]);
  assert.equal(state.jobUpdates.some((update) => update.data.status === "SUCCEEDED" && update.inTransaction), true);

  const places = state.placeCreateManyData ?? [];
  assert.equal(places.length > 0, true);
  assert.equal(places.every((place) => String(place.providerId).startsWith("goong:")), true);
  assert.equal(places.every((place) => typeof place.placeCatalogId === "string"), true);
  assert.equal(places.every((place) => typeof place.generationScore === "number"), true);
  assert.equal(places.some((place) => place.name === "La Viet Coffee"), true);
  assert.equal((state.checklistCreateManyData ?? []).length > 0, true);
});

test("generateTrip worker fails deep mode before persisting when trusted web research is missing", async () => {
  const { prisma, state } = createPrismaStub();
  const service = new AiService(
    prisma as never,
    config({
      AI_WEB_RESEARCH_ENABLED: "true",
      AI_TRIP_WORKER_AUTOSTART: "false",
      PLACE_SEARCH_MAX_CANDIDATES: "12",
    }) as never,
    createGeoStub() as never,
  );

  const queued = await service.generateTrip("user-1", {
    destination: {
      placeId: "goong:dest",
      name: "Đà Lạt",
      address: "Lâm Đồng",
    },
    startingPoint: {
      placeId: "goong:start",
      name: "Khách sạn trung tâm",
      address: "Phường 1, Đà Lạt",
    },
    startDate: "2026-08-10",
    endDate: "2026-08-11",
    totalBudget: 5000000,
    people: 2,
    interests: ["coffee", "photo", "local-food"],
    description: "Muốn lịch chill và có cà phê",
    pace: "balanced",
  } as GenerateTripInput);

  await service.processGenerationJobForTest(queued.generationId);
  const result = await service.getGeneration("user-1", queued.generationId);

  assert.equal(result.status, "FAILED");
  assert.equal(result.progress < 100, true);
  assert.match(result.errorMessage ?? "", /web research/i);
  assert.equal(state.tripCreateData, undefined);
});

test("generateTrip worker fails strict mode when final verified cited pool is insufficient", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        output: [
          { type: "web_search_call", status: "completed" },
          {
            content: [
              {
                text: JSON.stringify({
                  places: [
                    {
                      name: "Hồ Xuân Hương",
                      placeType: "SCENIC",
                      reason: "Official destination candidate",
                      citations: [
                        {
                          title: "Da Lat tourism",
                          url: "https://dalat.vn/ho-xuan-huong",
                          snippet: "Official page",
                        },
                      ],
                      sourceConfidence: 0.9,
                      suggestedTimeOfDay: "morning",
                    },
                  ],
                }),
              },
            ],
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as typeof fetch;

  try {
    const { prisma, state } = createPrismaStub();
    const service = new AiService(
      prisma as never,
      config({
        OPENAI_API_KEY: "test-key",
        OPENAI_MODEL: "gpt-5.5",
        AI_WEB_RESEARCH_ENABLED: "true",
        AI_TRIP_WORKER_AUTOSTART: "false",
        PLACE_SEARCH_MAX_CANDIDATES: "12",
      }) as never,
      createGeoStub() as never,
    );

    const queued = await service.generateTrip("user-1", {
      destination: {
        placeId: "goong:dest",
        name: "Đà Lạt",
        address: "Lâm Đồng",
      },
      startingPoint: {
        placeId: "goong:start",
        name: "Khách sạn trung tâm",
        address: "Phường 1, Đà Lạt",
      },
      startDate: "2026-08-10",
      endDate: "2026-08-11",
      totalBudget: 5000000,
      people: 2,
      interests: ["coffee", "photo", "local-food"],
      description: "Muốn lịch chill và có cà phê",
      pace: "balanced",
    } as GenerateTripInput);

    await service.processGenerationJobForTest(queued.generationId);
    const result = await service.getGeneration("user-1", queued.generationId);

    assert.equal(result.status, "FAILED");
    assert.match(result.errorMessage ?? "", /citation|nguồn|địa điểm/i);
    assert.equal(state.tripCreateData, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
