const CACHE = "maps-hub-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./maps.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE) ? caches.delete(k) : null))
    ).then(()=>self.clients.claim())
  );
});

// Nur App-Dateien cachen (deine Karten-URLs sind extern)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;

  if(!sameOrigin) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(()=>{});
        return res;
      }).catch(()=>cached);
    })
  );
});
