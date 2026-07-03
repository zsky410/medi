import { z } from "zod";

export type ChecklistType = "TODO" | "PACKING";

export const createChecklistItemSchema = z.object({
  text: z.string().min(1).max(500),
  type: z.enum(["TODO", "PACKING"]).default("TODO"),
});
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;

export const updateChecklistItemSchema = z.object({
  text: z.string().min(1).max(500).optional(),
  checked: z.boolean().optional(),
});
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;

export interface ChecklistItemDto {
  id: string;
  tripId: string;
  text: string;
  checked: boolean;
  type: ChecklistType;
  createdAt: string;
}
