# Slot Merkezi + Bildirim kurulumu (bir kez)

1. Supabase > SQL Editor: `aerodox-sql-11.sql` dosyasını çalıştır.
2. Dosyaları GitHub `aerodox-web` deposuna yükle (zip içindekiler). Yeni: `slot.js`, `slot-watch/` klasörü ve
   `.github/workflows/slot-watch.yml` (klasör yapısı korunmalı: GitHub'da Add file > Upload files ile klasörleri sürükle).
3. GitHub deposu > Settings > Secrets and variables > Actions > New repository secret ile 5 secret ekle:
   - SUPABASE_URL = Supabase proje adresi (https://qjcaiqkjlyqqdbfbzczo.supabase.co)
   - SUPABASE_SERVICE_KEY = Supabase > Project Settings > API > **service_role** anahtarı (GİZLİ; kimseyle paylaşma, config.js'e koyma)
   - VAPID_PUBLIC = (sohbette verilen public anahtar; config.js'tekiyle aynı)
   - VAPID_PRIVATE = (sohbette verilen private anahtar)
   - VAPID_SUBJECT = mailto:senin-epostan@ornek.com
4. Actions sekmesi > slot-watch > Run workflow ile bir kez elle çalıştır; yeşil olursa her 5 dakikada kendi çalışır.
   (Not: GitHub, 60 gün hiç etkinlik olmayan açık depolarda zamanlanmış çalışmayı durdurur; ara sıra güncelleme yapmak/Run workflow yeterli.)
5. Uygulamada Slot Merkezi sekmesi > "Bildirimleri aç". iPhone'da önce ana ekrana ekle.
