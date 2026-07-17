import type { CreatePlaceInput } from "@medi/types";

/** Guess place category from provider tags / type strings. */
export function guessCategory(raw: string | null): CreatePlaceInput["category"] {
  if (!raw) return "OTHER";
  const s = raw.toLowerCase();
  if (/(restaurant|cafe|food|bar|bakery|ăn\s*uống|nhà\s*hàng|quán)/.test(s)) return "FOOD";
  if (/(hotel|hostel|guest|motel|apartment|resort|homestay|khách\s*sạn|nhà\s*nghỉ)/.test(s))
    return "LODGING";
  if (/(station|airport|bus|terminal|ga\s|sân\s*bay)/.test(s)) return "TRANSPORT";
  if (/(mall|market|shop|supermarket|chợ|siêu\s*thị)/.test(s)) return "SHOPPING";
  if (
    /(attraction|museum|park|monument|viewpoint|beach|waterfall|temple|church|tham\s*quan|bảo\s*tàng|công\s*viên)/.test(
      s,
    )
  ) {
    return "ATTRACTION";
  }
  return "OTHER";
}
