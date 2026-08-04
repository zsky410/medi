import { z } from "zod";
import { PLACE_CATEGORIES } from "./place";

const tripDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày phải có định dạng YYYY-MM-DD");

function validDate(value: string): boolean {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function dayCount(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function mapLegacyGenerateTripAliases(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const input = { ...(raw as Record<string, unknown>) };
  if (input.totalBudget == null && input.budget != null) input.totalBudget = input.budget;
  if (input.people == null && input.partySize != null) input.people = input.partySize;
  if (input.description == null && input.prompt != null) input.description = input.prompt;
  return input;
}

export const tripPaceSchema = z.enum(["relaxed", "balanced", "packed"]);
export type TripPace = z.infer<typeof tripPaceSchema>;

export const tripDestinationInputSchema = z.object({
  placeId: z.string().trim().min(1).max(300).optional(),
  name: z.string().trim().min(2, "Cần chọn điểm đến").max(200),
  address: z.string().trim().max(500).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
}).superRefine((destination, ctx) => {
  if ((destination.lat == null) !== (destination.lng == null)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Tọa độ điểm đến cần đủ lat/lng",
      path: destination.lat == null ? ["lat"] : ["lng"],
    });
  }
});
export type TripDestinationInput = z.infer<typeof tripDestinationInputSchema>;

const generateTripInputCoreSchema = z.object({
  destination: tripDestinationInputSchema,
  startDate: tripDateSchema,
  endDate: tripDateSchema,
  totalBudget: z.coerce.number().int().positive("Budget phải lớn hơn 0").max(1_000_000_000),
  people: z.coerce.number().int().min(1, "Số người phải lớn hơn 0").max(30),
  interests: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  notes: z.string().trim().max(1000).nullish(),
  description: z.string().trim().max(2000).nullish(),
  pace: tripPaceSchema.default("balanced"),
});

export const generateTripInputSchema = z
  .preprocess(mapLegacyGenerateTripAliases, generateTripInputCoreSchema)
  .superRefine((input, ctx) => {
    if (!validDate(input.startDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ngày bắt đầu không hợp lệ", path: ["startDate"] });
    }
    if (!validDate(input.endDate)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Ngày kết thúc không hợp lệ", path: ["endDate"] });
    }
    if (validDate(input.startDate) && validDate(input.endDate)) {
      const count = dayCount(input.startDate, input.endDate);
      if (count < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ngày kết thúc phải sau ngày bắt đầu",
          path: ["endDate"],
        });
      }
      if (count > 14) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Lịch trình AI MVP hỗ trợ tối đa 14 ngày",
          path: ["endDate"],
        });
      }
    }
  });
export const generateTripSchema = generateTripInputSchema;
export type GenerateTripInput = z.infer<typeof generateTripInputSchema>;

export const normalizedDestinationSchema = z.object({
  providerId: z.string().nullable(),
  name: z.string(),
  address: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
});
export type NormalizedDestination = z.infer<typeof normalizedDestinationSchema>;

export const normalizedTripIntentSchema = z.object({
  destination: normalizedDestinationSchema,
  startDate: tripDateSchema,
  endDate: tripDateSchema,
  dayCount: z.number().int().min(1).max(14),
  totalBudget: z.number().positive(),
  people: z.number().int().min(1).max(30),
  budgetPerPersonPerDay: z.number().nonnegative(),
  interests: z.array(z.string()),
  notes: z.string().nullable(),
  description: z.string().nullable(),
  pace: tripPaceSchema,
});
export type NormalizedTripIntent = z.infer<typeof normalizedTripIntentSchema>;

export const placeCandidateSourceSchema = z.enum(["goong", "catalog", "ai_web", "fallback"]);
export type PlaceCandidateSource = z.infer<typeof placeCandidateSourceSchema>;

const sourceMetadataSchema = z.record(z.unknown()).default({});

export const placeCandidateSchema = z.object({
  id: z.string(),
  source: placeCandidateSourceSchema,
  providerId: z.string().nullable().optional(),
  placeCatalogId: z.string().nullable().optional(),
  name: z.string(),
  address: z.string().nullable().optional(),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  category: z.enum(PLACE_CATEGORIES).default("OTHER"),
  cost: z.number().nonnegative().nullable().optional(),
  qualityScore: z.number().min(0).max(1).default(0.5),
  confidence: z.number().min(0).max(1).default(0.5),
  matchedInterests: z.array(z.string()).default([]),
  sourceMetadata: sourceMetadataSchema,
  estimatedDurationMinutes: z.number().int().positive().nullable().optional(),
});
export type PlaceCandidate = z.infer<typeof placeCandidateSchema>;

