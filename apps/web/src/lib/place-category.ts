import type { CreatePlaceInput } from "@medi/types";

export function guessCategory(raw: string | null): CreatePlaceInput["category"] {
  if (!raw) return "OTHER";
  const s = raw.toLowerCase();
  if (/(restaurant|cafe|food|bar|bakery)/.test(s)) return "FOOD";
  if (/(hotel|hostel|guest|motel|apartment)/.test(s)) return "LODGING";
  if (/(station|airport|bus|terminal)/.test(s)) return "TRANSPORT";
  if (/(mall|market|shop|supermarket)/.test(s)) return "SHOPPING";
  if (/(attraction|museum|park|monument|viewpoint|beach|waterfall|temple|church)/.test(s)) return "ATTRACTION";
  return "OTHER";
}
