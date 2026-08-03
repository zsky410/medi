import { z } from "zod";
import type { AuthProvider, Plan, SystemRole } from "./auth";
import type { ProBillingPeriod } from "./billing";
import type { TripDistributionMode, TripVisibility } from "./trip";

export type AdminPaymentStatus = "PENDING" | "PAID" | "EXPIRED" | "CANCELED";

export interface AdminDashboardDto {
  totalUsers: number;
  proUsers: number;
  totalTrips: number;
  publicTrips: number;
  paidRevenue: number;
  pendingPayments: number;
  affiliateClicks: number;
  guidePurchases: number;
}

export interface AdminListDto<T> {
  items: T[];
  total: number;
}

export interface AdminUserDto {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: SystemRole;
  plan: Plan;
  proExpiresAt: string | null;
  authProvider: AuthProvider;
  defaultCurrency: string;
  locale: string;
  aiGenerationsDate: string | null;
  aiGenerationsCount: number;
  tripCount: number;
  guideCount: number;
  purchaseCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTripDto {
  id: string;
  title: string;
  destination: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  visibility: TripVisibility;
  distributionMode: TripDistributionMode;
  cloneCount: number;
  budgetAmount: number | null;
  budgetCurrency: string;
  owner: { id: string; email: string; name: string };
  memberCount: number;
  dayCount: number;
  placeCount: number;
  expenseCount: number;
  attachmentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentIntentDto {
  id: string;
  user: { id: string; email: string; name: string };
  amount: number;
  currency: string;
  billingPeriod: ProBillingPeriod;
  durationDays: number;
  status: AdminPaymentStatus;
  checkoutCode: string;
  sepayTransactionId: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminGuideDto {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  published: boolean;
  purchaseCount: number;
  creator: { id: string; email: string; name: string };
  trip: { id: string; title: string; destination: string; visibility: TripVisibility };
  createdAt: string;
  updatedAt: string;
}

export interface AdminAffiliateClickDto {
  id: string;
  partner: string;
  tripId: string;
  placeId: string | null;
  userId: string | null;
  createdAt: string;
}

export interface AdminSystemConfigDto {
  geoProvider: string;
  goongConfigured: boolean;
  openAiConfigured: boolean;
  openAiModel: string;
  sepayConfigured: boolean;
  importEmailConfigured: boolean;
  affiliatePartners: {
    booking: boolean;
    agoda: boolean;
    viator: boolean;
    klook: boolean;
    traveloka: boolean;
  };
}

export const adminPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().optional(),
});

export const adminUserFilterSchema = adminPaginationSchema.extend({
  plan: z.enum(["FREE", "PRO"]).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  authProvider: z.enum(["LOCAL", "GOOGLE"]).optional(),
});

export const adminTripFilterSchema = adminPaginationSchema.extend({
  visibility: z.enum(["PRIVATE", "LINK", "PUBLIC"]).optional(),
  distributionMode: z.enum(["EXPLORE_FREE", "SHOP_FREE", "SHOP_PAID"]).optional(),
});

export const adminPaymentFilterSchema = adminPaginationSchema.extend({
  status: z.enum(["PENDING", "PAID", "EXPIRED", "CANCELED"]).optional(),
});

export const adminGuideFilterSchema = adminPaginationSchema.extend({
  published: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
});

export const updateAdminUserPlanSchema = z.object({
  plan: z.enum(["FREE", "PRO"]),
  proExpiresAt: z.string().datetime().nullable().optional(),
});
export type UpdateAdminUserPlanInput = z.infer<typeof updateAdminUserPlanSchema>;

export const updateAdminTripVisibilitySchema = z.object({
  visibility: z.enum(["PRIVATE", "LINK", "PUBLIC"]),
});
export type UpdateAdminTripVisibilityInput = z.infer<typeof updateAdminTripVisibilitySchema>;

export const updateAdminPaymentStatusSchema = z.object({
  status: z.enum(["PENDING", "PAID", "EXPIRED", "CANCELED"]),
});
export type UpdateAdminPaymentStatusInput = z.infer<typeof updateAdminPaymentStatusSchema>;

export const updateAdminGuideModerationSchema = z.object({
  published: z.boolean(),
});
export type UpdateAdminGuideModerationInput = z.infer<typeof updateAdminGuideModerationSchema>;
