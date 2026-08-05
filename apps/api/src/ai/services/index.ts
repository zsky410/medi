import { BadRequestException, Logger, ServiceUnavailableException } from "@nestjs/common";
import type {
  FinalTripPlan,
  GenerateTripInput,
  GenerationMetadata,
  NormalizedDestination,
  NormalizedTripIntent,
  PlaceCitation,
  PlaceCandidate,
  PlaceCandidateSource,
  PlaceCategory,
  PlanningPlaceType,
  PlannedDay,
  ResolvedPlaceCandidate,
  ScoredPlaceCandidate,
  SuggestedTimeOfDay,
} from "@medi/types";
import { finalTripPlanSchema, PLACE_CATEGORIES, PLANNING_PLACE_TYPES, suggestedTimeOfDaySchema } from "@medi/types";
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

const PLACE_TYPE_CATEGORY: Record<PlanningPlaceType, PlaceCategory> = {
  SCENIC: "ATTRACTION",
  CULTURE: "ATTRACTION",
  NATURE: "ATTRACTION",
  ACTIVITY: "ATTRACTION",
  CAFE: "FOOD",
  LOCAL_FOOD: "FOOD",
  NIGHTLIFE: "FOOD",
  MARKET: "SHOPPING",
  SHOPPING: "SHOPPING",
  WELLNESS: "OTHER",
};

const TIME_OF_DAY_ORDER: Record<SuggestedTimeOfDay, number> = {
  morning: 0,
  late_morning: 1,
  lunch: 2,
  afternoon: 3,
  sunset: 4,
  evening: 5,
};

const GENERIC_PLACE_NAMES = new Set([
  "quan ca phe",
  "cafe",
  "coffee",
  "quan an",
  "nha hang",
  "cho",
  "cho dem",
  "dac san da lat",
  "dia diem tham quan",
  "khu vui choi",
]);

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

function mapPlaceType(category: string | null | undefined, name = ""): PlanningPlaceType {
  const normalized = `${category ?? ""} ${normalizePlaceName(name)}`;
  if (/cafe|coffee|ca phe/.test(normalized)) return "CAFE";
  if (/restaurant|food|quan an|nha hang|am thuc|banh|bun|pho|com|dac san/.test(normalized)) return "LOCAL_FOOD";
  if (/bar|pub|night|dem/.test(normalized)) return "NIGHTLIFE";
  if (/market|cho |cho$/.test(normalized)) return "MARKET";
  if (/shop|shopping|mall|store|mua sam/.test(normalized)) return "SHOPPING";
  if (/museum|bao tang|di tich|dinh|chua|temple|pagoda|pho co/.test(normalized)) return "CULTURE";
  if (/park|garden|vuon|lake|ho |doi|thac|bien|rung|nature|natural/.test(normalized)) return "NATURE";
  if (/spa|wellness|massage|tam bun|tam khoang/.test(normalized)) return "WELLNESS";
  if (/tour|activity|adventure|zipline|trekking|leo nui|cheo sup/.test(normalized)) return "ACTIVITY";
  return "SCENIC";
}

function categoryForPlaceType(placeType: PlanningPlaceType, fallback: PlaceCategory): PlaceCategory {
  return PLACE_TYPE_CATEGORY[placeType] ?? fallback;
}

function normalizePlaceType(value: unknown, category: PlaceCategory, name: string): PlanningPlaceType {
  if (typeof value === "string" && PLANNING_PLACE_TYPES.includes(value as PlanningPlaceType)) {
    return value as PlanningPlaceType;
  }
  return mapPlaceType(category, name);
}

