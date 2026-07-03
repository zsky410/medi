import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import type {
  AffiliatePartnerDto,
  AffiliatePartnerId,
  PlaceDealDto,
  TripAffiliateDto,
} from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";
import { TripAccessService } from "../trips/trip-access.service";
import {
  PARTNER_CONFIGS,
  buildPartnerUrl,
  partnersForPlaceCategory,
} from "./affiliate.providers";

interface RedirectToken {
  sub: string;
  partner: AffiliatePartnerId;
  tripId: string;
  placeId?: string;
  purpose: "affiliate-redirect";
}

@Injectable()
export class AffiliateService {
  private readonly logger = new Logger(AffiliateService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly jwt: JwtService,
    private readonly tripAccess: TripAccessService,
  ) {}

  private apiUrl(): string {
    return this.config.get<string>("API_URL") ?? `http://localhost:${this.config.get("API_PORT") ?? 4000}`;
  }

  private affiliateId(envKey: string): string | undefined {
    const value = this.config.get<string>(envKey)?.trim();
    return value || undefined;
  }

  private async trackedUrl(
    partner: AffiliatePartnerId,
    tripId: string,
    userId: string,
    placeId?: string,
  ): Promise<string> {
    const token = await this.jwt.signAsync(
      { sub: userId, partner, tripId, placeId, purpose: "affiliate-redirect" } satisfies RedirectToken,
      { secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"), expiresIn: "30d" },
    );
    return `${this.apiUrl()}/affiliate/go?token=${encodeURIComponent(token)}`;
  }

  private async toPartnerDto(
    partnerId: AffiliatePartnerId,
    tripId: string,
    userId: string,
    ctx: { destination: string; startDate: string; endDate: string; placeName?: string },
    placeId?: string,
  ): Promise<AffiliatePartnerDto> {
    const config = PARTNER_CONFIGS.find((p) => p.id === partnerId)!;
    const affiliateId = this.affiliateId(config.envKey);
    return {
      id: partnerId,
      name: config.name,
      emoji: config.emoji,
      description: config.description,
      category: config.category,
      url: await this.trackedUrl(partnerId, tripId, userId, placeId),
      hasAffiliateId: !!affiliateId,
    };
  }

  async getTripAffiliate(tripId: string, userId: string): Promise<TripAffiliateDto> {
    await this.tripAccess.assertRole(tripId, userId, "VIEWER");

    const trip = await this.prisma.trip.findUniqueOrThrow({
      where: { id: tripId },
      include: {
        days: { orderBy: { order: "asc" }, include: { places: { orderBy: { order: "asc" } } } },
        places: { where: { dayId: null }, orderBy: { order: "asc" } },
      },
    });

    const ctx = {
      destination: trip.destination,
      startDate: trip.startDate.toISOString().slice(0, 10),
      endDate: trip.endDate.toISOString().slice(0, 10),
    };

    const partners = await Promise.all(
      PARTNER_CONFIGS.map((p) => this.toPartnerDto(p.id, tripId, userId, ctx)),
    );

    const placeDeals: PlaceDealDto[] = [];
    const isDealCategory = (cat: string) =>
      ["LODGING", "ATTRACTION", "TRANSPORT", "FOOD", "OTHER"].includes(cat);

    for (const [dayIdx, day] of trip.days.entries()) {
      for (const place of day.places) {
        if (!isDealCategory(place.category)) continue;
        const partnerIds = partnersForPlaceCategory(place.category);
        if (partnerIds.length === 0) continue;

        placeDeals.push({
          placeId: place.id,
          placeName: place.name,
          category: place.category,
          dayLabel: `Ngày ${dayIdx + 1}`,
          deals: await Promise.all(
            partnerIds.map((id) =>
              this.toPartnerDto(id, tripId, userId, { ...ctx, placeName: place.name }, place.id),
            ),
          ),
        });
      }
    }

    for (const place of trip.places) {
      if (!isDealCategory(place.category)) continue;
      const partnerIds = partnersForPlaceCategory(place.category);
      if (partnerIds.length === 0) continue;

      placeDeals.push({
        placeId: place.id,
        placeName: place.name,
        category: place.category,
        dayLabel: null,
        deals: await Promise.all(
          partnerIds.map((id) =>
            this.toPartnerDto(id, tripId, userId, { ...ctx, placeName: place.name }, place.id),
          ),
        ),
      });
    }

    return { ...ctx, partners, placeDeals };
  }

  async handleRedirect(token: string): Promise<string> {
    let payload: RedirectToken;
    try {
      payload = await this.jwt.verifyAsync(token, {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
      });
    } catch {
      throw new UnauthorizedException("Link đặt chỗ không hợp lệ hoặc đã hết hạn");
    }
    if (payload.purpose !== "affiliate-redirect") {
      throw new UnauthorizedException("Link đặt chỗ không hợp lệ");
    }

    const trip = await this.prisma.trip.findUnique({ where: { id: payload.tripId } });
    if (!trip) throw new UnauthorizedException("Chuyến đi không tồn tại");

    const place = payload.placeId
      ? await this.prisma.place.findFirst({ where: { id: payload.placeId, tripId: payload.tripId } })
      : null;

    const config = PARTNER_CONFIGS.find((p) => p.id === payload.partner);
    if (!config) throw new UnauthorizedException("Đối tác không hợp lệ");

    await this.prisma.affiliateClick.create({
      data: {
        partner: payload.partner,
        tripId: payload.tripId,
        placeId: payload.placeId ?? null,
        userId: payload.sub,
      },
    });

    const url = buildPartnerUrl(payload.partner, {
      destination: trip.destination,
      startDate: trip.startDate.toISOString().slice(0, 10),
      endDate: trip.endDate.toISOString().slice(0, 10),
      placeName: place?.name,
      affiliateId: this.affiliateId(config.envKey),
    });

    this.logger.log(`Affiliate click: ${payload.partner} trip=${payload.tripId} place=${payload.placeId ?? "-"}`);
    return url;
  }
}
