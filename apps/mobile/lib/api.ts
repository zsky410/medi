import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type { AuthResponse, TripDto } from "@medi/types";

export const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:4000";

const ACCESS_KEY = "medi.access";
const REFRESH_KEY = "medi.refresh";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    let message = `Lỗi ${res.status}`;
    try {
      const body = await res.json();
      if (typeof body.message === "string") message = body.message;
    } catch {
      // ignore
    }
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await api<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  await setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function fetchTrips(): Promise<TripDto[]> {
  return api<TripDto[]>("/trips");
}
