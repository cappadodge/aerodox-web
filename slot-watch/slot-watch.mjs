// Slot Merkezi sayfasını okur, Supabase'e yazar, değişiklikte web push gönderir.
// Çalıştıran: .github/workflows/slot-watch.yml (her 5 dk)
const { SUPABASE_URL, SUPABASE_SERVICE_KEY, VAPID_PUBLIC, VAPID_PRIVATE, VAPID_SUBJECT } = process.env;
const SRC = "https://shmkapadokya.kapadokya.edu.tr/";
const H = { apikey: SUPABASE_SERVICE_KEY, Authorization: "Bearer " + SUPABASE_SERVICE_KEY, "Content-Type": "application/json" };
const strip = h => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, "\n").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n");
const FLAG = { red: ["🔴", "Uçulmaz"], yellow: ["🟡", "Uçulmaz (sarı)"], green: ["🟢", "Uçulabilir"] };

export function parse(html) {
  const text = strip(html);
  const flags = [...html.matchAll(/flags\/([a-z]+)-flag/gi)].map(m => m[1].toLowerCase());
  const names = ["Sektör A", "Sektör B", "Sektör C", "Bölge 2", "Bölge 3", "Bölge 4", "Bölge 5"];
  const flagsOk = flags.length >= 7 ? flags.slice(0, 7) : flags;
  const items = flagsOk.map((f, i) => ({ name: names[i] || "Alan " + (i + 1), flag: f }));
  // durum kelimeleri (UÇULMAZ / UÇULABİLİR) başlıklardan
  const heads = [...text.matchAll(/SEKT[ÖO]R\s+([ABC])\s+([^\n]+)/gi)].map(m => ({ k: "Sektör " + m[1].toUpperCase(), t: m[2].trim() }));
  items.forEach(it => { const h = heads.find(x => x.k === it.name); if (h) it.label = h.t; });
  const upd = (text.match(/G[ÜU]NCELLEME\s+TAR[İI]H[İI]\s+ve\s+SAAT[İI]\s*:?\s*\n?\s*([0-9.]+\s*-\s*[0-9:]+)/i) || [])[1] || "";
  const val = (text.match(/GE[ÇC]ERL[İI]\s+TAR[İI]H\s+ve\s+SAATLER\s*:?\s*\n?\s*([0-9.]+\s*-\s*[0-9:]+\s*-\s*[0-9:]+)/i) || [])[1] || "";
  const metar = (text.match(/METAR\s+[A-Z]{4}\s+\d{6}Z[^\n]*/) || [])[0] || "";
  const taf = (text.match(/TAF\s+(?:AMD\s+|COR\s+)?[A-Z]{4}\s+\d{6}Z[\s\S]*?(?=\n\s*\n|\nMETAR|Ge[çc]ici hata|\n[A-Za-zÇĞİÖŞÜ ]*(?:Airgram|HEZARFEN)|$)/) || [])[0] || "";
  const tafErr = !taf && /TAF/i.test(text) ? ((text.match(/Ge[çc]ici hata[^\n]*/) || [])[0] || "") : "";
  return { items, updated: upd.trim(), valid: val.trim(), metar: metar.trim(), taf: taf.replace(/\s+/g, " ").trim(), tafErr, fetched: new Date().toISOString() };
}
const sig = d => JSON.stringify([d.items.map(i => i.flag), d.updated, d.valid]);
function summary(d) {
  const parts = d.items.map(i => `${i.name.replace("Sektör ", "").replace("Bölge ", "B")} ${(FLAG[i.flag] || ["⚪"])[0]}`);
  return `${parts.join("  ")}${d.valid ? "\nGeçerli: " + d.valid : ""}`;
}
async function main() {
  const r = await fetch(SRC, { headers: { "User-Agent": "Mozilla/5.0 AviaDoX-slot-watch" } });
  if (!r.ok) throw new Error("Slot sayfası HTTP " + r.status);
  const d = parse(await r.text());
  if (!d.items.length) throw new Error("Sayfa biçimi tanınmadı (bayrak bulunamadı) - parse güncellenmeli");
  const old = await (await fetch(`${SUPABASE_URL}/rest/v1/slot_status?id=eq.1&select=data`, { headers: H })).json();
  const prev = old && old[0] && old[0].data && old[0].data.items ? old[0].data : null;
  const changed = !prev || sig(prev) !== sig(d);
  const w = await fetch(`${SUPABASE_URL}/rest/v1/slot_status`, { method: "POST", headers: { ...H, Prefer: "resolution=merge-duplicates" }, body: JSON.stringify({ id: 1, data: d, updated_at: new Date().toISOString() }) });
  if (!w.ok) throw new Error("Supabase yazma: " + w.status + " " + await w.text());
  console.log("Kaydedildi. Değişiklik:", changed, summary(d).replace(/\n/g, " | "));
  if (!changed || !prev) return; // ilk çalıştırmada bildirim yok
  const webpush = (await import("web-push")).default;
  webpush.setVapidDetails(VAPID_SUBJECT || "mailto:admin@aviadox.app", VAPID_PUBLIC, VAPID_PRIVATE);
  const subs = await (await fetch(`${SUPABASE_URL}/rest/v1/push_subs?select=id,endpoint,p256dh,auth`, { headers: H })).json();
  const payload = JSON.stringify({ title: "Slot Merkezi güncellendi", body: summary(d), tag: "slot", url: "./#sm" });
  let ok = 0, gone = [];
  await Promise.all((subs || []).map(s => webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 }).then(() => ok++).catch(e => { if ([404, 410].includes(e.statusCode)) gone.push(s.id); else console.log("push hata", e.statusCode); })));
  for (const id of gone) await fetch(`${SUPABASE_URL}/rest/v1/push_subs?id=eq.${id}`, { method: "DELETE", headers: H });
  console.log(`Bildirim: ${ok} gönderildi, ${gone.length} geçersiz abonelik silindi`);
}
if (process.argv[1] && process.argv[1].endsWith("slot-watch.mjs")) main().catch(e => { console.error(e); process.exit(1); });
