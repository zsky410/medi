import { z } from "zod";

export const PLACE_CATEGORIES = [
  "ATTRACTION",
  "FOOD",
  "LODGING",
  "TRANSPORT",
  "SHOPPING",
  "OTHER",
] as const;
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];

export const createPlaceSchema = z.object({
  dayId: z.string().nullish(),
  name: z.string().min(1).max(300),
  lat: z.number().min(-90).max(90).nullish(),
  lng: z.number().min(-180).max(180).nullish(),
  category: z.enum(PLACE_CATEGORIES).default("OTHER"),
  address: z.string().max(500).nullish(),
  note: z.string().max(5000).nullish(),
  cost: z.number().min(0).nullish(),
  providerId: z.string().max(200).nullish(),
});
export type CreatePlaceInput = z.infer<typeof createPlaceSchema>;

export const updatePlaceSchema = createPlaceSchema.partial();
export type UpdatePlaceInput = z.infer<typeof updatePlaceSchema>;

export const reorderPlacesSchema = z.object({
  moves: z.array(
    z.object({
      placeId: z.string(),
      dayId: z.string().nullable(),
      order: z.number().int().min(0),
    }),
  ),
});
export type ReorderPlacesInput = z.infer<typeof reorderPlacesSchema>;

export interface PlaceDto {
  id: string;
  tripId: string;
  dayId: string | null;
  name: string;
  lat: number | null;
  lng: number | null;
  category: PlaceCategory;
  address: string | null;
  note: string | null;
  order: number;
  cost: number | null;
  providerId: string | null;
}

export interface DayDto {
  id: string;
  tripId: string;
  date: string;
  order: number;
  places: PlaceDto[];
}
