import { z } from "zod";

export const generateTripSchema = z.object({
  prompt: z.string().min(10, "Mô tả chuyến đi quá ngắn").max(2000),
});
export type GenerateTripInput = z.infer<typeof generateTripSchema>;

export interface GenerateTripResultDto {
  tripId: string;
  title: string;
  destination: string;
  remainingGenerations: number | null;
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
