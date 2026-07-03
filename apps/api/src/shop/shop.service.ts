import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type {
  GuideDetailDto,
  GuideListItemDto,
  GuidesListDto,
  PublishGuideInput,
  PurchaseGuideResultDto,
  UpdateGuideInput,
} from "@medi/types";
import { customAlphabet } from "nanoid";
import { PrismaService } from "../prisma/prisma.service";
import { TripsService } from "../trips/trips.service";

@Injectable()
export class ShopService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trips: TripsService,
  ) {}

  private toListItem(
    guide: {
      id: string;
      title: string;
      description: string | null;
      price: number;
      currency: string;
      purchaseCount: number;
      createdAt: Date;
      creator: { id: string; name: string };
      trip: {
        destination: string;
        coverImage: string | null;
        _count: { days: number; places: number };
      };
    },
  ): GuideListItemDto {
    return {
      id: guide.id,
      title: guide.title,
      description: guide.description,
      price: guide.price,
      currency: guide.currency,
      destination: guide.trip.destination,
      coverImage: guide.trip.coverImage,
      dayCount: guide.trip._count.days,
      placeCount: guide.trip._count.places,
      purchaseCount: guide.purchaseCount,
      creatorName: guide.creator.name,
      creatorId: guide.creator.id,
      createdAt: guide.createdAt.toISOString(),
    };
  }

  async listPublished(limit = 24, offset = 0): Promise<GuidesListDto> {
    const where = { published: true };
    const [guides, total] = await Promise.all([
      this.prisma.guide.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true } },
          trip: {
            select: {
              destination: true,
              coverImage: true,
              _count: { select: { days: true, places: true } },
            },
          },
        },
        orderBy: { purchaseCount: "desc" },
        take: limit,
        skip: offset,
      }),
      this.prisma.guide.count({ where }),
    ]);
    return { items: guides.map((g) => this.toListItem(g)), total };
  }

  async myGuides(userId: string): Promise<GuideListItemDto[]> {
    const guides = await this.prisma.guide.findMany({
      where: { creatorId: userId },
      include: {
        creator: { select: { id: true, name: true } },
        trip: {
          select: {
            destination: true,
            coverImage: true,
            _count: { select: { days: true, places: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });
    return guides.map((g) => this.toListItem(g));
  }

  async getDetail(guideId: string, userId?: string): Promise<GuideDetailDto> {
    const guide = await this.prisma.guide.findUnique({
      where: { id: guideId },
      include: {
        creator: { select: { id: true, name: true } },
        trip: {
          select: {
            id: true,
            destination: true,
            coverImage: true,
            _count: { select: { days: true, places: true } },
          },
        },
        purchases: userId ? { where: { buyerId: userId }, select: { id: true } } : false,
      },
    });
    if (!guide || (!guide.published && guide.creatorId !== userId)) {
      throw new NotFoundException("Không tìm thấy guide");
    }

    return {
      ...this.toListItem(guide),
      tripId: guide.trip.id,
      owned: guide.creatorId === userId,
      purchased: userId ? guide.purchases.length > 0 : false,
    };
  }

  async publish(userId: string, input: PublishGuideInput): Promise<GuideDetailDto> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: input.tripId },
      include: { members: true },
    });
    if (!trip) throw new NotFoundException("Không tìm thấy chuyến đi");
    const member = trip.members.find((m) => m.userId === userId);
    if (!member || member.role === "VIEWER") {
      throw new ForbiddenException("Chỉ chủ hoặc editor mới đăng guide");
    }
    if (trip.visibility !== "PUBLIC") {
      throw new BadRequestException("Chuyến đi phải ở chế độ Công khai trước khi đăng guide");
    }

    const existing = await this.prisma.guide.findFirst({ where: { tripId: input.tripId } });
    if (existing) {
      throw new BadRequestException("Chuyến đi này đã có guide. Hãy chỉnh sửa guide hiện có.");
    }

    const guide = await this.prisma.guide.create({
      data: {
        creatorId: userId,
        tripId: input.tripId,
        title: input.title,
        description: input.description ?? null,
        price: input.price,
        currency: input.currency,
        published: true,
      },
      include: {
        creator: { select: { id: true, name: true } },
        trip: {
          select: {
            id: true,
            destination: true,
            coverImage: true,
            _count: { select: { days: true, places: true } },
          },
        },
        purchases: { where: { buyerId: userId }, select: { id: true } },
      },
    });

    return {
      ...this.toListItem(guide),
      tripId: guide.trip.id,
      owned: true,
      purchased: false,
    };
  }

  async update(userId: string, guideId: string, input: UpdateGuideInput): Promise<GuideDetailDto> {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId } });
    if (!guide) throw new NotFoundException("Không tìm thấy guide");
    if (guide.creatorId !== userId) throw new ForbiddenException("Chỉ creator mới chỉnh sửa guide");

    const updated = await this.prisma.guide.update({
      where: { id: guideId },
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        published: input.published,
      },
      include: {
        creator: { select: { id: true, name: true } },
        trip: {
          select: {
            id: true,
            destination: true,
            coverImage: true,
            _count: { select: { days: true, places: true } },
          },
        },
        purchases: { where: { buyerId: userId }, select: { id: true } },
      },
    });

    return {
      ...this.toListItem(updated),
      tripId: updated.trip.id,
      owned: true,
      purchased: updated.purchases.length > 0,
    };
  }

  async purchase(userId: string, guideId: string): Promise<PurchaseGuideResultDto> {
    const guide = await this.prisma.guide.findUnique({
      where: { id: guideId },
      include: { trip: true },
    });
    if (!guide || !guide.published) throw new NotFoundException("Không tìm thấy guide");
    if (guide.creatorId === userId) {
      throw new BadRequestException("Bạn đã sở hữu guide này");
    }

    const existing = await this.prisma.guidePurchase.findUnique({
      where: { guideId_buyerId: { guideId, buyerId: userId } },
    });
    if (existing?.clonedTripId) {
      return { guideId, clonedTripId: existing.clonedTripId, provider: guide.price > 0 ? "mock" : "free" };
    }

    // MVP: mock purchase — no real payment for paid guides yet
    const cloned = await this.trips.clone(guide.tripId, userId);

    await this.prisma.guidePurchase.upsert({
      where: { guideId_buyerId: { guideId, buyerId: userId } },
      update: { clonedTripId: cloned.id },
      create: {
        guideId,
        buyerId: userId,
        clonedTripId: cloned.id,
        amount: guide.price,
        currency: guide.currency,
      },
    });

    await this.prisma.guide.update({
      where: { id: guideId },
      data: { purchaseCount: { increment: 1 } },
    });

    return {
      guideId,
      clonedTripId: cloned.id,
      provider: guide.price > 0 ? "mock" : "free",
    };
  }
}
