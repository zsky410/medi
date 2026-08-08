export type JsonBody = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

export interface JsonRequestOptions {
  method?: string;
  token?: string | null;
  body?: JsonBody;
  headers?: Record<string, string>;
}

type TripResource =
  | "detail"
  | "places"
  | "checklist"
  | "expenses"
  | "expenseSummary"
  | "attachments"
  | "messages"
  | "importText";

const TRIP_RESOURCE_PATHS: Record<TripResource, string> = {
  detail: "/trips/:tripId",
  places: "/trips/:tripId/places",
  checklist: "/trips/:tripId/checklist",
  expenses: "/trips/:tripId/expenses",
  expenseSummary: "/trips/:tripId/expenses/summary",
  attachments: "/trips/:tripId/attachments",
  messages: "/trips/:tripId/messages",
  importText: "/trips/:tripId/import/parse-text",
};

export function buildApiPath(path: string, params: Record<string, string> = {}) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const [pathname, rawQuery] = normalized.split("?");
  let result = pathname;
  for (const [key, value] of Object.entries(params)) {
    result = result.replaceAll(`:${key}`, encodeURIComponent(value));
  }
  if (!rawQuery) return result;

  const search = new URLSearchParams(rawQuery);
  const query = search.toString();
  return query ? `${result}?${query}` : result;
}

export function tripResourcePath(tripId: string, resource: TripResource) {
  return buildApiPath(TRIP_RESOURCE_PATHS[resource], { tripId });
}

export function jsonRequest(options: JsonRequestOptions = {}): RequestInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.headers ?? {}),
  };

  return {
    ...(options.method ? { method: options.method } : {}),
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  };
}