function suggestedTimeOfDay(value: unknown): SuggestedTimeOfDay | null {
  const parsed = suggestedTimeOfDaySchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

function timeOrderForPlace(place: { category: PlaceCategory; placeType?: PlanningPlaceType; sourceMetadata: Record<string, unknown> }): number {
  const time = suggestedTimeOfDay(place.sourceMetadata.suggestedTimeOfDay);
  if (time) return TIME_OF_DAY_ORDER[time];
  if (place.placeType === "CAFE") return TIME_OF_DAY_ORDER.late_morning;
  if (isFoodOnly(place)) return TIME_OF_DAY_ORDER.lunch;
  if (place.placeType === "NIGHTLIFE") return TIME_OF_DAY_ORDER.evening;
  return TIME_OF_DAY_ORDER.afternoon;
}

function isFoodOnly(place: { category: PlaceCategory; placeType?: PlanningPlaceType }): boolean {
  return place.category === "FOOD" && place.placeType !== "CAFE" && place.placeType !== "NIGHTLIFE";
}

function isGenericPlaceName(name: string): boolean {
  const normalized = normalizePlaceName(name);
  if (GENERIC_PLACE_NAMES.has(normalized)) return true;
  if (/^dac san(\s+.+)?$/.test(normalized)) return true;
  return /^(quan ca phe|quan an|nha hang)(\s+(dia phuong|gan day|ngon|dep|noi tieng|da lat|hoi an|phu quoc|da nang))?$/.test(normalized);
}

function hasSightseeingCategory(category: PlaceCategory): boolean {
  return category !== "FOOD" && category !== "LODGING" && category !== "TRANSPORT";
}

function allowsLogisticsCandidates(intent: NormalizedTripIntent): boolean {
  const text = normalizePlaceName([
    ...intent.interests,
    intent.description ?? "",
    intent.notes ?? "",
  ].join(" "));
  return /\b(lodging|hotel|homestay|resort|khach san|luu tru|transport|bus|station|taxi|xe dua don|phuong tien)\b/.test(text);
}

export function hasTrustedSourceCitation(candidate: {
  sourceMetadata: Record<string, unknown>;
  sourceTrustScore?: number | null;
}): boolean {
  const citations = candidate.sourceMetadata.citations;
  if (!Array.isArray(citations) || citations.length === 0) return false;
  const hasValidUrl = citations.some((citation) => {
    if (!citation || typeof citation !== "object") return false;
    const url = (citation as Record<string, unknown>).url;
    if (typeof url !== "string") return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  });
  const metadataTrust = candidate.sourceMetadata.sourceTrustScore;
  const trust = typeof candidate.sourceTrustScore === "number"
    ? candidate.sourceTrustScore
    : typeof metadataTrust === "number"
      ? metadataTrust
      : 0;
  return hasValidUrl && trust >= 0.6;
}

function nameSimilarity(a: string, b: string): number {
  const aTokens = new Set(normalizePlaceName(a).split(" ").filter((token) => token.length > 1));
  const bTokens = new Set(normalizePlaceName(b).split(" ").filter((token) => token.length > 1));
  if (aTokens.size === 0 || bTokens.size === 0) return 0;
  let intersection = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) intersection += 1;
  }
  return intersection / Math.max(aTokens.size, bTokens.size);
}

