import { PROVINCES_API_BASE, type Province, fetchProvinces } from "@/lib/provinces";

export interface Location {
  id: string;
  name: string;
  province: string;
  label: string;
  kind: "province" | "place";
}

interface Ward {
  name: string;
  code: number;
  division_type: string;
  province_code: number;
}

/** Well-known spots missing or hard to find in the wards dataset. */
const CURATED_PLACES: { name: string; province: string }[] = [
  { name: "Nhơn Hải", province: "Bình Định" },
  { name: "Cát Bà", province: "Hải Phòng" },
  { name: "Tam Cốc", province: "Ninh Bình" },
  { name: "Vịnh Hạ Long", province: "Quảng Ninh" },
  { name: "Bản Giốc", province: "Cao Bằng" },
  { name: "Bà Nà Hills", province: "Đà Nẵng" },
  { name: "Fansipan", province: "Lào Cai" },
  { name: "Côn Đảo", province: "Bà Rịa - Vũng Tàu" },
  { name: "Mũi Né", province: "Bình Thuận" },
  { name: "Đồng Văn", province: "Hà Giang" },
  { name: "Quy Nhơn", province: "Bình Định" },
  { name: "Măng Đen", province: "Kon Tum" },
];

/** Shown when the field is focused but empty — not the full ward index. */
const POPULAR_PICKS: { name: string; province: string }[] = [
  { name: "Hà Nội", province: "Hà Nội" },
  { name: "Hồ Chí Minh", province: "Hồ Chí Minh" },
  { name: "Đà Lạt", province: "Lâm Đồng" },
  { name: "Nha Trang", province: "Khánh Hòa" },
  { name: "Phú Quốc", province: "An Giang" },
  { name: "Hội An", province: "Quảng Nam" },
  { name: "Đà Nẵng", province: "Đà Nẵng" },
  { name: "Sa Pa", province: "Lào Cai" },
  { name: "Vịnh Hạ Long", province: "Quảng Ninh" },
  { name: "Huế", province: "Huế" },
  { name: "Côn Đảo", province: "Bà Rịa - Vũng Tàu" },
  { name: "Lý Sơn", province: "Quảng Ngãi" },
];

const WARD_PREFIXES = ["Đặc khu ", "Thị trấn ", "Phường ", "Xã "] as const;
const DIRECTION_PREFIX =
  /^(Bắc|Nam|Tây|Đông|Trung|Đông Bắc|Đông Nam|Tây Bắc|Tây Nam)\s+/i;
const DIRECTION_SUFFIX = /\s+(Tây|Đông|Bắc|Nam)$/i;
const LEADING_WARD_NUMBER = /^\d+\s+/;
const TRAILING_WARD_NUMBER = /\s+\d+$/;

export function shortenProvinceName(name: string): string {
  return name.replace(/^Tỉnh\s+/i, "").replace(/^Thành phố\s+/i, "").trim();
}

export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d");
}

function normalizePlaceName(name: string): string {
  let normalized = name
    .replace(LEADING_WARD_NUMBER, "")
    .replace(TRAILING_WARD_NUMBER, "")
    .replace(DIRECTION_PREFIX, "")
    .replace(DIRECTION_SUFFIX, "")
    .trim();
  return normalized || name.trim();
}

function extractPlaceName(wardName: string): string {
  const dashIdx = wardName.indexOf(" - ");
  if (dashIdx !== -1) return wardName.slice(dashIdx + 3).trim();

  let name = wardName;
  for (const prefix of WARD_PREFIXES) {
    if (name.startsWith(prefix)) {
      name = name.slice(prefix.length);
      break;
    }
  }
  return normalizePlaceName(name);
}

function locationId(name: string, province: string): string {
  return `${normalizeSearchText(name)}|${normalizeSearchText(province)}`;
}

function makeLocation(name: string, province: string, kind: Location["kind"]): Location {
  const shortProvince = shortenProvinceName(province);
  const label = kind === "province" || name === shortProvince ? shortProvince : `${name}, ${shortProvince}`;
  return { id: locationId(name, shortProvince), name, province: shortProvince, label, kind };
}

