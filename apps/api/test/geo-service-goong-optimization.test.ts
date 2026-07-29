import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { GeoService, type GeoPoint } from "../src/geo/geo.service";

class FakeConfig {
  get<T = string>(key: string): T | undefined {
    const values: Record<string, string> = {
      GEO_PROVIDER: "goong",
      GOONG_API_KEY: "test-goong-key",
    };
    return values[key] as T | undefined;
  }
}

function createService() {
  return new GeoService(new FakeConfig() as never);
}

function jsonResponse(body: unknown, ok = true) {
  return {
    ok,
    json: async () => body,
  } as Response;
}

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

test("Goong autocomplete uses v2 only when v2 returns predictions", async () => {
  const urls: string[] = [];
  global.fetch = (async (input: URL | RequestInfo) => {
    const url = String(input);
    urls.push(url);
    if (url.includes("/v2/place/autocomplete")) {
      return jsonResponse({
        status: "OK",
        predictions: [
          {
            place_id: "place-1",
            description: "Dinh Bao Dai III, Da Lat",
            structured_formatting: {
              main_text: "Dinh Bao Dai III",
              secondary_text: "Da Lat",
            },
          },
        ],
      });
    }
    throw new Error(`Unexpected fetch: ${url}`);
  }) as typeof fetch;

  const results = await createService().autocomplete("dinh bao dai");

  assert.equal(results.length, 1);
  assert.equal(results[0].providerId, "goong:place-1");
  assert.equal(urls.length, 1);
  assert.match(urls[0], /\/v2\/place\/autocomplete/);
  assert.doesNotMatch(urls.join("\n"), /\/Place\/AutoComplete/);
});

test("Goong autocomplete shares concurrent identical requests", async () => {
  const urls: string[] = [];
  let releaseFetch!: () => void;
  const fetchGate = new Promise<void>((resolve) => {
    releaseFetch = resolve;
  });

  global.fetch = (async (input: URL | RequestInfo) => {
    const url = String(input);
    urls.push(url);
    await fetchGate;
    return jsonResponse({
      status: "OK",
      predictions: [
        {
          place_id: "place-1",
          description: "Dinh Bao Dai III, Da Lat",
          structured_formatting: { main_text: "Dinh Bao Dai III" },
        },
      ],
    });
  }) as typeof fetch;

  const service = createService();
  const first = service.autocomplete("dinh bao dai");
  const second = service.autocomplete("  DINH BAO DAI  ");
  releaseFetch();
  const [firstResults, secondResults] = await Promise.all([first, second]);

  assert.equal(firstResults[0].providerId, "goong:place-1");
  assert.equal(secondResults[0].providerId, "goong:place-1");
  assert.equal(urls.length, 1);
});

test("Goong ordered route legs fetch only adjacent legs", async () => {
  const urls: string[] = [];
  global.fetch = (async (input: URL | RequestInfo) => {
    const url = String(input);
    urls.push(url);
    return jsonResponse({
      status: "OK",
      rows: [
        {
          elements: [
            {
              status: "OK",
              duration: { value: 600 },
              distance: { value: 5000 },
            },
          ],
        },
      ],
    });
  }) as typeof fetch;

  const points: GeoPoint[] = [
    { lat: 11.91969, lng: 108.33426 },
    { lat: 11.98469, lng: 108.39158 },
    { lat: 11.94107, lng: 108.45169 },
    { lat: 11.93936, lng: 108.44516 },
    { lat: 11.93016, lng: 108.42959 },
    { lat: 11.93377, lng: 108.42343 },
  ];

  const legs = await createService().routeLegs(points);

  assert.equal(legs.length, 5);
  assert.equal(legs.every((leg) => leg?.durationSec === 600), true);
  assert.equal(urls.length, 5);
  assert.equal(urls.every((url) => url.includes("/v2/distancematrix")), true);
  assert.equal(urls.every((url) => new URL(url).searchParams.get("destinations")?.includes("|") === false), true);
});
