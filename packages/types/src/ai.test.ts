import assert from "node:assert/strict";
import test from "node:test";
import {
  aiTripGenerationStatusSchema,
  generateTripInputSchema,
  generateTripJobSchema,
  generateTripSchema,
  finalTripPlanSchema,
} from "./index";

test("generateTripInputSchema accepts destination-based trip constraints", () => {
  const result = generateTripInputSchema.safeParse({
    destination: {
      placeId: "goong:dalat",
      name: "Đà Lạt",
      address: "Lâm Đồng",
    },
    startingPoint: {
      placeId: "goong:hotel",
      name: "Khách sạn trung tâm",
      address: "Phường 1, Đà Lạt",
      lat: 11.941,
      lng: 108.437,
    },
    startDate: "2026-08-10",
    endDate: "2026-08-13",
    totalBudget: 5000000,
    people: 2,
    interests: ["coffee", "photo", "local-food"],
    notes: "Không thuê xe máy",
    description: "Muốn có một buổi ngắm hoàng hôn",
    pace: "relaxed",
  });

  assert.equal(result.success, true);
  if (!result.success) return;
  assert.equal(result.data.destination.name, "Đà Lạt");
  assert.equal(result.data.startingPoint.name, "Khách sạn trung tâm");
  assert.equal(result.data.totalBudget, 5000000);
  assert.equal(result.data.people, 2);
  assert.equal(result.data.pace, "relaxed");
});

test("generateTripSchema remains an alias and maps legacy field names", () => {
  assert.equal(generateTripSchema, generateTripInputSchema);

  const result = generateTripSchema.parse({
    destination: { name: "Hội An", lat: 15.877, lng: 108.326 },
    startingPoint: { name: "Homestay Hội An", lat: 15.878, lng: 108.327 },
    startDate: "2026-08-10",
    endDate: "2026-08-12",
    budget: "4000000",
    partySize: "3",
    interests: ["culture"],
    prompt: "Ưu tiên phố cổ và đồ ăn địa phương",
  });

  assert.equal(result.totalBudget, 4000000);
  assert.equal(result.people, 3);
  assert.equal(result.description, "Ưu tiên phố cổ và đồ ăn địa phương");
});

test("generateTripInputSchema rejects missing destination and invalid constraints", () => {
  assert.equal(
    generateTripInputSchema.safeParse({
      startDate: "2026-08-10",
      endDate: "2026-08-12",
      totalBudget: 4000000,
      people: 2,
      interests: ["culture"],
    }).success,
    false,
  );

  assert.equal(
    generateTripInputSchema.safeParse({
      destination: { name: "Đà Lạt", lat: 11.94, lng: 108.44 },
      startDate: "2026-08-10",
      endDate: "2026-08-12",
      totalBudget: 4000000,
      people: 2,
      interests: ["culture"],
    }).success,
    false,
  );

  assert.equal(
    generateTripInputSchema.safeParse({
      destination: { name: "Đà Lạt" },
      startingPoint: { name: "Khách sạn", lat: 11.94, lng: 108.44 },
      startDate: "2026-08-13",
      endDate: "2026-08-12",
      totalBudget: 0,
      people: 0,
      interests: ["culture"],
    }).success,
    false,
  );
});

test("finalTripPlanSchema rejects narrator output containing unknown place ids", () => {
  const result = finalTripPlanSchema.safeParse({
    title: "Đà Lạt 2 ngày",
    destination: "Đà Lạt",
    dayCount: 1,
    days: [
      {
        date: "2026-08-10",
        title: "Ngày 1",
        notes: "Đi nhẹ nhàng",
        placeIds: ["resolved-1"],
      },
    ],
    checklist: ["Đặt xe"],
    metadata: {
      lockedPlaceIds: ["resolved-1"],
      warnings: [],
    },
  });

  assert.equal(result.success, true);

  const invalid = finalTripPlanSchema.safeParse({
    title: "Đà Lạt 2 ngày",
    destination: "Đà Lạt",
    dayCount: 1,
    days: [
      {
        date: "2026-08-10",
        title: "Ngày 1",
        notes: "Đi nhẹ nhàng",
        placeIds: ["ai-invented-place"],
      },
    ],
    checklist: ["Đặt xe"],
    metadata: {
      lockedPlaceIds: ["resolved-1"],
      warnings: [],
    },
  });

  assert.equal(invalid.success, false);
});

test("AI generation job DTOs validate async statuses", () => {
  const queued = generateTripJobSchema.parse({
    generationId: "job-1",
    status: "QUEUED",
    estimatedWaitSeconds: 180,
  });

  assert.equal(queued.status, "QUEUED");
  assert.equal(aiTripGenerationStatusSchema.parse("RESEARCHING"), "RESEARCHING");
  assert.equal(aiTripGenerationStatusSchema.safeParse("RUNNING").success, false);
});
