import assert from "node:assert/strict";
import test from "node:test";
import { buildPublicTripsUrl } from "./public-trips";

test("buildPublicTripsUrl targets the shared free public trip feed", () => {
  assert.equal(
    buildPublicTripsUrl({ apiUrl: "http://localhost:3001", limit: 4 }).toString(),
    "http://localhost:3001/public/trips?sort=cloneCount&limit=4",
  );
});

test("buildPublicTripsUrl encodes destination filters for explore", () => {
  assert.equal(
    buildPublicTripsUrl({
      apiUrl: "https://api.example.test",
      destination: "Đà Nẵng",
      limit: 24,
    }).toString(),
    "https://api.example.test/public/trips?sort=cloneCount&limit=24&destination=%C4%90%C3%A0+N%E1%BA%B5ng",
  );
});
