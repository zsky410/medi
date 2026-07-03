const ACCESS_KEY = "medi.access";
const REFRESH_KEY = "medi.refresh";

export interface TokenStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SessionSnapshot {
  accessToken: string | null;
  refreshToken: string | null;
}

export function captureSessionSnapshot(storage: TokenStorageLike): SessionSnapshot {
  return {
    accessToken: storage.getItem(ACCESS_KEY),
    refreshToken: storage.getItem(REFRESH_KEY),
  };
}

export function matchesSessionSnapshot(storage: TokenStorageLike, snapshot: SessionSnapshot): boolean {
  return (
    storage.getItem(ACCESS_KEY) === snapshot.accessToken &&
    storage.getItem(REFRESH_KEY) === snapshot.refreshToken
  );
}

export function applyTokensIfUnchanged(
  storage: TokenStorageLike,
  snapshot: SessionSnapshot,
  accessToken: string,
  refreshToken: string,
): boolean {
  if (!matchesSessionSnapshot(storage, snapshot)) return false;
  storage.setItem(ACCESS_KEY, accessToken);
  storage.setItem(REFRESH_KEY, refreshToken);
  return true;
}

export function clearTokensIfUnchanged(storage: TokenStorageLike, snapshot: SessionSnapshot): boolean {
  if (!matchesSessionSnapshot(storage, snapshot)) return false;
  storage.removeItem(ACCESS_KEY);
  storage.removeItem(REFRESH_KEY);
  return true;
}
