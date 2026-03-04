const CACHE = "maps-hub-v3"; // <-- JEDES MAL HOCHZÄHLEN, wenn du was änderst

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

// ✅ Network-first für index.html + maps.json (damit Änderungen sofort ankommen)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const sameOrigin = url.origin === self.location.origin;
  if(!sameOrigin) return;

  const isCore =
    url.pathname.endsWith("/index.html") ||
    url.pathname.endsWith("/maps.json") ||
    url.pathname.endsWith("/manifest.json") ||
    url.pathname.endsWith("/");

  if(isCore){
    event.respondWith(
      fetch(event.request).then(res=>{
        const copy = res.clone();
        caches.open(CACHE).then(c=>c.put(event.request, copy)).catch(()=>{});
        return res;
      }).catch(()=>caches.match(event.request))
    );
    return;
  }

  // sonst cache-first
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
