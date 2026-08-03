"use client";

import type { AuthResponse, UserDto } from "@medi/types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

const ACCESS_KEY = "medi.admin.access";
const REFRESH_KEY = "medi.admin.refresh";

function storage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function getAccessToken(): string | null {
  return storage()?.getItem(ACCESS_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return storage()?.getItem(REFRESH_KEY) ?? null;
}

export function hasStoredSession(): boolean {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function setTokens(accessToken: string, refreshToken: string) {
  const target = storage();
  if (!target) return;
  target.setItem(ACCESS_KEY, accessToken);
  target.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  const target = storage();
  if (!target) return;
  target.removeItem(ACCESS_KEY);
  target.removeItem(REFRESH_KEY);
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

let refreshPromise: Promise<boolean> | null = null;

export async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;
        const data = (await res.json()) as AuthResponse;
        setTokens(data.accessToken, data.refreshToken);
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

export async function api<T>(path: string, options: RequestInit = {}, retried = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new NetworkError("Không kết nối được API. Hãy chạy pnpm dev.");
  }

  if (res.status === 401 && !retried && canRetryWithRefresh(path)) {
    if (await tryRefresh()) return api<T>(path, options, true);
    clearTokens();
    throw new ApiError(401, "Phiên đăng nhập admin hết hạn");
  }

  if (!res.ok) throw await parseErrorResponse(res);
  return res.json() as Promise<T>;
}

export async function restoreSession(): Promise<UserDto | null> {
  if (!hasStoredSession()) return null;
  try {
    return await api<UserDto>("/auth/me");
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearTokens();
      return null;
    }
    throw err;
  }
}
