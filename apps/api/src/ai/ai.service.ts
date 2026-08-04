import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from "@nestjs/common";
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
import { GeoService } from "../geo/geo.service";
import { PrismaService } from "../prisma/prisma.service";
import { createAiProvider } from "./ai.provider-impl";
import type { AiProvider } from "./ai.providers";
import {
  AiWebPlaceResearchProvider,
  DayPlannerService,
  DestinationResolverService,
  IntentNormalizerService,
  PlaceCatalogService,
  PlaceDeduplicationService,
  PlaceEnrichmentService,
  PlaceProviderService,
  PlaceResearchService,
  PlaceResolverService,
  PlaceScoringService,
  PlaceSelectionService,
  PlanningRouteOptimizerService,
  TripNarratorService,
  TripPersistenceService,
  buildGenerationMetadata,
  ensureEnoughPlaces,
} from "./services";

const generateInviteCode = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);
const generateRequestId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);
const FREE_DAILY_LIMIT = 3;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly geo: GeoService,
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
    const requestId = generateRequestId();
    const remaining = await this.consumeGeneration(userId);
    this.logger.log(`[${requestId}] generateTrip start user=${userId} destination=${input.destination.name}`);

    const destination = await new DestinationResolverService(this.geo).resolve(input.destination);
    const intent = new IntentNormalizerService().normalize(input, destination);

    const catalog = new PlaceCatalogService(this.prisma as never, this.config);
    const [goongCandidates, catalogCandidates, research] = await Promise.all([
      new PlaceProviderService(this.geo, this.config).findCandidates(intent),
      catalog.findCandidates(intent),
      new PlaceResearchService(new AiWebPlaceResearchProvider(this.config), this.config).collect(intent),
    ]);

    const candidatePool = [...goongCandidates, ...catalogCandidates, ...research.candidates];
    const resolver = new PlaceResolverService(this.geo);
    const resolved = await resolver.resolveCandidates(intent, candidatePool);
    const enriched = new PlaceEnrichmentService().enrich(intent, resolved);
    const deduped = new PlaceDeduplicationService().dedupe(enriched);
    ensureEnoughPlaces(deduped, intent);

    const linked = [];
    for (const candidate of deduped) {
      linked.push(await catalog.linkResolved(candidate));
    }

    const scorer = new PlaceScoringService();
    const scored = linked.map((candidate) => scorer.score(intent, candidate));
    const selected = new PlaceSelectionService().select(intent, scored);
    ensureEnoughPlaces(selected, intent);

    const plannedDays = new DayPlannerService().planDays(intent, selected);
    const optimized = await new PlanningRouteOptimizerService(this.geo).optimizeDays(intent, plannedDays);
    const plan = await new TripNarratorService().narrate(intent, optimized.days);
    const metadata = buildGenerationMetadata({
      requestId,
      goongCandidates: goongCandidates.length,
      catalogCandidates: catalogCandidates.length,
      aiWebCandidates: research.candidates.length,
      resolvedCandidates: resolved.length,
      dedupedCandidates: deduped.length,
      selectedCandidates: selected.length,
      fallbacks: [...research.fallbacks, ...plan.metadata.warnings],
      warnings: [...research.warnings, ...plan.metadata.warnings],
      usedWebResearch: research.usedWebResearch,
      usedDistanceMatrix: optimized.usedDistanceMatrix,
      pace: intent.pace,
      selected,
    });

    this.logger.log(
      `[${requestId}] candidates goong=${goongCandidates.length} catalog=${catalogCandidates.length} aiWeb=${research.candidates.length} resolved=${resolved.length} selected=${selected.length}`,
    );

    return new TripPersistenceService(this.prisma as never).persist({
      userId,
      remainingGenerations: remaining,
      inviteCode: generateInviteCode(),
      intent,
      days: optimized.days,
      plan,
      metadata,
    });
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
