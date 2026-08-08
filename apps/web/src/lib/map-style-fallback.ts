const GOONG_TILES_HOST = "tiles.goong.io";
const GOONG_STYLE_PATHS = ["/assets/", "/sources/"];
const AUTH_FAILURE_PATTERNS = [" 401", " 403", "unauthorized", "forbidden", "invalid api"];

export interface MapStyleFallbackInput {
  isFallbackStyle: boolean;
  hasLoadedGoongStyle: boolean;
  errorText: string;
}

export function shouldFallbackToOsmMapStyle({
  isFallbackStyle,
  hasLoadedGoongStyle,
  errorText,
}: MapStyleFallbackInput): boolean {
  if (isFallbackStyle) return false;

  const normalized = errorText.toLowerCase();
  if (!normalized.includes(GOONG_TILES_HOST)) return false;

  const isAuthFailure = AUTH_FAILURE_PATTERNS.some((pattern) => normalized.includes(pattern));
  if (isAuthFailure) return true;

  if (hasLoadedGoongStyle) return false;

  return GOONG_STYLE_PATHS.some((path) => normalized.includes(path));
}
