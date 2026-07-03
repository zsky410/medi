import { z } from "zod";

export const publishGuideSchema = z.object({
  tripId: z.string(),
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).default(0),
  currency: z.string().length(3).default("VND"),
});
export type PublishGuideInput = z.infer<typeof publishGuideSchema>;

export const updateGuideSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().max(2000).optional(),
  price: z.number().min(0).optional(),
  published: z.boolean().optional(),
});
export type UpdateGuideInput = z.infer<typeof updateGuideSchema>;

export interface GuideListItemDto {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  destination: string;
  coverImage: string | null;
  dayCount: number;
  placeCount: number;
  purchaseCount: number;
  creatorName: string;
  creatorId: string;
  createdAt: string;
}

export interface GuideDetailDto extends GuideListItemDto {
  tripId: string;
  owned: boolean;
  purchased: boolean;
}

export interface GuidesListDto {
  items: GuideListItemDto[];
  total: number;
}

export interface PurchaseGuideResultDto {
  guideId: string;
  clonedTripId: string;
  provider: "mock" | "free";
}