export const resolvedPlaceCandidateSchema = placeCandidateSchema.extend({
  providerId: z.string(),
  placeCatalogId: z.string().nullable().optional(),
  address: z.string().nullable(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  estimatedDurationMinutes: z.number().int().positive(),
});
export type ResolvedPlaceCandidate = z.infer<typeof resolvedPlaceCandidateSchema>;

export const scoredPlaceCandidateSchema = resolvedPlaceCandidateSchema.extend({
  score: z.number(),
  distanceMeters: z.number().nonnegative(),
  scoreBreakdown: z.object({
    interest: z.number(),
    quality: z.number(),
    budget: z.number(),
    distance: z.number(),
    diversity: z.number(),
    source: z.number(),
  }),
});
export type ScoredPlaceCandidate = z.infer<typeof scoredPlaceCandidateSchema>;

export const plannedDaySchema = z.object({
  date: tripDateSchema,
  title: z.string().nullable(),
  notes: z.string().nullable(),
  places: z.array(resolvedPlaceCandidateSchema),
});
export type PlannedDay = z.infer<typeof plannedDaySchema>;

export const finalTripPlanSchema = z
  .object({
    title: z.string().min(1).max(200),
    destination: z.string().min(1).max(200),
    dayCount: z.number().int().min(1).max(14),
    days: z.array(
      z.object({
        date: tripDateSchema,
        title: z.string().nullable(),
        notes: z.string().nullable(),
        placeIds: z.array(z.string()),
      }),
    ),
    checklist: z.array(z.string().min(1).max(200)).max(20),
    metadata: z.object({
      lockedPlaceIds: z.array(z.string()),
      warnings: z.array(z.string()),
    }),
  })
  .superRefine((plan, ctx) => {
    const locked = new Set(plan.metadata.lockedPlaceIds);
    plan.days.forEach((day, dayIndex) => {
      day.placeIds.forEach((placeId, placeIndex) => {
        if (!locked.has(placeId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Narrator output referenced an unknown place id",
            path: ["days", dayIndex, "placeIds", placeIndex],
          });
        }
      });
    });
  });
export type FinalTripPlan = z.infer<typeof finalTripPlanSchema>;

export const generationMetadataSchema = z.object({
  requestId: z.string(),
  candidateCounts: z.object({
    goong: z.number().int().nonnegative(),
    catalog: z.number().int().nonnegative(),
    aiWeb: z.number().int().nonnegative(),
    resolved: z.number().int().nonnegative(),
    deduped: z.number().int().nonnegative(),
    selected: z.number().int().nonnegative(),
  }),
  sourceCounts: z.record(z.number().int().nonnegative()),
  fallbacks: z.array(z.string()),
  warnings: z.array(z.string()),
  usedWebResearch: z.boolean(),
  usedDistanceMatrix: z.boolean(),
  pace: tripPaceSchema,
});
export type GenerationMetadata = z.infer<typeof generationMetadataSchema>;

export interface GenerateTripResultDto {
  tripId: string;
  title: string;
  destination: string;
  remainingGenerations: number | null;
  generationMetadata?: Pick<GenerationMetadata, "warnings" | "fallbacks" | "usedWebResearch" | "usedDistanceMatrix">;
}

export interface AiUsageDto {
  used: number;
  limit: number | null;
  resetsAt: string | null;
  provider: "mock" | "openai";
}

export const suggestPlacesSchema = z.object({
  prompt: z.string().max(500).optional(),
  dayId: z.string().optional(),
  limit: z.number().int().min(1).max(10).default(5),
});
export type SuggestPlacesInput = z.infer<typeof suggestPlacesSchema>;

export interface SuggestedPlaceDto {
  name: string;
  category: "ATTRACTION" | "FOOD" | "LODGING" | "TRANSPORT" | "SHOPPING" | "OTHER";
  lat: number | null;
  lng: number | null;
  address: string | null;
  note: string | null;
  cost: number | null;
}

export interface SuggestPlacesResultDto {
  suggestions: SuggestedPlaceDto[];
  provider: "mock" | "openai";
}

export const optimizeRouteSchema = z.object({
  dayId: z.string().optional(),
});
export type OptimizeRouteInput = z.infer<typeof optimizeRouteSchema>;

export interface OptimizeRouteResultDto {
  optimized: number;
  provider: "mock" | "openai";
}
