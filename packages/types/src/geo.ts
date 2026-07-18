export interface GeoAutocompleteResult {
  providerId: string;
  name: string;
  address: string;
  category: string | null;
  /** Nominatim results include coordinates immediately; Goong results require Place Detail. */
  lat?: number;
  lng?: number;
}

export interface GeoSearchResult extends GeoAutocompleteResult {
  lat: number;
  lng: number;
}

/** Sentinel id used for the lodging anchor in day route legs. */
export const ROUTE_LODGING_ID = "lodging";

/** One travel leg between two consecutive stops of a day. */
export interface RouteLegDto {
  /** Place id, or ROUTE_LODGING_ID for the lodging anchor. */
  fromId: string;
  toId: string;
  durationSec: number;
  distanceM: number;
  /** True when the value is a Haversine estimate (routing provider unavailable). */
  estimated: boolean;
}

export interface DayRouteLegsDto {
  legs: RouteLegDto[];
  vehicle: string;
}

export interface DayRoutePathDto {
  /** Goong Directions v2 encoded overview polyline; null when unavailable. */
  encodedPolyline: string | null;
  vehicle: string;
}

export interface OptimizeDayResult {
  ok: boolean;
  optimized: number;
  totalDurationSec: number;
  totalDistanceM: number;
}
