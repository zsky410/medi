import assert from "node:assert/strict";
import test from "node:test";
import {
  PUBLIC_TRIP_DESTINATION_COVERS,
  buildPublicTripsUrl,
  publicTripDestinationCover,
  publicTripPreviewCover,
} from "./public-trips";

test("buildPublicTripsUrl targets the shared free public trip feed", () => {
  assert.equal(
    buildPublicTripsUrl({ apiUrl: "http://localhost:3001", limit: 4 }).toString(),
    "http://localhost:3001/public/trips?sort=cloneCount&limit=4",
  );
});

test("buildPublicTripsUrl supports the same-origin API proxy path", () => {
  assert.equal(
    buildPublicTripsUrl({ apiUrl: "/api", limit: 4 }).toString(),
    "/api/public/trips?sort=cloneCount&limit=4",
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

test("publicTripDestinationCover resolves popular Vietnamese destinations", () => {
  assert.equal(publicTripDestinationCover("Đà Lạt"), PUBLIC_TRIP_DESTINATION_COVERS.daLat);
  assert.equal(publicTripDestinationCover("TP.HCM"), PUBLIC_TRIP_DESTINATION_COVERS.hcm);
  assert.equal(publicTripDestinationCover("Hồ Chí Minh"), PUBLIC_TRIP_DESTINATION_COVERS.hcm);
  assert.equal(publicTripDestinationCover("Tam Cốc, Ninh Bình"), PUBLIC_TRIP_DESTINATION_COVERS.ninhBinh);
  assert.equal(publicTripDestinationCover("Sa Pa"), PUBLIC_TRIP_DESTINATION_COVERS.sapa);
});

test("publicTripPreviewCover keeps approved covers and replaces generic Unsplash covers", () => {
  const approvedCover = "https://cdn.example.test/da-lat-real-cover.jpg";

  assert.equal(
    publicTripPreviewCover({ destination: "Đà Lạt", coverImage: approvedCover }),
    approvedCover,
  );
  assert.equal(
    publicTripPreviewCover({
      destination: "Đà Lạt",
      coverImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
    }),
    PUBLIC_TRIP_DESTINATION_COVERS.daLat,
  );
  assert.equal(
    publicTripPreviewCover({ destination: "Nha Trang", coverImage: null }),
    PUBLIC_TRIP_DESTINATION_COVERS.nhaTrang,
  );
});
