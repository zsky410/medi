import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type {
  AiProvider,
  GeneratedPlace,
  GeneratedTripPlan,
  RoutePlace,
  SuggestContext,
} from "./ai.providers";

interface DestinationTemplate {
  keywords: string[];
  destination: string;
  coverImage: string;
  places: GeneratedPlace[];
}

const TEMPLATES: DestinationTemplate[] = [
  {
    keywords: ["đà lạt", "dalat", "da lat"],
    destination: "Đà Lạt, Lâm Đồng",
    coverImage: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&fit=crop&auto=format",
    places: [
      { name: "Hồ Xuân Hương", category: "ATTRACTION", lat: 11.9416, lng: 108.4441, note: "Đi dạo buổi chiều" },
      { name: "Chợ đêm Đà Lạt", category: "FOOD", lat: 11.9427, lng: 108.4358, cost: 300000 },
      { name: "Thung lũng Tình Yêu", category: "ATTRACTION", lat: 11.9764, lng: 108.4494, cost: 250000 },
      { name: "Bánh căn Lệ", category: "FOOD", lat: 11.9435, lng: 108.4379, cost: 100000 },
      { name: "Ga Đà Lạt", category: "ATTRACTION", lat: 11.9417, lng: 108.4547 },
      { name: "Quán cà phê Túi Mơ To", category: "FOOD", lat: 11.9231, lng: 108.4265, note: "View đồi cực chill" },
      { name: "Dinh Bảo Đại", category: "ATTRACTION", lat: 11.9372, lng: 108.4293, cost: 40000 },
      { name: "Langfarm Center", category: "FOOD", lat: 11.9401, lng: 108.4412, note: "Dâu tươi & socola" },
    ],
  },
  {
    keywords: ["hội an", "hoi an"],
    destination: "Hội An, Quảng Nam",
    coverImage: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&fit=crop&auto=format",
    places: [
      { name: "Phố cổ Hội An", category: "ATTRACTION", lat: 15.877, lng: 108.326 },
      { name: "Cao lầu Bà Buội", category: "FOOD", lat: 15.8778, lng: 108.328, cost: 80000 },
      { name: "An Bàng Beach", category: "ATTRACTION", lat: 15.913, lng: 108.345 },
      { name: "Cafe Faifo Coffee", category: "FOOD", lat: 15.8775, lng: 108.327, note: "View phố cổ" },
      { name: "Chùa Cầu", category: "ATTRACTION", lat: 15.8773, lng: 108.3273 },
    ],
  },
  {
    keywords: ["phú quốc", "phu quoc"],
    destination: "Phú Quốc, Kiên Giang",
    coverImage: "https://images.unsplash.com/photo-1537953773345-d172ccf13cf4?w=800&fit=crop&auto=format",
    places: [
      { name: "Bãi Sao", category: "ATTRACTION", lat: 10.024, lng: 104.018 },
      { name: "Chợ đêm Dinh Cậu", category: "FOOD", lat: 10.224, lng: 103.967, cost: 400000 },
      { name: "Sunset Sanato Beach Club", category: "ATTRACTION", lat: 10.089, lng: 103.995, cost: 150000 },
      { name: "VinWonders Phú Quốc", category: "ATTRACTION", lat: 10.323, lng: 103.848, cost: 800000 },
    ],
  },
  {
    keywords: ["đà nẵng", "da nang", "danang"],
    destination: "Đà Nẵng",
    coverImage: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=800&fit=crop&auto=format",
    places: [
      { name: "Cầu Rồng", category: "ATTRACTION", lat: 16.0614, lng: 108.2275 },
      { name: "Bà Nà Hills", category: "ATTRACTION", lat: 15.995, lng: 107.996, cost: 900000 },
      { name: "Mì Quảng Bà Mua", category: "FOOD", lat: 16.0678, lng: 108.2208, cost: 60000 },
      { name: "Bãi biển Mỹ Khê", category: "ATTRACTION", lat: 16.0471, lng: 108.2482 },
    ],
  },
];

const EXTRA_SUGGESTIONS: Record<string, GeneratedPlace[]> = {
  coffee: [
    { name: "The Married Beans", category: "FOOD", lat: 11.9405, lng: 108.438, note: "Specialty coffee" },
    { name: "La Viet Coffee", category: "FOOD", lat: 11.935, lng: 108.442, note: "Cà phê rang xay" },
  ],
  food: [
    { name: "Quán ăn địa phương", category: "FOOD", lat: 11.94, lng: 108.44, note: "Đặc sản địa phương" },
  ],
  family: [
    { name: "Công viên giải trí", category: "ATTRACTION", lat: 11.95, lng: 108.45, note: "Phù hợp gia đình" },
  ],
};

function parseDays(prompt: string): number {
  const match = prompt.match(/(\d+)\s*(ngày|day)/i);
  if (match) return Math.min(Math.max(parseInt(match[1], 10), 1), 14);
  return 3;
}

function parseBudget(prompt: string): number | null {
  const match = prompt.match(/(\d+(?:\.\d+)?)\s*(triệu|tr|million|m)/i);
  if (match) return parseFloat(match[1]) * 1_000_000;
  const vnd = prompt.match(/(\d[\d.,]*)\s*(?:đ|vnd|dong)/i);
  if (vnd) return parseInt(vnd[1].replace(/[.,]/g, ""), 10);
  return null;
}

