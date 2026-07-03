import { z } from "zod";
import type { PlaceCategory } from "./place";

export const parseBookingTextSchema = z.object({
  text: z.string().min(20, "Nội dung quá ngắn").max(50000),
});
export type ParseBookingTextInput = z.infer<typeof parseBookingTextSchema>;

export const inboundEmailSchema = z.object({
  tripId: z.string(),
  subject: z.string().max(500).optional(),
  text: z.string().min(20).max(50000),
  from: z.string().email().optional(),
});
export type InboundEmailInput = z.infer<typeof inboundEmailSchema>;

export interface ParsedBookingItem {
  type: "flight" | "hotel" | "transport" | "other";
  name: string;
  note: string | null;
  category: PlaceCategory;
  date: string | null;
  confirmationCode: string | null;
}

export interface ImportBookingResultDto {
  items: ParsedBookingItem[];
  placesCreated: number;
  attachmentsCreated: number;
}
