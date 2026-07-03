export interface GeoSearchResult {
  providerId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string | null;
}
