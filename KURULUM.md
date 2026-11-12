# AeroDoX: kurulum rehberi (web uygulaması)

Toplam süre yaklaşık 30 dakika. Gerekenler: bilgisayar, Supabase hesabın (zaten var) ve ücretsiz bir barındırma hesabı (Netlify).

## 1. Supabase: SQL'leri çalıştır
1. supabase.com/dashboard > projen > **SQL Editor**.
2. 1. SQL (`balon-supabase-sema.sql`) zaten çalıştı. Şimdi **New query** aç, `sql/02-ucus-kayitlari-ve-ayarlar.sql` dosyasının tamamını yapıştır, **Run** de. "Success" görmelisin.

## 2. Supabase: giriş ayarları
**Authentication > Sign In / Providers** (veya Providers > Email) bölümünde:
- **Allow new users to sign up** (yeni kullanıcı kaydı): **KAPAT**. Kullanıcıları sadece sen ekleyeceksin.
- **Confirm email**: kapalı kalsın (kullanıcı adları gerçek e-posta değil).

## 3. İlk şirket ve yönetici
1. **SQL Editor**'de çalıştır (şirket adını kendine göre yaz):
   ```sql
   insert into public.companies (name) values ('Göreme Balonculuk AŞ');
   ```
2. **Authentication > Users > Add user > Create new user**
   - Email: `goreme@aerodox.app` (uygulamada kullanıcı adı olarak sadece `goreme` yazılır)
   - Password: güçlü bir parola
   - **Auto Confirm User** işaretli olsun > Create.
3. **SQL Editor**'de yöneticiyi şirkete bağla:
   ```sql
   insert into public.profiles (id, company_id, full_name, role)
   select u.id, c.id, 'Yönetici Adı Soyadı', 'admin'
   from auth.users u, public.companies c
   where u.email = 'goreme@aerodox.app' and c.name = 'Göreme Balonculuk AŞ';
   ```

Başka kullanıcı (pilot, personel) eklemek için 2. ve 3. adımı tekrarla, rolü `'staff'` yaz.
Başka bir şirket için `companies` tablosuna yeni satır ekleyip kullanıcıları ona bağla: şirketler birbirinin verisini göremez.

## 4. Yayınla (Netlify, ücretsiz)
1. Zip'i bilgisayarında çıkar. İçindeki `index.html` olan klasör uygulamadır.
2. app.netlify.com/drop adresine git, hesap aç/giriş yap.
3. Klasörü sayfaya sürükle bırak. Birkaç saniye sonra `https://...netlify.app` adresi verir.
4. İstersen Site settings > Change site name ile adı `aerodox` gibi değiştir.

## 5. Telefona kur
- **Android (Chrome):** adresi aç > ⋮ menü > **Uygulamayı yükle** / **Ana ekrana ekle**.
- **iPhone (Safari):** adresi aç > Paylaş simgesi > **Ana Ekrana Ekle**.

## 6. Mutlaka dene (ilk kullanım kontrol listesi)
1. `goreme` ve parola ile gir. Panelde şirket adı görünmeli.
2. Ayarlar > logo yükle. Panelde logo çıkmalı.
3. Personel > pilot ekle > evrak yükle > Görüntüle. Sayfayı yenile; evrak duruyor mu?
4. Bakım > balon ekle. Çizelge > kayıt gir.
5. Flight Log > Test konumu ile bir uçuş yap > Stop > Kayıtlar. Durum **Sunucuda** olmalı.
6. Telefonda aynı hesapla gir; bilgisayarda yaptığın kayıtlar orada da görünmeli.
7. Yönetici olmayan bir kullanıcıyla gir: ekleme/silme butonları görünmemeli.

Bir adımda hata çıkarsa ekrandaki kırmızı mesajı bana yaz.

## Bilmen gerekenler
- **Ücretsiz Supabase planı** 1 hafta kullanılmazsa projeyi duraklatır ve otomatik yedek almaz. Gerçek işletme verisi için Pro plan (aylık yaklaşık 25 dolar, günlük yedek) önerilir.
- Uygulamayı **internet varken açıp giriş yapman** gerekir. Uçuş sırasında internet gitse bile kayıt cihazda tutulur, internet gelince sunucuya yüklenir.
- Ekran kapanınca/uygulama arka plana alınınca web uygulaması GPS'i kısıtlayabilir. Uçuşta ekranı açık tut. Arka plan GPS ve barometre için mağaza uygulaması gerekir (sonraki adım).
- Harita karoları Esri'nin ücretsiz sunucusundan gelir. Ticari ve yoğun kullanımda Esri/MapTiler/Mapbox lisans şartlarını kontrol et.
- Pilot ve personel kimlik/sağlık belgeleri kişisel veridir. KVKK yükümlülükleri için bir hukukçuya danış.
- `service_role` anahtarını hiçbir zaman uygulamaya, bana veya kimseye verme.
