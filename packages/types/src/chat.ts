import { z } from "zod";
import type { UserDto } from "./auth";

export const sendTripMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Tin nhắn không được để trống")
    .max(1000, "Tin nhắn tối đa 1000 ký tự"),
});
export type SendTripMessageInput = z.infer<typeof sendTripMessageSchema>;

export interface TripMessageDto {
  id: string;
  tripId: string;
  senderId: string;
  body: string;
  createdAt: string;
  sender: Pick<UserDto, "id" | "name" | "email" | "avatarUrl">;
}

export interface ListTripMessagesQuery {
  cursor?: string;
  limit?: number;
}
