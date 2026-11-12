// Supabase bağlantısı. "publishable" anahtar herkese açık olacak şekilde tasarlanmıştır;
// veriyi koruyan şey SQL'deki satır güvenliği (RLS) kurallarıdır. service_role anahtarını ASLA buraya koyma.
const AERODOX = {
  SUPABASE_URL: "https://qjcaiqkjlyqqdbfbzczo.supabase.co",
  SUPABASE_KEY: "sb_publishable_D8wRpB-wSzCAR5iSwPp9FQ_HqseaejT",
  AUTH_DOMAIN: "aerodox.app", // kullanıcı adı "ahmet" -> ahmet@aerodox.app
};
