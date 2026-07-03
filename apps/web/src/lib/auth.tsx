"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { AuthResponse, LoginInput, RegisterInput, UserDto } from "@medi/types";
import {
  api,
  ApiError,
  clearTokens,
  getAccessToken,
  hasStoredSession,
  NetworkError,
  restoreSession,
  setTokens,
} from "./api";
import { createAuthBootstrapGuard } from "./auth-bootstrap-guard";
import { disconnectSocket } from "./socket";

const CACHED_USER_KEY = "medi.user";

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
  register: (input: RegisterInput) => Promise<void>;
  acceptTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const bootstrapGuardRef = useRef(createAuthBootstrapGuard());

  const runAuthMutation = useCallback(async <T,>(work: () => Promise<T>): Promise<T> => {
    bootstrapGuardRef.current.invalidate();
    setLoading(true);
    try {
      return await work();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const bootstrapSnapshot = bootstrapGuardRef.current.capture();
      const canApply = () => !cancelled && bootstrapGuardRef.current.isCurrent(bootstrapSnapshot);

      if (!hasStoredSession()) {
        if (canApply()) setLoading(false);
        return;
      }

      const cached = loadCachedUser();
      if (cached) setUser(cached);

      try {
        const me = await restoreSession();
        if (!canApply()) return;
        if (me) {
          setUser(me);
          cacheUser(me);
        } else {
          setUser(null);
          cacheUser(null);
        }
      } catch (err) {
        if (!canApply()) return;
        if (err instanceof NetworkError && cached) {
          // API down/slow: keep cached profile so header stays logged-in.
          setUser(cached);
        } else if (err instanceof ApiError) {
          clearTokens();
          cacheUser(null);
          setUser(null);
        } else {
          setUser(cached);
        }
      } finally {
        if (canApply()) setLoading(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  // Sync logout across tabs when tokens are cleared elsewhere.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== "medi.access" && e.key !== "medi.refresh") return;
      if (!hasStoredSession()) {
        setUser(null);
        cacheUser(null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    await runAuthMutation(async () => {
      const res = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      cacheUser(res.user);
    });
  }, [runAuthMutation]);

  const register = useCallback(async (input: RegisterInput) => {
    await runAuthMutation(async () => {
      const res = await api<AuthResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setTokens(res.accessToken, res.refreshToken);
      setUser(res.user);
      cacheUser(res.user);
    });
  }, [runAuthMutation]);

  const acceptTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    await runAuthMutation(async () => {
      setTokens(accessToken, refreshToken);
      const me = await api<UserDto>("/auth/me");
      setUser(me);
      cacheUser(me);
    });
  }, [runAuthMutation]);

  const refreshUser = useCallback(async () => {
    const me = await api<UserDto>("/auth/me");
    setUser(me);
    cacheUser(me);
  }, []);

  const logout = useCallback(async () => {
    await runAuthMutation(async () => {
      try {
        if (getAccessToken()) {
          await api("/auth/logout", { method: "POST" });
        }
      } catch {
        // best-effort; clear locally regardless
      }
      clearTokens();
      cacheUser(null);
      setUser(null);
      disconnectSocket();
      router.push("/login");
    });
  }, [router, runAuthMutation]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, acceptTokens, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
