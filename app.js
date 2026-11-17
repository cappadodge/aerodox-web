/* ===== AviaDoX: uygulama (Supabase'e bağlı) ===== */
const sb = supabase.createClient(AERODOX.SUPABASE_URL, AERODOX.SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});
const BUCKET = "documents";

const fd = x => x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
const S = {
  user: null, profile: null, co: null, company: null, logoUrl: "",
  tab: "dash", bal: null, person: 0, menu: 0, month: fd(new Date()).slice(0, 7), busy: false,
  people: [], allStaff: [], docs: [], balloons: [], logs: [],
};

const CT = ["İşletme El Kitabı", "İşletme Şartları", "Balon Sigorta Evrakları", "CAO Anlaşmaları", "Balon Telsiz Ruhsatları", "Balon Tescil", "Balon Uçuşa Elverişlilik Evrakları"];
const PT = ["Dil Yeterlilik Belgesi", "Pilot Lisansı", "Sağlık Sertifikası", "Mezuniyet Diploması", "İlk Yardım Belgesi", "KDM Belgeleri"];
const ROLES = ["Pilot", "Yer Ekibi", "Rezervasyon", "Diğer"];
const ROLE_TO_DB = { "Pilot": "pilot", "Yer Ekibi": "ground", "Rezervasyon": "reservation", "Diğer": "other" };
const ROLE_FROM_DB = { pilot: "Pilot", ground: "Yer Ekibi", reservation: "Rezervasyon", other: "Diğer" };
const STATUS_TO_DB = { u: "flew", i: "leave", c: "field_cancel", n: "pre_cancel" };
const STATUS_FROM_DB = { flew: "u", leave: "i", field_cancel: "c", pre_cancel: "n" };
const ST = { u: ["✈️", "Uçtu"], i: ["🏖️", "İzinli"], c: ["🚫", "Alana gidildi, iptal"], n: ["❌", "Önceden iptal, alana gidilmedi"] };
const TITLES = { dash: "Panel", co: "Şirket Evrakları", pe: "Personel Evrakları", bk: "Balon Bakımı", pl: "Pilot Çizelgesi", fl: "Flight Log", wx: "Hava Durumu", sm: "Slot Merkezi", tr: "Eğitimler", cm: "Şirketler", ak: "Ayarlar" };

/* ---------- yardımcılar ---------- */
const isAdmin = () => !!(S.profile && S.profile.role === "admin");
/* Roller: admin = veriden sorumlu yönetici (her şey + kullanıcı yönetimi); flight_mgr = uçuş işletme; ground_mgr = yer işletme; quality_mgr = kalite; staff = kullanıcı */
const ROLE_NAMES = { admin: "Veriden sorumlu yönetici", flight_mgr: "Uçuş işletme yöneticisi", ground_mgr: "Yer işletme yöneticisi", quality_mgr: "Kalite yöneticisi", camo_admin: "CAMO yöneticisi", staff: "Kullanıcı" };
const POLICY_VER = () => String((typeof AERODOX !== "undefined" && AERODOX.POLICY_VERSION) || "1");
const myRole = () => (S.profile && S.profile.role) || "staff";
const isCamo = () => myRole() === "camo_admin";
const isMgr = () => myRole() !== "staff";
const canTraining = () => ["admin", "quality_mgr"].includes(myRole());
const canManageUsers = () => ["admin", "quality_mgr"].includes(myRole());
const canEditMaint = () => ["admin", "ground_mgr"].includes(myRole());
const canEditSched = () => ["admin", "flight_mgr", "quality_mgr"].includes(myRole());
const canEditCo = () => ["admin", "quality_mgr"].includes(myRole());
const canEditStaffRec = person => { const r = myRole(); return r === "admin" || r === "quality_mgr" || (r === "ground_mgr" && (!person || person.r === "Yer Ekibi")); };
const canEditPDoc = person => !!person && canEditStaffRec(person);
const canDelDoc = d => d.k === "co" ? canEditCo() : canEditPDoc(S.allStaff.find(x => x.id === d.sid));
const $ = h => { document.body.classList.remove("hasside"); document.getElementById("app").innerHTML = h; };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const val = id => { const e = document.getElementById(id); return e ? e.value : ""; };
const fileOf = id => { const e = document.getElementById(id); return e && e.files ? e.files[0] : null; };
const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }));
const extOf = n => ((String(n).split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8)) || "bin";
const nm = sid => (S.allStaff.find(x => x.id === sid) || { n: "(silinmiş)" }).n;
const BAL = z => `<svg width="${z}" height="${Math.round(z * 1.2)}" viewBox="0 0 100 120" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="bc${z}"><path d="M50 4C22 4 8 26 8 46c0 20 14 34 28 44h28c14-10 28-24 28-44C92 26 78 4 50 4z"/></clipPath></defs><g clip-path="url(#bc${z})">${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${8 + i * 12.15}" y="0" width="12.2" height="100" fill="${["#e03131", "#fff", "#f59f00"][i % 3]}"/>`).join("")}</g><path d="M50 4C22 4 8 26 8 46c0 20 14 34 28 44h28c14-10 28-24 28-44C92 26 78 4 50 4z" fill="none" stroke="#7a2e0e" stroke-width="2"/><path d="M36 90l5 12M64 90l-5 12M50 90v12" stroke="#7a2e0e" stroke-width="1.5"/><ellipse cx="50" cy="95" rx="3" ry="5" fill="#ffd43b"/><rect x="39" y="102" width="22" height="14" rx="2" fill="#a0652a" stroke="#6b3f17"/><path d="M39 109h22M45 102v14M55 102v14" stroke="#6b3f17" stroke-width="1"/></svg>`;
const AERO = z => `<svg width="${z}" height="${Math.round(z * 7 / 6)}" viewBox="0 0 120 140" style="display:block;margin:0 auto" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="AviaDoX"><path d="M60 6C28 6 10 30 10 54c0 22 16 38 32 50h36c16-12 32-28 32-50C110 30 92 6 60 6z" style="fill:var(--pr)"/><path d="M60 6C46 22 40 40 42 104M60 6c14 16 20 34 18 98" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="2"/><path d="M39 34l42 50" stroke="#8ec5ff" stroke-width="9" stroke-linecap="round"/><path d="M81 34L39 84" stroke="#fff" stroke-width="9" stroke-linecap="round"/><path d="M44 104l6 12M76 104l-6 12" style="stroke:var(--pr)" stroke-width="2.5" stroke-linecap="round"/><path d="M45 119a3 3 0 0 1 3-3h18l9 9v8a3 3 0 0 1-3 3H48a3 3 0 0 1-3-3z" fill="#fff" style="stroke:var(--pr)" stroke-width="3" stroke-linejoin="round"/><path d="M66 116v9h9" fill="none" style="stroke:var(--pr)" stroke-width="2.5" stroke-linejoin="round"/><path d="M51 128h18M51 133h10" stroke="#8ec5ff" stroke-width="2.5" stroke-linecap="round"/></svg>`;

function errMsg(e) {
  const m = String((e && (e.message || e.error_description)) || e || "Bilinmeyen hata");
  if (/row-level security|permission denied|not authorized/i.test(m)) return "Bu işlem için yetkiniz yok.";
  if (/Failed to fetch|NetworkError|Load failed|network/i.test(m)) return "İnternet bağlantısı yok veya sunucuya ulaşılamıyor.";
  if (/JWT|session/i.test(m)) return "Oturum süresi doldu, yeniden giriş yapın.";
  return m;
}
let toastT = null;
function toast(msg, bad) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.className = "toast" + (bad ? " bad" : ""); t.textContent = msg;
  clearTimeout(toastT); toastT = setTimeout(() => t.remove(), bad ? 6000 : 3500);
}
/* Tek seferde tek işlem: çift dokunmayı engeller, hataları ekrana yazar */
async function run(fn) {
  if (S.busy) return;
  S.busy = true;
  try { await fn(); } catch (e) { console.error(e); toast(errMsg(e), true); } finally { S.busy = false; }
}
async function fetchAll(mk) { // Supabase tek istekte en fazla 1000 satır verir
  let out = [], i = 0;
  for (;;) {
    const { data, error } = await mk().range(i, i + 999);
    if (error) throw error;
    out = out.concat(data || []);
    if (!data || data.length < 1000) break;
    i += 1000;
  }
  return out;
}

/* ---------- veri yükleme ---------- */
async function loadAll() {
  const d = new Date(); d.setMonth(d.getMonth() - 24); const since = fd(d);
  const [st, dc, bl, lg, pf, ml, jr, bd, cc] = await Promise.all([
    fetchAll(() => sb.from("staff").select("*").order("created_at")),
    fetchAll(() => sb.from("documents").select("*").order("created_at")),
    fetchAll(() => sb.from("balloons").select("*").order("created_at")),
    fetchAll(() => sb.from("duty_logs").select("*").gte("log_date", since).order("log_date")),
    canManageUsers() ? fetchAll(() => sb.from("profiles").select("*").order("full_name")) : Promise.resolve([]),
    fetchAll(() => sb.from("maintenance_logs").select("*").order("done_on", { ascending: false })).catch(() => []),
    canManageUsers() ? fetchAll(() => sb.from("join_requests").select("*").eq("status", "pending").order("created_at")).catch(() => []) : Promise.resolve([]),
    fetchAll(() => sb.from("balloon_docs").select("*").order("created_at")).catch(() => []),
    isCamo() ? fetchAll(() => sb.from("companies").select("id,name").order("name")).catch(() => []) : Promise.resolve([]),
  ]);
  S.bdocs = bd.map(x => ({ id: x.id, b: x.balloon_id, t: x.doc_type, d: x.expires_on, f: x.file_name || "", path: x.file_path }));
  S.camoCos = cc;
  S.allStaff = st.map(x => ({ id: x.id, n: x.full_name, r: ROLE_FROM_DB[x.job_title] || "Diğer", on: x.active !== false, u: x.user_id || null }));
  S.profiles = pf; S.joins = jr; S.mlogs = ml.map(mapM);
  S.people = S.allStaff.filter(x => x.on);
  S.docs = dc.filter(x => x.scope !== "company" || CT.includes(x.doc_type)).map(x => ({ id: x.id, k: x.scope === "company" ? "co" : "pe", sid: x.staff_id, t: x.doc_type, d: x.expires_on, f: x.file_name || "", path: x.file_path }));
  S.balloons = bl.map(mapB);
  S.logs = lg.map(x => ({ id: x.id, d: x.log_date, sid: x.staff_id, w: Number(x.duty_hours) || 0, f: Number(x.flight_hours) || 0, s: STATUS_FROM_DB[x.status] || "u" }));
  if (S.person >= S.people.length) S.person = 0;
}
async function loadAvatar() {
  S.avatarUrl = "";
  const p = S.profile && S.profile.avatar_path;
  if (!p) return;
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(p, 86400);
  if (data && data.signedUrl) S.avatarUrl = data.signedUrl;
}
async function loadAvatars() {
  S.avatarMap = {};
  const ps = (S.profiles || []).filter(x => x.avatar_path);
  if (!ps.length) return;
  const { data } = await sb.storage.from(BUCKET).createSignedUrls(ps.map(x => x.avatar_path), 86400);
  (data || []).forEach((r, i) => { if (r && r.signedUrl) S.avatarMap[ps[i].id] = r.signedUrl; });
}
async function loadLogo() {
  S.logoUrl = "";
  const p = S.company && S.company.logo_path;
  if (!p) return;
  const { data } = await sb.storage.from(BUCKET).createSignedUrl(p, 86400);
  if (data && data.signedUrl) S.logoUrl = data.signedUrl;
}

/* ---------- giriş / çıkış ---------- */
function loginView(msg) {
  $(`<div class="wrap login"><div class="logo">${AERO(104)}</div><div class="wm"><span>Avia</span><b>DoX</b></div>
