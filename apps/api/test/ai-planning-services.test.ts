import assert from "node:assert/strict";
import test from "node:test";
import type { NormalizedTripIntent, PlaceCandidate, ResolvedPlaceCandidate } from "@medi/types";
import { haversineM } from "../src/itinerary/route-optimizer";
import {
  AiWebPlaceResearchProvider,
  DayPlannerService,
  PlaceDeduplicationService,
  PlaceResolverService,
  PlaceScoringService,
  PlaceSelectionService,
  PlanningRouteOptimizerService,
  TripNarratorService,
  ensureEnoughPlaces,
} from "../src/ai/services";

const intent: NormalizedTripIntent = {
  destination: {
    providerId: "goong:dest",
    name: "Đà Lạt",
    address: "Lâm Đồng",
    lat: 11.94,
    lng: 108.44,
  },
  startingPoint: {
    providerId: "goong:hotel",
    name: "Khách sạn trung tâm",
    address: "Phường 1, Đà Lạt",
    lat: 11.941,
    lng: 108.437,
  },
  startDate: "2026-08-10",
  endDate: "2026-08-12",
  dayCount: 3,
  totalBudget: 6000000,
  people: 2,
  budgetPerPersonPerDay: 1000000,
  interests: ["coffee", "photo"],
  notes: null,
  description: "Cà phê và chụp ảnh",
  pace: "relaxed",
};

function resolved(overrides: Partial<ResolvedPlaceCandidate> & { id: string; name: string }): ResolvedPlaceCandidate {
  return {
    id: overrides.id,
    source: overrides.source ?? "goong",
    providerId: overrides.providerId ?? `goong:${overrides.id}`,
    placeCatalogId: overrides.placeCatalogId ?? `catalog-${overrides.id}`,
    name: overrides.name,
    address: overrides.address ?? "Đà Lạt",
    lat: overrides.lat ?? 11.94,
    lng: overrides.lng ?? 108.44,
    category: overrides.category ?? "ATTRACTION",
    placeType: overrides.placeType ?? "SCENIC",
    cost: overrides.cost ?? 100000,
    qualityScore: overrides.qualityScore ?? 0.7,
    confidence: overrides.confidence ?? 0.8,
    matchedInterests: overrides.matchedInterests ?? [],
    sourceMetadata: overrides.sourceMetadata ?? {},
    estimatedDurationMinutes: overrides.estimatedDurationMinutes ?? 90,
  };
}

test("PlaceResolverService drops unresolved AI web candidates and ignores AI coordinates", async () => {
  const geo = {
    autocomplete: async () => [],
    resolve: async () => {
      throw new Error("not found");
    },
  };
  const resolver = new PlaceResolverService(geo as never);
  const candidates: PlaceCandidate[] = [
    {
      id: "ai-made-up",
      source: "ai_web",
      name: "AI Invented Viewpoint",
      category: "ATTRACTION",
      lat: 99,
      lng: 99,
      confidence: 0.95,
      matchedInterests: ["photo"],
      sourceMetadata: { url: "https://example.com" },
    },
  ];

  const result = await resolver.resolveCandidates(intent, candidates);

  assert.deepEqual(result, []);
});

