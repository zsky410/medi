"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AuthResponse, LoginInput, UserDto } from "@medi/types";
import { api, clearTokens, getAccessToken, hasStoredSession, restoreSession, setTokens } from "./api";

const CACHED_USER_KEY = "medi.admin.user";

function cacheUser(user: UserDto | null) {
  try {
    if (user) localStorage.setItem(CACHED_USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(CACHED_USER_KEY);
  } catch {
    // storage unavailable
  }
}

function loadCachedUser(): UserDto | null {
  try {
    const raw = localStorage.getItem(CACHED_USER_KEY);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    async function bootstrap() {
      if (!hasStoredSession()) {
        setLoading(false);
        return;
      }

      const cached = loadCachedUser();
      if (cached) setUser(cached);

      try {
        const me = await restoreSession();
        if (cancelled) return;
        setUser(me);
        cacheUser(me);
      } catch {
        if (cancelled) return;
        setUser(cached);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setLoading(true);
    try {
      const res = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      cacheUser(res.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (getAccessToken()) {
        await api("/auth/logout", { method: "POST" }).catch(() => undefined);
      }
      clearTokens();
      cacheUser(null);
      setUser(null);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
