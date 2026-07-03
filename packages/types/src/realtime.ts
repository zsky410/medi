/**
 * Realtime events broadcast over WebSocket to everyone viewing a trip.
 * The payload is intentionally coarse: clients refetch the affected resource.
 */
export type TripRealtimeEvent =
  | { type: "trip:updated" }
  | { type: "itinerary:changed" }
  | { type: "expenses:changed" }
  | { type: "checklist:changed" }
  | { type: "members:changed" };

export interface TripRealtimeMessage {
  tripId: string;
  /** Socket id of originator so clients can ignore their own echoes. */
  originSocketId?: string;
  event: TripRealtimeEvent;
}