<p class="mu" style="text-align:center;margin:2px 0 24px">Balon operasyonları için evrak ve uçuş takibi</p>
<input id="u" placeholder="Kullanıcı adı" autocapitalize="none" autocorrect="off" autocomplete="username" value="${esc(val("u"))}">
<input id="p" type="password" placeholder="Parola" autocomplete="current-password" onkeydown="if(event.key==='Enter')doLogin()">
<div class="err" id="e">${esc(msg || "")}</div><button id="lb" onclick="doLogin()">Giriş Yap</button><button class="sec" onclick="signupView()">Hesabın yok mu? Kayıt ol</button><p style="text-align:center;margin-top:14px"><a href="#" onclick="privPage(loginView,'pol');return false">Gizlilik Politikası</a> · <a href="#" onclick="privPage(loginView,'ayd');return false">Aydınlatma Metni</a> · <a href="#" onclick="privPage(loginView,'riza');return false">Açık Rıza</a></p>${I18N.controls(true)}</div>`);
}
const consentBlock = back => `<label style="display:flex;gap:10px;align-items:flex-start;margin:10px 0;font-size:14px"><input id="ck-a" type="checkbox" style="width:auto;margin:3px 0 0"><span><b>Okudum, anladım:</b> <a href="#" onclick="privPage(${back},'ayd');return false">KVKK Aydınlatma Metni</a> ve <a href="#" onclick="privPage(${back},'pol');return false">Gizlilik Politikası</a> metinlerini okudum, anladım.</span></label>
<div class="mu" style="margin:10px 0 2px"><a href="#" onclick="privPage(${back},'riza');return false">Açık Rıza Beyanı</a> — aşağıdaki her rıza ayrıdır:</div>
<label style="display:flex;gap:10px;align-items:flex-start;margin:6px 0;font-size:14px"><input id="ck-x" type="checkbox" style="width:auto;margin:3px 0 0"><span><b>Açık rıza 1:</b> Verilerimin Türkiye dışındaki sunucularda saklanmasına ve yurt dışındaki hizmet sağlayıcılara aktarılmasına açık rıza veriyorum.</span></label>
<label style="display:flex;gap:10px;align-items:flex-start;margin:6px 0;font-size:14px"><input id="ck-h" type="checkbox" style="width:auto;margin:3px 0 0"><span><b>Açık rıza 2:</b> Sağlık sertifikası gibi sağlık verisi niteliğindeki belgelerimin işletme yöneticileri tarafından yüklenip işlenmesine açık rıza veriyorum.</span></label>`;
function consentOk() {
  const g = id => { const e = document.getElementById(id); return e && e.checked; };
  if (!g("ck-a")) return "Devam etmek için Aydınlatma Metni ve Gizlilik Politikası'nı okuduğunuzu işaretleyin.";
  if (!g("ck-x")) return "Devam etmek için yurt dışına aktarım için açık rıza (Açık rıza 1) vermelisiniz.";
  if (!g("ck-h")) return "Devam etmek için özel nitelikli veri için açık rıza (Açık rıza 2) vermelisiniz.";
  return "";
}
function privPage(back, kind) {
  const f = typeof back === "function" ? back : null;
  $(`<div class="wrap" style="padding-bottom:40px"><button class="sec" style="width:auto" onclick="${f ? "(" + f.name + ")()" : "render()"}">‹ Geri</button><div style="margin-top:8px">${privHtml(kind)}</div></div>`);
}
async function loadCompanyList() {
  try {
    const { data, error } = await sb.rpc("signup_companies");
    if (error || !data || !data.length) return;
    const el = document.getElementById("sc"); if (!el || el.tagName === "SELECT") return;
    const cur = el.value, sel = document.createElement("select"); sel.id = "sc";
    sel.innerHTML = `<option value="">Şirketini seç</option>` + data.map(n => `<option value="${esc(n)}"${n === cur ? " selected" : ""}>${esc(n)}</option>`).join("");
    el.replaceWith(sel);
  } catch (e) {}
}
function signupView(msg) {
  $(`<div class="wrap login"><div class="logo">${AERO(72)}</div><div class="wm"><span>Avia</span><b>DoX</b></div>
<p class="mu" style="text-align:center;margin:2px 0 18px">Kayıt ol. Hesabın, çalıştığın şirketin yöneticisi onaylayınca açılır.</p>
<input id="sn" placeholder="Ad Soyad" autocomplete="name" value="${esc(val("sn"))}">
<input id="sc" placeholder="Çalıştığın şirketin adı (tam ve doğru yaz)" value="${esc(val("sc"))}">
<input id="su" placeholder="Kullanıcı adı (küçük harf, rakam, . _ -)" autocapitalize="none" autocorrect="off" autocomplete="username" value="${esc(val("su"))}">
<input id="sp1" type="password" placeholder="Parola (en az 8 karakter)" autocomplete="new-password">
<input id="sp2" type="password" placeholder="Parola (tekrar)" autocomplete="new-password" onkeydown="if(event.key==='Enter')doSignup()">
${consentBlock("signupView")}<div class="err" id="e">${esc(msg || "")}</div><button id="lb" onclick="doSignup()">Kayıt ol</button><button class="sec" onclick="loginView()">‹ Girişe dön</button></div>`);
  loadCompanyList();
}
async function doSignup() {
  const fn = val("sn").trim().replace(/\s+/g, " "), cn = val("sc").trim().replace(/\s+/g, " "), un = val("su").trim().toLowerCase(), p1 = val("sp1"), p2 = val("sp2");
  const err = document.getElementById("e"), btn = document.getElementById("lb");
  if (!fn || !cn || !un || !p1) { err.textContent = "Tüm alanları doldurun."; return; }
  { const ce = consentOk(); if (ce) { err.textContent = ce; return; } }
  if (!/^[a-z0-9._-]{3,30}$/.test(un)) { err.textContent = "Kullanıcı adı 3-30 karakter olmalı; sadece küçük harf (a-z), rakam ve . _ - kullanın. Türkçe karakter ve boşluk olmaz."; return; }
  if (p1.length < 8) { err.textContent = "Parola en az 8 karakter olmalı."; return; }
  if (p1 !== p2) { err.textContent = "Parolalar aynı değil."; return; }
  btn.disabled = true; btn.textContent = "Kaydediliyor…"; err.textContent = "";
  const { data, error } = await sb.auth.signUp({ email: un + "@" + AERODOX.AUTH_DOMAIN, password: p1, options: { data: { full_name: fn } } });
  if (error) {
    btn.disabled = false; btn.textContent = "Kayıt ol";
    const m = error.message || "";
    err.textContent = /already|registered|exists/i.test(m) ? "Bu kullanıcı adı alınmış. Başka bir kullanıcı adı deneyin." : /not allowed|disabled/i.test(m) ? "Kayıt şu an kapalı. Yöneticinizle iletişime geçin." : /password/i.test(m) ? "Parola kabul edilmedi: daha uzun ve karışık bir parola seçin." : errMsg(error);
    return;
  }
  if (!data.session) { btn.disabled = false; btn.textContent = "Kayıt ol"; err.textContent = "Hesap oluşturuldu ama oturum açılamadı. Girişe dönüp deneyin."; return; }
  S.user = data.user;
  const { error: e2 } = await sb.rpc("request_join", { cname: cn, fname: fn, ver: POLICY_VER(), xver: POLICY_VER() });
  S.joinErr = e2 ? errMsg(e2) : "";
  await bootWith(data.user);
}
function gateView(user, req, msg) {
  let body;
  if (req && req.status === "pending") {
    body = `<p style="text-align:center"><b>Başvurun alındı.</b></p><p class="mu" style="text-align:center">${esc(req.company)} şirketinin yöneticisi hesabını onayladığında giriş yapabileceksin. Onaydan sonra aşağıdaki Yenile düğmesine bas.</p><button onclick="bootWith(S.user)">Yenile</button>`;
  } else {
    body = `<p class="mu" style="text-align:center">${req && req.status === "rejected" ? "Başvurun reddedildi. Şirket adını kontrol edip tekrar başvurabilirsin." : "Hesabın henüz bir şirkete bağlı değil. Çalıştığın şirketin adını yazıp başvur."}</p>
<input id="gc" placeholder="Şirket adı (tam ve doğru yaz)"><div class="err" id="e">${esc(msg || "")}</div><button onclick="run(gateApply)">Başvur</button>`;
  }
  $(`<div class="wrap login"><div class="logo">${AERO(72)}</div><div class="wm"><span>Avia</span><b>DoX</b></div><div style="height:10px"></div>${body}<button class="sec" onclick="gateOut()">Çıkış</button></div>`);
}
async function gateApply() {
  const fn = (S.user.user_metadata && S.user.user_metadata.full_name) || "", cn = val("gc").trim(); if (!cn) return gateView(S.user, null, "Şirket adını yazın.");
  const { error } = await sb.rpc("request_join", { cname: cn, fname: fn || (S.user.email || "").split("@")[0] });
  if (error) return gateView(S.user, null, errMsg(error));
  await bootWith(S.user);
}
async function gateOut() { await sb.auth.signOut().catch(() => {}); S.user = null; loginView(); }
async function doLogin() {
  const u = val("u").trim(), p = val("p");
  const err = document.getElementById("e"), btn = document.getElementById("lb");
  if (!u || !p) { err.textContent = "Kullanıcı adı ve parolayı girin."; return; }
  const email = u.includes("@") ? u : u.toLowerCase() + "@" + AERODOX.AUTH_DOMAIN;
  btn.disabled = true; btn.textContent = "Giriş yapılıyor…"; err.textContent = "";
  const { data, error } = await sb.auth.signInWithPassword({ email, password: p });
  if (error) {
    btn.disabled = false; btn.textContent = "Giriş Yap";
    err.textContent = /invalid|credentials/i.test(error.message || "") ? "Kullanıcı adı veya parola hatalı." : errMsg(error);
    return;
  }
  await bootWith(data.user);
}
async function bootWith(user) {
  $('<p class="ld">Veriler yükleniyor…</p>');
  try {
    await boot(user);
  } catch (e) {
    console.error(e);
    if (/internet|ulaşılamıyor/i.test(errMsg(e))) { offlineView(errMsg(e), user); return; }
    await sb.auth.signOut().catch(() => {});
    S.user = null; loginView(errMsg(e));
  }
}
function offlineView(msg, user) {
  window.__retryUser = user;
  $(`<div class="wrap login"><div class="logo">${AERO(80)}</div><p class="mu" style="text-align:center">${esc(msg)}</p><button onclick="bootWith(window.__retryUser)">Tekrar dene</button></div>`);
}
function consentView(msg) {
  $(`<div class="wrap login"><div class="logo">${AERO(72)}</div><div class="wm"><span>Avia</span><b>DoX</b></div>
