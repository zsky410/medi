import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { customAlphabet } from "nanoid";
import type {
  AiUsageDto,
  GenerateTripInput,
  GenerateTripResultDto,
  OptimizeRouteInput,
  OptimizeRouteResultDto,
  SuggestPlacesInput,
  SuggestPlacesResultDto,
} from "@medi/types";
import { PrismaService } from "../prisma/prisma.service";
import { createAiProvider } from "./ai.provider-impl";
import type { AiProvider } from "./ai.providers";

const generateInviteCode = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);
const FREE_DAILY_LIMIT = 3;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

@Injectable()
export class AiService {
  private readonly provider: AiProvider;

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.provider = createAiProvider(config);
  }

  providerName(): "mock" | "openai" {
    return this.provider.name;
  }

  async getUsage(userId: string): Promise<AiUsageDto> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan === "PRO") {
      return { used: 0, limit: null, resetsAt: null, provider: this.provider.name };
    }
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const resetDate = user.aiGenerationsDate;
    const isToday = resetDate && resetDate.getTime() === today.getTime();
    const used = isToday ? user.aiGenerationsCount : 0;
    const tomorrow = addDays(today, 1);
    return { used, limit: FREE_DAILY_LIMIT, resetsAt: tomorrow.toISOString(), provider: this.provider.name };
  }

  private async consumeGeneration(userId: string): Promise<number | null> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    if (user.plan === "PRO") return null;

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const resetDate = user.aiGenerationsDate;
    const isToday = resetDate && resetDate.getTime() === today.getTime();
    const used = isToday ? user.aiGenerationsCount : 0;

    if (used >= FREE_DAILY_LIMIT) {
      throw new ForbiddenException(`Bạn đã dùng hết ${FREE_DAILY_LIMIT} lượt AI hôm nay. Nâng cấp PRO để không giới hạn.`);
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        aiGenerationsDate: today,
        aiGenerationsCount: used + 1,
      },
    });
    return FREE_DAILY_LIMIT - used - 1;
  }

  async generateTrip(userId: string, input: GenerateTripInput): Promise<GenerateTripResultDto> {
    const remaining = await this.consumeGeneration(userId);
    const plan = await this.provider.generateTrip(input.prompt);

    const start = addDays(new Date(), 14);
    start.setUTCHours(0, 0, 0, 0);
    const end = addDays(start, plan.dayCount - 1);

    const trip = await this.prisma.trip.create({
      data: {
        ownerId: userId,
        title: plan.title,
        destination: plan.destination,
        coverImage: plan.coverImage,
        budgetAmount: plan.budget,
        budgetCurrency: "VND",
        startDate: start,
        endDate: end,
        inviteCode: generateInviteCode(),
        members: { create: { userId, role: "OWNER" } },
        days: {
          create: Array.from({ length: plan.dayCount }, (_, i) => ({
            date: addDays(start, i),
            order: i,
          })),
        },
      },
      include: { days: { orderBy: { order: "asc" } } },
    });

    const placesPerDay = Math.max(Math.ceil(plan.places.length / plan.dayCount), 1);
    const placeData = plan.places.map((p, i) => {
      const dayIdx = Math.min(Math.floor(i / placesPerDay), plan.dayCount - 1);
      return {
        tripId: trip.id,
        dayId: trip.days[dayIdx].id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        category: p.category,
        note: p.note ?? null,
        cost: p.cost ?? null,
        order: i % placesPerDay,
      };
    });

    if (placeData.length > 0) {
      await this.prisma.place.createMany({ data: placeData });
    }

    await this.prisma.checklistItem.createMany({
      data: [
        { tripId: trip.id, text: "Đặt vé xe/máy bay", type: "TODO" },
        { tripId: trip.id, text: "Sạc dự phòng", type: "PACKING" },
        { tripId: trip.id, text: "Áo khoác", type: "PACKING" },
      ],
    });

    return {
      tripId: trip.id,
      title: trip.title,
      destination: trip.destination,
      remainingGenerations: remaining,
    };
  }

  async suggestPlaces(userId: string, tripId: string, input: SuggestPlacesInput): Promise<SuggestPlacesResultDto> {
    await this.consumeGeneration(userId);
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { places: true, members: true },
    });
    if (!trip) throw new NotFoundException("Không tìm thấy chuyến đi");
    const isMember = trip.members.some((m) => m.userId === userId);
    if (!isMember) throw new ForbiddenException("Bạn không có quyền truy cập chuyến đi này");

    const suggestions = await this.provider.suggestPlaces({
      destination: trip.destination,
      existingNames: trip.places.map((p) => p.name),
      prompt: input.prompt,
      limit: input.limit,
    });

    return {
      suggestions: suggestions.map((s) => ({
        name: s.name,
        category: s.category,
        lat: s.lat,
        lng: s.lng,
        address: null,
        note: s.note ?? null,
        cost: s.cost ?? null,
      })),
      provider: this.provider.name,
    };
  }

  async optimizeRoute(userId: string, tripId: string, input: OptimizeRouteInput): Promise<OptimizeRouteResultDto> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { members: true, days: { include: { places: true } } },
    });
    if (!trip) throw new NotFoundException("Không tìm thấy chuyến đi");
    const member = trip.members.find((m) => m.userId === userId);
    if (!member || member.role === "VIEWER") {
      throw new ForbiddenException("Bạn không có quyền chỉnh sửa chuyến đi này");
    }

    const days = input.dayId ? trip.days.filter((d) => d.id === input.dayId) : trip.days;
    if (input.dayId && days.length === 0) throw new NotFoundException("Không tìm thấy ngày");

    let optimized = 0;
    for (const day of days) {
      const withCoords = day.places.filter((p) => p.lat != null && p.lng != null);
      const withoutCoords = day.places.filter((p) => p.lat == null || p.lng == null);
      if (withCoords.length < 2) continue;

      const orderedIds = this.provider.optimizeRouteOrder(
        withCoords.map((p) => ({ id: p.id, lat: p.lat!, lng: p.lng! })),
      );
      const idToPlace = new Map(day.places.map((p) => [p.id, p]));
      const finalOrder = [...orderedIds.map((id) => idToPlace.get(id)!), ...withoutCoords];

      await this.prisma.$transaction(
        finalOrder.map((p, i) => this.prisma.place.update({ where: { id: p.id }, data: { order: i } })),
      );
      optimized += withCoords.length;
    }

    if (optimized === 0) {
      throw new BadRequestException("Cần ít nhất 2 địa điểm có tọa độ trong ngày để tối ưu");
    }

    return { optimized, provider: this.provider.name };
  }
}
