// Önce ağ, olmazsa önbellek: uygulama dosyaları güncellenince hemen yenisi gelir, çevrimdışıyken açılır.
// Supabase ve harita karoları önbelleğe alınmaz (her zaman ağdan).
const V = "aviadox-v5";
const SHELL = ["./", "index.html", "styles.css", "config.js", "privacy.js", "app.js", "flightlog.js", "weather.js", "slot.js", "i18n.js", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png"];
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

// Web push: sunucu (slot-watch) Slot Merkezi değişince gönderir.
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (x) {}
  e.waitUntil(self.registration.showNotification(d.title || "AviaDoX", { body: d.body || "", tag: d.tag || "slot", renotify: true, icon: "icons/icon-192.png", badge: "icons/icon-192.png", data: { url: d.url || "./#sm" } }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const u = new URL((e.notification.data && e.notification.data.url) || "./#sm", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(cs => {
    for (const c of cs) { if ("focus" in c) { c.navigate(u).catch(() => {}); return c.focus(); } }
    return self.clients.openWindow(u);
  }));
});
