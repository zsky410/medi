import type { TripMessageDto } from "@medi/types";

export const TRIP_CHAT_IDLE_TTL_MS = 15 * 60 * 1000;
export const tripMessagesQueryKey = (tripId: string) => ["trip-messages", tripId] as const;

export function shouldShowTripChat(memberCount: number): boolean {
  return memberCount > 1;
}

export function appendTripMessage(messages: TripMessageDto[], message: TripMessageDto): TripMessageDto[] {
  if (messages.some((existing) => existing.id === message.id)) return messages;
  return [...messages, message];
}

export function isFirstMessageInSenderGroup(messages: TripMessageDto[], index: number): boolean {
  if (index <= 0) return true;
  return messages[index - 1]?.senderId !== messages[index]?.senderId;
}

function newestCreatedAtMs(messages: TripMessageDto[]): number | null {
  if (messages.length === 0) return null;
  return Math.max(...messages.map((message) => new Date(message.createdAt).getTime()));
}

export function getTripChatExpiryDelay(messages: TripMessageDto[], now = new Date()): number | null {
  const newestMs = newestCreatedAtMs(messages);
  if (newestMs == null) return null;
  return Math.max(0, newestMs + TRIP_CHAT_IDLE_TTL_MS - now.getTime());
}

export function pruneExpiredTripMessages(messages: TripMessageDto[], now = new Date()): TripMessageDto[] {
  const delay = getTripChatExpiryDelay(messages, now);
  return delay === 0 ? [] : messages;
}
