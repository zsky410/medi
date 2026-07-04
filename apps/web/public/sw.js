self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const registrations = await self.registration.unregister();
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.filter((name) => name.startsWith("medi-static-")).map((name) => caches.delete(name)));
      await self.clients.claim();
      return registrations;
    })(),
  );
});
