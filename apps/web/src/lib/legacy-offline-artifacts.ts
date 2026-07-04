const LEGACY_SW_PATHS = new Set(["/sw.js"]);
const LEGACY_CACHE_PREFIXES = ["medi-static-"];

export interface ServiceWorkerRegistrationLike {
  active?: { scriptURL?: string } | null;
  waiting?: { scriptURL?: string } | null;
  installing?: { scriptURL?: string } | null;
  unregister(): Promise<boolean>;
}

export interface CacheStorageLike {
  keys(): Promise<string[]>;
  delete(cacheName: string): Promise<boolean>;
}

function isLegacyScriptURL(scriptURL: string | undefined): boolean {
  if (!scriptURL) return false;

  try {
    const { pathname } = new URL(scriptURL);
    return LEGACY_SW_PATHS.has(pathname);
  } catch {
    return false;
  }
}

function isLegacyRegistration(registration: ServiceWorkerRegistrationLike): boolean {
  return [registration.active, registration.waiting, registration.installing].some((worker) =>
    isLegacyScriptURL(worker?.scriptURL),
  );
}

function isLegacyCache(cacheName: string): boolean {
  return LEGACY_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
}

export async function cleanupLegacyOfflineArtifacts(input: {
  registrations: readonly ServiceWorkerRegistrationLike[];
  cacheStorage: CacheStorageLike;
}): Promise<{ unregistered: number; deletedCaches: string[] }> {
  let unregistered = 0;

  for (const registration of input.registrations) {
    if (!isLegacyRegistration(registration)) continue;
    if (await registration.unregister()) unregistered += 1;
  }

  const deletedCaches: string[] = [];
  for (const cacheName of await input.cacheStorage.keys()) {
    if (!isLegacyCache(cacheName)) continue;
    if (await input.cacheStorage.delete(cacheName)) deletedCaches.push(cacheName);
  }

  return { unregistered, deletedCaches };
}

export async function cleanupLegacyOfflineArtifactsInBrowser(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("caches" in window)) return;

  await cleanupLegacyOfflineArtifacts({
    registrations: await navigator.serviceWorker.getRegistrations(),
    cacheStorage: window.caches,
  });
}
