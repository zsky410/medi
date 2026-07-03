import type { PlaceCategory } from "./place";

export const AFFILIATE_PARTNERS = [
  "booking",
  "agoda",
  "viator",
  "klook",
  "traveloka",
] as const;
export type AffiliatePartnerId = (typeof AFFILIATE_PARTNERS)[number];

export type AffiliateCategory = "lodging" | "flights" | "activities";

export interface AffiliatePartnerDto {
  id: AffiliatePartnerId;
  name: string;
  emoji: string;
  description: string;
  category: AffiliateCategory;
  /** Tracked redirect URL — opens partner site via /affiliate/go */
  url: string;
  hasAffiliateId: boolean;
}

export interface PlaceDealDto {
  placeId: string;
  placeName: string;
  category: PlaceCategory;
  dayLabel: string | null;
  deals: AffiliatePartnerDto[];
}

export interface TripAffiliateDto {
  destination: string;
  startDate: string;
  endDate: string;
  partners: AffiliatePartnerDto[];
  placeDeals: PlaceDealDto[];
}
