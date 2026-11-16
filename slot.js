// Slot Merkezi sekmesi + bildirim aboneliği + METAR/TAF kartı. Veriyi GitHub Actions (slot-watch) Supabase'e yazar.
const SLOT = (() => {
  let data = null, ts = "", host = null, started = false, ch = null, banner = "", pushOn = null, busy = "";
  const FL = { red: ["🔴", "UÇULMAZ", "var(--er)"], yellow: ["🟡", "UÇULMAZ (sarı bayrak)", "var(--wa)"], green: ["🟢", "UÇULABİLİR", "var(--ok,#2e9e5b)"] };
  const sig = d => JSON.stringify([(d.items || []).map(i => i.flag), d.updated, d.valid]);
  const tm = s => s ? new Date(s).toLocaleString("tr-TR", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }) : "";
  async function load() {
    const { data: r } = await sb.from("slot_status").select("data,updated_at").eq("id", 1).maybeSingle();
    if (r && r.data) { const old = data; data = r.data; ts = r.updated_at; if (old && sig(old) !== sig(data)) banner = "🔔 Slot Merkezi güncellendi"; }
    repaint();
  }
  function start() {
    if (started) return; started = true;
    load().catch(() => {});
    try { ch = sb.channel("slot").on("postgres_changes", { event: "*", schema: "public", table: "slot_status" }, () => load().catch(() => {})).subscribe(); } catch (e) {}
    setInterval(() => load().catch(() => {}), 120000);
    checkPush();
  }
  const b64 = s => { const p = "=".repeat((4 - s.length % 4) % 4), r = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };
  const k = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  function support() {
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) return "apk";
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return /iPhone|iPad/.test(navigator.userAgent) ? "ios" : "none";
    return "ok";
  }
  async function checkPush() {
    if (support() !== "ok") { pushOn = false; return; }
    try { const reg = await navigator.serviceWorker.ready; pushOn = !!(await reg.pushManager.getSubscription()) && Notification.permission === "granted"; } catch (e) { pushOn = false; }
    repaint();
  }
  async function enable() {
    busy = "…"; repaint();
    try {
      if (await Notification.requestPermission() !== "granted") throw new Error("İzin verilmedi. Tarayıcı/telefon ayarlarından bildirimlere izin ver.");
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(AERODOX.VAPID_PUBLIC) });
      const { error } = await sb.from("push_subs").upsert({ user_id: S.user.id, endpoint: sub.endpoint, p256dh: k(sub.getKey("p256dh")), auth: k(sub.getKey("auth")) }, { onConflict: "endpoint" });
      if (error) throw error;
      pushOn = true;
      try { await reg.showNotification("AviaDoX", { body: "Slot Merkezi bildirimleri açıldı ✔", icon: "icons/icon-192.png" }); } catch (e) {}
    } catch (e) { alert("Bildirim açılamadı: " + (e.message || e)); }
    busy = ""; repaint();
  }
  async function disable() {
    try { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) { await sb.from("push_subs").delete().eq("endpoint", sub.endpoint); await sub.unsubscribe(); } } catch (e) {}
    pushOn = false; repaint();
  }
  function pushCard() {
    const s = support();
    let t;
    if (s === "ok") t = pushOn ? `<button class="sec" style="width:auto;margin:0" onclick="SLOT.off()">🔕 Bildirimi kapat</button>` : `<button style="width:auto;margin:0" onclick="SLOT.on()">🔔 Bildirimleri aç ${busy}</button>`;
    else if (s === "ios") t = '<span class="mu">iPhone\'da bildirim için uygulamayı Safari ▸ Paylaş ▸ <b>Ana Ekrana Ekle</b> ile ekleyip ana ekran simgesinden aç (iOS 16.4+), sonra bu butonu kullan.</span>';
    else if (s === "apk") t = '<span class="mu">Android uygulamasında (APK) arka plan bildirimi henüz yok; uygulama açıkken sayfa anlık güncellenir. Bildirim için telefonda tarayıcıdan siteyi ana ekrana ekleyebilirsin.</span>';
    else t = '<span class="mu">Bu tarayıcı bildirimi desteklemiyor.</span>';
    return `<div class="card" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><div style="flex:1;min-width:150px"><b>Bildirim</b><div class="mu">Slot kararı değiştiğinde haber ver</div></div>${t}</div>`;
  }
  function flagCards() {
    if (!data || !data.items) return '<p class="mu">Veri bekleniyor… (ilk güncelleme birkaç dakika sürebilir)</p>';
    return `<div class="grid">${data.items.map(i => { const f = FL[i.flag] || ["⚪", i.label || "—", "var(--mu)"]; return `<div class="card stat"><b style="color:${f[2]}">${f[0]}</b><div style="font-weight:700">${esc(i.name)}</div><div class="mu">${esc(f[1])}</div></div>`; }).join("")}</div>`;
  }
  function metarCard() {
    if (!data) return "";
    const taf = data.taf ? esc(data.taf) : `<span class="mu">TAF şu an alınamadı${data.tafErr ? " (kaynak: " + esc(data.tafErr.slice(0, 80)) + ")" : ""}.</span>`;
    return `<h2>METAR / TAF (LTAZ)</h2><div class="card"><div class="mu">METAR</div><div style="font-family:monospace;word-break:break-word">${esc(data.metar || "—")}</div><div class="mu" style="margin-top:10px">TAF</div><div style="font-family:monospace;word-break:break-word">${taf}</div><div class="mu" style="margin-top:8px">Kaynak: Slot Merkezi sayfası (HEZARFEN Rasat)</div></div>`;
  }
  function view() {
    const d = data || {};
    return `${banner ? `<div class="card" style="border-color:var(--pr)"><b>${banner}</b></div>` : ""}<div class="card"><b>Kapadokya Slot Merkezi</b><div class="mu">${d.updated ? "Güncelleme: " + esc(d.updated) : "Henüz veri yok"}${d.valid ? "<br>Geçerli: " + esc(d.valid) : ""}</div></div>${flagCards()}${pushCard()}<p class="mu" style="margin-top:10px">Kırmızı/sarı bayrak: kalkış izni verilmez. Yeşilde nihai uçuş kararı pilot ve işletmeye aittir. Bilgi resmî sayfadan otomatik alınır ve gecikebilir; resmî kaynağı esas alın. <a href="https://shmkapadokya.kapadokya.edu.tr" target="_blank" rel="noopener">Slot Merkezi sayfası ↗</a>${ts ? " · Son kontrol: " + tm(ts) : ""}</p>`;
  }
  function repaint() { if (host && host.isConnected) host.innerHTML = view(); if (typeof WX !== "undefined" && WX.slotChanged) WX.slotChanged(); }
  return {
    start, mount(el) { host = el; banner = ""; repaint(); load().catch(() => {}); }, on: enable, off: disable,
    metarCard, get data() { return data; }
  };
})();
