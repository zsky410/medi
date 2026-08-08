import assert from "node:assert/strict";
import test from "node:test";
import {
  buildApiPath,
  jsonRequest,
  tripResourcePath,
  type JsonRequestOptions,
} from "./mobile-api";

test("buildApiPath preserves query strings and encodes params", () => {
  assert.equal(buildApiPath("/trips"), "/trips");
  assert.equal(buildApiPath("trips/:tripId/places/:placeId", { tripId: "trip 1", placeId: "p/a" }), "/trips/trip%201/places/p%2Fa");
  assert.equal(buildApiPath("/geo/autocomplete?q=Đà Lạt"), "/geo/autocomplete?q=%C4%90%C3%A0+L%E1%BA%A1t");
});

test("tripResourcePath returns the existing backend route shapes", () => {
  assert.equal(tripResourcePath("trip-1", "detail"), "/trips/trip-1");
  assert.equal(tripResourcePath("trip-1", "places"), "/trips/trip-1/places");
  assert.equal(tripResourcePath("trip-1", "checklist"), "/trips/trip-1/checklist");
  assert.equal(tripResourcePath("trip-1", "expenses"), "/trips/trip-1/expenses");
  assert.equal(tripResourcePath("trip-1", "expenseSummary"), "/trips/trip-1/expenses/summary");
  assert.equal(tripResourcePath("trip-1", "attachments"), "/trips/trip-1/attachments");
  assert.equal(tripResourcePath("trip-1", "messages"), "/trips/trip-1/messages");
  assert.equal(tripResourcePath("trip-1", "importText"), "/trips/trip-1/import/parse-text");
});

test("jsonRequest serializes object bodies and keeps explicit headers", () => {
  const request = jsonRequest({
    method: "POST",
    token: "access-token",
    body: { title: "Cà phê", amount: 120000 },
    headers: { "x-socket-id": "socket-1" },
  });

  assert.equal(request.method, "POST");
  assert.deepEqual(request.headers, {
    "Content-Type": "application/json",
    Authorization: "Bearer access-token",
    "x-socket-id": "socket-1",
  });
  assert.equal(request.body, "{\"title\":\"Cà phê\",\"amount\":120000}");
});

test("jsonRequest supports bodyless authorized GET requests", () => {
  const request = jsonRequest({ token: "access-token" } satisfies JsonRequestOptions);

  assert.deepEqual(request, {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer access-token",
    },
  });
});
