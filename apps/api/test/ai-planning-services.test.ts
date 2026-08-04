import assert from "node:assert/strict";
import test from "node:test";
import type { NormalizedTripIntent, PlaceCandidate, ResolvedPlaceCandidate } from "@medi/types";
import { haversineM } from "../src/itinerary/route-optimizer";
import {
  DayPlannerService,
  PlaceDeduplicationService,
  PlaceResolverService,
  PlaceScoringService,
  PlaceSelectionService,
  PlanningRouteOptimizerService,
  TripNarratorService,
} from "../src/ai/services";

const intent: NormalizedTripIntent = {
  destination: {
    providerId: "goong:dest",
    name: "Đà Lạt",
    address: "Lâm Đồng",
    lat: 11.94,
    lng: 108.44,
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
    const anchor = { lat: intent.destination.lat, lng: intent.destination.lng };
    const points = [anchor, ...places.map((place) => ({ lat: place.lat, lng: place.lng })), anchor];
    return points.slice(0, -1).reduce((total, point, index) => total + haversineM(point, points[index + 1]), 0);
  };

  assert.equal(result.usedDistanceMatrix, false);
  assert.equal(anchoredCost(result.days[0].places) <= anchoredCost(day.places), true);
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
