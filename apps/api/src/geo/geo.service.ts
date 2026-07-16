import { Injectable, Logger, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { GeoAutocompleteResult, GeoSearchResult } from "@medi/types";

interface NominatimItem {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
}

interface GoongPrediction {
  place_id: string;
  description: string;
  structured_formatting?: { main_text?: string; secondary_text?: string };
  types?: string[];
}

interface GoongPlaceDetail {
  result?: {
    name?: string;
    formatted_address?: string;
    geometry?: { location?: { lat: number; lng: number } };
    types?: string[];
  };
  status?: string;
}

interface GoongGeocodeResult {
  place_id?: string;
  name?: string;
  formatted_address?: string;
  address?: string;
  geometry?: { location?: { lat: number; lng: number } };
  types?: string[];
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const AUTOCOMPLETE_CACHE_MS = 60_000;
const DETAIL_CACHE_MS = 5 * 60_000;
const CACHE_LIMIT = 200;

@Injectable()
export class GeoService {
  private readonly logger = new Logger(GeoService.name);
  private readonly autocompleteCache = new Map<string, CacheEntry<GeoAutocompleteResult[]>>();
  private readonly detailCache = new Map<string, CacheEntry<GeoSearchResult>>();

  constructor(private readonly config: ConfigService) {
    const provider = this.config.get<string>("GEO_PROVIDER") ?? "nominatim";
    const hasGoongKey = Boolean(this.config.get<string>("GOONG_API_KEY"));
    this.logger.log(`Geo provider=${provider} goongKey=${hasGoongKey ? "set" : "missing"}`);
  }

  async autocomplete(
    query: string,
    location?: { lat: number; lng: number },
  ): Promise<GeoAutocompleteResult[]> {
    const provider = this.config.get<string>("GEO_PROVIDER") ?? "nominatim";
    const goongKey = this.config.get<string>("GOONG_API_KEY");
    if (provider === "goong") {
      // Fail loudly instead of silently returning OSM results, which previously
      // made misconfiguration look like a "not found" search bug.
      if (!goongKey) {
        throw new ServiceUnavailableException(
          "GEO_PROVIDER=goong nhưng thiếu GOONG_API_KEY. Vui lòng cấu hình khoá REST API của Goong.",
        );
      }
      return this.autocompleteGoong(query, goongKey, location);
    }
    return this.searchNominatim(query);
  }

  async resolve(providerId: string): Promise<GeoSearchResult> {
    if (providerId.startsWith("goong:")) {
      const apiKey = this.config.get<string>("GOONG_API_KEY");
      if (!apiKey) throw new ServiceUnavailableException("Chưa cấu hình Goong API");
      return this.resolveGoong(providerId.slice("goong:".length), apiKey);
    }
    throw new ServiceUnavailableException("Không thể lấy chi tiết địa điểm này");
  }

  private async searchNominatim(query: string): Promise<GeoSearchResult[]> {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", query);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "8");
    url.searchParams.set("addressdetails", "0");

    const res = await fetch(url, {
      headers: {
        // Nominatim usage policy requires an identifying User-Agent.
        "User-Agent": "medi-travel-planner/0.1 (dev)",
        "Accept-Language": "vi,en",
      },
    });
    if (!res.ok) {
      throw new ServiceUnavailableException("Dịch vụ tìm kiếm địa điểm tạm thời không khả dụng");
    }
    const items = (await res.json()) as NominatimItem[];
    return items.map((item) => ({
      providerId: `osm:${item.place_id}`,
      name: item.name || item.display_name.split(",")[0],
      address: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      category: item.type ?? item.class ?? null,
    }));
  }

  private async autocompleteGoong(
    query: string,
    apiKey: string,
    location?: { lat: number; lng: number },
  ): Promise<GeoAutocompleteResult[]> {
    const cacheKey = [
      query.trim().toLocaleLowerCase("vi-VN"),
      location ? `${location.lat.toFixed(4)},${location.lng.toFixed(4)}` : "",
    ]
      .filter(Boolean)
      .join("|");
    const cached = this.readCache(this.autocompleteCache, cacheKey);
    if (cached) return cached;

    const settled = await Promise.allSettled([
      this.autocompleteGoongV2(query, apiKey, location),
      this.autocompleteGoongLegacy(query, apiKey, location),
    ]);
    const autocompleteGroups = settled
      .filter((result): result is PromiseFulfilledResult<GeoAutocompleteResult[]> => result.status === "fulfilled")
      .map((result) => result.value);

    let results = this.mergeAutocompleteResults(...autocompleteGroups);
    if (results.length === 0) {
      const geocodeSettled = await Promise.allSettled([
        this.forwardGeocodeGoong(query, apiKey),
        this.forwardGeocodeGoongLegacy(query, apiKey),
      ]);
      const geocodeGroups = geocodeSettled
        .filter((result): result is PromiseFulfilledResult<GeoAutocompleteResult[]> => result.status === "fulfilled")
        .map((result) => result.value);
      results = this.mergeAutocompleteResults(...geocodeGroups);
    }

    if (results.length > 0) {
      this.writeCache(this.autocompleteCache, cacheKey, results, AUTOCOMPLETE_CACHE_MS);
    }
    return results;
  }

  private async autocompleteGoongV2(
    query: string,
    apiKey: string,
    location?: { lat: number; lng: number },
  ): Promise<GeoAutocompleteResult[]> {
    const autocompleteUrl = new URL("https://rsapi.goong.io/v2/place/autocomplete");
    autocompleteUrl.searchParams.set("input", query);
    autocompleteUrl.searchParams.set("limit", "8");
    autocompleteUrl.searchParams.set("more_compound", "true");
    autocompleteUrl.searchParams.set("has_deprecated_administrative_unit", "true");
    autocompleteUrl.searchParams.set("api_key", apiKey);
    if (location) {
      autocompleteUrl.searchParams.set("location", `${location.lat},${location.lng}`);
    }

    const data = await this.fetchGoongJson<{ predictions?: GoongPrediction[]; status?: string }>(
      autocompleteUrl,
    );
    if (!data) return [];
    return this.mapPredictions(data.predictions ?? []);
  }

  private async autocompleteGoongLegacy(
    query: string,
    apiKey: string,
    location?: { lat: number; lng: number },
  ): Promise<GeoAutocompleteResult[]> {
    const autocompleteUrl = new URL("https://rsapi.goong.io/Place/AutoComplete");
    autocompleteUrl.searchParams.set("input", query);
    autocompleteUrl.searchParams.set("limit", "8");
    autocompleteUrl.searchParams.set("more_compound", "true");
    autocompleteUrl.searchParams.set("api_key", apiKey);
    if (location) {
      autocompleteUrl.searchParams.set("location", `${location.lat},${location.lng}`);
    }

    const data = await this.fetchGoongJson<{ predictions?: GoongPrediction[]; status?: string }>(
      autocompleteUrl,
    );
    if (!data) return [];
    return this.mapPredictions(data.predictions ?? []);
  }

  private mapPredictions(predictions: GoongPrediction[]): GeoAutocompleteResult[] {
    return predictions.slice(0, 8).map((prediction) => ({
      providerId: `goong:${prediction.place_id}`,
      name: prediction.structured_formatting?.main_text ?? prediction.description.split(",")[0],
      address: prediction.structured_formatting?.secondary_text ?? prediction.description,
      category: prediction.types?.[0] ?? null,
    } satisfies GeoAutocompleteResult));
  }

  private mergeAutocompleteResults(...groups: GeoAutocompleteResult[][]): GeoAutocompleteResult[] {
    const merged = new Map<string, GeoAutocompleteResult>();
    for (const group of groups) {
      for (const item of group) {
        if (!merged.has(item.providerId)) merged.set(item.providerId, item);
        if (merged.size >= 8) return [...merged.values()];
      }
    }
    return [...merged.values()];
  }

  private async forwardGeocodeGoong(query: string, apiKey: string): Promise<GeoAutocompleteResult[]> {
    const geocodeUrl = new URL("https://rsapi.goong.io/v2/geocode");
    geocodeUrl.searchParams.set("address", query);
    geocodeUrl.searchParams.set("limit", "8");
    geocodeUrl.searchParams.set("has_deprecated_administrative_unit", "true");
    geocodeUrl.searchParams.set("api_key", apiKey);

    const data = await this.fetchGoongJson<{ results?: GoongGeocodeResult[]; status?: string }>(geocodeUrl);
    if (!data) return [];
    return this.mapGeocodeResults(query, data.results ?? []);
  }

  private async forwardGeocodeGoongLegacy(query: string, apiKey: string): Promise<GeoAutocompleteResult[]> {
    const geocodeUrl = new URL("https://rsapi.goong.io/Geocode");
    geocodeUrl.searchParams.set("address", query);
    geocodeUrl.searchParams.set("api_key", apiKey);

    const data = await this.fetchGoongJson<{ results?: GoongGeocodeResult[]; status?: string }>(geocodeUrl);
    if (!data) return [];
    return this.mapGeocodeResults(query, data.results ?? []);
  }

  private mapGeocodeResults(query: string, results: GoongGeocodeResult[]): GeoAutocompleteResult[] {
    return results
      .filter((result) => result.geometry?.location)
      .slice(0, 8)
      .map((result, index) => ({
        providerId: result.place_id ? `goong:${result.place_id}` : `goong-geocode:${query}:${index}`,
        name: result.name ?? result.formatted_address?.split(",")[0] ?? "Địa điểm",
        address: result.formatted_address ?? result.address ?? "",
        lat: result.geometry!.location!.lat,
        lng: result.geometry!.location!.lng,
        category: result.types?.[0] ?? null,
      } satisfies GeoAutocompleteResult));
  }

  private async fetchGoongJson<T>(url: URL): Promise<T | null> {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = (await res.json()) as T & { status?: string };
      if (data.status && data.status !== "OK") return null;
      return data;
    } catch {
      return null;
    }
  }

  private async resolveGoong(placeId: string, apiKey: string): Promise<GeoSearchResult> {
    const cached = this.readCache(this.detailCache, placeId);
    if (cached) return cached;

    const detailUrl = new URL("https://rsapi.goong.io/v2/place/detail");
    detailUrl.searchParams.set("place_id", placeId);
    detailUrl.searchParams.set("api_key", apiKey);
    const res = await fetch(detailUrl);
    if (!res.ok) throw new ServiceUnavailableException("Không thể lấy chi tiết địa điểm");

    const data = (await res.json()) as GoongPlaceDetail;
    const location = data.result?.geometry?.location;
    if (data.status && data.status !== "OK") {
      throw new ServiceUnavailableException("Không thể lấy chi tiết địa điểm");
    }
    if (!location || !data.result) throw new ServiceUnavailableException("Địa điểm không có toạ độ");

    const result: GeoSearchResult = {
      providerId: `goong:${placeId}`,
      name: data.result.name ?? data.result.formatted_address?.split(",")[0] ?? "Địa điểm",
      address: data.result.formatted_address ?? data.result.name ?? "",
      lat: location.lat,
      lng: location.lng,
      category: data.result.types?.[0] ?? null,
    };
    this.writeCache(this.detailCache, placeId, result, DETAIL_CACHE_MS);
    return result;
  }

  private readCache<T>(cache: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      cache.delete(key);
      return null;
    }
    return entry.value;
  }

  private writeCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T, ttl: number) {
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value!);
    cache.set(key, { value, expiresAt: Date.now() + ttl });
  }
}