function matchTemplate(prompt: string): DestinationTemplate {
  const lower = prompt.toLowerCase();
  for (const t of TEMPLATES) {
    if (t.keywords.some((k) => lower.includes(k))) return t;
  }
  for (const t of TEMPLATES) {
    if (t.destination.toLowerCase().split(",")[0].split(" ").some((w) => lower.includes(w) && w.length > 2)) {
      return t;
    }
  }
  return TEMPLATES[0];
}

function nearestNeighborOrder(places: RoutePlace[]): string[] {
  if (places.length <= 1) return places.map((p) => p.id);
  const remaining = [...places];
  const ordered = [remaining.shift()!];
  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i];
      const dist = Math.hypot(p.lat - last.lat, p.lng - last.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    ordered.push(remaining.splice(nearestIdx, 1)[0]);
  }
  return ordered.map((p) => p.id);
}

@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = "mock" as const;

  async generateTrip(prompt: string): Promise<GeneratedTripPlan> {
    const template = matchTemplate(prompt);
    const dayCount = parseDays(prompt);
    const budget = parseBudget(prompt);
    const titleMatch = prompt.match(/^[^,.]{3,40}/);
    const title = titleMatch
      ? titleMatch[0].trim().charAt(0).toUpperCase() + titleMatch[0].trim().slice(1)
      : `${template.destination.split(",")[0]} ${dayCount} ngày`;

    return {
      title,
      destination: template.destination,
      coverImage: template.coverImage,
      dayCount,
      budget,
      places: template.places,
    };
  }

  async suggestPlaces(ctx: SuggestContext): Promise<GeneratedPlace[]> {
    const template = matchTemplate(ctx.destination + " " + (ctx.prompt ?? ""));
    const existing = new Set(ctx.existingNames.map((n) => n.toLowerCase()));
    const pool = [...template.places];

    const lower = (ctx.prompt ?? "").toLowerCase();
    if (lower.includes("cà phê") || lower.includes("coffee")) pool.push(...(EXTRA_SUGGESTIONS.coffee ?? []));
    if (lower.includes("ăn") || lower.includes("food")) pool.push(...(EXTRA_SUGGESTIONS.food ?? []));
    if (lower.includes("gia đình") || lower.includes("family")) pool.push(...(EXTRA_SUGGESTIONS.family ?? []));

    return pool
      .filter((p) => !existing.has(p.name.toLowerCase()))
      .slice(0, ctx.limit);
  }

  optimizeRouteOrder(places: RoutePlace[]): string[] {
    return nearestNeighborOrder(places);
  }
}

interface OpenAiJsonPlan {
  title?: string;
  destination?: string;
  dayCount?: number;
  budget?: number | null;
  places?: Array<{
    name: string;
    category?: string;
    lat?: number;
    lng?: number;
    note?: string;
    cost?: number;
  }>;
}

@Injectable()
export class OpenAiProvider implements AiProvider {
  readonly name = "openai" as const;
  private readonly logger = new Logger(OpenAiProvider.name);
  private readonly model: string;

  constructor(
    private readonly apiKey: string,
    model?: string,
  ) {
    this.model = model ?? "gpt-4o-mini";
  }

  private async chatJson<T>(system: string, user: string): Promise<T> {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0.7,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      this.logger.warn(`OpenAI error ${res.status}: ${err.slice(0, 200)}`);
      throw new Error("OpenAI request failed");
    }
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty OpenAI response");
    return JSON.parse(content) as T;
  }

  async generateTrip(prompt: string): Promise<GeneratedTripPlan> {
    const fallback = new MockAiProvider();
    try {
      const plan = await this.chatJson<OpenAiJsonPlan>(
        `You are a Vietnam travel planner. Return JSON with: title, destination, dayCount (1-14), budget (VND number or null), places array with name, category (ATTRACTION|FOOD|LODGING|TRANSPORT|OTHER), lat, lng, note, cost. Use real coordinates in Vietnam.`,
        prompt,
      );
      const template = matchTemplate(prompt);
      return {
        title: plan.title ?? template.destination,
        destination: plan.destination ?? template.destination,
        coverImage: template.coverImage,
        dayCount: Math.min(Math.max(plan.dayCount ?? 3, 1), 14),
        budget: plan.budget ?? parseBudget(prompt),
        places: (plan.places ?? []).map((p) => ({
          name: p.name,
          category: (p.category as GeneratedPlace["category"]) ?? "OTHER",
          lat: p.lat ?? 0,
          lng: p.lng ?? 0,
          note: p.note,
          cost: p.cost,
        })),
      };
    } catch {
      return fallback.generateTrip(prompt);
    }
  }

  async suggestPlaces(ctx: SuggestContext): Promise<GeneratedPlace[]> {
    const fallback = new MockAiProvider();
    try {
      const data = await this.chatJson<{ places: GeneratedPlace[] }>(
        `Suggest places in Vietnam. Return JSON { places: [{ name, category, lat, lng, note, cost }] }. Avoid duplicates.`,
        `Destination: ${ctx.destination}. Existing: ${ctx.existingNames.join(", ") || "none"}. Request: ${ctx.prompt ?? "popular spots"}. Limit ${ctx.limit}.`,
      );
      return (data.places ?? []).slice(0, ctx.limit);
    } catch {
      return fallback.suggestPlaces(ctx);
    }
  }

  optimizeRouteOrder(places: RoutePlace[]): string[] {
    return nearestNeighborOrder(places);
  }
}

export function createAiProvider(config: ConfigService): AiProvider {
  const key = config.get<string>("OPENAI_API_KEY");
  if (key) {
    return new OpenAiProvider(key, config.get<string>("OPENAI_MODEL") ?? undefined);
  }
  return new MockAiProvider();
}
