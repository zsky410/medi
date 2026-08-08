import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type {
  AttachmentDto,
  AuthResponse,
  BudgetSummaryDto,
  ChecklistItemDto,
  CheckoutSessionDto,
  CreateChecklistItemInput,
  CreateCheckoutInput,
  CreateExpenseInput,
  CreatePlaceInput,
  CreateTripInput,
  ExpenseDto,
  GuidesListDto,
  ImportBookingResultDto,
  PublicTripsListDto,
  ParseBookingTextInput,
  PlaceDto,
  RegisterInput,
  SendTripMessageInput,
  SubscriptionDto,
  TripDetailDto,
  TripDto,
  TripMessageDto,
  UpdateProfileInput,
  UpdateChecklistItemInput,
  UpdateExpenseInput,
  UpdatePlaceInput,
  UserDto,
} from "@medi/types";
import { buildApiPath, jsonRequest, tripResourcePath, type JsonBody } from "./mobile-api";

export const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:4000";
const API_TIMEOUT_MS = Number(Constants.expoConfig?.extra?.apiTimeoutMs ?? 8000);

const ACCESS_KEY = "medi.access";
const REFRESH_KEY = "medi.refresh";

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
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

async function refreshTokens() {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;
  try {
    const res = await fetchWithTimeout(`${API_URL}/auth/refresh`, jsonRequest({
      method: "POST",
      body: { refreshToken },
    }));
    if (!res.ok) return null;
    const data = (await res.json()) as AuthResponse;
    await setTokens(data.accessToken, data.refreshToken);
    return data.accessToken;
  } catch {
    return null;
  }
}

