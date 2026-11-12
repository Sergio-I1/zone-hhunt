// Zone Hunt service worker: lets the app install and open without a connection.
// The page itself is always fetched fresh when online, so updates show up right away.
const CACHE = "zone-hunt-v1";
self.addEventListener("install", e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "manifest.webmanifest", "icon-192.png"]))); });
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.hostname.includes("tile.openstreetmap.org")) return;                 // map tiles: straight to the network
  e.respondWith(fetch(req).then(res => { if (res.ok && (url.origin === location.origin || /unpkg|fonts\./.test(url.hostname))) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
    .catch(() => caches.match(req, {ignoreSearch: url.origin === location.origin})));
});
