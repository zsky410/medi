import type { TripDto, UserDto } from "@medi/types";

export function canDeleteTrip(trip: TripDto, user: Pick<UserDto, "id"> | null | undefined): boolean {
  return Boolean(user && trip.ownerId === user.id && trip.myRole === "OWNER");
}

export function tripDeletePath(tripId: string): string {
  return `/trips/${tripId}`;
}
