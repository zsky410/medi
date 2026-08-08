import assert from "node:assert/strict";
import test from "node:test";
import { DEMO_COVER_IMAGE_POOLS, DEMO_TRIPS, DEMO_USERS } from "../prisma/demo-seed-data";

test("demo seed defines ten users with a free/pro mix", () => {
  assert.equal(DEMO_USERS.length, 10);
  assert.equal(DEMO_USERS.filter((user) => user.plan === "FREE").length, 5);
  assert.equal(DEMO_USERS.filter((user) => user.plan === "PRO").length, 5);
});

test("demo seed defines fifty public trips with explore and creator shop coverage", () => {
  assert.equal(DEMO_TRIPS.length, 50);
  assert.equal(DEMO_TRIPS.filter((trip) => trip.distributionMode === "EXPLORE_FREE").length, 30);
  assert.equal(DEMO_TRIPS.filter((trip) => trip.distributionMode === "SHOP_FREE").length, 0);
  assert.equal(DEMO_TRIPS.filter((trip) => trip.distributionMode === "SHOP_PAID").length, 20);

  for (const trip of DEMO_TRIPS) {
    assert.equal(trip.visibility, "PUBLIC", trip.title);
    assert.ok(trip.lodging.name.length > 0, trip.title);
    assert.equal(trip.lodging.category, "LODGING", trip.title);
    assert.ok(trip.days.length >= 3, trip.title);

    if (trip.distributionMode === "SHOP_PAID") {
      assert.ok(trip.guide, `${trip.title} should define a creator shop guide`);
      assert.ok(trip.guide.title.length >= 3, `${trip.title} guide title`);
      assert.ok(trip.guide.description.length >= 40, `${trip.title} guide description`);
      assert.equal(trip.guide.currency, "VND", `${trip.title} guide currency`);
      assert.ok(trip.guide.price > 0, `${trip.title} paid guide price`);
    } else {
      assert.equal(trip.guide, undefined, `${trip.title} should stay out of creator shop`);
    }

    for (const day of trip.days) {
      assert.ok(
        day.places.length >= 4 && day.places.length <= 6,
        `${trip.title} day ${day.order + 1} has ${day.places.length} non-lodging places`,
      );
      assert.equal(day.places.filter((place) => place.category === "LODGING").length, 0, trip.title);
      assert.ok(day.places.some((place) => place.category === "FOOD"), `${trip.title} day ${day.order + 1}`);
      assert.ok(
        day.places.some((place) => ["ATTRACTION", "SHOPPING", "OTHER"].includes(place.category)),
        `${trip.title} day ${day.order + 1}`,
      );
    }

    for (let dayIndex = 0; dayIndex < trip.days.length - 1; dayIndex += 1) {
      const currentLastPlace = trip.days[dayIndex].places.at(-1)?.name;
      const nextFirstPlace = trip.days[dayIndex + 1].places[0]?.name;
      assert.notEqual(
        currentLastPlace,
        nextFirstPlace,
        `${trip.title} repeats ${currentLastPlace} across day ${dayIndex + 1} and ${dayIndex + 2}`,
      );
    }
  }
});

test("demo trip covers use approved destination-specific images", () => {
  const approvedCoverImages = new Set(Object.values(DEMO_COVER_IMAGE_POOLS).flat());

  assert.ok(approvedCoverImages.size >= 28);
  for (const pool of Object.values(DEMO_COVER_IMAGE_POOLS)) {
    assert.ok(pool.length >= 2, "each demo destination should have multiple cover images");
  }

  for (const trip of DEMO_TRIPS) {
    assert.ok(approvedCoverImages.has(trip.coverImage), `${trip.title} uses an unapproved cover image`);
    assert.doesNotMatch(trip.coverImage, /images\.unsplash\.com/, `${trip.title} still uses a generic Unsplash image`);
  }

  const coversByDestination = new Map<string, Set<string>>();
  for (const trip of DEMO_TRIPS) {
    const covers = coversByDestination.get(trip.destination) ?? new Set<string>();
    covers.add(trip.coverImage);
    coversByDestination.set(trip.destination, covers);
  }

  for (const [destination, covers] of coversByDestination.entries()) {
    const tripCount = DEMO_TRIPS.filter((trip) => trip.destination === destination).length;
    if (tripCount > 1) {
      assert.ok(covers.size > 1, `${destination} should rotate through multiple preview covers`);
    }
  }
});
