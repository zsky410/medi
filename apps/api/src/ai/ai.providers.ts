import type { PlaceCategory } from "@medi/types";

export interface GeneratedPlace {
  name: string;
  category: PlaceCategory;
  lat: number;
  lng: number;
  note?: string;
  cost?: number;
}

export interface GeneratedTripPlan {
  title: string;
  destination: string;
  coverImage: string;
  dayCount: number;
  budget: number | null;
  places: GeneratedPlace[];
}

export interface SuggestContext {
  destination: string;
  existingNames: string[];
  prompt?: string;
  limit: number;
}

export interface RoutePlace {
  id: string;
  lat: number;
  lng: number;
}

export interface AiProvider {
  readonly name: "mock" | "openai";
  generateTrip(prompt: string): Promise<GeneratedTripPlan>;
  suggestPlaces(ctx: SuggestContext): Promise<GeneratedPlace[]>;
  optimizeRouteOrder(places: RoutePlace[]): string[];
}