test("AiWebPlaceResearchProvider accepts only trusted cited Responses web-search candidates", async () => {
  const originalFetch = globalThis.fetch;
  let requestUrl = "";
  let requestBody: Record<string, unknown> = {};

  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    requestUrl = String(url);
    requestBody = JSON.parse(String(init?.body));
    return new Response(
      JSON.stringify({
        output: [
          { type: "web_search_call", status: "completed" },
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  places: [
                    {
                      name: "Hồ Xuân Hương",
                      placeType: "SCENIC",
                      reason: "Không gian đi bộ trung tâm",
                      citations: [
                        {
                          title: "Da Lat tourism",
                          url: "https://dalat.vn/ho-xuan-huong",
                          snippet: "Official destination page",
                        },
                      ],
                      sourceConfidence: 0.9,
                      suggestedTimeOfDay: "morning",
                    },
                    {
                      name: "Quán cà phê chung chung",
                      placeType: "CAFE",
                      reason: "Không có nguồn đáng tin",
                      citations: [],
                      sourceConfidence: 0.8,
                    },
                  ],
                }),
              },
            ],
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
          OPENAI_BASE_URL: "https://gateway.example.com/openai",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.equal(requestUrl, "https://gateway.example.com/openai/v1/responses");
    assert.deepEqual(requestBody.tools, [{ type: "web_search" }]);
    assert.deepEqual(requestBody.tool_choice, { type: "web_search" });
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Hồ Xuân Hương");
    assert.equal(candidates[0].placeType, "SCENIC");
    assert.equal(candidates[0].sourceMetadata.suggestedTimeOfDay, "morning");
    assert.equal(Array.isArray(candidates[0].sourceMetadata.citations), true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider accepts model-provided cited JSON without hosted web-search metadata", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  places: [
                    {
                      name: "Hồ Xuân Hương",
                      placeType: "SCENIC",
                      citations: [{ title: "Da Lat tourism", url: "https://dalat.vn/ho-xuan-huong" }],
                      sourceConfidence: 0.9,
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
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Hồ Xuân Hương");
    assert.equal(candidates[0].sourceMetadata.citationMode, "model_provided");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider retries with prompt-only research when hosted web-search params are rejected", async () => {
  const originalFetch = globalThis.fetch;
  const requestBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    requestBodies.push(JSON.parse(String(init?.body)));
    if (requestBodies.length === 1) {
      return new Response(JSON.stringify({ error: { message: "unsupported tool" } }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        output_text: JSON.stringify({
          places: [
            {
              name: "Thác Datanla",
              placeType: "ACTIVITY",
              reason: "Có hoạt động ngoài trời",
              citations: [
                {
                  title: "Visit Lam Dong",
                  url: "https://visitlamdong.vn/vi/thacdatanla",
                  snippet: "Destination page",
                },
              ],
              sourceConfidence: 0.9,
              suggestedTimeOfDay: "afternoon",
            },
          ],
        }),
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.equal(requestBodies.length, 2);
    assert.deepEqual(requestBodies[0].tools, [{ type: "web_search" }]);
    assert.equal("tools" in requestBodies[1], false);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Thác Datanla");
    assert.equal(candidates[0].sourceMetadata.citationMode, "model_provided");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider retries when hosted web-search request throws", async () => {
  const originalFetch = globalThis.fetch;
  const requestBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    requestBodies.push(JSON.parse(String(init?.body)));
    if (requestBodies.length === 1) {
      throw new Error("This operation was aborted");
    }
    return new Response(
      JSON.stringify({
        output_text: JSON.stringify({
          places: [
            {
              name: "Hồ Tuyền Lâm",
              placeType: "SCENIC",
              citations: ["https://visitlamdong.vn/vi/hotuyenlam"],
              sourceConfidence: 0.9,
            },
          ],
        }),
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.equal(requestBodies.length, 2);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Hồ Tuyền Lâm");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider retries when a response has no parseable cited places", async () => {
  const originalFetch = globalThis.fetch;
  const requestBodies: Array<Record<string, unknown>> = [];
  globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
    requestBodies.push(JSON.parse(String(init?.body)));
    if (requestBodies.length === 1) {
      return new Response(JSON.stringify({ output_text: "Tôi đã tìm được vài địa điểm ở Đà Lạt." }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        output_text: JSON.stringify({
          places: [
            {
              name: "Langbiang",
              placeType: "NATURE",
              citations: ["https://visitlamdong.vn/vi/langbiang"],
              sourceConfidence: 0.9,
            },
          ],
        }),
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.equal(requestBodies.length, 2);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Langbiang");
    assert.equal(candidates[0].sourceMetadata.citations[0].url, "https://visitlamdong.vn/vi/langbiang");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider accepts chat-completions fenced JSON with model citations", async () => {
  const originalFetch = globalThis.fetch;
  const requestUrls: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    requestUrls.push(String(url));
    if (requestUrls.length < 3) {
      return new Response(JSON.stringify({ error: { message: "unsupported endpoint" } }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content:
                "```json\n{\"places\":[{\"name\":\"Nhà ga Đà Lạt\",\"placeType\":\"CULTURE\",\"citations\":[{\"url\":\"https://dalat.vn/nhagadalat\"}],\"sourceConfidence\":0.9}]}\n```",
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
          OPENAI_BASE_URL: "https://gateway.example.com/openai",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.deepEqual(requestUrls, [
      "https://gateway.example.com/openai/v1/responses",
      "https://gateway.example.com/openai/v1/responses",
      "https://gateway.example.com/openai/v1/chat/completions",
    ]);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Nhà ga Đà Lạt");
    assert.equal(candidates[0].sourceMetadata.citations[0].title, "dalat.vn");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider can prefer chat-completions for slow gateways", async () => {
  const originalFetch = globalThis.fetch;
  const requestUrls: string[] = [];
  globalThis.fetch = (async (url: string | URL | Request) => {
    requestUrls.push(String(url));
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                places: [
                  {
                    name: "Là Việt Coffee",
                    placeType: "coffee",
                    citations: [
                      "https://laviet.coffee/",
                      "https://www.tripadvisor.com/Restaurant_Review-g293922-d8769925-Reviews-La_Viet_Coffee-Da_Lat_Lam_Dong_Province.html",
                      "https://www.google.com/maps/search/?api=1&query=La+Viet+Coffee+Da+Lat",
                    ],
                    sourceConfidence: "high",
                  },
                ],
              }),
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
          OPENAI_BASE_URL: "https://gateway.example.com/openai",
          AI_WEB_RESEARCH_PREFER_CHAT_COMPLETIONS: "true",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.deepEqual(requestUrls, ["https://gateway.example.com/openai/v1/chat/completions"]);
    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Là Việt Coffee");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider accepts numbered prose with source links", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        output_text: [
          "Nếu bạn đi Đà Lạt lần đầu, mình chọn top 5 này:",
          "",
          "1. Hồ Tuyền Lâm + Thiền viện Trúc Lâm",
          "Đẹp, yên, đúng chất Đà Lạt.",
          "Nguồn (https://visitlamdong.vn/vi/hotuyenlam)",
          "",
          "2. Thác Datanla",
          "Có hoạt động ngoài trời.",
          "Nguồn (https://visitlamdong.vn/vi/thacdatanla)",
        ].join("\n"),
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.equal(candidates.length, 2);
    assert.equal(candidates[0].name, "Hồ Tuyền Lâm + Thiền viện Trúc Lâm");
    assert.equal(candidates[0].sourceMetadata.citations[0].url, "https://visitlamdong.vn/vi/hotuyenlam");
    assert.equal(candidates[1].name, "Thác Datanla");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider accepts Google Maps citations with textual confidence from gateways", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                places: [
                  {
                    name: "Café Tùng",
                    placeType: "coffee",
                    reason: "Quán cà phê lâu đời ngay khu Hòa Bình.",
                    citations: ["https://www.google.com/maps/search/?api=1&query=Caf%C3%A9%20T%C3%B9ng%20%C4%90%C3%A0%20L%E1%BA%A1t"],
                    sourceConfidence: "high",
                    suggestedTimeOfDay: "morning",
                  },
                ],
              }),
            },
          },
        ],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    )) as typeof fetch;

  try {
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].name, "Café Tùng");
    assert.equal(candidates[0].placeType, "CAFE");
    assert.equal(candidates[0].sourceMetadata.sourceConfidence, 0.85);
    assert.equal(candidates[0].sourceMetadata.citations[0].title, "google.com");
    assert.equal(candidates[0].sourceTrustScore >= 0.6, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("AiWebPlaceResearchProvider rejects model-provided citations when official web-search evidence is required", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({
        output: [
          {
            type: "message",
            content: [
              {
                type: "output_text",
                text: JSON.stringify({
                  places: [
                    {
                      name: "Hồ Xuân Hương",
                      placeType: "SCENIC",
                      citations: [{ title: "Da Lat tourism", url: "https://dalat.vn/ho-xuan-huong" }],
                      sourceConfidence: 0.9,
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
    const provider = new AiWebPlaceResearchProvider({
      get: <T = string>(key: string): T | undefined =>
        ({
          OPENAI_API_KEY: "test-key",
          OPENAI_MODEL: "gpt-5.5",
          AI_REQUIRE_OFFICIAL_WEB_SEARCH_EVIDENCE: "true",
        })[key] as T | undefined,
    });

    const candidates = await provider.research(intent);

    assert.deepEqual(candidates, []);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("PlaceResolverService drops lodging and generic map results from sightseeing candidates", async () => {
  const geo = {
    autocomplete: async (query: string) => [
      query.includes("Resort")
        ? { providerId: "goong:hotel", name: "Dalat Resort", address: "Đà Lạt", category: "lodging" }
        : { providerId: "goong:generic", name: "Quán cà phê", address: "Đà Lạt", category: "cafe" },
    ],
    resolve: async (providerId: string) => ({
      providerId,
      name: providerId === "goong:hotel" ? "Dalat Resort" : "Quán cà phê",
      address: "Đà Lạt",
      lat: 11.94,
      lng: 108.44,
      category: providerId === "goong:hotel" ? "lodging" : "cafe",
    }),
  };
  const resolver = new PlaceResolverService(geo as never);

  const result = await resolver.resolveCandidates(intent, [
    {
      id: "hotel",
      source: "goong",
      providerId: "goong:hotel",
      name: "Dalat Resort",
      category: "LODGING",
      confidence: 0.9,
      sourceMetadata: {},
    },
    {
      id: "generic",
      source: "ai_web",
      name: "Quán cà phê",
      category: "FOOD",
      placeType: "CAFE",
      confidence: 0.9,
      sourceMetadata: {
        citations: [{ title: "Da Lat tourism", url: "https://dalat.vn/cafe", snippet: "Official" }],
      },
    },
  ]);

  assert.deepEqual(result, []);
});

test("PlaceResolverService allows lodging when the traveler explicitly asks for lodging", async () => {
  const geo = {
    autocomplete: async () => [],
    resolve: async () => ({
      providerId: "goong:hotel",
      name: "Dalat Resort",
      address: "Đà Lạt",
      lat: 11.94,
      lng: 108.44,
      category: "lodging",
    }),
  };
  const resolver = new PlaceResolverService(geo as never);

  const result = await resolver.resolveCandidates(
    { ...intent, interests: ["lodging"], description: "Cần thêm khách sạn/homestay phù hợp" },
    [
      {
        id: "hotel",
        source: "goong",
        providerId: "goong:hotel",
        name: "Dalat Resort",
        category: "LODGING",
        confidence: 0.9,
        sourceMetadata: {},
      },
    ],
  );

  assert.equal(result.length, 1);
  assert.equal(result[0].category, "LODGING");
});

test("PlaceDeduplicationService merges provider and near-duplicate candidates", () => {
  const deduper = new PlaceDeduplicationService();
  const result = deduper.dedupe([
    resolved({ id: "lake-a", providerId: "goong:lake", name: "Hồ Xuân Hương", qualityScore: 0.6 }),
    resolved({ id: "lake-b", providerId: "goong:lake", name: "Ho Xuan Huong", qualityScore: 0.9 }),
    resolved({ id: "lake-c", providerId: "goong:other", name: "Ho Xuan Huong", lat: 11.94001, lng: 108.44001 }),
  ]);

  assert.equal(result.length, 1);
  assert.equal(result[0].qualityScore, 0.9);
});

test("PlaceDeduplicationService merges market parent clusters", () => {
  const deduper = new PlaceDeduplicationService();
  const result = deduper.dedupe([
    resolved({ id: "market-a", providerId: "goong:market-a", name: "Chợ Đà Lạt", category: "SHOPPING" }),
    resolved({
      id: "market-b",
      providerId: "goong:market-b",
      name: "Khu ăn uống chợ Đà Lạt",
      category: "FOOD",
      placeType: "LOCAL_FOOD",
      lat: 11.94002,
      lng: 108.44002,
      qualityScore: 0.9,
    }),
  ]);

  assert.equal(result.length, 1);
  assert.match(normalizeNameForTest(result[0].name), /cho da lat/);
});

test("PlaceScoringService rewards interest matches and penalizes distance and budget mismatch", () => {
  const scorer = new PlaceScoringService();
  const nearCoffee = scorer.score(intent, resolved({
    id: "coffee",
    name: "La Viet Coffee",
    category: "FOOD",
    lat: 11.941,
    lng: 108.441,
    cost: 100000,
    matchedInterests: ["coffee"],
  }));
  const farExpensive = scorer.score(intent, resolved({
    id: "far",
    name: "Far Luxury Park",
    category: "ATTRACTION",
    lat: 12.7,
    lng: 109.2,
    cost: 3000000,
    matchedInterests: [],
    confidence: 0.4,
  }));

  assert.equal(nearCoffee.score > farExpensive.score, true);
});

test("PlaceSelectionService keeps category diversity and respects relaxed pace capacity", () => {
  const scorer = new PlaceScoringService();
  const scored = [
    resolved({ id: "food-1", name: "Food 1", category: "FOOD", matchedInterests: ["coffee"] }),
    resolved({ id: "food-2", name: "Food 2", category: "FOOD", matchedInterests: ["coffee"] }),
    resolved({ id: "food-3", name: "Food 3", category: "FOOD", matchedInterests: ["coffee"] }),
    resolved({ id: "attr-1", name: "View 1", category: "ATTRACTION", matchedInterests: ["photo"] }),
    resolved({ id: "shop-1", name: "Market", category: "SHOPPING" }),
    resolved({ id: "attr-2", name: "View 2", category: "ATTRACTION", matchedInterests: ["photo"] }),
    resolved({ id: "attr-3", name: "View 3", category: "ATTRACTION", matchedInterests: ["photo"] }),
    resolved({ id: "attr-4", name: "View 4", category: "ATTRACTION", matchedInterests: ["photo"] }),
    resolved({ id: "attr-5", name: "View 5", category: "ATTRACTION", matchedInterests: ["photo"] }),
    resolved({ id: "attr-6", name: "View 6", category: "ATTRACTION", matchedInterests: ["photo"] }),
  ].map((candidate) => scorer.score(intent, candidate));

  const selected = new PlaceSelectionService().select(intent, scored);

  assert.equal(selected.length <= 9, true);
  assert.equal(new Set(selected.map((candidate) => candidate.category)).size >= 3, true);
});

test("PlaceSelectionService enforces daily cafe and food caps with non-food anchors", () => {
  const scored = [
    resolved({ id: "coffee-1", name: "Coffee 1", category: "FOOD", placeType: "CAFE", qualityScore: 0.95 }),
    resolved({ id: "coffee-2", name: "Coffee 2", category: "FOOD", placeType: "CAFE", qualityScore: 0.94 }),
    resolved({ id: "food-1", name: "Food 1", category: "FOOD", placeType: "LOCAL_FOOD", qualityScore: 0.93 }),
    resolved({ id: "food-2", name: "Food 2", category: "FOOD", placeType: "LOCAL_FOOD", qualityScore: 0.92 }),
    resolved({ id: "attr-1", name: "View 1", category: "ATTRACTION", placeType: "SCENIC", qualityScore: 0.8 }),
    resolved({ id: "attr-2", name: "View 2", category: "ATTRACTION", placeType: "CULTURE", qualityScore: 0.79 }),
    resolved({ id: "market-1", name: "Market 1", category: "SHOPPING", placeType: "MARKET", qualityScore: 0.78 }),
    resolved({ id: "activity-1", name: "Activity 1", category: "ATTRACTION", placeType: "ACTIVITY", qualityScore: 0.77 }),
  ].map((candidate) => new PlaceScoringService().score(intent, candidate));

  const selected = new PlaceSelectionService().select(intent, scored);
  const days = new DayPlannerService().planDays(intent, selected);

  for (const day of days) {
    assert.equal(day.places.some((place) => place.category !== "FOOD"), true);
    assert.equal(day.places.filter((place) => place.placeType === "CAFE").length <= 1, true);
    assert.equal(day.places.filter((place) => place.placeType === "LOCAL_FOOD").length <= 1, true);
  }
});

test("DayPlannerService does not overpack relaxed days", () => {
  const days = new DayPlannerService().planDays(intent, [
    resolved({ id: "p1", name: "P1" }),
    resolved({ id: "p2", name: "P2" }),
    resolved({ id: "p3", name: "P3" }),
    resolved({ id: "p4", name: "P4" }),
    resolved({ id: "p5", name: "P5" }),
    resolved({ id: "p6", name: "P6" }),
    resolved({ id: "p7", name: "P7" }),
  ]);

  assert.equal(days.length, 3);
  assert.equal(days.every((day) => day.places.length <= 3), true);
  assert.equal(days[0].places.length >= days[2].places.length, true);
});

test("ensureEnoughPlaces rejects too few verified anchors for the requested days", () => {
  assert.throws(
    () => ensureEnoughPlaces([resolved({ id: "only", name: "Only Anchor" })], intent),
    /Không đủ địa điểm/,
  );
});

test("DayPlannerService orders stops by suggested time of day", () => {
  const days = new DayPlannerService().planDays({ ...intent, dayCount: 1, pace: "packed" }, [
    resolved({ id: "sunset", name: "Sunset Hill", sourceMetadata: { suggestedTimeOfDay: "sunset" } }),
    resolved({ id: "morning", name: "Morning Lake", sourceMetadata: { suggestedTimeOfDay: "morning" } }),
    resolved({
      id: "lunch",
      name: "Lunch Spot",
      category: "FOOD",
      placeType: "LOCAL_FOOD",
      sourceMetadata: { suggestedTimeOfDay: "lunch" },
    }),
  ]);

  assert.deepEqual(days[0].places.map((place) => place.id), ["morning", "lunch", "sunset"]);
});

test("PlanningRouteOptimizerService falls back to Haversine and does not worsen the initial route", async () => {
  const geo = {
    distanceMatrix: async () => null,
  };
  const optimizer = new PlanningRouteOptimizerService(geo as never);
  const day = {
    date: "2026-08-10",
    title: null,
    notes: null,
    places: [
      resolved({ id: "a", name: "A", lat: 11.94, lng: 108.44 }),
      resolved({ id: "b", name: "B", lat: 11.99, lng: 108.50 }),
      resolved({ id: "c", name: "C", lat: 11.95, lng: 108.45 }),
    ],
  };

  const result = await optimizer.optimizeDays(intent, [day]);

  const anchoredCost = (places: ResolvedPlaceCandidate[]) => {
    const anchor = { lat: intent.startingPoint.lat, lng: intent.startingPoint.lng };
    const points = [anchor, ...places.map((place) => ({ lat: place.lat, lng: place.lng })), anchor];
    return points.slice(0, -1).reduce((total, point, index) => total + haversineM(point, points[index + 1]), 0);
  };

  assert.equal(result.usedDistanceMatrix, false);
  assert.equal(anchoredCost(result.days[0].places) <= anchoredCost(day.places), true);
});

test("PlanningRouteOptimizerService anchors each day at the starting point", async () => {
  let matrixPoints: Array<{ lat: number; lng: number }> = [];
  const geo = {
    distanceMatrix: async (points: Array<{ lat: number; lng: number }>) => {
      matrixPoints = points;
      return null;
    },
  };
  const optimizer = new PlanningRouteOptimizerService(geo as never);

  await optimizer.optimizeDays(intent, [
    {
      date: "2026-08-10",
      title: null,
      notes: null,
      places: [
        resolved({ id: "a", name: "A", lat: 11.96, lng: 108.45 }),
        resolved({ id: "b", name: "B", lat: 11.97, lng: 108.46 }),
      ],
    },
  ]);

  assert.deepEqual(matrixPoints.at(-1), { lat: intent.startingPoint.lat, lng: intent.startingPoint.lng });
});

test("PlanningRouteOptimizerService preserves suggested time-of-day buckets while optimizing", async () => {
  const optimizer = new PlanningRouteOptimizerService({ distanceMatrix: async () => null } as never);
  const day = {
    date: "2026-08-10",
    title: null,
    notes: null,
    places: [
      resolved({
        id: "morning",
        name: "Morning Lake",
        lat: 12.1,
        lng: 108.7,
        sourceMetadata: { suggestedTimeOfDay: "morning" },
      }),
      resolved({
        id: "lunch",
        name: "Lunch Spot",
        category: "FOOD",
        placeType: "LOCAL_FOOD",
        lat: 12.0,
        lng: 108.6,
        sourceMetadata: { suggestedTimeOfDay: "lunch" },
      }),
      resolved({
        id: "sunset",
        name: "Sunset Hill",
        lat: 11.942,
        lng: 108.438,
        sourceMetadata: { suggestedTimeOfDay: "sunset" },
      }),
    ],
  };

  const result = await optimizer.optimizeDays(intent, [day]);

  assert.deepEqual(result.days[0].places.map((place) => place.id), ["morning", "lunch", "sunset"]);
});

test("TripNarratorService rejects narrator plans with unknown place IDs and falls back", async () => {
  const narrator = new TripNarratorService({
    narrate: async () => ({
      title: "Bad AI plan",
      destination: "Đà Lạt",
      dayCount: 1,
      days: [
        {
          date: "2026-08-10",
          title: "Invented",
          notes: "Should be rejected",
          placeIds: ["unknown"],
        },
      ],
      checklist: ["Pack"],
      metadata: {
        lockedPlaceIds: ["known"],
        warnings: [],
      },
    }),
  });

  const plan = await narrator.narrate(intent, [
    {
      date: "2026-08-10",
      title: null,
      notes: null,
      places: [resolved({ id: "known", name: "Known" })],
    },
  ]);

  assert.notEqual(plan.title, "Bad AI plan");
  assert.deepEqual(plan.days[0].placeIds, ["known"]);
  assert.equal(plan.metadata.warnings.includes("ai_narration_rejected"), true);
});

function normalizeNameForTest(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}