async function fetchWithTimeout(url: string, options: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: options.signal ?? controller.signal });
  } catch (err) {
    if (err instanceof Error && (err.name === "AbortError" || /aborted/i.test(err.message))) {
      throw new ApiError(0, `Không kết nối được API sau ${Math.round(API_TIMEOUT_MS / 1000)}s: ${API_URL}`);
    }
    if (err instanceof Error || err instanceof TypeError) {
      throw new ApiError(0, `Không kết nối được API: ${API_URL}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

async function parseError(res: Response) {
  let message = `Lỗi ${res.status}`;
  try {
    const body = await res.json();
    if (typeof body.message === "string") message = body.message;
    if (Array.isArray(body.message)) message = body.message.join("\n");
  } catch {
    // ignore invalid error body
  }
  return message;
}

async function request<T>(path: string, options: RequestInit = {}, retry = true): Promise<T> {
  const token = await getAccessToken();
  const headers = {
    ...((options.headers as Record<string, string> | undefined) ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetchWithTimeout(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401 && retry) {
    const nextToken = await refreshTokens();
    if (nextToken) {
      return request<T>(path, options, false);
    }
    await clearTokens();
  }
  if (!res.ok) {
    throw new ApiError(res.status, await parseError(res));
  }
  return res.json() as Promise<T>;
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  return request<T>(path, options);
}

export async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${API_URL}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

function jsonApi<T>(path: string, options: { method?: string; body?: JsonBody } = {}) {
  return api<T>(path, jsonRequest(options));
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await jsonApi<AuthResponse>("/auth/login", { method: "POST", body: { email, password } });
  await setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const data = await jsonApi<AuthResponse>("/auth/register", { method: "POST", body: input });
  await setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logoutRequest() {
  try {
    await jsonApi<{ ok: true }>("/auth/logout", { method: "POST" });
  } finally {
    await clearTokens();
  }
}

export async function fetchTrips(): Promise<TripDto[]> {
  return api<TripDto[]>("/trips");
}

export async function fetchPublicTrips({
  destination,
  limit = 24,
}: {
  destination?: string;
  limit?: number;
} = {}): Promise<PublicTripsListDto> {
  const params = new URLSearchParams();
  params.set("sort", "cloneCount");
  params.set("limit", String(limit));
  if (destination) params.set("destination", destination);
  const res = await fetchWithTimeout(`${API_URL}/public/trips?${params.toString()}`);
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  return res.json() as Promise<PublicTripsListDto>;
}

export async function fetchGuides(): Promise<GuidesListDto> {
  const res = await fetchWithTimeout(`${API_URL}/shop/guides`);
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  return res.json() as Promise<GuidesListDto>;
}

export async function fetchSubscription(): Promise<SubscriptionDto> {
  return api<SubscriptionDto>("/billing/subscription");
}

export async function createCheckout(input: CreateCheckoutInput = {}): Promise<CheckoutSessionDto> {
  return jsonApi<CheckoutSessionDto>("/billing/checkout", { method: "POST", body: input as JsonBody });
}

export async function updateProfile(input: UpdateProfileInput): Promise<UserDto> {
  return jsonApi<UserDto>("/auth/me", { method: "PATCH", body: input });
}

export async function changePassword(input: { currentPassword: string; newPassword: string }) {
  return jsonApi<{ ok: true }>("/auth/change-password", { method: "POST", body: input });
}

export async function createTrip(input: CreateTripInput): Promise<TripDto> {
  return jsonApi<TripDto>("/trips", { method: "POST", body: input });
}

export async function fetchTripDetail(tripId: string): Promise<TripDetailDto> {
  return api<TripDetailDto>(tripResourcePath(tripId, "detail"));
}

export async function createPlace(tripId: string, input: CreatePlaceInput): Promise<PlaceDto> {
  return jsonApi<PlaceDto>(tripResourcePath(tripId, "places"), { method: "POST", body: input });
}

export async function updatePlace(tripId: string, placeId: string, input: UpdatePlaceInput): Promise<PlaceDto> {
  return jsonApi<PlaceDto>(buildApiPath("/trips/:tripId/places/:placeId", { tripId, placeId }), {
    method: "PATCH",
    body: input,
  });
}

export async function deletePlace(tripId: string, placeId: string): Promise<{ ok: true }> {
  return jsonApi<{ ok: true }>(buildApiPath("/trips/:tripId/places/:placeId", { tripId, placeId }), {
    method: "DELETE",
  });
}

export async function fetchChecklist(tripId: string): Promise<ChecklistItemDto[]> {
  return api<ChecklistItemDto[]>(tripResourcePath(tripId, "checklist"));
}

export async function createChecklistItem(tripId: string, input: CreateChecklistItemInput): Promise<ChecklistItemDto> {
  return jsonApi<ChecklistItemDto>(tripResourcePath(tripId, "checklist"), { method: "POST", body: input });
}

export async function updateChecklistItem(
  tripId: string,
  itemId: string,
  input: UpdateChecklistItemInput,
): Promise<ChecklistItemDto> {
  return jsonApi<ChecklistItemDto>(buildApiPath("/trips/:tripId/checklist/:itemId", { tripId, itemId }), {
    method: "PATCH",
    body: input,
  });
}

export async function deleteChecklistItem(tripId: string, itemId: string): Promise<{ ok: true }> {
  return jsonApi<{ ok: true }>(buildApiPath("/trips/:tripId/checklist/:itemId", { tripId, itemId }), {
    method: "DELETE",
  });
}

export async function fetchExpenses(tripId: string): Promise<ExpenseDto[]> {
  return api<ExpenseDto[]>(tripResourcePath(tripId, "expenses"));
}

export async function fetchExpenseSummary(tripId: string): Promise<BudgetSummaryDto> {
  return api<BudgetSummaryDto>(tripResourcePath(tripId, "expenseSummary"));
}

export async function createExpense(tripId: string, input: CreateExpenseInput): Promise<ExpenseDto> {
  return jsonApi<ExpenseDto>(tripResourcePath(tripId, "expenses"), { method: "POST", body: input });
}

export async function updateExpense(tripId: string, expenseId: string, input: UpdateExpenseInput): Promise<ExpenseDto> {
  return jsonApi<ExpenseDto>(buildApiPath("/trips/:tripId/expenses/:expenseId", { tripId, expenseId }), {
    method: "PATCH",
    body: input,
  });
}

export async function deleteExpense(tripId: string, expenseId: string): Promise<{ ok: true }> {
  return jsonApi<{ ok: true }>(buildApiPath("/trips/:tripId/expenses/:expenseId", { tripId, expenseId }), {
    method: "DELETE",
  });
}

export async function fetchAttachments(tripId: string): Promise<AttachmentDto[]> {
  return api<AttachmentDto[]>(tripResourcePath(tripId, "attachments"));
}

export async function importBookingText(
  tripId: string,
  input: ParseBookingTextInput,
): Promise<ImportBookingResultDto> {
  return jsonApi<ImportBookingResultDto>(tripResourcePath(tripId, "importText"), { method: "POST", body: input });
}

export async function fetchMessages(tripId: string): Promise<TripMessageDto[]> {
  return api<TripMessageDto[]>(tripResourcePath(tripId, "messages"));
}

export async function sendMessage(tripId: string, input: SendTripMessageInput): Promise<TripMessageDto> {
  return jsonApi<TripMessageDto>(tripResourcePath(tripId, "messages"), { method: "POST", body: input });
}
