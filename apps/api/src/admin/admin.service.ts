import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AdminAffiliateClickDto,
  AdminDashboardDto,
  AdminGuideDto,
  AdminListDto,
  AdminPaymentIntentDto,
  AdminSystemConfigDto,
  AdminTripDto,
  AdminUserDto,
  UpdateAdminGuideModerationInput,
  UpdateAdminPaymentStatusInput,
  UpdateAdminTripVisibilityInput,
  UpdateAdminUserPlanInput,
} from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";

interface PageQuery {
  page: number;
  perPage: number;
  q?: string;
}

function iso(value?: Date | null) {
  return value?.toISOString() ?? null;
}

function pageArgs(query: PageQuery) {
  return {
    take: query.perPage,
    skip: (query.page - 1) * query.perPage,
  };
}

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getDashboard(): Promise<AdminDashboardDto> {
    const [totalUsers, proUsers, totalTrips, publicTrips, paidRevenue, pendingPayments, affiliateClicks, guidePurchases] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { plan: "PRO" } }),
        this.prisma.trip.count(),
        this.prisma.trip.count({ where: { visibility: "PUBLIC" } }),
        this.prisma.proPaymentIntent.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
        this.prisma.proPaymentIntent.count({ where: { status: "PENDING" } }),
        this.prisma.affiliateClick.count(),
        this.prisma.guidePurchase.count(),
      ]);

    return {
      totalUsers,
      proUsers,
      totalTrips,
      publicTrips,
      paidRevenue: paidRevenue._sum.amount ?? 0,
      pendingPayments,
      affiliateClicks,
      guidePurchases,
    };
  }

  async listUsers(query: PageQuery & { plan?: string; role?: string; authProvider?: string }): Promise<AdminListDto<AdminUserDto>> {
    const where = {
      ...(query.plan ? { plan: query.plan as "FREE" | "PRO" } : {}),
      ...(query.role ? { role: query.role as "USER" | "ADMIN" } : {}),
      ...(query.authProvider ? { authProvider: query.authProvider as "LOCAL" | "GOOGLE" } : {}),
      ...(query.q
        ? {
            OR: [
              { email: { contains: query.q, mode: "insensitive" as const } },
              { name: { contains: query.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...pageArgs(query),
        include: {
          _count: { select: { ownedTrips: true, guides: true, guidePurchases: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items: items.map((user) => this.toUserDto(user)), total };
  }

  async updateUserPlan(actorId: string, userId: string, input: UpdateAdminUserPlanInput): Promise<AdminUserDto> {
    if (input.plan === "FREE" && input.proExpiresAt) {
      throw new BadRequestException("Tài khoản FREE không cần ngày hết hạn PRO");
    }
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        plan: input.plan,
        proExpiresAt: input.plan === "PRO" ? (input.proExpiresAt ? new Date(input.proExpiresAt) : null) : null,
      },
      include: { _count: { select: { ownedTrips: true, guides: true, guidePurchases: true } } },
    });
    await this.audit(actorId, "USER_PLAN_UPDATED", "User", userId, input);
    return this.toUserDto(user);
  }

  async revokeUserSession(actorId: string, userId: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { refreshHash: null } });
    await this.audit(actorId, "USER_SESSION_REVOKED", "User", userId);
    return { ok: true };
  }

  async resetAiQuota(actorId: string, userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { aiGenerationsDate: null, aiGenerationsCount: 0 },
    });
    await this.audit(actorId, "USER_AI_QUOTA_RESET", "User", userId);
    return { ok: true };
  }

  async listTrips(query: PageQuery & { visibility?: string; distributionMode?: string }): Promise<AdminListDto<AdminTripDto>> {
    const where = {
      ...(query.visibility ? { visibility: query.visibility as "PRIVATE" | "LINK" | "PUBLIC" } : {}),
      ...(query.distributionMode ? { distributionMode: query.distributionMode as "EXPLORE_FREE" | "SHOP_FREE" | "SHOP_PAID" } : {}),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { destination: { contains: query.q, mode: "insensitive" as const } },
              { owner: { email: { contains: query.q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        ...pageArgs(query),
        include: {
          owner: { select: { id: true, email: true, name: true } },
          _count: { select: { members: true, days: true, places: true, expenses: true, attachments: true } },
        },
      }),
      this.prisma.trip.count({ where }),
    ]);
    return { items: items.map((trip) => this.toTripDto(trip)), total };
  }

  async updateTripVisibility(actorId: string, tripId: string, input: UpdateAdminTripVisibilityInput) {
    const trip = await this.prisma.trip.update({
      where: { id: tripId },
      data: { visibility: input.visibility },
    });
    await this.audit(actorId, "TRIP_VISIBILITY_UPDATED", "Trip", tripId, input);
    return trip;
  }

  async listPaymentIntents(query: PageQuery & { status?: string }): Promise<AdminListDto<AdminPaymentIntentDto>> {
    const where = {
      ...(query.status ? { status: query.status as "PENDING" | "PAID" | "EXPIRED" | "CANCELED" } : {}),
      ...(query.q
        ? {
            OR: [
              { checkoutCode: { contains: query.q, mode: "insensitive" as const } },
              { sepayTransactionId: { contains: query.q, mode: "insensitive" as const } },
              { user: { email: { contains: query.q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.proPaymentIntent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...pageArgs(query),
        include: { user: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.proPaymentIntent.count({ where }),
    ]);
    return { items: items.map((intent) => this.toPaymentDto(intent)), total };
  }

  async updatePaymentStatus(actorId: string, intentId: string, input: UpdateAdminPaymentStatusInput) {
    const intent = await this.prisma.proPaymentIntent.update({
      where: { id: intentId },
      data: {
        status: input.status,
        ...(input.status === "PAID" ? { paidAt: new Date() } : {}),
      },
    });
    await this.audit(actorId, "PAYMENT_STATUS_UPDATED", "ProPaymentIntent", intentId, input);
    return intent;
  }

  async listGuides(query: PageQuery & { published?: boolean }): Promise<AdminListDto<AdminGuideDto>> {
    const where = {
      ...(query.published === undefined ? {} : { published: query.published }),
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: "insensitive" as const } },
              { description: { contains: query.q, mode: "insensitive" as const } },
              { creator: { email: { contains: query.q, mode: "insensitive" as const } } },
              { trip: { destination: { contains: query.q, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.guide.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        ...pageArgs(query),
        include: {
          creator: { select: { id: true, email: true, name: true } },
          trip: { select: { id: true, title: true, destination: true, visibility: true } },
        },
      }),
      this.prisma.guide.count({ where }),
    ]);
    return { items: items.map((guide) => this.toGuideDto(guide)), total };
  }

  async updateGuideModeration(actorId: string, guideId: string, input: UpdateAdminGuideModerationInput) {
    const guide = await this.prisma.guide.update({
      where: { id: guideId },
      data: { published: input.published },
    });
    await this.audit(actorId, "GUIDE_MODERATION_UPDATED", "Guide", guideId, input);
    return guide;
  }

  async listAffiliateClicks(query: PageQuery): Promise<AdminListDto<AdminAffiliateClickDto>> {
    const where = query.q ? { partner: { contains: query.q, mode: "insensitive" as const } } : {};
    const [items, total] = await Promise.all([
      this.prisma.affiliateClick.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...pageArgs(query),
      }),
      this.prisma.affiliateClick.count({ where }),
    ]);
    return {
      items: items.map((click) => ({
        id: click.id,
        partner: click.partner,
        tripId: click.tripId,
        placeId: click.placeId,
        userId: click.userId,
        createdAt: click.createdAt.toISOString(),
      })),
      total,
    };
  }

  async listAuditLogs(query: PageQuery) {
    const where = query.q
      ? {
          OR: [
            { action: { contains: query.q, mode: "insensitive" as const } },
            { targetType: { contains: query.q, mode: "insensitive" as const } },
            { targetId: { contains: query.q, mode: "insensitive" as const } },
          ],
        }
      : {};
    const [items, total] = await Promise.all([
      this.prisma.adminAuditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        ...pageArgs(query),
        include: { actor: { select: { id: true, email: true, name: true } } },
      }),
      this.prisma.adminAuditLog.count({ where }),
    ]);
    return {
      items: items.map((log) => ({
        id: log.id,
        actor: log.actor,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        metadata: log.metadata,
        createdAt: log.createdAt.toISOString(),
      })),
      total,
    };
  }

  getSystemConfig(): AdminSystemConfigDto {
    return {
      geoProvider: this.config.get<string>("GEO_PROVIDER") ?? "nominatim",
      goongConfigured: this.has("GOONG_API_KEY"),
      openAiConfigured: this.has("OPENAI_API_KEY"),
      openAiModel: this.config.get<string>("OPENAI_MODEL") ?? "gpt-4o-mini",
      sepayConfigured:
        this.has("SEPAY_WEBHOOK_SECRET") ||
        this.has("SEPAY_BANK_NAME") ||
        this.has("SEPAY_BANK_ACCOUNT") ||
        this.has("SEPAY_ACCOUNT_NUMBER"),
      importEmailConfigured: this.has("IMPORT_EMAIL_SECRET"),
      affiliatePartners: {
        booking: this.has("AFFILIATE_BOOKING_AID"),
        agoda: this.has("AFFILIATE_AGODA_CID"),
        viator: this.has("AFFILIATE_VIATOR_PID"),
        klook: this.has("AFFILIATE_KLOOK_AID"),
        traveloka: this.has("AFFILIATE_TRAVELOKA_AID"),
      },
    };
  }

  private has(key: string): boolean {
    return Boolean(this.config.get<string>(key)?.trim());
  }

  private async audit(actorId: string, action: string, targetType: string, targetId: string, metadata?: unknown) {
    await this.prisma.adminAuditLog.create({
      data: {
        actorId,
        action,
        targetType,
        targetId,
        metadata: metadata === undefined ? undefined : (metadata as object),
      },
    });
  }

  private toUserDto(user: {
    id: string;
    email: string;
    name: string;
    avatarUrl: string | null;
    role: "USER" | "ADMIN";
    plan: "FREE" | "PRO";
    proExpiresAt: Date | null;
    authProvider: "LOCAL" | "GOOGLE";
    defaultCurrency: string;
    locale: string;
    aiGenerationsDate: Date | null;
    aiGenerationsCount: number;
    createdAt: Date;
    updatedAt: Date;
    _count?: { ownedTrips: number; guides: number; guidePurchases: number };
  }): AdminUserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      plan: user.plan,
      proExpiresAt: iso(user.proExpiresAt),
      authProvider: user.authProvider,
      defaultCurrency: user.defaultCurrency,
      locale: user.locale,
      aiGenerationsDate: iso(user.aiGenerationsDate),
      aiGenerationsCount: user.aiGenerationsCount,
      tripCount: user._count?.ownedTrips ?? 0,
      guideCount: user._count?.guides ?? 0,
      purchaseCount: user._count?.guidePurchases ?? 0,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  private toTripDto(trip: {
    id: string;
    title: string;
    destination: string;
    coverImage: string | null;
    startDate: Date;
    endDate: Date;
    visibility: "PRIVATE" | "LINK" | "PUBLIC";
    distributionMode: "EXPLORE_FREE" | "SHOP_FREE" | "SHOP_PAID";
    cloneCount: number;
    budgetAmount: number | null;
    budgetCurrency: string;
    owner: { id: string; email: string; name: string };
    _count: { members: number; days: number; places: number; expenses: number; attachments: number };
    createdAt: Date;
    updatedAt: Date;
  }): AdminTripDto {
    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      coverImage: trip.coverImage,
      startDate: trip.startDate.toISOString().slice(0, 10),
      endDate: trip.endDate.toISOString().slice(0, 10),
      visibility: trip.visibility,
      distributionMode: trip.distributionMode,
      cloneCount: trip.cloneCount,
      budgetAmount: trip.budgetAmount,
      budgetCurrency: trip.budgetCurrency,
      owner: trip.owner,
      memberCount: trip._count.members,
      dayCount: trip._count.days,
      placeCount: trip._count.places,
      expenseCount: trip._count.expenses,
      attachmentCount: trip._count.attachments,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
    };
  }

  private toPaymentDto(intent: {
    id: string;
    user: { id: string; email: string; name: string };
    amount: number;
    currency: string;
    billingPeriod: "WEEK" | "MONTH" | "YEAR";
    durationDays: number;
    status: "PENDING" | "PAID" | "EXPIRED" | "CANCELED";
    checkoutCode: string;
    sepayTransactionId: string | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): AdminPaymentIntentDto {
    return {
      id: intent.id,
      user: intent.user,
      amount: intent.amount,
      currency: intent.currency,
      billingPeriod: intent.billingPeriod,
      durationDays: intent.durationDays,
      status: intent.status,
      checkoutCode: intent.checkoutCode,
      sepayTransactionId: intent.sepayTransactionId,
      paidAt: iso(intent.paidAt),
      createdAt: intent.createdAt.toISOString(),
      updatedAt: intent.updatedAt.toISOString(),
    };
  }

  private toGuideDto(guide: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    published: boolean;
    purchaseCount: number;
    creator: { id: string; email: string; name: string };
    trip: { id: string; title: string; destination: string; visibility: "PRIVATE" | "LINK" | "PUBLIC" };
    createdAt: Date;
    updatedAt: Date;
  }): AdminGuideDto {
    return {
      id: guide.id,
      title: guide.title,
      description: guide.description,
      price: guide.price,
      currency: guide.currency,
      published: guide.published,
      purchaseCount: guide.purchaseCount,
      creator: guide.creator,
      trip: guide.trip,
      createdAt: guide.createdAt.toISOString(),
      updatedAt: guide.updatedAt.toISOString(),
    };
  }
}
