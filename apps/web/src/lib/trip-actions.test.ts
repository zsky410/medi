import assert from "node:assert/strict";
import test from "node:test";
import type { TripDto, UserDto } from "@medi/types";
import { canDeleteTrip, tripDeletePath } from "./trip-actions";

function trip(overrides: Partial<TripDto>): TripDto {
  return {
    id: "trip-1",
    ownerId: "owner-1",
    title: "Vivu Đà Lạt",
    destination: "Đà Lạt",
    coverImage: null,
    startDate: "2026-07-06",
    endDate: "2026-07-10",
    visibility: "PRIVATE",
    distributionMode: "EXPLORE_FREE",
    inviteCode: null,
    cloneCount: 0,
    budgetAmount: null,
    budgetCurrency: "VND",
    createdAt: "2026-07-01T00:00:00.000Z",
    updatedAt: "2026-07-01T00:00:00.000Z",
    members: [],
    myRole: "OWNER",
    ...overrides,
  };
}

const user = { id: "owner-1" } as UserDto;

test("canDeleteTrip only allows the creator owner", () => {
  assert.equal(canDeleteTrip(trip({}), user), true);
  assert.equal(canDeleteTrip(trip({ myRole: "EDITOR" }), user), false);
  assert.equal(canDeleteTrip(trip({ ownerId: "someone-else" }), user), false);
  assert.equal(canDeleteTrip(trip({}), null), false);
});

test("tripDeletePath targets the trip delete endpoint", () => {
  assert.equal(tripDeletePath("trip-1"), "/trips/trip-1");
});
