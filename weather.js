// AviaDoX Hava Durumu + kendi airgramımız. Veri: Open-Meteo (açık, anahtarsız). Kapadokya/Göreme.
const WX = (() => {
  const LAT = 38.643, LON = 34.828, TTL = 10 * 60 * 1000, KEY = "aviadox-wx-v1";
  const LV = [["700", "700 hPa"], ["850", "850 hPa"], ["925", "925 hPa"], ["180m", "180 m"], ["120m", "120 m"], ["80m", "80 m"], ["10m", "10 m"]];
  const DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
  let host = null, timer = null, data = null, err = "", loading = false;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function url() {
    const h = ["temperature_2m", "dew_point_2m", "cloud_cover", "precipitation", "visibility", "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m"];
    for (const m of [80, 120, 180]) h.push(`wind_speed_${m}m`, `wind_direction_${m}m`);
    for (const p of [925, 850, 700]) h.push(`wind_speed_${p}hPa`, `wind_direction_${p}hPa`, `geopotential_height_${p}hPa`);
    return `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&hourly=${h.join(",")}&wind_speed_unit=kn&timezone=Europe%2FIstanbul&forecast_days=3&models=best_match`;
  }
  async function load(force) {
    try { const c = JSON.parse(localStorage.getItem(KEY) || "null"); if (c && !force && Date.now() - c.t < TTL) { data = c; err = ""; paint(); return; } if (c && !data) { data = c; paint(); } } catch (e) {}
    loading = true; paint();
    try {
      const r = await fetch(url(), { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      data = { t: Date.now(), h: j.hourly }; err = "";
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) {}
    } catch (e) { err = data ? "Güncellenemedi, eski veri gösteriliyor." : "Hava verisi alınamadı. İnternet bağlantını kontrol et."; }
    loading = false; paint();
  }
  function col(k) { return k < 8 ? "#2e9e5b" : k < 12 ? "#9acd32" : k < 16 ? "#f2c230" : k < 22 ? "#f08a24" : "#d63a3a"; }
  function sp(h, lv, i) { return lv.endsWith("m") ? h["wind_speed_" + lv][i] : h[`wind_speed_${lv}hPa`][i]; }
  function dr(h, lv, i) { return lv.endsWith("m") ? h["wind_direction_" + lv][i] : h[`wind_direction_${lv}hPa`][i]; }
  function airgram(h, from, n) {
    const cw = 34, rh = 34, lw = 74, top = 40, bot = 88, W = lw + cw * n, H = top + rh * LV.length + bot;
    let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="system-ui,sans-serif" font-size="11">`;
    // gün/saat başlıkları
    for (let k = 0; k < n; k++) {
      const i = from + k, d = new Date(h.time[i]), x = lw + k * cw;
      s += `<text x="${x + cw / 2}" y="30" text-anchor="middle" fill="currentColor">${String(d.getHours()).padStart(2, "0")}</text>`;
      if (d.getHours() === 0 || k === 0) s += `<text x="${x + 2}" y="12" font-weight="700" fill="currentColor">${DAYS[d.getDay()]} ${d.getDate()}</text><line x1="${x}" y1="0" x2="${x}" y2="${H - bot}" stroke="currentColor" stroke-opacity=".35"/>`;
    }
    LV.forEach(([lv, lb], r) => {
      const y = top + r * rh;
      let t = lb;
      if (!lv.endsWith("m")) { const g = h[`geopotential_height_${lv}hPa`], a = g.slice(from, from + n).filter(v => v != null); if (a.length) t += `\n~${Math.round(a.reduce((x, y) => x + y) / a.length / 10) * 10} m`; }
      const [t1, t2] = t.split("\n");
      s += `<text x="${lw - 6}" y="${y + rh / 2 - (t2 ? 1 : -4)}" text-anchor="end" fill="currentColor">${t1}</text>`;
      if (t2) s += `<text x="${lw - 6}" y="${y + rh / 2 + 11}" text-anchor="end" fill="currentColor" fill-opacity=".6" font-size="9">${t2}</text>`;
      for (let k = 0; k < n; k++) {
        const i = from + k, v = sp(h, lv, i), d = dr(h, lv, i), x = lw + k * cw;
        if (v == null) continue;
        s += `<rect x="${x}" y="${y}" width="${cw}" height="${rh}" fill="${col(v)}" fill-opacity=".85" stroke="#fff" stroke-opacity=".5"/>`;
        s += `<g transform="translate(${x + cw / 2} ${y + 11}) rotate(${(d + 180) % 360})"><path d="M0-8L4 5L0 2L-4 5Z" fill="#fff" stroke="#000" stroke-opacity=".5" stroke-width=".6"/></g>`;
        s += `<text x="${x + cw / 2}" y="${y + 29}" text-anchor="middle" font-weight="700" fill="#111">${Math.round(v)}</text>`;
      }
    });
    // alt satırlar: sıcaklık, bulut, yağış, hamle
    const by = top + rh * LV.length + 16;
    const rows = [["Sıcaklık °C", "temperature_2m", v => Math.round(v)], ["Bulut %", "cloud_cover", v => Math.round(v)], ["Yağış mm", "precipitation", v => v ? v.toFixed(1) : ""], ["Hamle kt", "wind_gusts_10m", v => Math.round(v)]];
    rows.forEach(([lb, key, f], r) => {
      const y = by + r * 20;
      s += `<text x="${lw - 6}" y="${y}" text-anchor="end" fill="currentColor">${lb}</text>`;
      for (let k = 0; k < n; k++) { const v = h[key][from + k]; if (v == null) continue; const x = lw + k * cw + cw / 2;
        if (key === "wind_gusts_10m") s += `<text x="${x}" y="${y}" text-anchor="middle" font-weight="700" fill="${col(v)}">${f(v)}</text>`;
        else if (key === "cloud_cover") s += `<text x="${x}" y="${y}" text-anchor="middle" fill="currentColor" fill-opacity="${.45 + v / 200}">${f(v)}</text>`;
        else if (key === "precipitation") s += `<text x="${x}" y="${y}" text-anchor="middle" fill="${v > 0 ? "#2a7fd4" : "currentColor"}" font-weight="700">${f(v)}</text>`;
        else s += `<text x="${x}" y="${y}" text-anchor="middle" fill="currentColor">${f(v)}</text>`; }
    });
    return s + "</svg>";
  }
  function now(h, i) {
    const w = h.wind_speed_10m[i], g = h.wind_gusts_10m[i], vis = h.visibility[i];
    const cell = (l, v, c) => `<div class="card stat"><b${c ? ` style="color:${c}"` : ""}>${v}</b><span class="mu">${l}</span></div>`;
    return `<div class="grid">${cell("Yüzey rüzgârı (kt)", Math.round(w) + " " + dirTxt(h.wind_direction_10m[i]), col(w))}${cell("Hamle (kt)", Math.round(g), col(g))}${cell("Sıcaklık", Math.round(h.temperature_2m[i]) + "°C")}${cell("Görüş", vis == null ? "–" : (vis / 1000).toFixed(vis >= 10000 ? 0 : 1) + " km")}</div>`;
  }
  function dirTxt(d) { return ["K", "KKD", "KD", "DKD", "D", "DGD", "GD", "GGD", "G", "GGB", "GB", "BGB", "B", "BKB", "KB", "KKB"][Math.round(d / 22.5) % 16] || ""; }
  function paint() {
    if (!host || !host.isConnected) { stop(); return; }
    let b = `<div class="card" style="display:flex;align-items:center;gap:10px"><div style="flex:1"><b>Kapadokya (Göreme)</b><div class="mu">${data ? "Güncelleme: " + new Date(data.t).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) + " · otomatik yenilenir" : "Yükleniyor…"}</div></div><button class="sec" style="width:auto;margin:0" onclick="WX.refresh()">${loading ? "…" : "↻ Yenile"}</button></div>`;
    if (err) b += `<p class="mu" style="color:var(--er)">${esc(err)}</p>`;
    if (data) {
      const h = data.h, nowIso = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Istanbul" }).slice(0, 13).replace(" ", "T");
      let i = h.time.findIndex(t => t.slice(0, 13) === nowIso); if (i < 0) i = 0;
      const from = Math.max(0, i - 1), n = Math.min(48, h.time.length - from);
      b += now(h, i) + `<h2>Airgram (48 saat)</h2><p class="mu" style="margin:0 0 6px">Kutu içi sayı: rüzgâr hızı (knot). Ok: rüzgârın gittiği yön. Yatay kaydır →</p><div style="overflow-x:auto;color:var(--tx);background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:6px 0">${airgram(h, from, n)}</div>`;
      b += `<p class="mu" style="margin-top:8px">Renkler: <span style="color:#2e9e5b">■</span> &lt;8 kt <span style="color:#9acd32">■</span> 8–12 <span style="color:#f2c230">■</span> 12–16 <span style="color:#f08a24">■</span> 16–22 <span style="color:#d63a3a">■</span> &gt;22 kt</p>`;
    }
    if (typeof SLOT !== "undefined") b += SLOT.metarCard();
    b += `<p class="mu" style="margin-top:10px">Veri: Open-Meteo model tahminidir. Uçuş kararı için resmî kaynakları (MGM, SHGM/DHMİ) ve sorumlu pilotun değerlendirmesini esas alın. <a href="https://hezarfen.mgm.gov.tr/Kapadokya/khcpdkwrfgram.aspx" target="_blank" rel="noopener">MGM Kapadokya airgramı ↗</a></p>`;
    host.innerHTML = b;
  }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  return {
    mount(el) { host = el; stop(); paint(); load(false); timer = setInterval(() => load(true), TTL); },
    refresh() { load(true); },
    slotChanged() { if (host && host.isConnected) paint(); }
  };
})();
