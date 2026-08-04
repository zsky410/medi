import { BadRequestException, Logger, ServiceUnavailableException } from "@nestjs/common";
import type {
  FinalTripPlan,
  GenerateTripInput,
  GenerationMetadata,
  NormalizedDestination,
  NormalizedTripIntent,
  PlaceCandidate,
  PlaceCandidateSource,
  PlaceCategory,
  PlannedDay,
  ResolvedPlaceCandidate,
  ScoredPlaceCandidate,
} from "@medi/types";
import { finalTripPlanSchema, PLACE_CATEGORIES } from "@medi/types";
import type { GeoAutocompleteResult, GeoSearchResult } from "@medi/types";
import type { GeoPoint, GeoService } from "../../geo/geo.service";
import { completeMatrix, haversineM, optimizeRoute } from "../../itinerary/route-optimizer";

const DEFAULT_SEARCH_RADIUS_METERS = 30_000;
const DEFAULT_SEARCH_MAX_CANDIDATES = 50;
const DEFAULT_CACHE_TTL_SECONDS = 604_800;
const ROUTE_VEHICLE = "car";

const INTEREST_QUERY_MAP: Record<string, string[]> = {
  coffee: ["quán cà phê", "specialty coffee"],
  "local-food": ["quán ăn địa phương", "đặc sản"],
  food: ["quán ăn địa phương", "nhà hàng"],
  photo: ["địa điểm chụp ảnh", "view đẹp"],
  nature: ["thiên nhiên", "công viên"],
  culture: ["bảo tàng", "di tích"],
  family: ["khu vui chơi", "địa điểm gia đình"],
  budget: ["miễn phí", "giá rẻ"],
  relax: ["chill", "đi dạo"],
  shopping: ["chợ", "mua sắm"],
};

const CATEGORY_DURATION_MINUTES: Record<PlaceCategory, number> = {
  ATTRACTION: 90,
  FOOD: 75,
  LODGING: 30,
  TRANSPORT: 30,
  SHOPPING: 75,
  OTHER: 60,
};

const CATEGORY_COST: Record<PlaceCategory, number> = {
  ATTRACTION: 120_000,
  FOOD: 120_000,
  LODGING: 0,
  TRANSPORT: 0,
  SHOPPING: 250_000,
  OTHER: 100_000,
};

function addDays(date: string, offset: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + offset);
  return value.toISOString().slice(0, 10);
}

function inclusiveDayCount(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  return Math.max(Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1, 1);
}

export function normalizePlaceName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function metersBetween(a: GeoPoint, b: GeoPoint): number {
  return haversineM(a, b);
}

