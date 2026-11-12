// Önce ağ, olmazsa önbellek: uygulama dosyaları güncellenince hemen yenisi gelir, çevrimdışıyken açılır.
// Supabase ve harita karoları önbelleğe alınmaz (her zaman ağdan).
const V = "aerodox-v1";
const SHELL = ["./", "index.html", "styles.css", "config.js", "app.js", "flightlog.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin && u.hostname !== "cdn.jsdelivr.net") return;
  e.respondWith(
    fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("index.html") : Response.error())))
  );
});
