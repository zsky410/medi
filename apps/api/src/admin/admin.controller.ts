import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
  adminGuideFilterSchema,
  adminPaginationSchema,
  adminPaymentFilterSchema,
  adminTripFilterSchema,
  adminUserFilterSchema,
  updateAdminGuideModerationSchema,
  updateAdminPaymentStatusSchema,
  updateAdminTripVisibilitySchema,
  updateAdminUserPlanSchema,
  type UpdateAdminGuideModerationInput,
  type UpdateAdminPaymentStatusInput,
  type UpdateAdminTripVisibilityInput,
  type UpdateAdminUserPlanInput,
} from "@medi/types";
import { JwtGuard } from "../auth/jwt.guard";
import { CurrentUser, type JwtUser } from "../common/current-user.decorator";
import { ZodPipe } from "../common/zod.pipe";
import { AdminGuard } from "./admin.guard";
import { AdminService } from "./admin.service";

@UseGuards(JwtGuard, AdminGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("dashboard")
  dashboard() {
    return this.admin.getDashboard();
  }

  @Get("users")
  users(@Query(new ZodPipe(adminUserFilterSchema)) query: unknown) {
    return this.admin.listUsers(query as never);
  }

  @Patch("users/:id/plan")
  updateUserPlan(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body(new ZodPipe(updateAdminUserPlanSchema)) input: UpdateAdminUserPlanInput,
  ) {
    return this.admin.updateUserPlan(user.id, id, input);
  }

  @Post("users/:id/revoke-session")
  revokeUserSession(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.admin.revokeUserSession(user.id, id);
  }

  @Post("users/:id/reset-ai-quota")
  resetAiQuota(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.admin.resetAiQuota(user.id, id);
  }

  @Get("trips")
  trips(@Query(new ZodPipe(adminTripFilterSchema)) query: unknown) {
    return this.admin.listTrips(query as never);
  }

  @Patch("trips/:id/visibility")
  updateTripVisibility(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body(new ZodPipe(updateAdminTripVisibilitySchema)) input: UpdateAdminTripVisibilityInput,
  ) {
    return this.admin.updateTripVisibility(user.id, id, input);
  }

  @Get("payments")
  payments(@Query(new ZodPipe(adminPaymentFilterSchema)) query: unknown) {
    return this.admin.listPaymentIntents(query as never);
  }

  @Patch("payments/:id/status")
  updatePaymentStatus(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body(new ZodPipe(updateAdminPaymentStatusSchema)) input: UpdateAdminPaymentStatusInput,
  ) {
    return this.admin.updatePaymentStatus(user.id, id, input);
  }

  @Get("guides")
  guides(@Query(new ZodPipe(adminGuideFilterSchema)) query: unknown) {
    return this.admin.listGuides(query as never);
  }

  @Patch("guides/:id/moderation")
  updateGuideModeration(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body(new ZodPipe(updateAdminGuideModerationSchema)) input: UpdateAdminGuideModerationInput,
  ) {
    return this.admin.updateGuideModeration(user.id, id, input);
  }

  @Get("affiliate-clicks")
  affiliateClicks(@Query(new ZodPipe(adminPaginationSchema)) query: unknown) {
    return this.admin.listAffiliateClicks(query as never);
  }

  @Get("audit-logs")
  auditLogs(@Query(new ZodPipe(adminPaginationSchema)) query: unknown) {
    return this.admin.listAuditLogs(query as never);
  }

  @Get("system")
  system() {
    return this.admin.getSystemConfig();
  }
}
