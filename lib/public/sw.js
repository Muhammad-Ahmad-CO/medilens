/* MediLens service worker — v2.
 *
 * Why v2: v1 was cache-first with a cache name that never changed, so a
 * phone that visited once kept showing the FIRST design it ever cached —
 * new deploys never appeared. v2 fixes that for good:
 *  - pages are NETWORK-FIRST (fresh design always wins; cache is only an
 *    offline fallback),
 *  - static assets are cache-first but refreshed in the background,
 *  - every old cache is deleted on activate.
 */
const CACHE = "medilens-v2";
const CORE = ["/", "/scan", "/history", "/map", "/prescription", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // tiles/APIs: straight to network

  const isPage =
    e.request.mode === "navigate" ||
    (e.request.headers.get("accept") ?? "").includes("text/html");

  if (isPage) {
    // Network-first: the newest deploy always shows; cache only if offline.
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => caches.match(e.request).then((hit) => hit || caches.match("/")))
    );
    return;
  }

  // Static assets: cache-first, refreshed in the background.
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => hit);
      return hit || network;
    })
  );
});
