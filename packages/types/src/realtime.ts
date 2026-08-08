import type { TripMessageDto } from "./chat";

/**
 * Realtime events broadcast over WebSocket to everyone viewing a trip.
 * Most payloads are coarse: clients refetch the affected resource.
 * Chat messages carry the saved message so clients can append immediately.
 */
export type TripRealtimeEvent =
  | { type: "trip:updated" }
  | { type: "itinerary:changed" }
  | { type: "expenses:changed" }
  | { type: "checklist:changed" }
  | { type: "members:changed" }
  | { type: "chat:message"; message: TripMessageDto };

export interface TripRealtimeMessage {
  tripId: string;
  /** Socket id of originator so clients can ignore their own echoes. */
  originSocketId?: string;
  event: TripRealtimeEvent;
}
