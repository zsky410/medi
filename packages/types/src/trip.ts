import { z } from "zod";
import type { UserDto } from "./auth";
import type { DayDto, PlaceDto } from "./place";

export type TripVisibility = "PRIVATE" | "LINK" | "PUBLIC";
export type TripRole = "OWNER" | "EDITOR" | "VIEWER";

export const createTripSchema = z.object({
  title: z.string().min(1, "Tên chuyến đi không được để trống").max(200),
  destination: z.string().min(1, "Điểm đến không được để trống").max(200),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày không hợp lệ"),
  coverImage: z
    .union([
      z.string().url(),
      z.string().regex(/^data:image\/[a-zA-Z+]+;base64,/, "Ảnh bìa không hợp lệ"),
    ])
    .nullish(),
  budgetAmount: z.number().positive().nullish(),
  budgetCurrency: z.string().length(3).optional(),
});
export type CreateTripInput = z.infer<typeof createTripSchema>;

export const updateTripSchema = createTripSchema.partial().extend({
  visibility: z.enum(["PRIVATE", "LINK", "PUBLIC"]).optional(),
});
export type UpdateTripInput = z.infer<typeof updateTripSchema>;

export interface TripMemberDto {
  userId: string;
  role: TripRole;
  user: Pick<UserDto, "id" | "name" | "email" | "avatarUrl">;
}

export interface TripDto {
  id: string;
  ownerId: string;
  title: string;
  destination: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  visibility: TripVisibility;
  inviteCode: string | null;
  cloneCount: number;
  budgetAmount: number | null;
  budgetCurrency: string;
  createdAt: string;
  updatedAt: string;
  members: TripMemberDto[];
  myRole?: TripRole;
}

export interface TripDetailDto extends TripDto {
  days: DayDto[];
  unassignedPlaces: PlaceDto[];
}

/** Sanitized trip payload for the public share page (no emails, no invite code). */
export interface PublicTripDto {
  id: string;
  title: string;
  destination: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  ownerName: string;
  memberCount: number;
  placeCount: number;
  cloneCount: number;
  days: DayDto[];
  savedPlaces: PlaceDto[];
}

/** Card summary for the Explore feed. */
export interface PublicTripListItemDto {
  id: string;
  title: string;
  destination: string;
  coverImage: string | null;
  startDate: string;
  endDate: string;
  ownerName: string;
  memberCount: number;
  placeCount: number;
  cloneCount: number;
  dayCount: number;
}

export const listPublicTripsSchema = z.object({
  destination: z.string().max(200).optional(),
  sort: z.enum(["cloneCount", "recent"]).default("cloneCount"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListPublicTripsQuery = z.infer<typeof listPublicTripsSchema>;

export interface PublicTripsListDto {
  items: PublicTripListItemDto[];
  total: number;
}

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["EDITOR", "VIEWER"]).default("EDITOR"),
});
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

export const updateMemberRoleSchema = z.object({
  role: z.enum(["EDITOR", "VIEWER"]),
});
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;