function readNumber(config: { get: <T = string>(key: string) => T | undefined }, key: string, fallback: number): number {
  const value = Number(config.get<string>(key));
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function readBool(config: { get: <T = string>(key: string) => T | undefined }, key: string, fallback = false): boolean {
  const value = config.get<string>(key);
  if (value == null || value === "") return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function paceMaxPlacesPerDay(pace: NormalizedTripIntent["pace"]): number {
  if (pace === "relaxed") return 3;
  if (pace === "packed") return 5;
  return 4;
}

function mapCategory(category: string | null | undefined, name = ""): PlaceCategory {
  const normalized = `${category ?? ""} ${normalizePlaceName(name)}`;
  if (/cafe|coffee|restaurant|food|bar|bakery|quan an|nha hang|am thuc|cho dem/.test(normalized)) return "FOOD";
  if (/hotel|lodging|homestay|resort|khach san/.test(normalized)) return "LODGING";
  if (/airport|bus|station|taxi|transport|san bay|ben xe|ga /.test(normalized)) return "TRANSPORT";
  if (/shop|shopping|market|mall|store|cho |mua sam/.test(normalized)) return "SHOPPING";
  if (/tourist|attraction|museum|park|temple|pagoda|view|lake|garden|di tich|bao tang|ho |vuon/.test(normalized)) {
    return "ATTRACTION";
  }
  return "OTHER";
}

function matchedInterestsFor(candidate: { name: string; category: PlaceCategory }, interests: string[]): string[] {
  const normalized = normalizePlaceName(candidate.name);
  return interests.filter((interest) => {
    if (interest === "coffee") return candidate.category === "FOOD" && /cafe|coffee|ca phe/.test(normalized);
    if (interest === "local-food" || interest === "food") return candidate.category === "FOOD";
    if (interest === "photo") return /view|ho |lake|doi|garden|vuon|pho co|cau|thac|bien/.test(normalized) || candidate.category === "ATTRACTION";
    if (interest === "nature") return /park|garden|vuon|lake|ho |doi|thac|bien|rung/.test(normalized);
    if (interest === "culture") return /museum|bao tang|di tich|dinh|chua|temple|pagoda|pho co/.test(normalized);
    if (interest === "shopping") return candidate.category === "SHOPPING";
    return normalized.includes(normalizePlaceName(interest));
  });
}

function mergeSources(a: ResolvedPlaceCandidate, b: ResolvedPlaceCandidate): Record<string, unknown> {
  const sources = new Set<string>();
  const read = (candidate: ResolvedPlaceCandidate) => {
    sources.add(candidate.source);
    const existing = candidate.sourceMetadata.sources;
    if (Array.isArray(existing)) existing.forEach((source) => sources.add(String(source)));
  };
  read(a);
  read(b);
  return { ...a.sourceMetadata, ...b.sourceMetadata, sources: [...sources] };
}

export class IntentNormalizerService {
  normalize(input: GenerateTripInput, destination: NormalizedDestination): NormalizedTripIntent {
    const dayCount = inclusiveDayCount(input.startDate, input.endDate);
    const budgetPerPersonPerDay = input.totalBudget / input.people / dayCount;
    return {
      destination,
      startDate: input.startDate,
      endDate: input.endDate,
      dayCount,
      totalBudget: input.totalBudget,
      people: input.people,
      budgetPerPersonPerDay,
      interests: input.interests,
      notes: input.notes?.trim() ? input.notes.trim() : null,
      description: input.description?.trim() ? input.description.trim() : null,
      pace: input.pace,
    };
  }
}

export class DestinationResolverService {
  constructor(private readonly geo: Pick<GeoService, "autocomplete" | "resolve">) {}

  async resolve(destination: GenerateTripInput["destination"]): Promise<NormalizedDestination> {
    if (destination.placeId) {
      try {
        return this.fromGeoResult(await this.geo.resolve(destination.placeId));
      } catch (err) {
        if (destination.lat != null && destination.lng != null) {
          return {
            providerId: destination.placeId,
            name: destination.name,
            address: destination.address ?? null,
            lat: destination.lat,
            lng: destination.lng,
          };
        }
        throw err;
      }
    }

    if (destination.lat != null && destination.lng != null) {
      return {
        providerId: null,
        name: destination.name,
        address: destination.address ?? null,
        lat: destination.lat,
        lng: destination.lng,
      };
    }

    const results = await this.geo.autocomplete(destination.name);
    const first = results[0];
    if (!first) throw new BadRequestException("Không tìm thấy điểm đến này");
    if (first.lat != null && first.lng != null) {
      return this.fromAutocompleteResult(first);
    }
    return this.fromGeoResult(await this.geo.resolve(first.providerId));
  }

  private fromAutocompleteResult(result: GeoAutocompleteResult): NormalizedDestination {
    return {
      providerId: result.providerId,
      name: result.name,
      address: result.address ?? null,
      lat: result.lat!,
      lng: result.lng!,
    };
  }

  private fromGeoResult(result: GeoSearchResult): NormalizedDestination {
    return {
      providerId: result.providerId,
      name: result.name,
      address: result.address ?? null,
      lat: result.lat,
      lng: result.lng,
    };
  }
}

export class PlaceProviderService {
  constructor(
    private readonly geo: Pick<GeoService, "autocomplete">,
    private readonly config: { get: <T = string>(key: string) => T | undefined },
  ) {}

  async findCandidates(intent: NormalizedTripIntent): Promise<PlaceCandidate[]> {
    const maxCandidates = readNumber(this.config, "PLACE_SEARCH_MAX_CANDIDATES", DEFAULT_SEARCH_MAX_CANDIDATES);
    const queries = this.buildQueries(intent);
    const candidates: PlaceCandidate[] = [];

    for (const query of queries) {
      if (candidates.length >= maxCandidates) break;
      let results: GeoAutocompleteResult[] = [];
      try {
        results = await this.geo.autocomplete(query, {
          lat: intent.destination.lat,
          lng: intent.destination.lng,
        });
      } catch {
        results = [];
      }
      for (const result of results) {
        if (candidates.length >= maxCandidates) break;
        const category = mapCategory(result.category, result.name);
        candidates.push({
          id: result.providerId,
          source: "goong",
          providerId: result.providerId,
          name: result.name,
          address: result.address ?? null,
          lat: result.lat ?? null,
          lng: result.lng ?? null,
          category,
          cost: null,
          qualityScore: 0.65,
          confidence: 0.75,
          matchedInterests: matchedInterestsFor({ name: result.name, category }, intent.interests),
          sourceMetadata: { query, providerCategory: result.category },
          estimatedDurationMinutes: CATEGORY_DURATION_MINUTES[category],
        });
      }
    }

    return candidates;
  }

  private buildQueries(intent: NormalizedTripIntent): string[] {
    const destination = intent.destination.name;
    const queries = new Set<string>([
      `địa điểm tham quan ${destination}`,
      `quán ăn ${destination}`,
      `cà phê ${destination}`,
      `chợ ${destination}`,
    ]);

    for (const interest of intent.interests) {
      for (const term of INTEREST_QUERY_MAP[interest] ?? [interest]) {
        queries.add(`${term} ${destination}`);
      }
    }

    if (intent.description) queries.add(`${intent.description} ${destination}`);
    return [...queries].slice(0, 12);
  }
}

export class PlaceCatalogService {
  constructor(
    private readonly prisma: { placeCatalog?: Record<string, (...args: never[]) => Promise<unknown>> },
    private readonly config: { get: <T = string>(key: string) => T | undefined },
  ) {}

  async findCandidates(intent: NormalizedTripIntent): Promise<PlaceCandidate[]> {
    if (!this.prisma.placeCatalog?.findMany) return [];
    const radius = readNumber(this.config, "PLACE_SEARCH_RADIUS_METERS", DEFAULT_SEARCH_RADIUS_METERS);
    const rows = (await this.prisma.placeCatalog.findMany({
      take: readNumber(this.config, "PLACE_SEARCH_MAX_CANDIDATES", DEFAULT_SEARCH_MAX_CANDIDATES),
      orderBy: [{ qualityScore: "desc" }, { updatedAt: "desc" }],
    } as never)) as Array<{
      id: string;
      providerId: string;
      name: string;
      address: string | null;
      lat: number;
      lng: number;
      category: PlaceCategory;
      cost?: number | null;
      sourceMetadata: Record<string, unknown> | null;
      qualityScore: number;
      expiresAt: Date | null;
    }>;

    const now = Date.now();
    return rows
      .filter((row) => !row.expiresAt || row.expiresAt.getTime() > now)
      .filter((row) => metersBetween(intent.destination, row) <= radius)
      .map((row) => ({
        id: row.providerId,
        source: "catalog" as const,
        providerId: row.providerId,
        placeCatalogId: row.id,
        name: row.name,
        address: row.address,
        lat: row.lat,
        lng: row.lng,
        category: row.category,
        cost: row.cost ?? null,
        qualityScore: row.qualityScore ?? 0.6,
        confidence: 0.8,
        matchedInterests: matchedInterestsFor(row, intent.interests),
        sourceMetadata: row.sourceMetadata ?? {},
        estimatedDurationMinutes: CATEGORY_DURATION_MINUTES[row.category],
      }));
  }

  async linkResolved(candidate: ResolvedPlaceCandidate): Promise<ResolvedPlaceCandidate> {
    if (candidate.placeCatalogId || !this.prisma.placeCatalog?.upsert) return candidate;
    const ttlMs = readNumber(this.config, "PLACE_CACHE_TTL_SECONDS", DEFAULT_CACHE_TTL_SECONDS) * 1000;
    const now = new Date();
    const expiresAt = new Date(Date.now() + ttlMs);
    const row = (await this.prisma.placeCatalog.upsert({
      where: { providerId: candidate.providerId },
      create: {
        providerId: candidate.providerId,
        name: candidate.name,
        normalizedName: normalizePlaceName(candidate.name),
        address: candidate.address,
        lat: candidate.lat,
        lng: candidate.lng,
        category: candidate.category,
        sourceMetadata: candidate.sourceMetadata,
        qualityScore: candidate.qualityScore,
        lastResolvedAt: now,
        expiresAt,
      },
      update: {
        name: candidate.name,
        normalizedName: normalizePlaceName(candidate.name),
        address: candidate.address,
        lat: candidate.lat,
        lng: candidate.lng,
        category: candidate.category,
        sourceMetadata: candidate.sourceMetadata,
        qualityScore: candidate.qualityScore,
        lastResolvedAt: now,
        expiresAt,
      },
    } as never)) as { id?: string };
    return { ...candidate, placeCatalogId: row.id ?? candidate.placeCatalogId ?? null };
  }
}

export interface PlaceResearchResult {
  candidates: PlaceCandidate[];
  fallbacks: string[];
  warnings: string[];
  usedWebResearch: boolean;
}

export class AiWebPlaceResearchProvider {
  private readonly logger = new Logger(AiWebPlaceResearchProvider.name);

  constructor(private readonly config: { get: <T = string>(key: string) => T | undefined }) {}

  async research(intent: NormalizedTripIntent): Promise<PlaceCandidate[]> {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    if (!apiKey) return [];
    const baseUrl = (this.config.get<string>("OPENAI_BASE_URL") ?? "https://api.openai.com").replace(/\/+$/, "");
    const url = baseUrl.endsWith("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
    const timeout = readNumber(this.config, "AI_WEB_RESEARCH_TIMEOUT_MS", 60_000);
    const max = readNumber(this.config, "AI_WEB_RESEARCH_MAX_CANDIDATES", 30);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.get<string>("OPENAI_MODEL") ?? "gpt-4o-mini",
          response_format: { type: "json_object" },
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "Return JSON only: { places: [{ name, category, reason, sources, confidence }] }. Do not include coordinates.",
            },
            {
              role: "user",
              content: `Research real places for ${intent.destination.name}. Interests: ${intent.interests.join(", ")}. Notes: ${intent.description ?? ""}.`,
            },
          ],
        }),
      });
      if (!response.ok) return [];
      const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const content = data.choices?.[0]?.message?.content;
      if (!content) return [];
      const parsed = JSON.parse(content) as {
        places?: Array<{
          name?: string;
          category?: string;
          reason?: string;
          sources?: unknown;
          confidence?: number;
        }>;
      };
      return (parsed.places ?? [])
        .filter((place) => place.name && place.name.trim().length > 1)
        .slice(0, max)
        .map((place, index) => {
          const category = PLACE_CATEGORIES.includes(place.category as PlaceCategory)
            ? (place.category as PlaceCategory)
            : mapCategory(place.category, place.name);
          return {
            id: `ai-web:${normalizePlaceName(place.name!)}:${index}`,
            source: "ai_web" as const,
            providerId: null,
            name: place.name!.trim(),
            address: null,
            lat: null,
            lng: null,
            category,
            cost: null,
            qualityScore: 0.55,
            confidence: Math.max(0, Math.min(place.confidence ?? 0.5, 1)),
            matchedInterests: matchedInterestsFor({ name: place.name!, category }, intent.interests),
            sourceMetadata: { reason: place.reason, sources: place.sources },
            estimatedDurationMinutes: CATEGORY_DURATION_MINUTES[category],
          };
        });
    } catch (error) {
      this.logger.warn(`AI web research failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    } finally {
      clearTimeout(timer);
    }
  }
}

export class PlaceResearchService {
  constructor(
    private readonly provider: AiWebPlaceResearchProvider,
    private readonly config: { get: <T = string>(key: string) => T | undefined },
  ) {}

  async collect(intent: NormalizedTripIntent): Promise<PlaceResearchResult> {
    if (!readBool(this.config, "AI_WEB_RESEARCH_ENABLED", false)) {
      return {
        candidates: [],
        fallbacks: ["ai_web_research_disabled"],
        warnings: ["web_research_disabled_or_unverified"],
        usedWebResearch: false,
      };
    }
    const candidates = await this.provider.research(intent);
    if (candidates.length === 0) {
      return {
        candidates: [],
        fallbacks: ["ai_web_research_unverified"],
        warnings: ["web_research_disabled_or_unverified"],
        usedWebResearch: false,
      };
    }
    return { candidates, fallbacks: [], warnings: [], usedWebResearch: true };
  }
}

export class PlaceResolverService {
  constructor(private readonly geo: Pick<GeoService, "autocomplete" | "resolve">) {}

  async resolveCandidates(intent: NormalizedTripIntent, candidates: PlaceCandidate[]): Promise<ResolvedPlaceCandidate[]> {
    const resolved: ResolvedPlaceCandidate[] = [];
    for (const candidate of candidates) {
      const item = await this.resolveCandidate(intent, candidate);
      if (item) resolved.push(item);
    }
    return resolved;
  }

  private async resolveCandidate(
    intent: NormalizedTripIntent,
    candidate: PlaceCandidate,
  ): Promise<ResolvedPlaceCandidate | null> {
    let detail: GeoSearchResult | null = null;
    let providerId = candidate.providerId ?? null;

    if (candidate.source === "ai_web") {
      const results = await this.safeAutocomplete(`${candidate.name} ${intent.destination.name}`, intent.destination);
      const first = results[0];
      if (!first) return null;
      providerId = first.providerId;
      if (first.lat != null && first.lng != null) {
        detail = { ...first, lat: first.lat, lng: first.lng };
      }
    }

    if (!detail && providerId) {
      try {
        detail = await this.geo.resolve(providerId);
      } catch {
        if (candidate.source !== "ai_web" && candidate.lat != null && candidate.lng != null) {
          detail = {
            providerId,
            name: candidate.name,
            address: candidate.address ?? "",
            category: null,
            lat: candidate.lat,
            lng: candidate.lng,
          };
        }
      }
    }

    if (!detail || !providerId) return null;
    const category = candidate.category === "OTHER" ? mapCategory(detail.category, detail.name) : candidate.category;
    return {
      id: providerId,
      source: candidate.source,
      providerId,
      placeCatalogId: candidate.placeCatalogId ?? null,
      name: detail.name || candidate.name,
      address: detail.address ?? candidate.address ?? null,
      lat: detail.lat,
      lng: detail.lng,
      category,
      cost: candidate.source === "ai_web" ? null : candidate.cost ?? null,
      qualityScore: candidate.qualityScore,
      confidence: candidate.confidence,
      matchedInterests: candidate.matchedInterests.length > 0
        ? candidate.matchedInterests
        : matchedInterestsFor({ name: detail.name || candidate.name, category }, intent.interests),
      sourceMetadata: {
        ...candidate.sourceMetadata,
        resolvedProviderCategory: detail.category,
        sources: [candidate.source],
      },
      estimatedDurationMinutes: candidate.estimatedDurationMinutes ?? CATEGORY_DURATION_MINUTES[category],
    };
  }

  private async safeAutocomplete(query: string, location: GeoPoint): Promise<GeoAutocompleteResult[]> {
    try {
      return await this.geo.autocomplete(query, location);
    } catch {
      return [];
    }
  }
}

export class PlaceEnrichmentService {
  enrich(intent: NormalizedTripIntent, candidates: ResolvedPlaceCandidate[]): ResolvedPlaceCandidate[] {
    return candidates.map((candidate) => {
      const matchedInterests = candidate.matchedInterests.length > 0
        ? candidate.matchedInterests
        : matchedInterestsFor(candidate, intent.interests);
      return {
        ...candidate,
        cost: candidate.cost ?? CATEGORY_COST[candidate.category],
        matchedInterests,
        estimatedDurationMinutes: candidate.estimatedDurationMinutes ?? CATEGORY_DURATION_MINUTES[candidate.category],
      };
    });
  }
}

export class PlaceDeduplicationService {
  dedupe(candidates: ResolvedPlaceCandidate[]): ResolvedPlaceCandidate[] {
    const result: ResolvedPlaceCandidate[] = [];

    for (const candidate of candidates) {
      const existingIndex = result.findIndex((item) => this.isDuplicate(item, candidate));
      if (existingIndex === -1) {
        result.push(candidate);
        continue;
      }
      result[existingIndex] = this.merge(result[existingIndex], candidate);
    }

    return result;
  }

  private isDuplicate(a: ResolvedPlaceCandidate, b: ResolvedPlaceCandidate): boolean {
    if (a.providerId === b.providerId) return true;
    if (normalizePlaceName(a.name) !== normalizePlaceName(b.name)) return false;
    return metersBetween(a, b) <= 100;
  }

  private merge(a: ResolvedPlaceCandidate, b: ResolvedPlaceCandidate): ResolvedPlaceCandidate {
    const better = b.qualityScore + b.confidence > a.qualityScore + a.confidence ? b : a;
    const other = better === a ? b : a;
    return {
      ...better,
      cost: better.cost ?? other.cost,
      placeCatalogId: better.placeCatalogId ?? other.placeCatalogId ?? null,
      qualityScore: Math.max(a.qualityScore, b.qualityScore),
      confidence: Math.max(a.confidence, b.confidence),
      matchedInterests: [...new Set([...a.matchedInterests, ...b.matchedInterests])],
      sourceMetadata: mergeSources(a, b),
    };
  }
}

export class PlaceScoringService {
  score(intent: NormalizedTripIntent, candidate: ResolvedPlaceCandidate): ScoredPlaceCandidate {
    const distanceMeters = metersBetween(intent.destination, candidate);
    const interest = Math.min(
      1,
      (candidate.matchedInterests.length > 0 ? candidate.matchedInterests.length / Math.max(intent.interests.length, 1) : 0) +
        (intent.interests.length === 0 ? 0.3 : 0),
    );
    const quality = (candidate.qualityScore + candidate.confidence) / 2;
    const dayPlaceBudget = Math.max(intent.budgetPerPersonPerDay * intent.people * 0.45, 50_000);
    const budget = candidate.cost == null || candidate.cost <= 0
      ? 0.7
      : Math.max(0, Math.min(1, 1 - Math.max(candidate.cost - dayPlaceBudget, 0) / Math.max(dayPlaceBudget, 1)));
    const distance = distanceMeters <= DEFAULT_SEARCH_RADIUS_METERS
      ? Math.max(0, 1 - distanceMeters / DEFAULT_SEARCH_RADIUS_METERS)
      : Math.max(0, 0.25 - (distanceMeters - DEFAULT_SEARCH_RADIUS_METERS) / 100_000);
    const source = this.sourceScore(candidate.source);
    const diversity = candidate.category === "OTHER" ? 0.35 : 0.65;
    const score = interest * 0.3 + quality * 0.2 + budget * 0.18 + distance * 0.2 + diversity * 0.06 + source * 0.06;

    return {
      ...candidate,
      score,
      distanceMeters: Math.round(distanceMeters),
      scoreBreakdown: { interest, quality, budget, distance, diversity, source },
    };
  }

  private sourceScore(source: PlaceCandidateSource): number {
    if (source === "goong") return 0.85;
    if (source === "catalog") return 0.8;
    if (source === "ai_web") return 0.55;
    return 0.4;
  }
}

export class PlaceSelectionService {
  select(intent: NormalizedTripIntent, candidates: ScoredPlaceCandidate[]): ScoredPlaceCandidate[] {
    const target = Math.min(candidates.length, intent.dayCount * paceMaxPlacesPerDay(intent.pace));
    const pool = [...candidates].sort((a, b) => b.score - a.score);
    const selected: ScoredPlaceCandidate[] = [];

    for (const category of this.categoriesByBestScore(pool)) {
      if (selected.length >= target) break;
      const pick = pool.find((candidate) => candidate.category === category && !selected.includes(candidate));
      if (pick) selected.push(pick);
    }

    while (selected.length < target) {
      let best: ScoredPlaceCandidate | null = null;
      let bestValue = -Infinity;
      for (const candidate of pool) {
        if (selected.includes(candidate)) continue;
        const value = this.mmrValue(candidate, selected);
        if (value > bestValue) {
          best = candidate;
          bestValue = value;
        }
      }
      if (!best) break;
      selected.push(best);
    }

    return selected;
  }

  private categoriesByBestScore(candidates: ScoredPlaceCandidate[]): PlaceCategory[] {
    const best = new Map<PlaceCategory, number>();
    for (const candidate of candidates) {
      best.set(candidate.category, Math.max(best.get(candidate.category) ?? -Infinity, candidate.score));
    }
    return [...best.entries()].sort((a, b) => b[1] - a[1]).map(([category]) => category);
  }

  private mmrValue(candidate: ScoredPlaceCandidate, selected: ScoredPlaceCandidate[]): number {
    const sameCategoryCount = selected.filter((item) => item.category === candidate.category).length;
    const nearDuplicatePenalty = selected.some((item) => metersBetween(item, candidate) < 250) ? 0.2 : 0;
    const diversityBonus = sameCategoryCount === 0 ? 0.12 : -0.05 * sameCategoryCount;
    return candidate.score + diversityBonus - nearDuplicatePenalty;
  }
}

export class DayPlannerService {
  planDays(intent: NormalizedTripIntent, candidates: ResolvedPlaceCandidate[]): PlannedDay[] {
    const capacity = paceMaxPlacesPerDay(intent.pace);
    const days: PlannedDay[] = Array.from({ length: intent.dayCount }, (_, index) => ({
      date: addDays(intent.startDate, index),
      title: null,
      notes: null,
      places: [],
    }));

    const pool = this.roundRobinByCategory(candidates);
    for (const candidate of pool) {
      const targetDay = days.find((day) => day.places.length < capacity);
      if (!targetDay) break;
      targetDay.places.push(candidate);
    }

    return days;
  }

  private roundRobinByCategory(candidates: ResolvedPlaceCandidate[]): ResolvedPlaceCandidate[] {
    const groups = new Map<PlaceCategory, ResolvedPlaceCandidate[]>();
    for (const candidate of candidates) {
      const group = groups.get(candidate.category) ?? [];
      group.push(candidate);
      groups.set(candidate.category, group);
    }

    const ordered: ResolvedPlaceCandidate[] = [];
    while ([...groups.values()].some((group) => group.length > 0)) {
      for (const category of PLACE_CATEGORIES) {
        const item = groups.get(category)?.shift();
        if (item) ordered.push(item);
      }
    }
    return ordered;
  }
}

export class PlanningRouteOptimizerService {
  constructor(private readonly geo: Pick<GeoService, "distanceMatrix">) {}

  async optimizeDays(intent: NormalizedTripIntent, days: PlannedDay[]): Promise<{ days: PlannedDay[]; usedDistanceMatrix: boolean }> {
    let usedDistanceMatrix = false;
    const optimized: PlannedDay[] = [];

    for (const day of days) {
      if (day.places.length < 2) {
        optimized.push(day);
        continue;
      }
      const points: GeoPoint[] = day.places.map((place) => ({ lat: place.lat, lng: place.lng }));
      const anchorIndex = points.length;
      points.push({ lat: intent.destination.lat, lng: intent.destination.lng });
      let matrix = null;
      try {
        matrix = await this.geo.distanceMatrix(points, ROUTE_VEHICLE);
      } catch {
        matrix = null;
      }
      if (matrix) usedDistanceMatrix = true;
      const cells = completeMatrix(matrix, points);
      const visitIndices = day.places.map((_, index) => index);
      const { order } = optimizeRoute(cells, visitIndices, anchorIndex);
      optimized.push({ ...day, places: order.map((index) => day.places[index]) });
    }

    return { days: optimized, usedDistanceMatrix };
  }
}

export interface TripNarrationProvider {
  narrate(intent: NormalizedTripIntent, days: PlannedDay[], lockedPlaceIds: string[]): Promise<FinalTripPlan>;
}

export class TripNarratorService {
  constructor(private readonly provider?: TripNarrationProvider) {}

  async narrate(intent: NormalizedTripIntent, days: PlannedDay[]): Promise<FinalTripPlan> {
    const lockedPlaceIds = days.flatMap((day) => day.places.map((place) => place.id));
    if (this.provider) {
      try {
        const narrated = await this.provider.narrate(intent, days, lockedPlaceIds);
        return finalTripPlanSchema.parse(narrated);
      } catch {
        return this.fallback(intent, days, ["ai_narration_rejected"]);
      }
    }
    return this.fallback(intent, days, ["ai_narration_fallback"]);
  }

  private fallback(intent: NormalizedTripIntent, days: PlannedDay[], warnings: string[]): FinalTripPlan {
    const lockedPlaceIds = days.flatMap((day) => day.places.map((place) => place.id));
    return {
      title: `${intent.destination.name} ${intent.dayCount} ngày`,
      destination: intent.destination.name,
      dayCount: intent.dayCount,
      days: days.map((day, index) => ({
        date: day.date,
        title: `Ngày ${index + 1}`,
        notes: day.places.length > 0 ? `Lịch ${intent.pace} với ${day.places.length} điểm đã xác minh.` : null,
        placeIds: day.places.map((place) => place.id),
      })),
      checklist: [
        "Xác nhận phương tiện di chuyển",
        "Đặt chỗ lưu trú",
        "Mang giấy tờ tùy thân",
        "Dự phòng tiền mặt và pin sạc",
      ],
      metadata: { lockedPlaceIds, warnings },
    };
  }
}

export interface PersistTripContext {
  userId: string;
  remainingGenerations: number | null;
  inviteCode: string;
  intent: NormalizedTripIntent;
  days: PlannedDay[];
  plan: FinalTripPlan;
  metadata: GenerationMetadata;
}

export class TripPersistenceService {
  constructor(private readonly prisma: {
    $transaction: (arg: ((tx: unknown) => Promise<unknown>) | Promise<unknown>[]) => Promise<unknown>;
  }) {}

  async persist(ctx: PersistTripContext): Promise<{
    tripId: string;
    title: string;
    destination: string;
    remainingGenerations: number | null;
    generationMetadata: {
      warnings: string[];
      fallbacks: string[];
      usedWebResearch: boolean;
      usedDistanceMatrix: boolean;
    };
  }> {
    const trip = await this.prisma.$transaction(async (txUnknown) => {
      const tx = txUnknown as {
        trip: {
          create: (args: unknown) => Promise<{ id: string; title: string; destination: string; days: Array<{ id: string; order: number }> }>;
        };
        place: { createMany: (args: unknown) => Promise<unknown> };
        checklistItem: { createMany: (args: unknown) => Promise<unknown> };
      };
      const created = await tx.trip.create({
        data: {
          ownerId: ctx.userId,
          title: ctx.plan.title,
          destination: ctx.intent.destination.name,
          coverImage: null,
          budgetAmount: ctx.intent.totalBudget,
          budgetCurrency: "VND",
          startDate: new Date(`${ctx.intent.startDate}T00:00:00.000Z`),
          endDate: new Date(`${ctx.intent.endDate}T00:00:00.000Z`),
          generationMetadata: ctx.metadata,
          inviteCode: ctx.inviteCode,
          members: { create: { userId: ctx.userId, role: "OWNER" } },
          days: {
            create: ctx.days.map((day, order) => ({
              date: new Date(`${day.date}T00:00:00.000Z`),
              order,
            })),
          },
        },
        include: { days: { orderBy: { order: "asc" } } },
      });

      const daysByOrder = [...created.days].sort((a, b) => a.order - b.order);
      const placeRows = ctx.days.flatMap((day, dayIndex) =>
        day.places.map((place, order) => ({
          tripId: created.id,
          dayId: daysByOrder[dayIndex]?.id ?? null,
          placeCatalogId: place.placeCatalogId ?? null,
          name: place.name,
          lat: place.lat,
          lng: place.lng,
          category: place.category,
          address: place.address,
          note: ctx.plan.days[dayIndex]?.notes ?? null,
          cost: place.cost ?? null,
          providerId: place.providerId,
          estimatedDurationMinutes: place.estimatedDurationMinutes,
          generationScore: "score" in place ? Number(place.score) : null,
          generationMetadata: place.sourceMetadata,
          order,
        })),
      );
      if (placeRows.length > 0) await tx.place.createMany({ data: placeRows });

      await tx.checklistItem.createMany({
        data: ctx.plan.checklist.map((text) => ({
          tripId: created.id,
          text,
          type: "TODO",
        })),
      });
      return created;
    }) as { id: string; title: string; destination: string };

    return {
      tripId: trip.id,
      title: trip.title,
      destination: trip.destination,
      remainingGenerations: ctx.remainingGenerations,
      generationMetadata: {
        warnings: ctx.metadata.warnings,
        fallbacks: ctx.metadata.fallbacks,
        usedWebResearch: ctx.metadata.usedWebResearch,
        usedDistanceMatrix: ctx.metadata.usedDistanceMatrix,
      },
    };
  }
}

export function buildGenerationMetadata(input: {
  requestId: string;
  goongCandidates: number;
  catalogCandidates: number;
  aiWebCandidates: number;
  resolvedCandidates: number;
  dedupedCandidates: number;
  selectedCandidates: number;
  fallbacks: string[];
  warnings: string[];
  usedWebResearch: boolean;
  usedDistanceMatrix: boolean;
  pace: NormalizedTripIntent["pace"];
  selected: ResolvedPlaceCandidate[];
}): GenerationMetadata {
  const sourceCounts = input.selected.reduce<Record<string, number>>((counts, candidate) => {
    counts[candidate.source] = (counts[candidate.source] ?? 0) + 1;
    return counts;
  }, {});
  return {
    requestId: input.requestId,
    candidateCounts: {
      goong: input.goongCandidates,
      catalog: input.catalogCandidates,
      aiWeb: input.aiWebCandidates,
      resolved: input.resolvedCandidates,
      deduped: input.dedupedCandidates,
      selected: input.selectedCandidates,
    },
    sourceCounts,
    fallbacks: [...new Set(input.fallbacks)],
    warnings: [...new Set(input.warnings)],
    usedWebResearch: input.usedWebResearch,
    usedDistanceMatrix: input.usedDistanceMatrix,
    pace: input.pace,
  };
}

export function ensureEnoughPlaces(candidates: ResolvedPlaceCandidate[], intent: NormalizedTripIntent): void {
  if (candidates.length === 0) {
    throw new ServiceUnavailableException(`Không tìm được địa điểm đã xác minh quanh ${intent.destination.name}`);
  }
}
