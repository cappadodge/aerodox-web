// Supabase bağlantısı. "publishable" anahtar herkese açık olacak şekilde tasarlanmıştır;
// veriyi koruyan şey SQL'deki satır güvenliği (RLS) kurallarıdır. service_role anahtarını ASLA buraya koyma.
const AERODOX = {
  SUPABASE_URL: "https://qjcaiqkjlyqqdbfbzczo.supabase.co",
  SUPABASE_KEY: "sb_publishable_D8wRpB-wSzCAR5iSwPp9FQ_HqseaejT",
  VAPID_PUBLIC: "BFFRlkJwpYTn2Qz-A3hJHBEVgvJl8cUf7NzkwXOEGCJmcZTZwODiz22wkKeSjE9bGdTZgny0ZKsmAHuluaRJoYs",
  AUTH_DOMAIN: "aerodox.app", // kullanıcı adı "ahmet" -> ahmet@aerodox.app (teknik alan adı, DEĞİŞTİRME)
  // Gizlilik politikasında görünen bilgiler: köşeli parantezli yerleri kendi bilgilerinle değiştir.
  CONTROLLER: "Yandi ERAY",
  CONTACT_EMAIL: "yandi.eray@gmail.com",
  DATA_REGION: "İrlanda (AB)",
  POLICY_DATE: "16.11.2026",
};
