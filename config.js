// Supabase bağlantısı. "publishable" anahtar herkese açık olacak şekilde tasarlanmıştır;
// veriyi koruyan şey SQL'deki satır güvenliği (RLS) kurallarıdır. service_role anahtarını ASLA buraya koyma.
const AERODOX = {
  SUPABASE_URL: "https://qjcaiqkjlyqqdbfbzczo.supabase.co",
  SUPABASE_KEY: "sb_publishable_D8wRpB-wSzCAR5iSwPp9FQ_HqseaejT",
  AUTH_DOMAIN: "aerodox.app", // kullanıcı adı "ahmet" -> ahmet@aerodox.app (teknik alan adı, DEĞİŞTİRME)
  // Gizlilik politikasında görünen bilgiler: köşeli parantezli yerleri kendi bilgilerinle değiştir.
  CONTROLLER: "[Veri sorumlusu adı / unvanı]",
  CONTACT_EMAIL: "[iletişim e-postası]",
  DATA_REGION: "[Supabase proje bölgesi, örn. Frankfurt]",
  POLICY_DATE: "16.11.2026",
};
