import { z } from "zod";

export const BOOKING_ATTACHMENT_TYPES = [
  "flight",
  "lodging",
  "car",
  "train",
  "link",
  "booking",
  "other",
] as const;
export type BookingAttachmentType = (typeof BOOKING_ATTACHMENT_TYPES)[number];

export const bookingMetadataSchema = z.object({
  confirmationCode: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  startTime: z.string().max(20).optional(),
  endTime: z.string().max(20).optional(),
  amount: z.number().positive().optional(),
  currency: z.string().length(3).default("VND"),
  provider: z.string().max(200).optional(),
  fromPlace: z.string().max(200).optional(),
  toPlace: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
  expenseId: z.string().optional(),
});
export type BookingMetadata = z.infer<typeof bookingMetadataSchema>;

export const createAttachmentSchema = z.object({
  /** Booking link, file URL, or internal placeholder for manual entries. */
  url: z.string().min(1).max(2000),
  name: z.string().max(200).optional(),
  type: z.enum(BOOKING_ATTACHMENT_TYPES).default("link"),
  placeId: z.string().optional(),
  metadata: bookingMetadataSchema.optional(),
});
export type CreateAttachmentInput = z.infer<typeof createAttachmentSchema>;

export const updateAttachmentSchema = z.object({
  name: z.string().max(200).optional(),
  url: z.string().min(1).max(2000).optional(),
  metadata: bookingMetadataSchema.partial().optional(),
});
export type UpdateAttachmentInput = z.infer<typeof updateAttachmentSchema>;

export interface AttachmentDto {
  id: string;
  tripId: string;
  placeId: string | null;
  url: string;
  name: string | null;
  type: string;
  metadata: BookingMetadata | null;
  uploaderName: string | null;
  createdAt: string;
}
