import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { customAlphabet } from "nanoid";
import type {
  AiUsageDto,
  AiTripGenerationDto,
  AiTripGenerationStatus,
  GenerateTripInput,
  GenerateTripJobDto,
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
  hasTrustedSourceCitation,
  ensureEnoughPlaces,
} from "./services";

const generateInviteCode = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 10);
const generateRequestId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 12);
const FREE_DAILY_LIMIT = 3;
const ESTIMATED_WAIT_SECONDS = 180;
const WORKER_INTERVAL_MS = 2_000;
const STALE_JOB_MS = 10 * 60_000;
const RUNNING_STATUSES: AiTripGenerationStatus[] = [
  "RESEARCHING",
  "VERIFYING",
  "PLANNING",
  "ROUTING",
  "NARRATING",
];

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}

function readBool(config: ConfigService, key: string, fallback = false): boolean {
  const value = config.get<string>(key);
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function asStatus(value: unknown): AiTripGenerationStatus {
  return typeof value === "string" && [
    "QUEUED",
    "RESEARCHING",
    "VERIFYING",
    "PLANNING",
    "ROUTING",
    "NARRATING",
    "SUCCEEDED",
    "FAILED",
  ].includes(value)
    ? (value as AiTripGenerationStatus)
    : "QUEUED";
}

type GenerationJobRow = {
  id: string;
  userId: string;
  input: unknown;
  status: string;
  stage: string;
  progress: number;
  resultTripId: string | null;
  errorMessage: string | null;
  metadata: unknown;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

@Injectable()
export class AiService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;
  private workerTimer: ReturnType<typeof setInterval> | null = null;
  private processingQueue = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly geo: GeoService,
  ) {
    this.provider = createAiProvider(config);
  }

  onModuleInit() {
    if (readBool(this.config, "AI_TRIP_WORKER_AUTOSTART", true)) {
      this.startGenerationWorker();
    }
  }

  onModuleDestroy() {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
    }
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

  async generateTrip(userId: string, input: GenerateTripInput): Promise<GenerateTripJobDto> {
    const remaining = await this.consumeGeneration(userId);
    const job = (await (this.prisma as unknown as {
      aiTripGenerationJob: {
        create: (args: unknown) => Promise<GenerationJobRow>;
      };
    }).aiTripGenerationJob.create({
      data: {
        userId,
        input,
        status: "QUEUED",
        stage: "QUEUED",
        progress: 0,
        metadata: { remainingGenerations: remaining },
      },
    })) as GenerationJobRow;

    this.processQueueSoon();
    return { generationId: job.id, status: "QUEUED", estimatedWaitSeconds: ESTIMATED_WAIT_SECONDS };
  }

  async getGeneration(userId: string, generationId: string): Promise<AiTripGenerationDto> {
    const job = (await (this.prisma as unknown as {
      aiTripGenerationJob: {
        findFirst: (args: unknown) => Promise<GenerationJobRow | null>;
      };
    }).aiTripGenerationJob.findFirst({
      where: { id: generationId, userId },
    })) as GenerationJobRow | null;
    if (!job) throw new NotFoundException("Không tìm thấy job tạo lịch trình AI");
    return this.toGenerationDto(job);
  }

  async processGenerationJobForTest(generationId: string): Promise<void> {
    await this.processGenerationJob(generationId);
  }

  private async runGenerationPipeline(
    userId: string,
    input: GenerateTripInput,
    remaining: number | null,
    updateStage: (status: AiTripGenerationStatus, progress: number) => Promise<void>,
    generationJob?: { id: string; metadata: Record<string, unknown> },
  ): Promise<GenerateTripResultDto> {
    const requestId = generateRequestId();
    this.logger.log(`[${requestId}] generateTrip start user=${userId} destination=${input.destination.name}`);

    await updateStage("RESEARCHING", 10);
    const destination = await new DestinationResolverService(this.geo).resolve(input.destination);
    const startingPoint = await new DestinationResolverService(this.geo).resolve(input.startingPoint);
    const intent = new IntentNormalizerService().normalize(input, destination, startingPoint);

    const catalog = new PlaceCatalogService(this.prisma as never, this.config);
    const [goongCandidates, catalogCandidates, research] = await Promise.all([
      new PlaceProviderService(this.geo, this.config).findCandidates(intent),
      catalog.findCandidates(intent),
      new PlaceResearchService(new AiWebPlaceResearchProvider(this.config), this.config).collect(intent),
    ]);
    this.assertResearchQuality(research);

    await updateStage("VERIFYING", 35);
    const candidatePool = [...goongCandidates, ...catalogCandidates, ...research.candidates];
    const resolver = new PlaceResolverService(this.geo);
    const resolved = await resolver.resolveCandidates(intent, candidatePool);
    const enriched = new PlaceEnrichmentService().enrich(intent, resolved);
    const deduped = new PlaceDeduplicationService().dedupe(enriched);
    const strictSourceMode = research.usedWebResearch && !this.allowGoongOnlyFallback();
    const verifiedPool = strictSourceMode ? deduped.filter((candidate) => hasTrustedSourceCitation(candidate)) : deduped;
    if (strictSourceMode && verifiedPool.length < deduped.length) {
      this.logger.log(`[${requestId}] strict source gate kept ${verifiedPool.length}/${deduped.length} cited candidates`);
    }
    try {
      ensureEnoughPlaces(verifiedPool, intent);
    } catch (error) {
      if (strictSourceMode) {
        throw new ServiceUnavailableException(
          `Không đủ địa điểm có citation/nguồn tin cậy quanh ${intent.destination.name} cho ${intent.dayCount} ngày`,
        );
      }
      throw error;
    }

    const linked = [];
    for (const candidate of verifiedPool) {
      linked.push(await catalog.linkResolved(candidate));
    }

    await updateStage("PLANNING", 58);
    const scorer = new PlaceScoringService();
    const scored = linked.map((candidate) => scorer.score(intent, candidate));
    const selected = new PlaceSelectionService().select(intent, scored);
    ensureEnoughPlaces(selected, intent);

    const plannedDays = new DayPlannerService().planDays(intent, selected);
    this.assertPlanDiversity(plannedDays);
    await updateStage("ROUTING", 74);
    const optimized = await new PlanningRouteOptimizerService(this.geo).optimizeDays(intent, plannedDays);
    await updateStage("NARRATING", 88);
    const plan = await new TripNarratorService().narrate(intent, optimized.days);
    const metadata = buildGenerationMetadata({
      requestId,
      startingPoint: intent.startingPoint,
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
      generationJob,
    });
  }

  private startGenerationWorker() {
    if (this.workerTimer) return;
    this.processQueueSoon();
    this.workerTimer = setInterval(() => this.processQueueSoon(), WORKER_INTERVAL_MS);
  }

  private processQueueSoon() {
    if (readBool(this.config, "AI_TRIP_WORKER_AUTOSTART", true) === false) return;
    void this.processQueueOnce().catch((error) => {
      this.logger.warn(`AI trip worker failed: ${error instanceof Error ? error.message : String(error)}`);
    });
  }

  private async processQueueOnce(): Promise<void> {
    if (this.processingQueue) return;
    this.processingQueue = true;
    try {
      const staleBefore = new Date(Date.now() - STALE_JOB_MS);
      const job = (await (this.prisma as unknown as {
        aiTripGenerationJob: {
          findFirst: (args: unknown) => Promise<GenerationJobRow | null>;
        };
      }).aiTripGenerationJob.findFirst({
        where: {
          OR: [
            { status: "QUEUED" },
            { status: { in: RUNNING_STATUSES }, updatedAt: { lt: staleBefore } },
          ],
        },
        orderBy: { createdAt: "asc" },
      })) as GenerationJobRow | null;
      if (!job) return;
      await this.processGenerationJob(job.id);
    } finally {
      this.processingQueue = false;
    }
  }

  private async processGenerationJob(generationId: string): Promise<void> {
    const job = (await (this.prisma as unknown as {
      aiTripGenerationJob: {
        findUnique: (args: unknown) => Promise<GenerationJobRow | null>;
        update: (args: unknown) => Promise<GenerationJobRow>;
      };
    }).aiTripGenerationJob.findUnique({
      where: { id: generationId },
    })) as GenerationJobRow | null;
    if (!job) return;
    const currentStatus = asStatus(job.status);
    if (currentStatus === "SUCCEEDED" || currentStatus === "FAILED") return;

    const metadata = asRecord(job.metadata);
    const remaining = typeof metadata.remainingGenerations === "number" ? metadata.remainingGenerations : null;
    const input = job.input as GenerateTripInput;
    const startedAt = job.startedAt ?? new Date();
    let lastProgress = Math.max(0, Math.min(Number(job.progress) || 0, 95));
    const updateJob = async (data: Record<string, unknown>) => {
      await (this.prisma as unknown as {
        aiTripGenerationJob: { update: (args: unknown) => Promise<GenerationJobRow> };
      }).aiTripGenerationJob.update({ where: { id: generationId }, data });
    };
    const setStage = (status: AiTripGenerationStatus, progress: number) => {
      lastProgress = Math.max(0, Math.min(progress, 95));
      return updateJob({
        status,
        stage: status,
        progress,
        errorMessage: null,
        startedAt,
      });
    };

    try {
      await this.runGenerationPipeline(job.userId, input, remaining, setStage, { id: generationId, metadata });
    } catch (error) {
      await updateJob({
        status: "FAILED",
        stage: "FAILED",
        progress: Math.max(lastProgress, 5),
        errorMessage: this.humanGenerationError(error),
        completedAt: new Date(),
      });
    }
  }

  private toGenerationDto(job: GenerationJobRow): AiTripGenerationDto {
    const metadata = asRecord(job.metadata);
    const result = metadata.result as GenerateTripResultDto | undefined;
    return {
      generationId: job.id,
      status: asStatus(job.status),
      stage: asStatus(job.stage),
      progress: Math.max(0, Math.min(Number(job.progress) || 0, 100)),
      estimatedWaitSeconds: ESTIMATED_WAIT_SECONDS,
      resultTripId: job.resultTripId,
      errorMessage: job.errorMessage,
      ...(result ? { result } : {}),
    };
  }

  private assertResearchQuality(research: { usedWebResearch: boolean; warnings: string[]; fallbacks: string[] }) {
    if (research.usedWebResearch) return;
    if (this.allowGoongOnlyFallback()) return;
    throw new ServiceUnavailableException(
      "Thiếu web research/citation đáng tin trong JSON output. Cấu hình AI_WEB_RESEARCH_ENABLED với model/gateway trả citations URL hợp lệ, hoặc bật AI_ALLOW_GOONG_ONLY_FALLBACK=true cho môi trường dev.",
    );
  }

  private allowGoongOnlyFallback(): boolean {
    return readBool(this.config, "AI_ALLOW_GOONG_ONLY_FALLBACK", false);
  }

  private assertPlanDiversity(days: Array<{ places: Array<{ category: string; placeType?: string }> }>) {
    for (const day of days) {
      if (day.places.length === 0) {
        throw new ServiceUnavailableException("Không đủ địa điểm đã xác minh để phủ đủ từng ngày trong lịch trình.");
      }
      if (!day.places.some((place) => place.category !== "FOOD")) {
        throw new ServiceUnavailableException("Không đủ địa điểm tham quan/hoạt động đã xác minh để tạo lịch đa dạng.");
      }
      if (day.places.filter((place) => place.placeType === "CAFE").length > 1) {
        throw new ServiceUnavailableException("Không đủ địa điểm đa dạng: một ngày có quá nhiều quán cà phê.");
      }
      if (day.places.filter((place) => place.category === "FOOD" && place.placeType !== "CAFE").length > 1) {
        throw new ServiceUnavailableException("Không đủ địa điểm đa dạng: một ngày có quá nhiều điểm chỉ ăn uống.");
      }
    }
  }

  private humanGenerationError(error: unknown): string {
    if (error instanceof ServiceUnavailableException || error instanceof BadRequestException || error instanceof ForbiddenException) {
      const response = error.getResponse();
      if (typeof response === "string") return response;
      if (response && typeof response === "object" && "message" in response) {
        const message = (response as { message: unknown }).message;
        return Array.isArray(message) ? message.join("; ") : String(message);
      }
    }
    return error instanceof Error ? error.message : "Không tạo được lịch trình AI";
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
