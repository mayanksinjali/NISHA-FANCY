/*
 * Service worker for the OWNER app only (scope: /owner).
 *
 * Registered by the inline script in app/owner/layout.tsx. Lives in
 * public/owner/ so it is served at /owner/sw.js with /owner scope. Its job is to make
 * the installed owner PWA feel like a native app on the owner's phone:
 *   - instant app-icon open (shell loads even with a flaky connection)
 *   - an offline screen instead of a browser dinosaur
 * It is deliberately conservative: pages and data always come from the
 * network when available, so prices/stock shown in the owner area are never
 * stale. Nothing under /owner is cacheable content anyway — the middleware
 * cookie-gate protects every route, and no product data lives in this cache.
 */
const CACHE = "owner-shell-v1";
const OFFLINE_URL = "/owner/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL, "/logo.jpeg", "/icon.svg"]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return; // server actions / POSTs always hit the network

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith("/owner")) return; // never intercept customer pages

  // Navigations: network first (fresh data), offline screen as the fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(OFFLINE_URL).then(
          (cached) =>
            cached ??
            new Response("You're offline. Reopen the Owner app once you have a connection.", {
              status: 503,
              headers: { "Content-Type": "text/plain" },
            }),
        ),
      ),
    );
    return;
  }

  // Static assets: cache-first so the installed app opens instantly.
  const isStatic =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/logo.jpeg" ||
    url.pathname === "/icon.svg";
  if (isStatic) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
  }
});
