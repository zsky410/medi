"use client";

import type { AuthResponse, UserDto } from "@medi/types";
import {
  applyTokensIfUnchanged,
  captureSessionSnapshot,
  clearTokensIfUnchanged,
  type SessionSnapshot,
} from "./session-tokens";

/** Same-origin API proxy in dev (see next.config rewrites). Avoids CORS issues. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/** Direct API URL for OAuth redirects and WebSocket (cannot use /api proxy). */
export const DIRECT_API_URL = process.env.NEXT_PUBLIC_DIRECT_API_URL ?? "http://localhost:4000";

const ACCESS_KEY = "medi.access";
const REFRESH_KEY = "medi.refresh";

function getTokenStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getAccessToken(): string | null {
  const storage = getTokenStorage();
  return storage?.getItem(ACCESS_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  const storage = getTokenStorage();
  return storage?.getItem(REFRESH_KEY) ?? null;
}

export function hasStoredSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function setTokens(accessToken: string, refreshToken: string) {
  const storage = getTokenStorage();
  if (!storage) return;
  storage.setItem(ACCESS_KEY, accessToken);
  storage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  const storage = getTokenStorage();
  if (!storage) return;
  storage.removeItem(ACCESS_KEY);
  storage.removeItem(REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { cache: "no-store" });
    return res.ok;
  } catch {
    return false;
  }
}

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefresh(snapshot?: SessionSnapshot): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const storage = getTokenStorage();
      if (!storage) return false;
      const requestSnapshot = snapshot ?? captureSessionSnapshot(storage);
      const refreshToken = requestSnapshot.refreshToken;
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as AuthResponse;
        applyTokensIfUnchanged(storage, requestSnapshot, data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function canRetryWithRefresh(path: string): boolean {
  if (!path.startsWith("/auth/")) return true;
  return path === "/auth/me" || path === "/auth/logout";
}

/** Socket id attached to write requests so the server can skip echoing realtime events back. */
let currentSocketId: string | undefined;
export function setCurrentSocketId(id: string | undefined) {
  currentSocketId = id;
}

async function parseErrorResponse(res: Response): Promise<ApiError> {
  let message = `Lỗi ${res.status}`;
  let errors: Record<string, string[]> | undefined;
  try {
    const body = await res.json();
    message = typeof body.message === "string" ? body.message : message;
    errors = body.errors;
  } catch {
    // non-JSON error body
  }
  return new ApiError(res.status, message, errors);
}

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const storage = getTokenStorage();
  const sessionSnapshot = storage ? captureSessionSnapshot(storage) : { accessToken: null, refreshToken: null };
  const token = sessionSnapshot.accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (currentSocketId) headers["x-socket-id"] = currentSocketId;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new NetworkError(
      "Không kết nối được API. Chạy: docker compose up -d && pnpm dev:setup",
    );
  }

  if (res.status === 401 && !retried && canRetryWithRefresh(path)) {
    if (await tryRefresh(sessionSnapshot)) {
      return api<T>(path, options, true);
    }
    if (storage) clearTokensIfUnchanged(storage, sessionSnapshot);
    throw new ApiError(401, "Phiên đăng nhập hết hạn");
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json() as Promise<T>;
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(() => reject(new NetworkError(message)), ms);
    }),
  ]);
}

/** Restore session on app load: refresh if needed, then fetch /auth/me. */
export async function restoreSession(): Promise<UserDto | null> {
  if (!hasStoredSession()) return null;
  const storage = getTokenStorage();
  const sessionSnapshot = storage ? captureSessionSnapshot(storage) : { accessToken: null, refreshToken: null };

  if (!sessionSnapshot.accessToken) {
    const refreshed = await tryRefresh(sessionSnapshot);
    if (!refreshed) {
      if (storage) clearTokensIfUnchanged(storage, sessionSnapshot);
      return null;
    }
  }

  try {
    return await withTimeout(
      api<UserDto>("/auth/me"),
      12_000,
      "API phản hồi quá chậm. Kiểm tra pnpm dev:setup đang chạy.",
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      if (storage) clearTokensIfUnchanged(storage, sessionSnapshot);
      return null;
    }
    throw err;
  }
}
