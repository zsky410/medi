import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { GeoSearchResult } from "@medi/types";

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
  structured_formatting?: { main_text?: string };
}

@Injectable()
export class GeoService {
  constructor(private readonly config: ConfigService) {}

  async search(query: string): Promise<GeoSearchResult[]> {
    const provider = this.config.get<string>("GEO_PROVIDER") ?? "nominatim";
    const goongKey = this.config.get<string>("GOONG_API_KEY");
    if (provider === "goong" && goongKey) {
      return this.searchGoong(query, goongKey);
    }
    return this.searchNominatim(query);
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

  private async searchGoong(query: string, apiKey: string): Promise<GeoSearchResult[]> {
    const autocompleteUrl = new URL("https://rsapi.goong.io/Place/AutoComplete");
    autocompleteUrl.searchParams.set("input", query);
    autocompleteUrl.searchParams.set("api_key", apiKey);

    const res = await fetch(autocompleteUrl);
    if (!res.ok) {
      throw new ServiceUnavailableException("Dịch vụ tìm kiếm địa điểm tạm thời không khả dụng");
    }
    const data = (await res.json()) as { predictions?: GoongPrediction[] };
    const predictions = (data.predictions ?? []).slice(0, 8);

    const results = await Promise.all(
      predictions.map(async (p) => {
        const detailUrl = new URL("https://rsapi.goong.io/Place/Detail");
        detailUrl.searchParams.set("place_id", p.place_id);
        detailUrl.searchParams.set("api_key", apiKey);
        const detailRes = await fetch(detailUrl);
        if (!detailRes.ok) return null;
        const detail = (await detailRes.json()) as {
          result?: { geometry?: { location?: { lat: number; lng: number } }; types?: string[] };
        };
        const location = detail.result?.geometry?.location;
        if (!location) return null;
        return {
          providerId: `goong:${p.place_id}`,
          name: p.structured_formatting?.main_text ?? p.description.split(",")[0],
          address: p.description,
          lat: location.lat,
          lng: location.lng,
          category: detail.result?.types?.[0] ?? null,
        } satisfies GeoSearchResult;
      }),
    );
    return results.filter((r): r is GeoSearchResult => r !== null);
  }
}
