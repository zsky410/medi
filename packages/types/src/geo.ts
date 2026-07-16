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