<h2 style="text-align:center">Gizlilik ve KVKK Onayı</h2>
<p class="mu" style="text-align:center">Devam etmeden önce Aydınlatma Metni'ni ve Gizlilik Politikası'nı okuduğunuzu onaylamanız ve açık rızalarınızı ayrı ayrı vermeniz gerekir. Uygulama hesap bilgilerinizi, personel evraklarınızı ve (yalnızca Flight Log'da Start ile Stop arasında) konumunuzu işler.</p>
${consentBlock("consentView")}
<div class="err" id="e">${esc(msg || "")}</div><button id="lb" onclick="doConsent()">Kabul ediyorum ve devam et</button><button class="sec" onclick="logout()">Kabul etmiyorum (çıkış)</button></div>`);
}
async function doConsent() {
  const err = document.getElementById("e"), btn = document.getElementById("lb");
  const ce = consentOk(); if (ce) { err.textContent = ce; return; }
  btn.disabled = true;
  const { error } = await sb.rpc("accept_privacy", { ver: POLICY_VER(), loc: false, expl: true });
  if (error) { btn.disabled = false; err.textContent = errMsg(error); return; }
  await bootWith(S.user);
}
async function boot(user) {
  S.user = user;
  const { data: pr, error: e1 } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (e1) throw e1;
  if (!pr) {
    const { data: rq } = await sb.rpc("my_join_request");
    const m = S.joinErr; S.joinErr = "";
    gateView(user, rq || null, m);
    return;
  }
  S.profile = pr; S.co = pr.company_id;
  const { data: co, error: e2 } = await sb.from("companies").select("*").eq("id", S.co).single();
  if (e2) throw e2;
  S.company = co;
  if ("consent_version" in pr && ("explicit_version" in pr ? (pr.consent_version !== POLICY_VER() || pr.explicit_version !== POLICY_VER()) : pr.consent_version !== POLICY_VER())) { consentView(); return; }
  await loadAll();
  await loadLogo();
  await loadAvatar().catch(() => {});
  if (canManageUsers()) await loadAvatars().catch(() => {});
  S.trLoaded = false; S.trs = []; S.trf = []; S.trm = null;
  S.tab = isCamo() ? "cm" : "dash"; S.cmCo = null; S.cmBal = null; S.menu = 0; S.person = 0; S.pv = 0; S.month = fd(new Date()).slice(0, 7);
  render();
}
async function logout() {
  if (FL.running() && !FL.armLogout()) { S.tab = "fl"; S.menu = 0; render(); return; }
  await FL.teardown();
  await sb.auth.signOut().catch(() => {});
  S.user = S.profile = S.company = null; S.co = null; S.logoUrl = ""; S.avatarUrl = "";
  loginView();
}
async function initApp() {
  sb.auth.onAuthStateChange(ev => {
    if (ev === "SIGNED_OUT" && S.user) { FL.teardown(); S.user = null; loginView(); }
  });
  const { data } = await sb.auth.getSession();
  if (data && data.session) await bootWith(data.session.user); else loginView();
}

/* ---------- tarih / durum yardımcıları ---------- */
function st(d) {
  if (!d) return ["ok", "Süresiz"];
  const k = (new Date(d) - new Date()) / 864e5;
  return k < 0 ? ["er", "Süresi doldu"] : k < 30 ? ["wa", Math.ceil(k) + " gün kaldı"] : ["ok", "Geçerli"];
}
const mn = x => { const [y, m] = x.split("-"); return ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"][m - 1] + " " + y; };
const r1 = x => Math.round(x * 10) / 10;
function mon(s) { const [y, m, d] = s.split("-").map(Number), x = new Date(y, m - 1, d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return fd(x); }
/* Haftalık uçuş günü sayısı: uçtu + alana gidilen iptal; "önceden iptal" günü sayacı sıfırlar */
function wc(sid, wk, add) {
  const L = S.logs.filter(l => l.sid === sid && mon(l.d) === wk); let r = "";
  L.forEach(l => { if (l.s === "n" && l.d > r) r = l.d; });
  const s = new Set(); L.forEach(l => { if ((l.s === "u" || l.s === "c") && l.d > r) s.add(l.d); });
  if (add && add > r) s.add(add);
  return s.size;
}
function wAlerts() {
  const wk = mon(fd(new Date())), o = [];
  [...new Set(S.logs.map(l => l.sid))].forEach(sid => {
    const n = wc(sid, wk), p = nm(sid);
    if (n > 6) o.push(["er", p + ": haftalık 6 gün limiti aşıldı (" + n + " gün)"]);
    else if (n === 6) o.push(["er", p + ": bu hafta 6 gün doldu, artık uçamaz"]);
    else if (n === 5) o.push(["wa", p + ": bu hafta 5 gün uçtu, 1 gün hakkı kaldı"]);
  });
  return o;
}
/* AviaDoX sıcak hava balonu simgesi (logodaki balon) */
const BI = (sz = 22) => `<svg viewBox="0 0 120 142" width="${sz}" height="${Math.round(sz * 142 / 120)}" aria-hidden="true" style="vertical-align:-5px;margin-right:6px;flex:none"><path d="M60 6C28 6 10 30 10 54c0 22 16 38 32 50h36c16-12 32-28 32-50C110 30 92 6 60 6z" fill="#0b3d91"/><path d="M39 34l42 50" stroke="#8ec5ff" stroke-width="10" stroke-linecap="round"/><path d="M81 34L39 84" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M44 104l6 12M76 104l-6 12" stroke="#0b3d91" stroke-width="3" stroke-linecap="round"/><rect x="44" y="116" width="32" height="20" rx="4" fill="#8ec5ff" stroke="#0b3d91" stroke-width="3"/></svg>`;
const MK = { preventive: "Önleyici", corrective: "Düzeltici" };
const mapM = x => ({ id: x.id, b: x.balloon_id, r: x.balloon_reg || "", w: x.work || "", k: x.kind, d: x.done_on });
const CAMOS = [["kbbm", "Kapadokya Balon Bakım Merkezi"], ["khtm", "Kapadokya Havacılık Teknolojileri Merkezi"]];
const camoName = id => (CAMOS.find(c => c[0] === id) || [0, ""])[1];
const mapB = x => ({ id: x.id, r: x.registration, h: Number(x.hours_since_100h) || 0, a: x.annual_due, t: Number(x.total_hours) || 0, lm: x.last_maint_date, arc: x.arc_start, ts: x.temp_sensor_code || "", br: x.brand || "", md: x.model || "", ft: x.fuel_tanks || "", bu: x.burner_serial || "", ins: x.insurance_start, camo: x.camo || "", co: x.company_id });
function bkInfo(b) { return { h: Math.round((100 - b.h) * 10) / 10, dl: b.a ? Math.ceil((new Date(b.a) - new Date()) / 864e5) : 999 }; }
function mAlerts() {
  const o = [];
  S.balloons.forEach(b => {
    const i = bkInfo(b);
    if (i.h <= 10) o.push([i.h <= 0 ? "er" : "wa", b.r + ": 100 saatlik bakım " + (i.h <= 0 ? "gecikti (" + (-i.h) + " saat aşıldı)" : "için " + i.h + " saat kaldı")]);
    if (b.a && i.dl <= 10) o.push([i.dl < 0 ? "er" : "wa", b.r + ": yıllık bakım " + (i.dl < 0 ? (-i.dl) + " gün gecikti" : "için " + i.dl + " gün kaldı")]);
  });
  if (canManageUsers() && S.joins && S.joins.length) o.push(["wa", S.joins.length + " kişi şirkete katılmak için onayınızı bekliyor (Ayarlar > Katılım istekleri)"]);
  if (canEditSched()) o.push(...wAlerts());
  return o.length ? `<div style="margin-top:14px">${o.map(x => `<div class="card row" style="border-color:var(--${x[0]})"><span>🔔 ${esc(x[1])}</span><span class="badge ${x[0]}">${x[0] === "er" ? "Acil" : "Yaklaşıyor"}</span></div>`).join("")}</div>` : "";
}

/* ---------- ekranlar ---------- */
function avatarBox(sz, url, name) {
  if (url === undefined) url = S.avatarUrl;
  const ini = (name || (S.profile && S.profile.full_name) || (S.user && S.user.email) || "?").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();
  return url
    ? `<img src="${esc(url)}" alt="" style="width:${sz}px;height:${sz}px;border-radius:50%;object-fit:cover;flex:none">`
    : `<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:var(--pr);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:${Math.round(sz / 2.6)}px;flex:none">${esc(ini)}</div>`;
}
function profBox() {
  const job = isMgr() ? ROLE_NAMES[myRole()] : ((S.people[0] && S.people[0].r) || "Personel");
  return `<div class="card" style="display:flex;align-items:center;gap:14px;margin-top:14px">${avatarBox(72)}<div style="min-width:0"><b style="font-size:17px">${esc(S.profile.full_name || S.user.email)}</b><div class="mu">${esc(job)}</div><button class="sec" style="width:auto;margin:8px 0 0;padding:6px 12px;font-size:13px" onclick="S.tab='ak';S.menu=0;render()">📷 Fotoğrafımı değiştir</button></div></div>`;
}
function logoBox() {
  return `<div class="card" style="text-align:center;margin-top:14px">${S.logoUrl ? `<img src="${esc(S.logoUrl)}" alt="" style="width:112px;height:112px;border-radius:50%;object-fit:cover">` : BAL(70)}<div style="margin-top:8px"><b>${esc(S.company.name)}</b></div></div>`;
}
function navBtns() {
  const items = isCamo() ? [["cm", "🏢", "Şirketler"], ["ak", "⚙️", "Ayarlar"]] : [["dash", "📊", "Panel"], ["co", "🏢", "Şirket"], ["pe", "👥", "Personel"], ["bk", "🔧", "Bakım"], ["wx", "🌤️", "Hava Durumu"], ["sm", "🚩", "Slot Merkezi"], ["tr", "🎓", "Eğitimler"], ["pl", "⏱️", "Çizelge"], ["fl", "🛰️", "Flight Log"], ["ak", "⚙️", "Ayarlar"]].filter(t => (t[0] !== "pl" || canEditSched()) && (t[0] !== "tr" || canTraining()));
  return items.map(t => `<button class="${S.tab === t[0] ? "on" : ""}" onclick="S.tab='${t[0]}';S.bal=null;S.pv=0;S.menu=0;render()">${t[1]} ${t[2]}</button>`).join("");
}
function nav() {
  return `<div class="bd" onclick="S.menu=0;render()"></div><div class="dr"><b style="padding:0 12px 8px">Menü</b>${navBtns()}</div>`;
}
function sideNav() {
  return `<aside class="side"><div class="wm" style="font-size:28px;text-align:left;padding:4px 12px 14px;margin:0"><span>Avia</span><b>DoX</b></div>${navBtns()}<div style="flex:1"></div><button onclick="logout()">↩ Çıkış</button></aside>`;
}
function render() {
  if (!S.user || !S.company) return;
  if (location.hash === "#sm") { S.tab = "sm"; history.replaceState(null, "", location.pathname + location.search); }
  if (typeof SLOT !== "undefined" && !isCamo()) SLOT.start();
  if (S.tab === "pl" && !canEditSched()) S.tab = "dash";
  if (S.tab === "tr" && !canTraining()) S.tab = "dash";
  if (isCamo() && !["cm", "ak"].includes(S.tab)) S.tab = "cm";
  const head = `<div class="cn"><span class="cb">AviaDoX</span><span>🏢 ${esc(S.company.name)}</span></div><div class="top"><button class="hb" onclick="S.menu=1;render()">☰</button><div style="flex:1"><h1>${TITLES[S.tab]}</h1><div class="mu">Hoş geldin, ${esc(S.profile.full_name || S.user.email)}${isMgr() ? " · " + ROLE_NAMES[myRole()] : ""}</div></div><button class="sec" onclick="logout()">Çıkış</button></div>`;
  let b = "";
  if (S.tab === "dash") b = dashView();
  else if (S.tab === "bk") b = S.bal ? balView() : bkView();
  else if (S.tab === "pl") b = plView();
  else if (S.tab === "fl") b = '<div id="flhost"></div>';
  else if (S.tab === "wx") b = '<div id="wxhost"></div>';
  else if (S.tab === "sm") b = '<div id="smhost"></div>';
  else if (S.tab === "cm") b = cmView();
  else if (S.tab === "tr") b = trView();
  else if (S.tab === "ak") b = setView();
  else b = docView();
  $(`${sideNav()}<div class="wrap">${head}${b}</div>${S.menu ? nav() : ""}`);
  document.body.classList.add("hasside");
  if (S.tab === "sm") SLOT.mount(document.getElementById("smhost"));
  if (S.tab === "wx") WX.mount(document.getElementById("wxhost"));
  if (S.tab === "fl") FL.mount(document.getElementById("flhost"), S.co);
  if (S.tab === "tr" && !S.trLoaded && !S.trLoading) loadTr();
}
/* ---------- Eğitimler (kalite yöneticisi + veriden sorumlu yönetici) ---------- */
async function loadTr() {
  S.trLoading = true;
  try {
    const [a, b] = await Promise.all([sb.from("trainings").select("*").order("trained_on", { ascending: false }), sb.from("training_files").select("*").order("created_at")]);
    if (a.error) throw a.error; if (b.error) throw b.error;
    S.trs = a.data || []; S.trf = b.data || []; S.trLoaded = true; S.trErr = "";
  } catch (e) { S.trErr = errMsg(e); S.trLoaded = true; S.trs = S.trs || []; S.trf = S.trf || []; }
  S.trLoading = false; if (S.tab === "tr") render();
}
function trView() {
  if (!S.trLoaded) return `<p class="ld">Yükleniyor…</p>`;
  const trs = S.trs || [], trf = S.trf || [], cur = fd(new Date()).slice(0, 7);
  const cnt = {}; trs.forEach(t => { const k = t.trained_on.slice(0, 7); cnt[k] = (cnt[k] || 0) + 1; });
  const ms = Object.keys(cnt); if (!ms.includes(cur)) ms.push(cur); ms.sort().reverse();
  if (!S.trm || (!ms.includes(S.trm) && S.trm !== "all")) S.trm = cur;
  const list = trs.filter(t => S.trm === "all" || t.trained_on.slice(0, 7) === S.trm).sort((a, b) => a.trained_on < b.trained_on ? -1 : 1);
  const dl = d => { const [y, m, g] = d.split("-"); return g + "." + m + "." + y; };
  const sel = `<select onchange="S.trm=this.value;render()"><option value="all" ${S.trm === "all" ? "selected" : ""}>Tüm aylar</option>${ms.map(x => `<option value="${x}" ${x === S.trm ? "selected" : ""}>${mn(x)} (${cnt[x] || 0} eğitim)${x === cur ? " · bu ay" : ""}</option>`).join("")}</select>`;
  const cards = list.map(t => { const fs = trf.filter(f => f.training_id === t.id); return `<div class="card"><div class="row"><b>${esc(t.title)}</b><span class="mu">${dl(t.trained_on)}</span></div>
${t.trainer ? `<div class="mu">Eğitmen: ${esc(t.trainer)}</div>` : ""}${t.notes ? `<div class="mu" style="margin-top:4px;white-space:pre-wrap">${esc(t.notes)}</div>` : ""}
${fs.map(f => `<div class="row" style="margin-top:8px"><span>📄 ${esc(f.file_name || "evrak")}</span><span><button class="sec" style="width:auto;margin:0 4px 0 0;padding:6px 10px" onclick="run(()=>trView1('${f.id}'))">Aç</button><button class="sec" style="width:auto;margin:0;padding:6px 10px" onclick="run(()=>trDelFile('${f.id}'))">Sil</button></span></div>`).join("")}
<div style="margin-top:10px"><input id="tf-${t.id}" type="file" accept=".pdf,image/*,.doc,.docx,.ppt,.pptx,.xls,.xlsx" multiple><button class="sec" onclick="run(()=>trUpload('${t.id}'))">Evrak yükle</button></div>
<button class="sec" style="margin-top:6px" onclick="run(()=>trDel('${t.id}'))">Eğitimi sil</button></div>`; }).join("");
  return `<div style="margin-top:14px">${S.trErr ? `<p class="mu" style="color:var(--er)">${esc(S.trErr)} (SQL 17 çalıştırıldı mı?)</p>` : ""}
<details class="card"><summary><b>➕ Yeni eğitim ekle</b></summary>
<label class="mu">Eğitim adı</label><input id="tt" placeholder="Örn. Acil durum tatbikatı">
<label class="mu">Tarih</label><input id="td" type="date" value="${fd(new Date())}">
<label class="mu">Eğitmen (isteğe bağlı)</label><input id="te">
<label class="mu">Not (isteğe bağlı)</label><textarea id="tn" rows="2"></textarea>
<button onclick="run(trAdd)">Kaydet</button></details>
<div class="row" style="margin:14px 0 8px"><h2 style="margin:0">${S.trm === "all" ? "Tüm eğitimler" : mn(S.trm)}</h2></div>${sel}
${cards || `<p class="mu" style="margin-top:12px">Bu ay için eğitim yok.</p>`}</div>`;
}
async function trAdd() {
  const title = val("tt").trim(), d = val("td");
  if (!title) return alert("Eğitim adını girin."); if (!d) return alert("Tarih seçin.");
  const { data, error } = await sb.from("trainings").insert({ company_id: S.co, title, trained_on: d, trainer: val("te").trim() || null, notes: val("tn").trim() || null, created_by: S.user.id }).select().single();
  if (error) throw error;
  S.trs.push(data); S.trm = d.slice(0, 7); render(); toast("Eğitim eklendi");
}
async function trUpload(id) {
  const el = document.getElementById("tf-" + id), fs = el && el.files ? [...el.files] : [];
  if (!fs.length) return alert("Lütfen dosya seçin.");
  for (const f of fs) {
    if (f.size > 45e6) { alert(f.name + ": dosya en fazla 45 MB olabilir."); continue; }
    const path = `${S.co}/training/${uuid()}.${extOf(f.name)}`;
    const { error: e1 } = await sb.storage.from(BUCKET).upload(path, f, { contentType: f.type || "application/octet-stream" });
    if (e1) throw e1;
    const { data, error } = await sb.from("training_files").insert({ training_id: id, company_id: S.co, file_path: path, file_name: f.name, uploaded_by: S.user.id }).select().single();
    if (error) { sb.storage.from(BUCKET).remove([path]).catch(() => {}); throw error; }
    S.trf.push(data);
  }
  render(); toast("Evrak yüklendi");
}
async function trView1(id) {
  const f = S.trf.find(x => x.id === id); if (!f) return;
  const w = window.open("about:blank", "_blank");
  try {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(f.file_path, 300);
    if (error) throw error;
    if (w) w.location.href = data.signedUrl; else location.href = data.signedUrl;
  } catch (e) { if (w) w.close(); throw e; }
}
async function trDelFile(id) {
  const f = S.trf.find(x => x.id === id); if (!f || !confirm("Bu evrak silinsin mi? Geri alınamaz.")) return;
  const { error } = await sb.from("training_files").delete().eq("id", id); if (error) throw error;
  sb.storage.from(BUCKET).remove([f.file_path]).catch(() => {});
  S.trf = S.trf.filter(x => x.id !== id); render(); toast("Evrak silindi");
}
async function trDel(id) {
  const t = S.trs.find(x => x.id === id); if (!t || !confirm("Bu eğitim ve tüm evrakları silinsin mi? Geri alınamaz.")) return;
  const ps = S.trf.filter(x => x.training_id === id).map(x => x.file_path);
  const { error } = await sb.from("trainings").delete().eq("id", id); if (error) throw error;
  if (ps.length) sb.storage.from(BUCKET).remove(ps).catch(() => {});
  S.trs = S.trs.filter(x => x.id !== id); S.trf = S.trf.filter(x => x.training_id !== id); render(); toast("Eğitim silindi");
}
function dashView() {
  const c = S.docs.filter(d => d.k === "co").length, p = S.docs.filter(d => d.k === "pe").length;
  const ex = S.docs.filter(d => st(d.d)[0] === "er" && d.d), so = S.docs.filter(d => st(d.d)[0] === "wa");
  const who = d => d.k === "co" ? "Şirket" : nm(d.sid);
  return `${profBox()}${logoBox()}${mAlerts()}<div class="grid" style="margin-top:14px"><div class="card stat"><b>${c}</b><span class="mu">Şirket evrakı</span></div>
  <div class="card stat"><b>${p}</b><span class="mu">Personel evrakı</span></div>
  <div class="card stat"><b style="color:var(--wa)">${so.length}</b><span class="mu">30 gün içinde dolacak</span></div>
  <div class="card stat"><b style="color:var(--er)">${ex.length}</b><span class="mu">Süresi dolmuş</span></div></div>
  <h2>Dikkat gerektirenler</h2>${[...ex, ...so].map(d => `<div class="card row"><div>${esc(d.t)}<div class="mu">${esc(who(d))} · ${esc(d.d)}</div></div><span class="badge ${st(d.d)[0]}">${st(d.d)[1]}</span></div>`).join("") || '<p class="mu">Şu an uyarı yok.</p>'}`;
}
function personHead(person) {
  if (!person) return "";
  const pr = (S.profiles || []).find(x => x.id === person.u);
  const url = pr && S.avatarMap ? S.avatarMap[pr.id] : "";
  return `<div class="card" style="display:flex;align-items:center;gap:14px">${avatarBox(64, url, person.n)}<div style="min-width:0"><b style="font-size:16px">${esc(person.n)}</b><div class="mu">${esc(person.r)}${pr ? " · hesap: " + esc(pr.full_name || "") : " · giriş hesabı bağlı değil"}</div></div></div>`;
}
function linkCard(person) {
  if (!person) return "";
  const linked = (S.profiles || []).find(x => x.id === person.u);
  const used = new Set(S.allStaff.filter(x => x.u && x.id !== person.id).map(x => x.u));
  const opts = (S.profiles || []).filter(x => !used.has(x.id)).map(x => `<option value="${x.id}" ${x.id === person.u ? "selected" : ""}>${esc(x.full_name || "(adsız)")}${x.role === "admin" ? " · yönetici" : ""}</option>`).join("");
  return `<details class="card"><summary><b>🔗 Giriş hesabı</b> <span class="mu">${linked ? "· " + esc(linked.full_name) : "· bağlı değil"}</span></summary><div class="mu" style="margin:8px 0">Bu kişinin giriş hesabını seç. Bağlanan kullanıcı sadece bu kişinin evraklarını görür ve yükleyebilir.</div><select id="lk"><option value="">Bağlı değil</option>${opts}</select><button onclick="run(()=>linkP('${person.id}'))">Kaydet</button></details>`;
}
function coView() {
  const adm = canEditCo();
  if (!CT.includes(S.ct)) S.ct = CT[0];
  const of = t => S.docs.filter(d => d.k === "co" && d.t === t);
  const chips = CT.map((t, i) => {
    const n = of(t).length, bad = of(t).some(d => d.d && st(d.d)[0] === "er");
    return `<button class="${t === S.ct ? "" : "sec"}" style="width:auto;margin:0;padding:8px 12px;font-size:13px" onclick="S.ct=CT[${i}];render()">${esc(t)}${n ? " · " + n : ""}${bad ? " ⚠" : ""}</button>`;
  }).join("");
  const list = of(S.ct);
  return `<div style="margin-top:14px"><div style="display:flex;flex-wrap:wrap;gap:8px">${chips}</div>
<h2>${esc(S.ct)}</h2>
${list.map(d => `<div class="card"><div class="row"><b>${esc(d.f || d.t)}</b><span class="badge ${st(d.d)[0]}">${st(d.d)[1]}</span></div>
<div class="mu">${d.d ? "Bitiş: " + esc(d.d) : "Bitiş tarihi yok"}</div>
<div class="row"><button class="sec" style="width:auto;margin:8px 0 0" onclick="run(()=>viewDoc('${d.id}'))">Görüntüle</button>${adm ? `<button class="x" onclick="run(()=>delDoc('${d.id}'))">🗑 Evrakı sil</button>` : ""}</div></div>`).join("") || '<p class="mu">Bu kategoride evrak yok.</p>'}
${adm ? `<details class="card"><summary><b>➕ Bu kategoriye evrak yükle</b></summary><div style="height:8px"></div><input id="t" type="hidden" value="${esc(S.ct)}">
<label class="mu">Bitiş tarihi (isteğe bağlı)</label><input id="d" type="date"><input id="f" type="file" accept=".pdf,image/*"><button onclick="run(()=>up('co'))">Yükle</button></details>` : ""}</div>`;
}
function docView() {
  if (S.tab === "co") return coView();
  if (S.tab === "pe") return peView();
  return coView();
}
function pBadge(p) {
  const ds = S.docs.filter(d => d.k === "pe" && d.sid === p.id);
  const miss = PT.filter(t => !ds.some(d => d.t === t)).length;
  const bad = ds.some(d => d.d && st(d.d)[0] === "er"), soon = ds.some(d => d.d && st(d.d)[0] === "wa");
  return bad ? '<span class="badge er">Süresi dolmuş</span>' : soon ? '<span class="badge wa">Yakında dolacak</span>' : miss ? `<span class="badge er">${miss} eksik</span>` : '<span class="badge ok">Tamam</span>';
}
function peView() {
  const adm = isMgr();
  if (!adm) return S.people[0] ? peDetail(S.people[0], false) : '<div class="card mu" style="margin-top:14px">Hesabınız henüz bir personel kaydına bağlanmamış. Lütfen yöneticinize başvurun.</div>';
  const person = S.people[S.person];
  if (S.pv && person) return peDetail(person, true);
  return `<div style="margin-top:14px">${S.people.map((x, i) => `<button class="sec" style="text-align:left;display:flex;align-items:center;justify-content:space-between;gap:8px" onclick="S.person=${i};S.pv=1;S.pt=null;render()"><span><b>${esc(x.n)}</b><br><span class="mu">${esc(x.r)}</span></span>${pBadge(x)}</button>`).join("") || '<p class="mu">Henüz personel yok.</p>'}${pAdd(false)}</div>`;
}
function peDetail(person, adm) {
  const sid = person.id;
  if (!PT.includes(S.pt)) S.pt = PT[0];
  const of = t => S.docs.filter(d => d.k === "pe" && d.sid === sid && d.t === t);
  const chips = PT.map((t, i) => {
    const n = of(t).length, bad = of(t).some(d => d.d && st(d.d)[0] === "er");
    return `<button class="${t === S.pt ? "" : "sec"}" style="width:auto;margin:0;padding:8px 12px;font-size:13px" onclick="S.pt=PT[${i}];render()">${esc(t)}${n ? " · " + n : " · eksik"}${bad ? " ⚠" : ""}</button>`;
  }).join("");
  const list = of(S.pt);
  return `<div style="margin-top:14px">${adm ? `<button class="sec" style="width:auto;margin:0 0 12px" onclick="S.pv=0;render()">‹ Personel listesi</button>` : ""}${personHead(person)}
<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">${chips}</div>
<h2>${esc(S.pt)}</h2>
${list.map(d => `<div class="card"><div class="row"><b>${esc(d.f || d.t)}</b><span class="badge ${st(d.d)[0]}">${st(d.d)[1]}</span></div>
<div class="mu">${d.d ? "Bitiş: " + esc(d.d) : "Bitiş tarihi yok"}</div>
<div class="row"><button class="sec" style="width:auto;margin:8px 0 0" onclick="run(()=>viewDoc('${d.id}'))">Görüntüle</button>${canEditPDoc(person) ? `<button class="x" onclick="run(()=>delDoc('${d.id}'))">🗑 Evrakı sil</button>` : ""}</div></div>`).join("") || '<p class="mu">Bu kategoride evrak yok.</p>'}
${canEditPDoc(person) || person.u === S.user.id ? `<details class="card"><summary><b>➕ Bu kategoriye evrak yükle</b></summary><div style="height:8px"></div><input id="t" type="hidden" value="${esc(S.pt)}">
<label class="mu">Bitiş tarihi (isteğe bağlı)</label><input id="d" type="date"><input id="f" type="file" accept=".pdf,image/*"><button onclick="run(()=>up('pe'))">Yükle</button></details>` : ""}
${canManageUsers() ? linkCard(person) : ""}${adm && canEditStaffRec(person) ? `<button class="sec" style="color:var(--er);border-color:var(--er)" onclick="run(delP)">🗑 Bu personeli çıkar</button>` : ""}</div>`;
}
function chk(sid, person) {
  if (!person) return "";
  return `<div class="card"><b>📋 ${esc(person.n)} evrak durumu</b><div style="height:8px"></div>${PT.map(t => {
    const d = S.docs.filter(x => x.k === "pe" && x.sid === sid && x.t === t);
    if (!d.length) return `<div class="row" style="margin-bottom:6px"><span>${esc(t)}</span><span class="badge er">Eksik</span></div>`;
    const x = d[d.length - 1], s = x.d ? st(x.d) : ["ok", "Yüklendi"];
    return `<div class="row" style="margin-bottom:6px"><span>${esc(t)}</span><span class="badge ${s[0]}">${s[1]}</span></div>`;
  }).join("")}</div>`;
}
function pAdd(del) {
  if (!canEditStaffRec(null)) return "";
  const roles = myRole() === "ground_mgr" ? ["Yer Ekibi"] : ROLES;
  return `<details class="card"><summary><b>➕ Pilot / personel ekle</b></summary><div style="height:10px"></div><input id="pn" placeholder="Ad Soyad"><select id="pr">${roles.map(x => `<option>${x}</option>`).join("")}</select><button onclick="run(addP)">Ekle</button></details>${del && S.people.length ? `<button class="sec" style="color:var(--er);border-color:var(--er)" onclick="run(delP)">🗑 Seçili personeli çıkar</button>` : ""}`;
}
function tabChips(items, cur, setter) {
  return `<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px">${items.map(([k, t]) => `<button class="${k === cur ? "" : "sec"}" style="width:auto;margin:0;padding:8px 12px;font-size:13px" onclick="${setter}='${k}';render()">${esc(t)}</button>`).join("")}</div>`;
}
function bkView() {
  if (!["per", "bal", "mon", "camo"].includes(S.bk)) S.bk = "per";
  const chips = tabChips([["per", "Periyodik bakım"], ["bal", "Balonlar"], ["mon", "Aylık bakım çizelgesi"], ["camo", "🤝 Anlaşmalı CAMO"]], S.bk, "S.bk");
  return `<div style="margin-top:14px">${chips}${S.bk === "per" ? perView() : S.bk === "bal" ? balListView() : S.bk === "camo" ? camoView() : monView()}</div>`;
}
/* ---------- Balon evrakları (balon başına) + CAMO yöneticisi görünümü ---------- */
const BDOC_TYPES = ["Balon sigortası", "Azot tüpleri manometre kalibrasyonu", "Balon logbook kapak ve son uçuş sayfası", "Tescil sertifikası", "Uçuşa elverişlilik sertifikası", "Uçuşa elverişlilik gözden geçirme sertifikası", "İşletme şartları", "İşletme ruhsatı", "Hava bandı telsiz ruhsatı", "Yakıt tankı bakım raporları"];
function bdocCard(b, ad) {
  const all = (S.bdocs || []).filter(x => x.b === b.id);
  const rows = BDOC_TYPES.map((t, i) => { const fs = all.filter(x => x.t === t), bad = fs.some(x => x.d && st(x.d)[0] === "er");
    return `<details style="border-top:1px solid var(--bd);padding:8px 0"><summary style="cursor:pointer"><span>${esc(t)}</span> <span class="badge ${fs.length ? (bad ? "er" : "ok") : "wa"}">${fs.length ? fs.length + " evrak" + (bad ? " ⚠" : "") : "Yok"}</span></summary>
${fs.map(f => `<div class="row" style="margin-top:8px"><span>📄 ${esc(f.f || "evrak")}${f.d ? `<br><span class="mu">Bitiş: ${esc(f.d)}</span>` : ""}</span><span><button class="sec" style="width:auto;margin:0 4px 0 0;padding:6px 10px" onclick="run(()=>openPath('${f.path}'))">Aç</button>${ad ? `<button class="sec" style="width:auto;margin:0;padding:6px 10px" onclick="run(()=>delBdoc('${f.id}'))">Sil</button>` : ""}</span></div>`).join("") || '<div class="mu" style="margin-top:6px">Henüz evrak yüklenmemiş.</div>'}
${ad ? `<div style="margin-top:10px"><label class="mu">Bitiş tarihi (isteğe bağlı)</label><input id="bd-d-${b.id}-${i}" type="date"><input id="bd-f-${b.id}-${i}" type="file" accept=".pdf,image/*" multiple><button class="sec" onclick="run(()=>upBdoc('${b.id}',${i}))">Yükle</button></div>` : ""}</details>`; }).join("");
  return `<div class="card"><b>📁 Balon evrakları</b><div class="mu" style="margin:4px 0 6px">${ad ? "Bu balona ait evrakları türüne göre yükleyin." : "Bu balona ait evraklar."}${ad && b.camo ? " Anlaşmalı CAMO bu evrakları görebilir." : ""}</div>${rows}</div>`;
}
async function openPath(path) {
  const w = window.open("about:blank", "_blank");
  try {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, 300);
    if (error) throw error;
    if (w) w.location.href = data.signedUrl; else location.href = data.signedUrl;
  } catch (e) { if (w) w.close(); throw e; }
}
async function upBdoc(bid, i) {
  if (!canEditMaint()) return;
  const el = document.getElementById(`bd-f-${bid}-${i}`), fs = el && el.files ? [...el.files] : [], d = val(`bd-d-${bid}-${i}`) || null;
  if (!fs.length) return alert("Lütfen dosya seçin.");
  for (const f of fs) {
    if (f.size > 45e6) { alert(f.name + ": dosya en fazla 45 MB olabilir."); continue; }
    const path = `${S.co}/balloons/${uuid()}.${extOf(f.name)}`;
    const { error: e1 } = await sb.storage.from(BUCKET).upload(path, f, { contentType: f.type || "application/octet-stream" });
    if (e1) throw e1;
    const { data, error } = await sb.from("balloon_docs").insert({ company_id: S.co, balloon_id: bid, doc_type: BDOC_TYPES[i], expires_on: d, file_path: path, file_name: f.name, uploaded_by: S.user.id }).select().single();
    if (error) { sb.storage.from(BUCKET).remove([path]).catch(() => {}); throw error; }
    S.bdocs.push({ id: data.id, b: bid, t: data.doc_type, d: data.expires_on, f: f.name, path });
  }
  render(); toast("Evrak yüklendi");
}
async function delBdoc(id) {
  const x = (S.bdocs || []).find(v => v.id === id); if (!x || !canEditMaint() || !confirm("Bu evrak silinsin mi? Geri alınamaz.")) return;
  const { error } = await sb.from("balloon_docs").delete().eq("id", id); if (error) throw error;
  sb.storage.from(BUCKET).remove([x.path]).catch(() => {});
  S.bdocs = S.bdocs.filter(v => v.id !== id); render(); toast("Evrak silindi");
}
function cmView() {
  const mine = camoName(S.profile.camo);
  const cos = (S.camoCos || []).filter(c => S.balloons.some(b => b.co === c.id));
  const head = `<div class="mu" style="margin:14px 0 6px">${esc(mine)} · anlaşmalı olduğunuz şirketler</div>`;
  if (S.cmBal) {
    const b = S.balloons.find(x => x.id === S.cmBal);
    if (b) {
      const co = (S.camoCos || []).find(c => c.id === b.co), n = bkInfo(b), ml = (S.mlogs || []).filter(m => m.b === b.id);
      const info = [["Balon marka adı", b.br], ["Balon tip / model", b.md], ["Isı sensörü kodu", b.ts], ["Yakıt tankı seri numaraları", b.ft], ["Burner seri numarası", b.bu]];
      return `<div style="margin-top:14px"><button class="sec" onclick="S.cmBal=null;render()">‹ ${esc(co ? co.name : "Balonlar")}</button>
<div class="card"><b style="font-size:18px;display:flex;align-items:center">${BI(28)}${esc(b.r)}</b><div class="mu" style="margin-top:4px">Şirket: ${esc(co ? co.name : "-")}</div>
<div class="row" style="margin-top:8px"><span>Güncel toplam uçuş saati</span><b>${b.t} sa</b></div>
<div class="row" style="margin-top:6px"><span>100 saatlik bakıma kalan</span><b>${n.h} saat</b></div>
<div class="row" style="margin-top:6px"><span>Bu bakımdan beri</span><b>${b.h} sa</b></div>
<div class="row" style="margin-top:6px"><span>Son bakım tarihi</span><b>${b.lm ? esc(b.lm) : "-"}</b></div></div>
<div class="card"><b>📋 Balon bilgileri</b><div style="height:6px"></div>${info.map(x => `<div style="margin:8px 0"><div class="mu">${x[0]}</div><div>${x[1] ? esc(x[1]).replace(/\n/g, "<br>") : "-"}</div></div>`).join("")}</div>
${ml.length ? `<div class="card"><b>🔧 Bakım kayıtları</b>${ml.slice(0, 30).map(m => `<div style="border-top:1px solid var(--bd);padding:8px 0"><div>${esc(m.w)}</div><div class="mu">${esc(m.d)} · ${m.k === "corrective" ? "Düzeltici" : "Önleyici"}</div></div>`).join("")}</div>` : ""}
${bdocCard(b, false)}</div>`;
    }
    S.cmBal = null;
  }
  if (S.cmCo) {
    const co = cos.find(c => c.id === S.cmCo), bs = S.balloons.filter(b => b.co === S.cmCo);
    if (co) return `<div style="margin-top:14px"><button class="sec" onclick="S.cmCo=null;render()">‹ Şirketler</button><h2>${esc(co.name)}</h2><div class="mu" style="margin-bottom:8px">${esc(mine)} ile anlaşmalı balonlar</div>
${bs.map(b => { const n = bkInfo(b); return `<div class="card" style="cursor:pointer" onclick="S.cmBal='${b.id}';render()"><div class="row"><b style="display:flex;align-items:center">${BI(22)}${esc(b.r)} ›</b><span class="mu">${esc([b.br, b.md].filter(Boolean).join(" "))}</span></div><div class="mu" style="margin-top:4px">Toplam ${b.t} sa · 100 saatlik bakıma ${n.h} sa kaldı</div></div>`; }).join("")}</div>`;
    S.cmCo = null;
  }
  return `<div style="margin-top:14px">${head}${cos.map(c => { const k = S.balloons.filter(b => b.co === c.id).length; return `<div class="card" style="cursor:pointer" onclick="S.cmCo='${c.id}';render()"><div class="row"><b>🏢 ${esc(c.name)} ›</b><span class="mu">${k} balon</span></div></div>`; }).join("") || '<p class="mu">Henüz sizinle anlaşmalı balon yok. Balon işletmeleri balonlarına sizi CAMO olarak atadığında burada görünür.</p>'}</div>`;
}
function camoView() {
  const ad = canEditMaint();
  const cards = CAMOS.map(([id, nm]) => { const bs = S.balloons.filter(b => b.camo === id);
    return `<div class="card"><b>🤝 ${esc(nm)}</b><div class="mu" style="margin:4px 0">Anlaşmalı CAMO · ${bs.length} balon</div>${bs.map(b => `<div class="row" style="margin-top:6px;cursor:pointer" onclick="S.bal='${b.id}';render()"><span style="display:flex;align-items:center">${BI(20)}${esc(b.r)} ›</span></div>`).join("") || '<div class="mu">Atanmış balon yok.</div>'}</div>`; }).join("");
  const un = S.balloons.filter(b => !camoName(b.camo));
  const asg = `<div class="card"><b>Balon – CAMO ataması</b><div class="mu" style="margin:4px 0 8px">Her balon için anlaşmalı CAMO seçin.${ad ? "" : " (Yalnızca görüntüleme.)"}</div>${S.balloons.map(b => `<div class="row" style="margin-top:8px"><span style="display:flex;align-items:center">${BI(20)}${esc(b.r)}</span>${ad ? `<select style="width:auto;max-width:60%" onchange="run(()=>setCamo('${b.id}',this.value))"><option value="">Atanmadı</option>${CAMOS.map(c => `<option value="${c[0]}" ${b.camo === c[0] ? "selected" : ""}>${esc(c[1])}</option>`).join("")}</select>` : `<span class="mu">${esc(camoName(b.camo) || "Atanmadı")}</span>`}</div>`).join("") || '<p class="mu">Henüz balon yok.</p>'}</div>`;
  return `<div style="margin-top:14px">${cards}${un.length ? `<div class="mu" style="margin:0 0 10px">CAMO atanmamış balon: ${un.length}</div>` : ""}${asg}</div>`;
}
async function setCamo(id, v) {
  if (!canEditMaint()) return;
  const { error } = await sb.from("balloons").update({ camo: v || null }).eq("id", id); if (error) throw error;
  const b = S.balloons.find(x => x.id === id); if (b) b.camo = v || ""; render(); toast("CAMO ataması kaydedildi");
}
function perView() {
  const sum = S.balloons.map(b => {
    const n = bkInfo(b), c1 = n.h <= 0 ? "er" : n.h <= 10 ? "wa" : "ok", c2 = n.dl < 0 ? "er" : n.dl <= 10 ? "wa" : "ok";
    return `<div style="border-top:1px solid var(--bd);padding:10px 0"><div class="row"><b style="display:flex;align-items:center;cursor:pointer" onclick="S.bal='${b.id}';render()">${BI(22)}${esc(b.r)} ›</b><span class="badge ${c1}">${n.h <= 0 ? "Bakım gecikti" : n.h + " saat kaldı"}</span></div>
<div class="grid" style="margin-top:6px;gap:6px;font-size:13px"><div><span class="mu">Güncel uçuş saati</span><br><b>${b.t} sa</b></div><div><span class="mu">Son bakım</span><br><b>${b.lm ? esc(b.lm) : "-"}</b></div>
<div><span class="mu">Bu bakımdan beri</span><br><b>${b.h} sa</b></div><div><span class="mu">Yıllık bakım</span><br><span class="badge ${c2}">${b.a ? esc(b.a) : "-"}</span></div></div></div>`;
  }).join("");
  return `<div class="card"><b>🔧 100 saatlik bakım çizelgesi</b><div class="mu" style="margin:4px 0 8px">Kalan süre 10 saat veya 10 günün altına inince panelde bildirim çıkar. Ayrıntı için balonun adına dokun.</div>${S.balloons.length ? sum : '<p class="mu">Henüz balon yok.</p>'}</div>`;
}
function balListView() {
  return `${S.balloons.map(b => `<button class="sec" style="text-align:left" onclick="S.bal='${b.id}';render()"><span style="display:flex;align-items:center">${BI(22)}${esc(b.r)}</span></button>`).join("") || '<p class="mu">Henüz balon yok.</p>'}
<div class="card" ${canEditMaint() ? "" : "hidden"} style="margin-top:14px"><b>➕ Balon ekle</b><div style="height:8px"></div>
<input id="br" placeholder="Tescil (örn. TC-ABC)">
<label class="mu">Güncel toplam uçuş saati</label><input id="bt" type="number" min="0" step="0.1" value="0">
<label class="mu">Son 100 saatlik bakımdan beri uçulan saat</label><input id="bh" type="number" min="0" step="0.1" value="0">
<label class="mu">Yıllık bakım bitiş tarihi</label><input id="ba" type="date">
<button onclick="run(addB)">Balon ekle</button></div>`;
}
function mForm(pre, m) {
  const bs = S.balloons.map(b => `<option value="${b.id}" ${m && m.b === b.id ? "selected" : ""}>${esc(b.r)}</option>`).join("");
  return `<label class="mu">Balon (tescil)</label><select id="${pre}b">${bs}</select>
<label class="mu">Yapılan bakım</label><input id="${pre}w" placeholder="Örn. 100 saatlik bakım, burner conta değişimi" value="${m ? esc(m.w) : ""}">
<label class="mu">Bakım türü</label><select id="${pre}k"><option value="preventive" ${m && m.k === "preventive" ? "selected" : ""}>Önleyici bakım</option><option value="corrective" ${m && m.k === "corrective" ? "selected" : ""}>Düzeltici bakım</option></select>
<label class="mu">Bakım işlem tarihi</label><input id="${pre}d" type="date" value="${m ? esc(m.d) : fd(new Date())}">`;
}
function monView() {
  const adm = canEditMaint(), cur = fd(new Date()).slice(0, 7);
  const ms = [...new Set([cur, ...S.mlogs.map(x => x.d.slice(0, 7))])].sort().reverse();
  if (!ms.includes(S.bm)) S.bm = cur;
  const rows = S.mlogs.filter(x => x.d.slice(0, 7) === S.bm).sort((a, b) => a.d.localeCompare(b.d));
  const regOf = x => { const b = S.balloons.find(y => y.id === x.b); return b ? b.r : (x.r || "?"); };
  const nP = rows.filter(x => x.k === "preventive").length, nC = rows.length - nP;
  const edit = adm && S.editM ? S.mlogs.find(x => x.id === S.editM) : null;
  return `<select onchange="S.bm=this.value;S.editM=null;render()">${ms.map(x => `<option value="${x}" ${x === S.bm ? "selected" : ""}>${mn(x)}${x === cur ? " (güncel)" : " (arşiv)"}</option>`).join("")}</select>
<h2>${mn(S.bm)} bakım çizelgesi</h2>
<div class="mu" style="margin-bottom:8px">Toplam ${rows.length} kayıt · ${nP} önleyici · ${nC} düzeltici</div>
${edit ? `<div class="card"><b>✏️ Kaydı düzenle</b><div style="height:8px"></div>${mForm("x", edit)}<button onclick="run(()=>saveM('${edit.id}'))">Kaydet</button><button class="sec" onclick="S.editM=null;render()">Vazgeç</button><button class="x" onclick="run(()=>delM('${edit.id}'))">🗑 Kaydı sil</button></div>` : ""}
${rows.length ? `<div style="overflow-x:auto"><table class="gt" style="width:100%;font-size:13px"><tr><th>Tarih</th><th>Balon</th><th>Yapılan bakım</th><th>Tür</th>${adm ? "<th></th>" : ""}</tr>${rows.map(x => `<tr><td style="white-space:nowrap">${esc(x.d.slice(8))}.${esc(x.d.slice(5, 7))}</td><td style="white-space:nowrap"><b>${esc(regOf(x))}</b></td><td style="text-align:left;min-width:120px">${esc(x.w)}</td><td><span class="badge ${x.k === "preventive" ? "ok" : "wa"}">${MK[x.k] || "-"}</span></td>${adm ? `<td><button class="sec" style="width:auto;margin:0;padding:4px 8px" onclick="S.editM='${x.id}';render()">✏️</button></td>` : ""}</tr>`).join("")}</table></div>` : '<p class="mu">Bu ay bakım kaydı yok.</p>'}
${adm ? `<details class="card" style="margin-top:12px"><summary><b>➕ Bakım kaydı ekle</b></summary><div style="height:8px"></div>${S.balloons.length ? mForm("m") + '<button onclick="run(addM)">Kaydet</button>' : '<p class="mu">Önce Balonlar sekmesinden balon ekleyin.</p>'}</details>` : ""}`;
}
function balView() {
  const b = S.balloons.find(x => x.id === S.bal); if (!b) { S.bal = null; return bkView(); }
  const n = bkInfo(b), c1 = n.h <= 0 ? "er" : n.h <= 10 ? "wa" : "ok", c2 = n.dl < 0 ? "er" : n.dl <= 10 ? "wa" : "ok", t = c => c === "ok" ? "İyi" : c === "wa" ? "Yaklaşıyor" : "Gecikti";
  const info = [["Uçuşa elverişlilik başlangıç tarihi", b.arc], ["Isı sensörü kodu", b.ts], ["Balon marka adı", b.br], ["Balon tip / model", b.md], ["Yakıt tankı seri numaraları", b.ft], ["Burner seri numarası", b.bu], ["Balon sigorta başlangıç tarihi", b.ins]];
  const ad = canEditMaint();
  return `<div style="margin-top:14px"><button class="sec" onclick="S.bal=null;render()">‹ Balon listesi</button>
<div class="card"><div class="row"><b style="font-size:18px;display:flex;align-items:center">${BI(28)}${esc(b.r)}</b></div>
<div class="row" style="margin-top:8px"><span>Güncel toplam uçuş saati</span><b>${b.t} sa</b></div>
<div class="row" style="margin-top:6px"><span>100 saatlik bakıma kalan: ${n.h} saat</span><span class="badge ${c1}">${t(c1)}</span></div>
<div class="row" style="margin-top:6px"><span>Son bakım tarihi: ${b.lm ? esc(b.lm) : "-"}</span></div>
<div class="row" style="margin-top:6px"><span>Anlaşmalı CAMO: ${esc(camoName(b.camo) || "atanmadı")}</span></div>
<div class="row" style="margin-top:6px"><span>Yıllık bakım: ${b.a ? esc(b.a) + " (" + n.dl + " gün)" : "tarih yok"}</span><span class="badge ${c2}">${t(c2)}</span></div>
<input id="fh${b.id}" type="number" min="0" step="0.1" placeholder="Uçuş saati ekle" style="margin-top:10px">
<button onclick="run(()=>addH('${b.id}'))">Saat ekle</button>
<button class="sec" onclick="run(()=>done100('${b.id}'))">100 saatlik bakım yapıldı</button>
<button class="sec" onclick="run(()=>doneY('${b.id}'))">Yıllık bakım yapıldı (+1 yıl)</button></div>
<div class="card"><b>📋 Balon bilgileri</b><div style="height:6px"></div>${info.map(x => `<div style="margin:8px 0"><div class="mu">${x[0]}</div><div>${x[1] ? esc(x[1]).replace(/\n/g, "<br>") : "-"}</div></div>`).join("")}</div>
${bdocCard(b, ad)}
${ad ? `<details class="card"><summary><b>✏️ Bilgileri düzenle (yönetici)</b></summary><div style="height:10px"></div>
<label class="mu">Tescil</label><input id="er" value="${esc(b.r)}">
<label class="mu">Güncel toplam uçuş saati</label><input id="et" type="number" min="0" step="0.1" value="${b.t}">
<label class="mu">100 saatlik bakımdan beri uçulan saat</label><input id="eh" type="number" min="0" step="0.1" value="${b.h}">
<label class="mu">Son bakım tarihi</label><input id="el" type="date" value="${esc(b.lm || "")}">
<label class="mu">Yıllık bakım bitiş tarihi</label><input id="ea" type="date" value="${esc(b.a || "")}">
<label class="mu">Uçuşa elverişlilik başlangıç tarihi</label><input id="ec" type="date" value="${esc(b.arc || "")}">
<label class="mu">Isı sensörü kodu</label><input id="es" value="${esc(b.ts)}">
<label class="mu">Balon marka adı</label><input id="eb" value="${esc(b.br)}">
<label class="mu">Balon tip / model</label><input id="em" value="${esc(b.md)}">
<label class="mu">Yakıt tankı seri numaraları (her satıra bir tane)</label><textarea id="ef" rows="4" style="width:100%;font:inherit;padding:10px;border:1px solid var(--bd);border-radius:10px;background:var(--card);color:var(--tx);box-sizing:border-box">${esc(b.ft)}</textarea>
<label class="mu">Burner seri numarası</label><input id="eu" value="${esc(b.bu)}">
<label class="mu">Balon sigorta başlangıç tarihi</label><input id="ei" type="date" value="${esc(b.ins || "")}">
<button onclick="run(()=>saveB('${b.id}'))">Kaydet</button>
<button class="x" onclick="run(()=>delB('${b.id}'))">🗑 Balonu çıkar</button></details>` : ""}</div>`;
}
function wInfo(sids) {
  const wk = mon(fd(new Date()));
  return `<div class="card"><b>📅 Bu hafta uçuş günleri</b><div class="mu" style="margin:4px 0 8px">Kural: haftada en fazla 6 gün. Alana gidilen iptal günü de uçtu sayılır. 5. günde uyarı verilir. Bir gün önceden iptal (❌) günü sayacı sıfırlar.</div>${sids.map(sid => { const n = wc(sid, wk), c = n >= 6 ? "er" : n === 5 ? "wa" : "ok"; return `<div class="row" style="margin-bottom:6px"><span>${esc(nm(sid))}</span><span class="badge ${c}">${n} / 6 gün</span></div>`; }).join("")}</div>`;
}
function grid(m, sids, rows) {
  const [y, mo] = m.split("-"), n = new Date(y, mo, 0).getDate(), pr = { u: 4, c: 3, i: 2, n: 1 }, c = {};
  rows.forEach(l => { const k = l.sid + "|" + Number(l.d.slice(8)); if (!c[k] || pr[l.s] > pr[c[k]]) c[k] = l.s; });
  const days = Array.from({ length: n }, (_, i) => i + 1), tt = {};
  rows.forEach(l => { const t = tt[l.sid] = tt[l.sid] || { f: 0, w: 0 }; t.f += l.f; t.w += l.w; });
  const tc = 'style="text-align:center;font-weight:700;white-space:nowrap;padding:4px 8px"';
  return `<h2>${mn(m)} aylık çizelge</h2><div style="overflow-x:auto"><table class="gt"><tr><th class="nm"></th>${days.map(d => `<th>${d}</th>`).join("")}<th ${tc}>Uçuş saati toplamı</th><th ${tc}>Çalışma saati toplamı</th></tr>${sids.map(sid => { const t = tt[sid] || { f: 0, w: 0 }; return `<tr><td class="nm">${esc(nm(sid))}</td>${days.map(d => `<td>${c[sid + "|" + d] ? ST[c[sid + "|" + d]][0] : ""}</td>`).join("")}<td ${tc}>${r1(t.f)}</td><td ${tc}>${r1(t.w)}</td></tr>`; }).join("")}</table></div><p class="mu">✈️ Uçtu · 🏖️ İzinli · 🚫 Alana gidildi, uçuş iptal · ❌ Önceden iptal, alana gidilmedi</p>`;
}
function plView() {
  const cur = fd(new Date()).slice(0, 7), ed = S.month === cur;
  const ms = [...new Set([cur, ...S.logs.map(l => l.d.slice(0, 7))])].sort().reverse();
  if (!ms.includes(S.month)) S.month = cur;
  const m = S.month;
  const rows = S.logs.filter(l => l.d.slice(0, 7) === m).sort((a, b) => b.d.localeCompare(a.d));
  const tot = {}; rows.forEach(l => { const t = tot[l.sid] = tot[l.sid] || { w: 0, f: 0, g: new Set() }; t.w += l.w; t.f += l.f; if (l.s === "u") t.g.add(l.d); });
  let pil = S.people.filter(x => x.r === "Pilot"); if (!pil.length) pil = S.people;
  const sids = [...new Set([...pil.map(x => x.id), ...Object.keys(tot)])];
  const [y, mo] = cur.split("-"), last = String(new Date(y, mo, 0).getDate()).padStart(2, "0"), today = fd(new Date());
  const form = `<div class="card"><b>Günlük kayıt</b><div style="height:8px"></div><input id="pd" type="date" value="${today}" min="${cur}-01" max="${cur}-${last}"><select id="pp">${pil.map(x => `<option value="${x.id}">${esc(x.n)}</option>`).join("")}</select><select id="ps"><option value="u">✈️ Uçtu</option><option value="i">🏖️ İzinli</option><option value="c">🚫 Alana gidildi, uçuş iptal</option><option value="n">❌ Önceden iptal (alana gidilmedi)</option></select><input id="pw" type="number" min="0" step="0.5" placeholder="Çalışma süresi (saat)"><input id="pf" type="number" min="0" step="0.1" placeholder="Uçuş süresi (saat)"><button onclick="run(addL)">Kaydet</button></div>`;
  const sum = Object.keys(tot).map(sid => { const t = tot[sid]; return `<div class="card"><b>${esc(nm(sid))}</b><div class="grid" style="grid-template-columns:repeat(3,1fr);margin-top:8px"><div><b>${t.g.size}</b><div class="mu">uçuş günü</div></div><div><b>${r1(t.w)}</b><div class="mu">çalışma sa.</div></div><div><b>${r1(t.f)}</b><div class="mu">uçuş sa.</div></div></div></div>`; }).join("");
  const list = rows.map(l => `<div class="card row"><div><b>${esc(nm(l.sid))}</b><div class="mu">${l.d} · ${ST[l.s].join(" ")} · çalışma ${l.w} sa · uçuş ${l.f} sa</div></div>${ed ? `<button class="x" onclick="run(()=>delL('${l.id}'))">Sil</button>` : ""}</div>`).join("");
  return `<div style="margin-top:14px">${wInfo(sids)}<select onchange="S.month=this.value;render()">${ms.map(x => `<option value="${x}" ${x === m ? "selected" : ""}>${mn(x)}${x === cur ? " (güncel)" : " (arşiv)"}</option>`).join("")}</select>${pAdd()}${ed ? form : '<div class="card mu">📁 Arşivlenmiş ay: sadece görüntülenir.</div>'}<h2>${mn(m)} özeti</h2>${sum || '<p class="mu">Bu ay kayıt yok.</p>'}<h2>Günlük kayıtlar</h2>${list || '<p class="mu">Kayıt yok.</p>'}${grid(m, sids, rows)}</div>`;
}
function joinCard() {
  const rows = (S.joins || []).map(j => `<div class="card" style="margin:8px 0"><b>${esc(j.full_name)}</b><div class="mu">Kullanıcı adı: ${esc(j.username || "")} · ${esc((j.created_at || "").slice(0, 10))}</div><select id="jb${j.id}"><option value="">Personel kaydı oluşturma</option>${ROLES.map(r => `<option>${r}</option>`).join("")}</select><button onclick="run(()=>approveJ('${j.id}'))">Onayla</button><button class="x" onclick="run(()=>rejectJ('${j.id}'))">Reddet</button></div>`).join("");
  return `<div class="card"><b>📨 Katılım istekleri${S.joins && S.joins.length ? " (" + S.joins.length + ")" : ""}</b><div class="mu" style="margin:6px 0">Çalışanlar kayıt olurken listeden şirketi seçer: <b>${esc(S.company.name)}</b>. Onayladığın kişi normal kullanıcı olarak girer. Bir rol seçersen personel kaydı da açılır ve hesaba otomatik bağlanır.</div>${rows || '<p class="mu">Bekleyen istek yok.</p>'}</div>`;
}
function usersCard() {
  const me = S.user.id;
  const rows = (S.profiles || []).map(u => {
    const sf = S.allStaff.find(x => x.u === u.id), isA = u.role === "admin", self = u.id === me;
    return `<div style="border-top:1px solid var(--bd);padding:10px 0"><div style="display:flex;align-items:center;gap:10px">${avatarBox(40, S.avatarMap && S.avatarMap[u.id], u.full_name)}<div style="min-width:0;flex:1"><b>${esc(u.full_name || "(adsız)")}${self ? " (sen)" : ""}</b><div class="mu">${sf ? esc(sf.r) + " · personel kaydı bağlı" : "personel kaydı bağlı değil"}</div></div><span class="badge ${u.role === "staff" ? "ok" : "wa"}">${esc(ROLE_NAMES[u.role] || "Kullanıcı")}</span></div>
${self || (u.role === "admin" && !isAdmin()) ? "" : `<div class="row" style="margin-top:8px;gap:8px"><select style="margin:0" onchange="run(()=>setRole('${u.id}',this.value))">${Object.keys(ROLE_NAMES).filter(k => k !== "admin" || isAdmin()).map(k => `<option value="${k}"${k === u.role ? " selected" : ""}>${ROLE_NAMES[k]}</option>`).join("")}</select><button class="x" onclick="run(()=>removeU('${u.id}'))">Erişimi kaldır</button></div>`}</div>`;
  }).join("");
  return `<div class="card"><b>👥 Kullanıcılar (${(S.profiles || []).length})</b><div class="mu" style="margin:6px 0">Şirketine giriş yapabilen hesaplar. Rol atayabilir ya da erişimi kaldırabilirsin. Erişimi kaldırılan kişinin personel kaydı ve evrakları silinmez.</div>${rows || '<p class="mu">Kullanıcı yok.</p>'}</div>`;
}
async function setRole(id, role) {
  if (!canManageUsers()) return;
  const u = S.profiles.find(x => x.id === id); if (!u) return;
  if (u.role === role) return;
  if (!confirm((u.full_name || "Bu kullanıcı") + " için rol \"" + ROLE_NAMES[role] + "\" yapılsın mı?")) { render(); return; }
  const { error } = await sb.rpc("set_user_role", { uid: id, new_role: role }); if (error) throw error;
  u.role = role; render(); toast("Rol güncellendi");
}
async function removeU(id) {
  if (!canManageUsers()) return;
  const u = S.profiles.find(x => x.id === id); if (!u) return;
  if (!confirm((u.full_name || "Bu kullanıcı") + " için şirkete erişim kaldırılsın mı? Giriş yapabilir ama hiçbir veriyi göremez.")) return;
  const { error } = await sb.rpc("remove_user", { uid: id }); if (error) throw error;
  await loadAll(); await loadAvatars().catch(() => {}); render(); toast("Erişim kaldırıldı");
}
async function approveJ(id) {
  if (!canManageUsers()) return;
  const { error } = await sb.rpc("approve_join", { req: id, job: ROLE_TO_DB[val("jb" + id)] || null }); if (error) throw error;
  await loadAll(); await loadAvatars().catch(() => {}); render(); toast("Kullanıcı onaylandı");
}
async function rejectJ(id) {
  if (!canManageUsers() || !confirm("Bu başvuru reddedilsin mi?")) return;
  const { error } = await sb.rpc("reject_join", { req: id }); if (error) throw error;
  S.joins = S.joins.filter(x => x.id !== id); render(); toast("Başvuru reddedildi");
}
function setView() {
  const adm = isAdmin(), um = canManageUsers();
  return `<div style="margin-top:14px">${I18N.controls(false)}<div class="card"><b>📷 Profil fotoğrafım</b><div style="display:flex;align-items:center;gap:14px;margin:10px 0">${avatarBox(84)}<div class="mu">Panelde sadece senin hesabında görünür. Kare kırpılır ve küçültülür.</div></div><input id="av" type="file" accept="image/*"><button onclick="run(setAvatar)">Fotoğrafı yükle</button>${S.avatarUrl ? '<button class="sec" onclick="run(delAvatar)">Fotoğrafı kaldır</button>' : ""}</div>
<div class="card"><b>🔑 Parolamı değiştir</b><div style="height:8px"></div>
<input id="pw1" type="password" placeholder="Yeni parola (en az 8 karakter)" autocomplete="new-password"><input id="pw2" type="password" placeholder="Yeni parola (tekrar)" autocomplete="new-password"><button onclick="run(changePw)">Parolayı değiştir</button></div>
${um ? joinCard() + usersCard() : ""}
${adm ? `<div class="card"><b>🖼️ Şirket logosu</b><div class="mu" style="margin:4px 0 8px">Panelde görünür. PNG veya JPG, en fazla 2 MB.</div><input id="lg" type="file" accept="image/*"><button onclick="run(setLogo)">Logoyu yükle</button></div>` : ""}
${um ? `<div class="card"><b>👤 Yeni kullanıcı ekleme</b><div class="mu" style="margin-top:6px">Çalışanlar giriş ekranında Kayıt ol'a basıp listeden şirketi seçerek başvurur. Yukarıdaki Katılım istekleri bölümünden onaylarsın.</div></div>` : ""}
<div class="card"><b>🔒 Gizlilik</b><div class="mu" style="margin:6px 0">Hangi verileri neden işlediğimizi ve haklarını okuyabilirsin.</div><button class="sec" onclick="privPage(render,'pol')">Gizlilik Politikası</button><button class="sec" onclick="privPage(render,'ayd')">KVKK Aydınlatma Metni</button><button class="sec" onclick="privPage(render,'riza')">Açık Rıza Beyanı</button></div>
<div class="card"><b>🗑 Hesabımı sil</b><div class="mu" style="margin:6px 0">Giriş hesabın, profilin, fotoğrafın ve uçuş kayıtların kalıcı olarak silinir. Geri alınamaz. Personel kaydın ve evraklar işletmeye aittir, yöneticin siler. Şirketin tek yöneticisiysen önce başka birini yönetici yap.</div><input id="dx" placeholder="Onay için SİL yaz" autocapitalize="characters"><button class="x" onclick="run(deleteAccount)">Hesabımı kalıcı olarak sil</button></div>
<div class="card"><b>ℹ️ Hesap</b><div class="mu" style="margin-top:6px">${esc(S.user.email)}<br>${esc(S.company.name)} · ${esc(ROLE_NAMES[myRole()] || "Kullanıcı")}</div></div></div>`;
}

/* ---------- işlemler (hepsi sunucuya yazar) ---------- */
async function up(k) {
  const f = fileOf("f"), type = val("t"), exp = val("d");
  const person = S.people[S.person];
  if (k === "pe" && !person) return alert("Önce personel ekleyin.");
  if (!f) return alert("Lütfen bir dosya seçin.");
  if (f.size > 45e6) return alert("Dosya en fazla 45 MB olabilir.");
  const path = `${S.co}/${k === "co" ? "company" : "staff"}/${uuid()}.${extOf(f.name)}`;
  const { error: e1 } = await sb.storage.from(BUCKET).upload(path, f, { contentType: f.type || "application/octet-stream" });
  if (e1) throw e1;
  const row = { company_id: S.co, scope: k === "co" ? "company" : "staff", staff_id: k === "pe" ? person.id : null, doc_type: type, expires_on: exp || null, file_path: path, file_name: f.name, uploaded_by: S.user.id };
  const { data, error } = await sb.from("documents").insert(row).select().single();
  if (error) { sb.storage.from(BUCKET).remove([path]).catch(() => {}); throw error; }
  S.docs.push({ id: data.id, k, sid: data.staff_id, t: type, d: data.expires_on, f: f.name, path });
  render(); toast("Evrak yüklendi");
}
async function viewDoc(id) {
  const d = S.docs.find(x => x.id === id); if (!d) return;
  const w = window.open("about:blank", "_blank"); // dokunuş anında açılmalı (iOS)
  try {
    const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(d.path, 300);
    if (error) throw error;
    if (w) w.location.href = data.signedUrl; else location.href = data.signedUrl;
  } catch (e) { if (w) w.close(); throw e; }
}
async function delDoc(id) {
  const d = S.docs.find(x => x.id === id); if (!d || !canDelDoc(d) || !confirm("Bu evrak silinsin mi? Geri alınamaz.")) return;
  const { error } = await sb.from("documents").delete().eq("id", id);
  if (error) throw error;
  sb.storage.from(BUCKET).remove([d.path]).catch(() => {});
  S.docs = S.docs.filter(x => x.id !== id); render(); toast("Evrak silindi");
}
async function addP() {
  if (!canEditStaffRec(null)) return;
  const n = val("pn").trim(); if (!n) return alert("İsim girin.");
  const { data, error } = await sb.from("staff").insert({ company_id: S.co, full_name: n, job_title: ROLE_TO_DB[val("pr")] || "other" }).select().single();
  if (error) throw error;
  const x = { id: data.id, n: data.full_name, r: ROLE_FROM_DB[data.job_title] || "Diğer", on: true };
  S.allStaff.push(x); S.people.push(x); S.person = S.people.length - 1; S.pv = 1; S.pt = null; render(); toast("Eklendi");
}
async function delP() {
  const x = S.people[S.person];
  if (!x || !canEditStaffRec(x)) return;
  if (!confirm(x.n + " listeden çıkarılsın mı? Geçmiş çizelge kayıtları ve yüklenmiş evrakları saklanır.")) return;
  const { error } = await sb.from("staff").update({ active: false }).eq("id", x.id);
  if (error) throw error;
  x.on = false; S.people = S.people.filter(p => p.on); S.person = 0; S.pv = 0; render(); toast("Personel listeden çıkarıldı");
}
async function addB() {
  if (!canEditMaint()) return;
  const r = val("br").trim(); if (!r) return alert("Tescil girin.");
  const { data, error } = await sb.from("balloons").insert({ company_id: S.co, registration: r, hours_since_100h: Math.max(0, parseFloat(val("bh")) || 0), total_hours: Math.max(0, parseFloat(val("bt")) || 0), annual_due: val("ba") || null }).select().single();
  if (error) throw error;
  S.balloons.push(mapB(data)); render(); toast("Balon eklendi");
}
async function delB(id) {
  const b = S.balloons.find(x => x.id === id); if (!canEditMaint() || !b || !confirm(b.r + " balonu listeden çıkarılsın mı?")) return;
  const bps = (S.bdocs || []).filter(x => x.b === id).map(x => x.path);
  const { error } = await sb.from("balloons").delete().eq("id", id); if (error) throw error;
  if (bps.length) sb.storage.from(BUCKET).remove(bps).catch(() => {});
  S.bdocs = (S.bdocs || []).filter(x => x.b !== id);
  S.balloons = S.balloons.filter(x => x.id !== id); S.bal = null; render();
}
async function patchBalloon(id, fields, local) {
  const { error } = await sb.from("balloons").update(fields).eq("id", id); if (error) throw error;
  Object.assign(S.balloons.find(x => x.id === id), local); render();
}
async function addM() {
  if (!canEditMaint()) return;
  const w = val("mw").trim(), d = val("md"), bid = val("mb"), b = S.balloons.find(x => x.id === bid);
  if (!b || !w || !d) return alert("Balon, yapılan bakım ve tarih gerekli.");
  const { data, error } = await sb.from("maintenance_logs").insert({ company_id: S.co, balloon_id: bid, balloon_reg: b.r, work: w, kind: val("mk"), done_on: d }).select().single();
  if (error) throw error;
  S.mlogs.push(mapM(data)); S.bm = d.slice(0, 7); render(); toast("Bakım kaydı eklendi");
}
async function saveM(id) {
  if (!canEditMaint()) return;
  const w = val("xw").trim(), d = val("xd"), bid = val("xb"), b = S.balloons.find(x => x.id === bid);
  if (!b || !w || !d) return alert("Balon, yapılan bakım ve tarih gerekli.");
  const { data, error } = await sb.from("maintenance_logs").update({ balloon_id: bid, balloon_reg: b.r, work: w, kind: val("xk"), done_on: d }).eq("id", id).select().single();
  if (error) throw error;
  Object.assign(S.mlogs.find(x => x.id === id), mapM(data)); S.bm = d.slice(0, 7); S.editM = null; render(); toast("Kayıt güncellendi");
}
async function delM(id) {
  if (!canEditMaint() || !confirm("Bu bakım kaydı silinsin mi?")) return;
  const { error } = await sb.from("maintenance_logs").delete().eq("id", id); if (error) throw error;
  S.mlogs = S.mlogs.filter(x => x.id !== id); S.editM = null; render(); toast("Kayıt silindi");
}
async function autoLog(id, work, d) {
  try {
    const b = S.balloons.find(x => x.id === id); if (!canEditMaint() || !b) return;
    const { data, error } = await sb.from("maintenance_logs").insert({ company_id: S.co, balloon_id: id, balloon_reg: b.r, work, kind: "preventive", done_on: d }).select().single();
    if (error) throw error; S.mlogs.push(mapM(data));
  } catch (e) { console.warn("bakım kaydı eklenemedi", e); }
}
async function saveB(id) {
  if (!canEditMaint()) return;
  const r = val("er").trim(); if (!r) return alert("Tescil boş olamaz.");
  const num = k => Math.max(0, parseFloat(val(k)) || 0), tx = k => val(k).trim() || null, dt = k => val(k) || null;
  const f = { registration: r, total_hours: num("et"), hours_since_100h: num("eh"), last_maint_date: dt("el"), annual_due: dt("ea"), arc_start: dt("ec"), temp_sensor_code: tx("es"), brand: tx("eb"), model: tx("em"), fuel_tanks: tx("ef"), burner_serial: tx("eu"), insurance_start: dt("ei") };
  const { data, error } = await sb.from("balloons").update(f).eq("id", id).select().single(); if (error) throw error;
  Object.assign(S.balloons.find(x => x.id === id), mapB(data)); render(); toast("Balon bilgileri kaydedildi");
}
async function addH(id) {
  const v = parseFloat(val("fh" + id)); if (!(v > 0)) return;
  const b = S.balloons.find(x => x.id === id), nh = r1(b.h + v), nt = r1(b.t + v);
  await patchBalloon(id, { hours_since_100h: nh, total_hours: nt }, { h: nh, t: nt });
}
const done100 = async id => { const d = fd(new Date()); await autoLog(id, "100 saatlik periyodik bakım", d); return patchBalloon(id, { hours_since_100h: 0, last_maint_date: d }, { h: 0, lm: d }); };
async function doneY(id) { const d = new Date(); d.setFullYear(d.getFullYear() + 1); const s = fd(d); await autoLog(id, "Yıllık periyodik bakım", fd(new Date())); return patchBalloon(id, { annual_due: s }, { a: s }); }
async function addL() {
  const d = val("pd"), sid = val("pp"), s = val("ps");
  const w = (s === "i" || s === "n") ? 0 : (parseFloat(val("pw")) || 0), f = s === "u" ? (parseFloat(val("pf")) || 0) : 0;
  if (!sid) return alert("Önce pilot ekleyin.");
  if (!d || (s === "u" && !(f > 0))) return alert("Tarih ve uçuş saatini girin.");
  if (f > w) return alert("Uçuş saati çalışma saatinden büyük olamaz.");
  if (s === "u" || s === "c") {
    const n = wc(sid, mon(d), d), p = nm(sid);
    if (n > 6 && !confirm(p + " bu hafta " + n + ". gününe girecek. Haftalık 6 gün limiti aşılıyor, yine de kaydedilsin mi?")) return;
    if (n === 5) alert("Uyarı: " + p + " bu hafta 5. gününe ulaştı. 1 gün hakkı kaldı.");
  }
  const { data, error } = await sb.from("duty_logs").insert({ company_id: S.co, staff_id: sid, log_date: d, status: STATUS_TO_DB[s], duty_hours: w, flight_hours: f }).select().single();
  if (error) throw error;
  S.logs.push({ id: data.id, d, sid, w, f, s }); S.month = d.slice(0, 7); render();
}
async function delL(id) {
  if (!confirm("Bu kayıt silinsin mi?")) return;
  const { error } = await sb.from("duty_logs").delete().eq("id", id); if (error) throw error;
  S.logs = S.logs.filter(x => x.id !== id); render();
}
async function changePw() {
  const a = val("pw1"), b = val("pw2");
  if (a.length < 8) return alert("Parola en az 8 karakter olmalı.");
  if (a !== b) return alert("Parolalar aynı değil.");
  const { error } = await sb.auth.updateUser({ password: a }); if (error) throw error;
  render(); toast("Parola değiştirildi");
}
async function squareJpeg(file, size = 400) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error("Görsel okunamadı. JPG veya PNG deneyin.")); i.src = url; });
    const m = Math.min(img.width, img.height), c = document.createElement("canvas"); c.width = c.height = size;
    c.getContext("2d").drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, size, size);
    return await new Promise(res => c.toBlob(res, "image/jpeg", 0.85));
  } finally { URL.revokeObjectURL(url); }
}
async function deleteAccount() {
  const t = val("dx").trim().toLocaleUpperCase("tr-TR");
  if (t !== "SİL" && t !== "SIL") return alert("Onay için kutuya SİL yazın.");
  if (!confirm("Hesabın ve uçuş kayıtların kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?")) return;
  const uid = S.user.id, co = S.co;
  try {
    const { data } = await sb.from("flights").select("file_path").eq("pilot_user", uid);
    const ps = (data || []).map(x => x.file_path).filter(Boolean);
    if (S.profile && S.profile.avatar_path) ps.push(S.profile.avatar_path);
    if (ps.length) await sb.storage.from(BUCKET).remove(ps);
  } catch (e) { console.warn(e); }
  const { error } = await sb.rpc("delete_my_account"); if (error) throw error;
  try { await FL.teardown(); indexedDB.deleteDatabase("aerodox-fl-" + co + "-" + uid); } catch (e) {}
  await sb.auth.signOut().catch(() => {});
  S.user = S.profile = S.company = null; S.co = null; S.logoUrl = ""; S.avatarUrl = "";
  loginView("Hesabın silindi.");
}
async function setAvatar() {
  const f = fileOf("av"); if (!f) return alert("Bir fotoğraf seçin.");
  if (f.size > 15e6) return alert("Fotoğraf çok büyük.");
  const blob = await squareJpeg(f); if (!blob) throw new Error("Fotoğraf işlenemedi.");
  const path = `${S.co}/avatars/${S.user.id}/${uuid()}.jpg`;
  const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: "image/jpeg" }); if (error) throw error;
  const { error: e2 } = await sb.rpc("set_my_avatar", { p: path });
  if (e2) { sb.storage.from(BUCKET).remove([path]).catch(() => {}); throw e2; }
  const old = S.profile.avatar_path; S.profile.avatar_path = path;
  if (old) sb.storage.from(BUCKET).remove([old]).catch(() => {});
  await loadAvatar(); render(); toast("Fotoğraf güncellendi");
}
async function delAvatar() {
  const old = S.profile.avatar_path; if (!old) return;
  const { error } = await sb.rpc("set_my_avatar", { p: null }); if (error) throw error;
  S.profile.avatar_path = null; S.avatarUrl = "";
  sb.storage.from(BUCKET).remove([old]).catch(() => {}); render(); toast("Fotoğraf kaldırıldı");
}
async function linkP(id) {
  if (!canManageUsers()) return;
  const uid = val("lk") || null, x = S.allStaff.find(p => p.id === id); if (!x) return;
  const { error } = await sb.from("staff").update({ user_id: uid }).eq("id", id);
  if (error) throw new Error(/duplicate|unique/i.test(error.message || "") ? "Bu hesap başka bir personele bağlı." : error.message);
  x.u = uid; render(); toast(uid ? "Hesap bağlandı" : "Bağlantı kaldırıldı");
}
async function setLogo() {
  if (!isAdmin()) return;
  const f = fileOf("lg"); if (!f) return alert("Bir görsel seçin.");
  if (f.size > 2e6) return alert("Logo en fazla 2 MB olmalı.");
  const path = `${S.co}/logo/${uuid()}.${extOf(f.name)}`;
  const { error } = await sb.storage.from(BUCKET).upload(path, f, { contentType: f.type || "image/png" }); if (error) throw error;
  const old = S.company.logo_path;
  const { error: e2 } = await sb.from("companies").update({ logo_path: path }).eq("id", S.co); if (e2) throw e2;
  S.company.logo_path = path; if (old) sb.storage.from(BUCKET).remove([old]).catch(() => {});
  await loadLogo(); render(); toast("Logo güncellendi");
}