function isSearchableWard(ward: Ward, rawExtracted: string, normalized: string): boolean {
  if (ward.division_type === "đặc khu") return true;
  if (rawExtracted.includes(" - ") || ward.name.includes(" - ")) return true;
  if (ward.division_type === "thị trấn") return true;
  // Numbered sub-wards (Phường 1 Bảo Lộc) collapse to the normalized city name.
  if (LEADING_WARD_NUMBER.test(rawExtracted) || TRAILING_WARD_NUMBER.test(rawExtracted)) {
    return normalized.length >= 2 && normalized !== rawExtracted;
  }
  if (normalized.length < 2) return false;
  return true;
}

async function fetchWards(): Promise<Ward[]> {
  const res = await fetch(`${PROVINCES_API_BASE}/w/`);
  if (!res.ok) throw new Error("Không tải được danh sách phường/xã");
  return res.json() as Promise<Ward[]>;
}

function buildPlaceIndex(provinces: Province[], wards: Ward[]): Location[] {
  const provinceByCode = new Map(provinces.map((p) => [p.code, shortenProvinceName(p.name)]));
  const seen = new Set<string>();
  const locations: Location[] = [];

  const add = (name: string, province: string, kind: Location["kind"]) => {
    const loc = makeLocation(name, province, kind);
    if (seen.has(loc.id)) return;
    seen.add(loc.id);
    locations.push(loc);
  };

  for (const p of provinces) {
    add(shortenProvinceName(p.name), shortenProvinceName(p.name), "province");
  }

  for (const ward of wards) {
    const province = provinceByCode.get(ward.province_code);
    if (!province) continue;

    const raw = ward.name.includes(" - ")
      ? ward.name.slice(ward.name.indexOf(" - ") + 3).trim()
      : (() => {
          let n = ward.name;
          for (const prefix of WARD_PREFIXES) {
            if (n.startsWith(prefix)) {
              n = n.slice(prefix.length);
              break;
            }
          }
          return n.trim();
        })();

    const place = normalizePlaceName(raw);
    if (!place) continue;
    if (!isSearchableWard(ward, raw, place)) continue;
    add(place, province, "place");
  }

  for (const spot of CURATED_PLACES) {
    add(spot.name, spot.province, "place");
  }

  return locations.sort((a, b) => a.label.localeCompare(b.label, "vi"));
}

let popularLocationsCache: Location[] | null = null;

function buildPopularLocations(all: Location[]): Location[] {
  if (popularLocationsCache) return popularLocationsCache;

  const byId = new Map(all.map((loc) => [loc.id, loc]));
  const picks: Location[] = [];

  for (const pick of POPULAR_PICKS) {
    const id = locationId(pick.name, shortenProvinceName(pick.province));
    const found = byId.get(id);
    if (found) picks.push(found);
    else picks.push(makeLocation(pick.name, pick.province, pick.name === pick.province ? "province" : "place"));
  }

  popularLocationsCache = picks;
  return picks;
}

export async function fetchLocations(): Promise<Location[]> {
  const [provinces, wards] = await Promise.all([fetchProvinces(), fetchWards()]);
  return buildPlaceIndex(provinces, wards);
}

export function searchLocations(locations: Location[], query: string, limit = 12): Location[] {
  const q = normalizeSearchText(query.trim());

  if (!q) {
    return buildPopularLocations(locations).slice(0, limit);
  }

  const scored: { loc: Location; score: number }[] = [];
  for (const loc of locations) {
    const name = normalizeSearchText(loc.name);
    const province = normalizeSearchText(loc.province);
    const label = normalizeSearchText(loc.label);

    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (label.includes(q)) score = 40;
    else if (province.includes(q)) score = 20;

    if (score > 0) scored.push({ loc, score });
  }

  scored.sort((a, b) => b.score - a.score || a.loc.label.localeCompare(b.loc.label, "vi"));
  return scored.slice(0, limit).map((s) => s.loc);
}

/** Use the most specific term when filtering trips by destination. */
export function destinationFilterTerm(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (trimmed.includes(",")) return trimmed.split(",")[0]!.trim();
  return trimmed;
}