function canonicalClusterName(name: string): string {
  return normalizePlaceName(name)
    .replace(/\b(khu|cong|lang|quan|nha hang|cafe|coffee)\b/g, " ")
    .replace(/\b(an uong|am thuc|mua sam|tham quan)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
  normalize(
    input: GenerateTripInput,
    destination: NormalizedDestination,
    startingPoint: NormalizedDestination,
  ): NormalizedTripIntent {
    const dayCount = inclusiveDayCount(input.startDate, input.endDate);
    const budgetPerPersonPerDay = input.totalBudget / input.people / dayCount;
    return {
      destination,
      startingPoint,
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
        const placeType = mapPlaceType(result.category, result.name);
        candidates.push({
          id: result.providerId,
          source: "goong",
          providerId: result.providerId,
          name: result.name,
          address: result.address ?? null,
          lat: result.lat ?? null,
          lng: result.lng ?? null,
          category,
          placeType,
          cost: null,
          qualityScore: 0.65,
          confidence: 0.75,
          sourceTrustScore: 0.65,
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
      placeType: string | null;
      cost?: number | null;
      sourceMetadata: Record<string, unknown> | null;
      sourceTrustScore: number | null;
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
        placeType: normalizePlaceType(row.placeType, row.category, row.name),
        cost: row.cost ?? null,
        qualityScore: row.qualityScore ?? 0.6,
        confidence: 0.8,
        sourceTrustScore: row.sourceTrustScore ?? 0.65,
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
        placeType: candidate.placeType,
        sourceMetadata: candidate.sourceMetadata,
        sourceTrustScore: candidate.sourceTrustScore,
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
        placeType: candidate.placeType,
        sourceMetadata: candidate.sourceMetadata,
        sourceTrustScore: candidate.sourceTrustScore,
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

interface RawResearchPlace {
  name?: unknown;
  placeType?: unknown;
  category?: unknown;
  reason?: unknown;
  citations?: unknown;
  sources?: unknown;
  sourceConfidence?: unknown;
  confidence?: unknown;
  suggestedTimeOfDay?: unknown;
}

type ResearchCitationMode = "official_web_search" | "model_provided";

interface ResearchResponseData {
  output_text?: string;
  output?: Array<{ type?: string; content?: Array<{ text?: string; type?: string; annotations?: unknown[] }> }>;
  choices?: Array<{ message?: { content?: string } }>;
}

type ResearchEndpoint = "responses" | "chat_completions";

function citationTrust(urlValue: string): number {
  try {
    const url = new URL(urlValue);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (
      host.endsWith(".gov") ||
      host.endsWith(".gov.vn") ||
      host === "vietnam.travel" ||
      host.endsWith(".vietnam.travel") ||
      host === "dalat.vn" ||
      host.endsWith(".dalat.vn") ||
      host === "visitlamdong.vn" ||
      host.endsWith(".visitlamdong.vn") ||
      host.includes("tourism")
    ) {
      return 0.95;
    }
    if (
      /(^|\.)tripadvisor\.|(^|\.)booking\.com$|(^|\.)lonelyplanet\.com$|(^|\.)vnexpress\.net$|(^|\.)tuoitre\.vn$|(^|\.)thanhnien\.vn$/.test(host)
    ) {
      return 0.75;
    }
    if (
      ((host === "google.com" || host.endsWith(".google.com")) && url.pathname.startsWith("/maps")) ||
      host === "maps.app.goo.gl"
    ) {
      return 0.7;
    }
    return 0.45;
  } catch {
    return 0;
  }
}

function normalizeSourceConfidence(value: unknown): number {
  if (typeof value === "number") return Math.max(0, Math.min(value, 1));
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    const numeric = Number(normalized);
    if (Number.isFinite(numeric)) return Math.max(0, Math.min(numeric, 1));
    if (/^(very\s+)?high|strong|trusted|confident$/.test(normalized)) return 0.85;
    if (/^medium|moderate|ok$/.test(normalized)) return 0.7;
    if (/^low|weak|uncertain$/.test(normalized)) return 0.45;
  }
  return 0.5;
}

function normalizeCitations(value: unknown): PlaceCitation[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (typeof item === "string") {
      const url = item.trim();
      if (!url) return [];
      try {
        const parsedUrl = new URL(url);
        return [{ title: parsedUrl.hostname.toLowerCase().replace(/^www\./, ""), url }];
      } catch {
        return [];
      }
    }
    if (!item || typeof item !== "object") return [];
    const raw = item as Record<string, unknown>;
    const url = typeof raw.url === "string"
      ? raw.url.trim()
      : typeof raw.href === "string"
        ? raw.href.trim()
        : typeof raw.link === "string"
          ? raw.link.trim()
          : "";
    if (!url) return [];
    let title = typeof raw.title === "string" ? raw.title.trim() : "";
    try {
      const parsedUrl = new URL(url);
      if (!title) {
        title = typeof raw.name === "string" && raw.name.trim()
          ? raw.name.trim()
          : typeof raw.source === "string" && raw.source.trim()
            ? raw.source.trim()
            : parsedUrl.hostname.toLowerCase().replace(/^www\./, "");
      }
    } catch {
      return [];
    }
    const snippet = typeof raw.snippet === "string" && raw.snippet.trim() ? raw.snippet.trim() : undefined;
    return [{ title, url, ...(snippet ? { snippet } : {}) }];
  });
}

function sourceTrustScore(citations: PlaceCitation[], confidence: number): number {
  if (citations.length === 0) return 0;
  const citationScores = citations.map((citation) => citationTrust(citation.url));
  const maxTrust = Math.max(...citationScores);
  const independentHosts = new Set(
    citations.flatMap((citation) => {
      try {
        return [new URL(citation.url).hostname.toLowerCase().replace(/^www\./, "")];
      } catch {
        return [];
      }
    }),
  ).size;
  const corroboration = independentHosts >= 2 ? 0.12 : 0;
  return Math.max(0, Math.min(1, maxTrust * 0.75 + confidence * 0.2 + corroboration));
}

export class AiWebPlaceResearchProvider {
  private readonly logger = new Logger(AiWebPlaceResearchProvider.name);

  constructor(private readonly config: { get: <T = string>(key: string) => T | undefined }) {}

  async research(intent: NormalizedTripIntent): Promise<PlaceCandidate[]> {
    const apiKey = this.config.get<string>("OPENAI_API_KEY");
    if (!apiKey) return [];
    const baseUrl = (this.config.get<string>("OPENAI_BASE_URL") ?? "https://api.openai.com").replace(/\/+$/, "");
    const responsesUrl = baseUrl.endsWith("/v1") ? `${baseUrl}/responses` : `${baseUrl}/v1/responses`;
    const chatCompletionsUrl = baseUrl.endsWith("/v1") ? `${baseUrl}/chat/completions` : `${baseUrl}/v1/chat/completions`;
    const timeout = readNumber(this.config, "AI_WEB_RESEARCH_TIMEOUT_MS", 60_000);
    const max = readNumber(this.config, "AI_WEB_RESEARCH_MAX_CANDIDATES", 30);
    const requireOfficialWebSearchEvidence = readBool(this.config, "AI_REQUIRE_OFFICIAL_WEB_SEARCH_EVIDENCE", false);
    const acceptModelProvidedCitations =
      !requireOfficialWebSearchEvidence && readBool(this.config, "AI_ACCEPT_MODEL_PROVIDED_CITATIONS", true);
    const preferChatCompletions =
      acceptModelProvidedCitations && readBool(this.config, "AI_WEB_RESEARCH_PREFER_CHAT_COMPLETIONS", false);

    try {
      const attempts: Array<{ endpoint: ResearchEndpoint; url: string; includeHostedWebSearch: boolean }> = preferChatCompletions
        ? [
          { endpoint: "chat_completions", url: chatCompletionsUrl, includeHostedWebSearch: false },
          { endpoint: "responses", url: responsesUrl, includeHostedWebSearch: true },
          { endpoint: "responses", url: responsesUrl, includeHostedWebSearch: false },
        ]
        : [
          { endpoint: "responses", url: responsesUrl, includeHostedWebSearch: true },
          ...(acceptModelProvidedCitations
            ? [
              { endpoint: "responses" as const, url: responsesUrl, includeHostedWebSearch: false },
              { endpoint: "chat_completions" as const, url: chatCompletionsUrl, includeHostedWebSearch: false },
            ]
            : []),
        ];

      for (const attempt of attempts) {
        const data = await this.requestResearch(
          attempt.url,
          apiKey,
          timeout,
          intent,
          attempt.endpoint,
          attempt.includeHostedWebSearch,
        );
        if (!data) continue;
        const hasOfficialWebSearchEvidence = this.hasWebSearchEvidence(data);
        if (!hasOfficialWebSearchEvidence && requireOfficialWebSearchEvidence) return [];
        const citationMode: ResearchCitationMode = hasOfficialWebSearchEvidence ? "official_web_search" : "model_provided";
        const candidates = this.parseCandidates(intent, data, citationMode, max);
        if (candidates.length > 0) return candidates;
      }
      return [];
    } catch (error) {
      this.logger.warn(`AI web research failed: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  private async requestResearch(
    url: string,
    apiKey: string,
    timeout: number,
    intent: NormalizedTripIntent,
    endpoint: ResearchEndpoint,
    includeHostedWebSearch: boolean,
  ): Promise<ResearchResponseData | null> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    const messages = [
      {
        role: "system",
        content:
          "Research current, specific travel places. Return JSON only with { places: [{ name, placeType, reason, citations, sourceConfidence, suggestedTimeOfDay }] }. Every place must include concrete citation URLs that support the recommendation. Do not include coordinates.",
      },
      {
        role: "user",
        content: `Research specific real places for ${intent.destination.name}. Start/end point: ${intent.startingPoint.name}. Interests: ${intent.interests.join(", ") || "mixed sightseeing, food, cafe"}. Notes: ${intent.description ?? intent.notes ?? ""}. Avoid hotels, transit stops, generic cafes, and generic food labels.`,
      },
    ];
    const body: Record<string, unknown> = {
      model: this.config.get<string>("OPENAI_MODEL") ?? "gpt-4o-mini",
      temperature: 0.2,
      [endpoint === "responses" ? "input" : "messages"]: messages,
    };
    if (endpoint === "responses" && includeHostedWebSearch) {
      body.tools = [{ type: "web_search" }];
      body.tool_choice = { type: "web_search" };
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) return null;
      return (await response.json()) as ResearchResponseData;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  private extractOutputText(data: ResearchResponseData): string | null {
    if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text;
    for (const item of data.output ?? []) {
      for (const content of item.content ?? []) {
        if (typeof content.text === "string" && content.text.trim()) return content.text;
      }
    }
    for (const choice of data.choices ?? []) {
      const content = choice.message?.content;
      if (typeof content === "string" && content.trim()) return content;
    }
    return null;
  }

  private parseCandidates(
    intent: NormalizedTripIntent,
    data: ResearchResponseData,
    citationMode: ResearchCitationMode,
    max: number,
  ): PlaceCandidate[] {
    const content = this.extractOutputText(data);
    if (!content) return [];
    const jsonText = this.extractJsonText(content);
    if (!jsonText) return this.parseProseCandidates(intent, content, citationMode, max);
    try {
      const parsed = JSON.parse(jsonText) as { places?: RawResearchPlace[] } | RawResearchPlace[];
      const places = Array.isArray(parsed) ? parsed : parsed.places;
      if (!Array.isArray(places)) return [];
      return places.flatMap((place, index) => this.toCandidate(intent, place, index, citationMode)).slice(0, max);
    } catch {
      return this.parseProseCandidates(intent, content, citationMode, max);
    }
  }

  private extractJsonText(content: string): string | null {
    const trimmed = content.trim();
    const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
    if (fenced?.[1]?.trim()) return fenced[1].trim();
    return this.extractBalancedJson(trimmed, "{", "}") ?? this.extractBalancedJson(trimmed, "[", "]");
  }

  private extractBalancedJson(content: string, openChar: "{" | "[", closeChar: "}" | "]"): string | null {
    const start = content.indexOf(openChar);
    if (start < 0) return null;
    let depth = 0;
    let inString = false;
    let escaped = false;
    for (let index = start; index < content.length; index += 1) {
      const char = content[index];
      if (escaped) {
        escaped = false;
        continue;
      }
      if (char === "\\") {
        escaped = true;
        continue;
      }
      if (char === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (char === openChar) depth += 1;
      if (char === closeChar) depth -= 1;
      if (depth === 0) return content.slice(start, index + 1);
    }
    return null;
  }

  private parseProseCandidates(
    intent: NormalizedTripIntent,
    content: string,
    citationMode: ResearchCitationMode,
    max: number,
  ): PlaceCandidate[] {
    const blocks: Array<{ name: string; lines: string[] }> = [];
    let current: { name: string; lines: string[] } | null = null;
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      const heading = line.match(/^(?:\d+[\).]|[-*•])\s+(.+)$/);
      if (heading?.[1]) {
        if (current) blocks.push(current);
        current = { name: this.cleanProsePlaceName(heading[1]), lines: [] };
        continue;
      }
      if (current) current.lines.push(line);
    }
    if (current) blocks.push(current);

    return blocks
      .flatMap((block, index) => {
        const blockText = [block.name, ...block.lines].join(" ");
        const citations = this.extractUrls(blockText);
        const reason = block.lines.find((line) => !/nguồn|source|citation/i.test(line)) ?? null;
        return this.toCandidate(
          intent,
          {
            name: block.name,
            reason,
            citations,
            sourceConfidence: 0.8,
          },
          index,
          citationMode,
        );
      })
      .slice(0, max);
  }

  private extractUrls(content: string): string[] {
    return (content.match(/https?:\/\/[^\s)>\]]+/gi) ?? []).map((url) => url.replace(/[.,;:]+$/g, ""));
  }

  private cleanProsePlaceName(value: string): string {
    return value
      .replace(/\*\*/g, "")
      .replace(/\s+(?:Nguồn|Source|Citation)\b.*$/i, "")
      .replace(/\s*[-:]\s*(?:Đẹp|Hợp|Nên|Đi|Có|Không|View|Nguồn|Source)\b.*$/i, "")
      .trim();
  }

  private hasWebSearchEvidence(data: ResearchResponseData): boolean {
    return (data.output ?? []).some((item) => {
      if (item.type === "web_search_call") return true;
      return (item.content ?? []).some((content) =>
        (content.annotations ?? []).some((annotation) =>
          Boolean(annotation && typeof annotation === "object" && (annotation as Record<string, unknown>).type === "url_citation"),
        ),
      );
    });
  }

  private toCandidate(
    intent: NormalizedTripIntent,
    place: RawResearchPlace,
    index: number,
    citationMode: ResearchCitationMode,
  ): PlaceCandidate[] {
    const name = typeof place.name === "string" ? place.name.trim() : "";
    if (name.length < 2 || isGenericPlaceName(name)) return [];
    const confidence = normalizeSourceConfidence(place.sourceConfidence ?? place.confidence);
    const citations = normalizeCitations(place.citations ?? place.sources);
    const trustScore = sourceTrustScore(citations, confidence);
    if (trustScore < 0.6) return [];
    const initialCategory = PLACE_CATEGORIES.includes(place.category as PlaceCategory)
      ? (place.category as PlaceCategory)
      : mapCategory(typeof place.category === "string" ? place.category : null, name);
    const placeType = normalizePlaceType(place.placeType, initialCategory, name);
    const category = categoryForPlaceType(placeType, initialCategory);
    const time = suggestedTimeOfDay(place.suggestedTimeOfDay);
    return [
      {
        id: `ai-web:${normalizePlaceName(name)}:${index}`,
        source: "ai_web" as const,
        providerId: null,
        name,
        address: null,
        lat: null,
        lng: null,
        category,
        placeType,
        cost: null,
        qualityScore: Math.max(0.55, trustScore * 0.8),
        confidence,
        sourceTrustScore: trustScore,
        matchedInterests: matchedInterestsFor({ name, category }, intent.interests),
        sourceMetadata: {
          reason: typeof place.reason === "string" ? place.reason : null,
          citations,
          citationMode,
          sourceConfidence: confidence,
          sourceTrustScore: trustScore,
          ...(time ? { suggestedTimeOfDay: time } : {}),
        },
        estimatedDurationMinutes: CATEGORY_DURATION_MINUTES[category],
      },
    ];
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
      const first = [...results].sort((a, b) => nameSimilarity(candidate.name, b.name) - nameSimilarity(candidate.name, a.name))[0];
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
    const resolvedCategory = mapCategory(detail.category, detail.name);
    const logisticsCandidate =
      candidate.category === "LODGING" ||
      candidate.category === "TRANSPORT" ||
      resolvedCategory === "LODGING" ||
      resolvedCategory === "TRANSPORT";
    if (logisticsCandidate && !allowsLogisticsCandidates(intent)) {
      return null;
    }
    const category = candidate.category === "OTHER" ? resolvedCategory : candidate.category;
    const placeType = normalizePlaceType(candidate.placeType, category, detail.name || candidate.name);
    const finalCategory = logisticsCandidate ? category : categoryForPlaceType(placeType, category);
    const detailName = detail.name || candidate.name;
    if ((finalCategory === "LODGING" || finalCategory === "TRANSPORT") && !allowsLogisticsCandidates(intent)) return null;
    if (isGenericPlaceName(candidate.name) || isGenericPlaceName(detailName)) return null;
    if (candidate.source === "ai_web" && nameSimilarity(candidate.name, detailName) < 0.45) return null;
    const destinationDistance = metersBetween(intent.destination, detail);
    const startingPointDistance = metersBetween(intent.startingPoint, detail);
    if (destinationDistance > DEFAULT_SEARCH_RADIUS_METERS * 2 && startingPointDistance > DEFAULT_SEARCH_RADIUS_METERS * 2) {
      return null;
    }
    return {
      id: providerId,
      source: candidate.source,
      providerId,
      placeCatalogId: candidate.placeCatalogId ?? null,
      name: detailName,
      address: detail.address ?? candidate.address ?? null,
      lat: detail.lat,
      lng: detail.lng,
      category: finalCategory,
      placeType,
      cost: candidate.source === "ai_web" ? null : candidate.cost ?? null,
      qualityScore: candidate.qualityScore ?? 0.55,
      confidence: candidate.confidence ?? 0.5,
      sourceTrustScore: candidate.sourceTrustScore ?? (candidate.source === "ai_web" ? 0.6 : 0.65),
      matchedInterests: (candidate.matchedInterests ?? []).length > 0
        ? candidate.matchedInterests
        : matchedInterestsFor({ name: detailName, category: finalCategory }, intent.interests),
      sourceMetadata: {
        ...candidate.sourceMetadata,
        resolvedProviderCategory: detail.category,
        sources: [candidate.source],
      },
      estimatedDurationMinutes: candidate.estimatedDurationMinutes ?? CATEGORY_DURATION_MINUTES[finalCategory],
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
    const aName = normalizePlaceName(a.name);
    const bName = normalizePlaceName(b.name);
    if (aName === bName) return metersBetween(a, b) <= 120;
    const aCluster = canonicalClusterName(a.name);
    const bCluster = canonicalClusterName(b.name);
    if (aCluster && aCluster === bCluster && metersBetween(a, b) <= 250) return true;
    if ((aName.includes(bName) || bName.includes(aName)) && metersBetween(a, b) <= 150) return true;
    return false;
  }

  private merge(a: ResolvedPlaceCandidate, b: ResolvedPlaceCandidate): ResolvedPlaceCandidate {
    const better = b.qualityScore + b.confidence > a.qualityScore + a.confidence ? b : a;
    const other = better === a ? b : a;
    const displayName = canonicalClusterName(a.name) === canonicalClusterName(b.name)
      ? (normalizePlaceName(a.name).length <= normalizePlaceName(b.name).length ? a.name : b.name)
      : better.name;
    return {
      ...better,
      name: displayName,
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
    const quality = (candidate.qualityScore + candidate.confidence + (candidate.sourceTrustScore ?? 0.6)) / 3;
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

    const remaining = [...this.roundRobinByCategory(candidates)];
    for (const day of days) {
      const anchorIndex = remaining.findIndex((candidate) => hasSightseeingCategory(candidate.category));
      if (anchorIndex === -1) break;
      day.places.push(remaining.splice(anchorIndex, 1)[0]);
    }

    let cursor = 0;
    while (remaining.length > 0 && days.some((day) => day.places.length < capacity)) {
      const day = days[cursor % days.length];
      cursor += 1;
      if (day.places.length >= capacity) continue;
      const index = remaining.findIndex((candidate) => this.canAddToDay(day, candidate, capacity));
      if (index === -1) {
        if (days.every((candidateDay) => remaining.every((candidate) => !this.canAddToDay(candidateDay, candidate, capacity)))) break;
        continue;
      }
      day.places.push(remaining.splice(index, 1)[0]);
    }

    return days.map((day) => ({ ...day, places: this.sortByTimeOfDay(day.places) }));
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

  private canAddToDay(day: PlannedDay, candidate: ResolvedPlaceCandidate, capacity: number): boolean {
    if (day.places.length >= capacity) return false;
    if (candidate.placeType === "CAFE" && day.places.some((place) => place.placeType === "CAFE")) return false;
    if (isFoodOnly(candidate) && day.places.some((place) => isFoodOnly(place))) return false;
    if (day.places.length === 0 && !hasSightseeingCategory(candidate.category)) return false;
    return true;
  }

  private sortByTimeOfDay(places: ResolvedPlaceCandidate[]): ResolvedPlaceCandidate[] {
    return [...places].sort((a, b) => timeOrderForPlace(a) - timeOrderForPlace(b));
  }
}

export class PlanningRouteOptimizerService {
  constructor(private readonly geo: Pick<GeoService, "distanceMatrix">) {}

  async optimizeDays(intent: NormalizedTripIntent, days: PlannedDay[]): Promise<{ days: PlannedDay[]; usedDistanceMatrix: boolean }> {
    let usedDistanceMatrix = false;
    const optimized: PlannedDay[] = [];

    for (const day of days) {
      const places: ResolvedPlaceCandidate[] = [];
      for (const bucket of this.timeBuckets(day.places)) {
        const result = await this.optimizeBucket(intent, bucket);
        if (result.usedDistanceMatrix) usedDistanceMatrix = true;
        places.push(...result.places);
      }
      optimized.push({ ...day, places });
    }

    return { days: optimized, usedDistanceMatrix };
  }

  private timeBuckets(places: ResolvedPlaceCandidate[]): ResolvedPlaceCandidate[][] {
    const groups = new Map<number, ResolvedPlaceCandidate[]>();
    for (const place of places) {
      const key = timeOrderForPlace(place);
      const group = groups.get(key) ?? [];
      group.push(place);
      groups.set(key, group);
    }
    return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([, group]) => group);
  }

  private async optimizeBucket(
    intent: NormalizedTripIntent,
    places: ResolvedPlaceCandidate[],
  ): Promise<{ places: ResolvedPlaceCandidate[]; usedDistanceMatrix: boolean }> {
    if (places.length < 2) return { places, usedDistanceMatrix: false };

    const points: GeoPoint[] = places.map((place) => ({ lat: place.lat, lng: place.lng }));
    const anchorIndex = points.length;
    points.push({ lat: intent.startingPoint.lat, lng: intent.startingPoint.lng });
    let matrix = null;
    try {
      matrix = await this.geo.distanceMatrix(points, ROUTE_VEHICLE);
    } catch {
      matrix = null;
    }
    const cells = completeMatrix(matrix, points);
    const visitIndices = places.map((_, index) => index);
    const { order } = optimizeRoute(cells, visitIndices, anchorIndex);
    return { places: order.map((index) => places[index]), usedDistanceMatrix: matrix != null };
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
  generationJob?: {
    id: string;
    metadata: Record<string, unknown>;
  };
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
        aiTripGenerationJob?: { update: (args: unknown) => Promise<unknown> };
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
          generationMetadata: {
            ...place.sourceMetadata,
            placeType: place.placeType,
            sourceTrustScore: place.sourceTrustScore,
          },
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

      const result = {
        tripId: created.id,
        title: created.title,
        destination: created.destination,
        remainingGenerations: ctx.remainingGenerations,
        generationMetadata: {
          warnings: ctx.metadata.warnings,
          fallbacks: ctx.metadata.fallbacks,
          usedWebResearch: ctx.metadata.usedWebResearch,
          usedDistanceMatrix: ctx.metadata.usedDistanceMatrix,
        },
      };

      if (ctx.generationJob && tx.aiTripGenerationJob?.update) {
        await tx.aiTripGenerationJob.update({
          where: { id: ctx.generationJob.id },
          data: {
            status: "SUCCEEDED",
            stage: "SUCCEEDED",
            progress: 100,
            resultTripId: created.id,
            errorMessage: null,
            completedAt: new Date(),
            metadata: { ...ctx.generationJob.metadata, result },
          },
        });
      }

      return result;
    }) as {
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
    };

    return trip;
  }
}

export function buildGenerationMetadata(input: {
  requestId: string;
  startingPoint: NormalizedDestination;
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
    startingPoint: input.startingPoint,
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
  if (candidates.length < intent.dayCount) {
    throw new ServiceUnavailableException(`Không đủ địa điểm đã xác minh quanh ${intent.destination.name} cho ${intent.dayCount} ngày`);
  }
  const anchorCount = candidates.filter((candidate) => hasSightseeingCategory(candidate.category)).length;
  if (anchorCount < intent.dayCount) {
    throw new ServiceUnavailableException(
      `Không đủ địa điểm tham quan/hoạt động đã xác minh quanh ${intent.destination.name} cho ${intent.dayCount} ngày`,
    );
  }
}
