/* AviaDoX gizlilik politikası: tek kaynak (uygulama içi sayfa ve gizlilik.html bunu kullanır).
   Boş yerler config.js içindeki CONTROLLER / CONTACT_EMAIL / DATA_REGION alanlarından gelir. */
const PRIV_DOC = {
  title: "Gizlilik Politikası",
  sections: [
    { h: "1. Kimiz?", p: [
      "AviaDoX, sıcak hava balonu işletmeleri için evrak, bakım, çizelge ve uçuş kaydı takibi sağlayan bir uygulamadır.",
      "Uygulamayı işleten ve hesap/kullanım verilerinin veri sorumlusu: {{SORUMLU}}. İletişim: {{EPOSTA}}.",
      "Şirket yöneticilerinin yüklediği personel, balon ve işletme verileri bakımından ilgili balon işletmesi (şirket) veri sorumlusudur; AviaDoX bu veriler için işletmenin talimatıyla hizmet sağlayan veri işleyendir." ] },
    { h: "2. Hangi verileri işliyoruz?", ul: [
      "Hesap bilgileri: ad soyad, kullanıcı adı, bağlı olduğunuz şirket, rolünüz (yönetici/kullanıcı), katılım başvurunuz. Parolanız yalnızca geri döndürülemez (özetlenmiş) biçimde saklanır, biz göremeyiz.",
      "Profil fotoğrafı: isteğe bağlı olarak sizin yüklediğiniz fotoğraf.",
      "Personel bilgileri ve belgeleri: unvan/görev, dil yeterlilik belgesi, pilot lisansı, sağlık sertifikası, mezuniyet diploması, ilk yardım belgesi, KDM belgeleri ve bunların bitiş tarihleri; çalışma ve uçuş saati çizelgeleri. Sağlık sertifikası özel nitelikli kişisel veridir.",
      "İşletme verileri: şirket evrakları (el kitabı, sigorta, ruhsat, tescil vb.), balon bilgileri (tescil, seri numaraları, uçuş saatleri) ve bakım kayıtları.",
      "Uçuş kayıtları: Start ve Stop arasında konum (enlem, boylam), yükseklik, hız, yön, zaman ve tahmini rüzgar bilgisi; oluşturulan GPX izi.",
      "Teknik veriler: altyapı sağlayıcıların günlüklerinde IP adresi ve cihaz/tarayıcı bilgisi; cihazınızda oturum bilgisi ve uçuş kayıtlarının yerel kopyası." ] },
    { h: "3. Konum verisi nasıl kullanılır?", p: [
      "Konum yalnızca Flight Log'da siz Start düğmesine bastığınızda ve Stop'a basana kadar alınır. Android ve iOS uygulamalarında, uçuş sırasında ekran kapalıyken de iz kaydedebilmek için arka planda konum kullanılır; bu sırada Android'de \"Uçuş kaydı sürüyor\" bildirimi, iOS'ta ise durum çubuğunda konum göstergesi görünür. Arka plan konumu yalnızca uçuş kaydı için kullanılır; reklam veya profil çıkarma amacıyla kullanılmaz. Uçuş dışında konumunuz alınmaz ve takip edilmez.",
      "Kayıtlı uçuş izlerini (GPX) yalnızca kaydı yapan kullanıcı görür. Başka kullanıcılar ve şirket yöneticisi bu kayıtlara erişemez.",
      "Uçuş kaydı açıkken anlık konumunuz, yüksekliğiniz, hızınız, yönünüz, adınız ve (girdiyseniz) balon çağrı kodunuz, yalnızca aynı şirketteki diğer kullanıcılara canlı olarak gösterilir. Bu paylaşım Stop'a bastığınızda veya haritadaki \"Ekiple paylaş\" kutusunu kapattığınızda sona erer; canlı konum sunucuda saklanmaz, yalnızca en son değer tutulur ve paylaşım bitince silinir.",
      "Konum izni cihazınızın ayarlarından istediğiniz zaman geri alınabilir. İzin vermezseniz uygulamanın diğer bölümleri çalışmaya devam eder, yalnızca uçuş kaydı alınamaz." ] },
    { h: "4. İşleme amaçları ve hukuki sebepler", ul: [
      "Hesabınızı oluşturmak, kimliğinizi doğrulamak ve hizmeti sunmak (sözleşmenin kurulması ve ifası).",
      "Evrak geçerlilik takibi, bakım ve çizelge yönetimi, uçuş kaydı tutma (sözleşmenin ifası; havacılık mevzuatından doğan kayıt yükümlülüklerinin yerine getirilmesi; işletmenin meşru menfaati).",
      "Konum verisi: açık rızanız; cihaz izni ve Start düğmesi ile verilir, istediğiniz an geri alınır.",
      "Sağlık sertifikası gibi özel nitelikli veriler: hukuki yükümlülük ve açık rıza.",
      "Güvenliğin sağlanması, kötüye kullanımın önlenmesi ve hataların giderilmesi (meşru menfaat)." ] },
    { h: "5. Verileriniz kimlerle paylaşılır?", p: [
      "Verilerinizi satmayız. Reklam veya davranış izleme araçları kullanmayız.",
      "Şirketiniz içinde: şirket yöneticisi personel evraklarınıza ve çizelgenize erişir; normal kullanıcılar yalnızca kendi personel evraklarını görür.",
      "Anlaşmalı CAMO: bir balona anlaşmalı CAMO atandığında, o balonun bilgileri, bakım saatleri, seri numaraları ve balon evrakları atanan kuruluşun (Kapadokya Balon Bakım Merkezi veya Kapadokya Havacılık Teknolojileri Merkezi) yöneticisine gösterilir. Personel verileriniz paylaşılmaz.",
      "Hizmet sağlayıcılar:" ], ul: [
      "Supabase: kimlik doğrulama, veritabanı ve özel dosya depolama (sunucu bölgesi: {{BOLGE}} — Türkiye dışı).",
      "GitHub Pages (ABD): web uygulamasının barındırılması.",
      "Cloudflare (ABD): alan adı (DNS) ve e-posta yönlendirme (destek adresi).",
      "Open-Meteo: hava durumu tahminleri. Hava verisi istenirken IP adresiniz bu hizmete iletilebilir.",
      "Web bildirimleri (Google, Apple, Mozilla bildirim servisleri): bildirim açarsanız cihazınıza bildirim iletmek için kullanılır.",
      "Esri World Imagery: harita karoları. Harita görüntülenirken görüntülenen bölge ve IP adresiniz Esri sunucularına iletilir.",
      "Apple App Store / Google Play: uygulamanın dağıtımı (yalnızca mağazadan indirdiğinizde)." ] , p2: [
      "YURT DIŞINDA SAKLANAN VERİLER: AviaDoX'in veritabanı, kimlik doğrulama ve dosya depolama altyapısı Türkiye dışındadır. Hesap, personel, evrak, bakım, çizelge ve uçuş kayıtlarınız Türkiye dışındaki sunucularda ({{BOLGE}}) saklanır ve işlenir. Web uygulamasının barındırılması, alan adı/e-posta yönlendirme, harita, hava durumu ve bildirim hizmetleri de Türkiye dışındaki sağlayıcılar (ör. AB ve ABD) üzerinden çalışır. Bu nedenle verileriniz 6698 sayılı KVKK m.9 kapsamında yurt dışına aktarılmaktadır.",
      "Yurt dışına aktarım, hizmetin sunulması için gerekli olduğu ölçüde ve KVKK m.9'da öngörülen güvencelerle yapılır; ayrıca ayrı bir Açık Rıza Beyanı ile sizden açık rıza istenir. Ayrıntılar için Aydınlatma Metni ve Açık Rıza Beyanı'na bakın.",
      "Yasal bir zorunluluk doğarsa yetkili kamu kurumlarıyla paylaşım yapılabilir." ] },
    { h: "6. Ne kadar süre saklıyoruz?", ul: [
      "Uçuş kayıtları: 90 gün sonra otomatik silinir. Siz de kaydı kırpabilir veya (yetkiniz varsa) silebilirsiniz.",
      "Hesap bilgileri: hesabınız açık olduğu sürece.",
      "Personel ve işletme evrakları: işletme silene veya iş ilişkisi ve yasal saklama süreleri sona erene kadar.",
      "Hesabınızı sildiğinizde giriş hesabınız, profiliniz, fotoğrafınız ve uçuş kayıtlarınız silinir (bkz. madde 8)." ] },
    { h: "7. Güvenlik", p: [
      "Tüm bağlantılar şifreli (HTTPS) yapılır. Şirketler birbirinin verisini göremez; erişim kuralları sunucu tarafında uygulanır. Belgeler özel depoda tutulur ve yalnızca yetkili kullanıcıya kısa süreli bağlantıyla açılır.",
      "Hiçbir sistem %100 güvenli değildir. Parolanızı kimseyle paylaşmayın ve güçlü bir parola kullanın." ] },
    { h: "8. Haklarınız ve hesabınızı silme", p: [
      "KVKK m.11 uyarınca verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme/yok etme, aktarıldığı kişileri öğrenme, itiraz etme ve zarara uğramanız halinde tazminat talep etme haklarına sahipsiniz. Başvurular için: {{EPOSTA}}.",
      "Uygulama içinden: Ayarlar > Hesabımı sil. Bu işlem giriş hesabınızı, profilinizi, fotoğrafınızı ve uçuş kayıtlarınızı kalıcı olarak siler; geri alınamaz.",
      "Personel kaydınız ve belgeleriniz çalıştığınız işletmenin kayıtlarıdır; yasal saklama yükümlülükleri nedeniyle hesap silmeyle otomatik silinmeyebilir. Bunların silinmesi için işletme yöneticinize veya {{EPOSTA}} adresine başvurabilirsiniz." ] },
    { h: "9. Çocuklar", p: ["AviaDoX 18 yaşın altındaki kişilere yönelik değildir ve onlardan bilerek veri toplamaz."] },
    { h: "10. Değişiklikler", p: ["Bu metni güncelleyebiliriz. Önemli değişikliklerde uygulama içinden bilgi veririz. Son güncelleme: {{TARIH}}."] }
  ]
};

const PRIV_DOC_EN = {
  title: "Privacy Policy",
  sections: [
    { h: "1. Who we are", p: [
      "AviaDoX is an application for hot-air balloon operators that tracks documents, maintenance, schedules and flight records.",
      "The operator of the application and controller of account/usage data: {{SORUMLU}}. Contact: {{EPOSTA}}.",
      "For personnel, balloon and business data uploaded by company admins, the relevant balloon operator (the company) is the data controller; AviaDoX acts as a data processor providing the service on the operator's instructions." ] },
    { h: "2. What data do we process?", ul: [
      "Account information: full name, username, the company you belong to, your role (admin/user) and your join application. Your password is stored only in irreversible (hashed) form; we cannot see it.",
      "Profile photo: optionally, the photo you upload.",
      "Staff information and documents: title/role, language proficiency certificate, pilot license, medical certificate, graduation diploma, first aid certificate, KDM certificates and their expiry dates; duty and flight-hour schedules. A medical certificate is special-category personal data.",
      "Business data: company documents (manual, insurance, licenses, registration, etc.), balloon information (registration, serial numbers, flight hours) and maintenance records.",
      "Flight records: between Start and Stop, location (latitude, longitude), altitude, speed, heading, time and estimated wind information; the generated GPX track.",
      "Technical data: IP address and device/browser information in infrastructure providers' logs; session information and a local copy of flight records on your device." ] },
    { h: "3. How is location data used?", p: [
      "Location is captured only in Flight Log, from when you press Start until you press Stop. In the Android and iOS apps, location is used in the background so the track can be recorded while the screen is off; Android shows a \"Flight recording in progress\" notification and iOS shows the location indicator in the status bar. Background location is used only for flight recording, never for advertising or profiling. Outside a flight your location is not captured or tracked.",
      "Your saved flight tracks (GPX) are visible only to the user who recorded them. Other users and the company admin cannot access them.",
      "While flight recording is on, your live position, altitude, speed, heading, name and (if entered) balloon call sign are shown live only to other users in the same company. Sharing ends when you press Stop or untick \"Share with team\" on the map; live position is not stored long-term: only the latest value is kept and it is deleted when sharing ends.",
      "You can revoke location permission at any time in your device settings. If you do not grant it, the rest of the app keeps working; only flight recording is unavailable." ] },
    { h: "4. Purposes and legal bases", ul: [
      "Creating your account, verifying your identity and providing the service (establishment and performance of a contract).",
      "Document validity tracking, maintenance and schedule management, flight recording (performance of a contract; compliance with record-keeping obligations under aviation regulations; the operator's legitimate interest).",
      "Location data: your explicit consent; given through the device permission and the Start button and revocable at any time.",
      "Special-category data such as medical certificates: legal obligation and explicit consent.",
      "Ensuring security, preventing misuse and fixing errors (legitimate interest)." ] },
    { h: "5. Who is your data shared with?", p: [
      "We do not sell your data. We do not use advertising or behavioral tracking tools.",
      "Within your company: the company admin can access your staff documents and schedule; regular users see only their own staff documents.",
      "Contracted CAMO: when a contracted CAMO is assigned to a balloon, that balloon's information, maintenance hours, serial numbers and balloon documents are shown to the admin of the assigned organization (Cappadocia Balloon Maintenance Center or Cappadocia Aviation Technologies Center). Your staff data is not shared.",
      "Service providers:" ], ul: [
      "Supabase: authentication, database and private file storage (server region: {{BOLGE}} — outside Türkiye).",
      "GitHub Pages (USA): hosting of the web application.",
      "Cloudflare (USA): domain (DNS) and email forwarding (support address).",
      "Web notifications (Google, Apple, Mozilla push services): if you enable notifications, used to deliver them to your device.",
      "Esri World Imagery: map tiles. While a map is displayed, the displayed area and your IP address are sent to Esri servers.",
      "Open-Meteo: weather forecasts. Requests for weather data may expose your IP address to this service.",
      "Apple App Store / Google Play: distribution of the app (only if you download it from a store)." ] , p2: [
      "DATA STORED ABROAD: AviaDoX's database, authentication and file storage infrastructure is located outside Türkiye. Your account, staff, document, maintenance, schedule and flight records are stored and processed on servers outside Türkiye ({{BOLGE}}). Web hosting, domain/email forwarding, map, weather and notification services also run through providers outside Türkiye (e.g. the EU and the USA). Your data is therefore transferred abroad under Article 9 of Law No. 6698 (KVKK).",
      "Transfers abroad are made only to the extent necessary to provide the service and with the safeguards set out in Article 9 of the KVKK; in addition, your explicit consent is requested through a separate Explicit Consent Statement. See the Disclosure Notice and the Explicit Consent Statement for details.",
      "These service providers' servers may be located abroad; therefore your data may be transferred abroad under Article 9 of the KVKK. Transfers are made only to the extent necessary to provide the service and with appropriate safeguards.",
      "If a legal obligation arises, data may be shared with competent public authorities." ] },
    { h: "6. How long do we keep it?", ul: [
      "Flight records: automatically deleted after 90 days. You can also trim or (if permitted) delete a record.",
      "Account information: as long as your account is open.",
      "Staff and business documents: until the operator deletes them or the employment relationship and legal retention periods end.",
      "When you delete your account, your login account, profile, photo and flight records are deleted (see section 8)." ] },
    { h: "7. Security", p: [
      "All connections are encrypted (HTTPS). Companies cannot see each other's data; access rules are enforced on the server side. Documents are kept in private storage and opened only for authorized users via short-lived links.",
      "No system is 100% secure. Do not share your password with anyone and use a strong password." ] },
    { h: "8. Your rights and deleting your account", p: [
      "Under Article 11 of the KVKK you have the right to learn whether your data is processed, request information, request correction, deletion/destruction, learn to whom it has been transferred, object, and claim compensation if you suffer damage. For requests: {{EPOSTA}}.",
      "In the app: Settings > Delete my account. This permanently deletes your login account, profile, photo and flight records and cannot be undone.",
      "Your staff record and documents are records of the operator you work for; due to legal retention obligations they may not be deleted automatically with your account. To have them deleted, contact your company admin or {{EPOSTA}}." ] },
    { h: "9. Children", p: ["AviaDoX is not intended for people under 18 and does not knowingly collect data from them."] },
    { h: "10. Changes", p: ["We may update this text. We will notify you in the app of significant changes. Last updated: {{TARIH}}."] }
  ]
};

/* ---- Aydınlatma Metni (KVKK m.10): bilgilendirme; rıza DEĞİLDİR ---- */
const AYD_DOC = {
  title: "KVKK Aydınlatma Metni",
  sections: [
    { h: "Bu metin hakkında", p: [
      "Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) m.10 uyarınca bilgilendirme amacıyla hazırlanmıştır. Bir rıza beyanı değildir; yalnızca okuduğunuzu ve anladığınızı onaylarsınız. Rıza gerektiren işlemler için ayrı bir Açık Rıza Beyanı vardır." ] },
    { h: "1. Veri sorumlusu", p: [
      "Hesap ve kullanım verileri için veri sorumlusu: {{SORUMLU}}. İletişim: {{EPOSTA}}.",
      "Personel, balon ve işletme verileri bakımından, bağlı olduğunuz balon işletmesi (şirket) veri sorumlusudur; AviaDoX işletmenin talimatıyla hizmet sağlayan veri işleyendir." ] },
    { h: "2. İşlenen kişisel veriler", ul: [
      "Kimlik ve hesap: ad soyad, kullanıcı adı, şirket, rol, parola (yalnızca özetlenmiş biçimde).",
      "Çalışan/personel: görev, dil yeterlilik belgesi, pilot lisansı, mezuniyet ve ilk yardım belgeleri, KDM belgeleri, belge bitiş tarihleri, çalışma ve uçuş saati çizelgeleri.",
      "Özel nitelikli kişisel veri: sağlık sertifikası (sağlık verisi).",
      "Konum: Flight Log'da Start–Stop arasında enlem, boylam, yükseklik, hız, yön, zaman; uçuş kaydı açıkken aynı şirketteki kullanıcılara canlı gösterilen anlık konum.",
      "Görsel: isteğe bağlı profil fotoğrafı.",
      "İşlem güvenliği: IP adresi, cihaz/tarayıcı bilgisi, oturum bilgisi.",
      "Eğitim kayıtları: kalite yöneticisi tarafından tutulan eğitim adı, tarihi ve katılım evrakları." ] },
    { h: "3. İşleme amaçları", ul: [
      "Hesabın oluşturulması, kimlik doğrulama ve hizmetin sunulması.",
      "Evrak geçerlilik, bakım, çizelge ve eğitim takibi; uçuş kaydı ve uçuş güvenliği.",
      "Havacılık mevzuatından doğan kayıt ve denetim yükümlülüklerinin yerine getirilmesi.",
      "Bilgi güvenliğinin sağlanması ve hataların giderilmesi." ] },
    { h: "4. Toplama yöntemi ve hukuki sebepler", p: [
      "Verileriniz, uygulamaya kayıt olurken ve kullanırken sizin, şirket yöneticilerinizin veya kalite yöneticisinin girdiği bilgiler ile cihazınızın konum sensörü aracılığıyla elektronik ortamda toplanır.",
      "Hukuki sebepler (KVKK m.5/2 ve m.6): sözleşmenin kurulması ve ifası; hukuki yükümlülüğün yerine getirilmesi; veri sorumlusunun meşru menfaati; bir hakkın tesisi, kullanılması veya korunması. Konum, sağlık verisi ve yurt dışına aktarım için ayrıca Açık Rıza Beyanı ile açık rızanız istenir." ] },
    { h: "5. Verilerin aktarılması", p: [
      "Yurt içinde: şirketinizin yöneticileri, rolleri kapsamında personel evraklarınıza ve çizelgenize erişir; yetkili kamu kurum ve kuruluşları (ör. SHGM) yasal talep halinde; balonlarınıza atadığınız anlaşmalı CAMO kuruluşunun yöneticisi, o balonların bilgilerine, bakım saatlerine ve evraklarına (personel verilerine değil).",
      "YURT DIŞINDA SAKLANAN VERİLER: Verileriniz Türkiye dışındaki sunucularda saklanmakta ve işlenmektedir. Veritabanı, kimlik doğrulama ve dosya depolama: Supabase (sunucu bölgesi: {{BOLGE}}). Web uygulaması barındırma: GitHub Pages (ABD). Alan adı ve e-posta yönlendirme: Cloudflare (ABD). Harita karoları: Esri (ABD). Hava durumu: Open-Meteo. Bildirimler: Google/Apple/Mozilla bildirim servisleri (ABD).",
      "Bu aktarım KVKK m.9 kapsamındadır. Aktarım, hizmetin sunulması için gerekli olduğu ölçüde ve m.9'da öngörülen uygun güvencelerle yapılır; ayrıca Açık Rıza Beyanı ile açık rızanız istenir. Yeterlilik kararı bulunmayan ülkelere aktarımlarda standart sözleşme gibi güvenceler esas alınır." ] },
    { h: "6. Saklama süresi", ul: [
      "Uçuş kayıtları 90 gün; canlı konum yalnızca paylaşım sürdüğü kadar (son değer) tutulur.",
      "Hesap bilgileri hesabınız açık olduğu sürece; personel, işletme ve eğitim evrakları işletme silene veya yasal saklama süreleri dolana kadar." ] },
    { h: "7. KVKK m.11 kapsamındaki haklarınız", p: [
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme; işlenmişse bilgi talep etme; amacına uygun kullanılıp kullanılmadığını öğrenme; yurt içinde/yurt dışında aktarıldığı kişileri bilme; eksik/yanlış işlenmişse düzeltilmesini isteme; silinmesini veya yok edilmesini isteme; bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme; otomatik sistemlerle aleyhinize bir sonuç çıkmasına itiraz etme; kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme haklarına sahipsiniz.",
      "Başvuru: {{EPOSTA}} adresine yazılı olarak. Uygulama içinden Ayarlar > Hesabımı sil ile hesabınızı silebilirsiniz. Son güncelleme: {{TARIH}}." ] }
  ]
};
const AYD_DOC_EN = {
  title: "KVKK Disclosure Notice",
  sections: [
    { h: "About this text", p: [
      "This text is provided for information under Article 10 of Law No. 6698 (KVKK). It is not a consent statement; you only confirm that you have read and understood it. A separate Explicit Consent Statement covers processing that requires consent." ] },
    { h: "1. Data controller", p: [
      "Data controller for account and usage data: {{SORUMLU}}. Contact: {{EPOSTA}}.",
      "For staff, balloon and business data, the balloon operator (company) you belong to is the data controller; AviaDoX is a data processor acting on the operator's instructions." ] },
    { h: "2. Personal data processed", ul: [
      "Identity and account: full name, username, company, role, password (hashed only).",
      "Staff: job title, language proficiency certificate, pilot license, graduation and first aid certificates, KDM certificates, document expiry dates, work and flight-hour schedules.",
      "Special-category data: medical certificate (health data).",
      "Location: in Flight Log between Start and Stop, latitude, longitude, altitude, speed, heading, time; while flight recording is on, live position shown to users in the same company.",
      "Image: optional profile photo.",
      "Transaction security: IP address, device/browser information, session information.",
      "Training records: training name, date and attendance documents kept by the quality manager." ] },
    { h: "3. Purposes of processing", ul: [
      "Creating your account, authentication and providing the service.",
      "Tracking document validity, maintenance, schedules and training; flight recording and flight safety.",
      "Meeting record-keeping and audit obligations arising from aviation regulations.",
      "Ensuring information security and fixing errors." ] },
    { h: "4. Collection method and legal bases", p: [
      "Your data is collected electronically from information entered by you, your company admins or the quality manager when registering and using the app, and via your device's location sensor.",
      "Legal bases (KVKK Art. 5/2 and 6): establishment and performance of a contract; compliance with a legal obligation; the controller's legitimate interest; establishment, exercise or protection of a right. For location, health data and transfer abroad, your explicit consent is additionally requested through the Explicit Consent Statement." ] },
    { h: "5. Transfer of data", p: [
      "In Türkiye: admins of your company, within their roles, access your staff documents and schedule; competent public authorities (e.g. SHGM) upon legal request; the admin of the contracted CAMO assigned to your balloons, for those balloons' information, maintenance hours and documents (not staff data).",
      "DATA STORED ABROAD: Your data is stored and processed on servers outside Türkiye. Database, authentication and file storage: Supabase (server region: {{BOLGE}}). Web app hosting: GitHub Pages (USA). Domain and email forwarding: Cloudflare (USA). Map tiles: Esri (USA). Weather: Open-Meteo. Notifications: Google/Apple/Mozilla push services (USA).",
      "This transfer falls under Article 9 of the KVKK. It is made only to the extent necessary to provide the service and with the appropriate safeguards set out in Article 9; in addition your explicit consent is requested through the Explicit Consent Statement. For transfers to countries without an adequacy decision, safeguards such as standard contracts are relied upon." ] },
    { h: "6. Retention", ul: [
      "Flight records 90 days; live position is kept only while sharing continues (latest value).",
      "Account information while your account is open; staff, business and training documents until the operator deletes them or legal retention periods end." ] },
    { h: "7. Your rights under Article 11 of the KVKK", p: [
      "You have the right to learn whether your data is processed; request information; learn the purpose and whether it is used accordingly; know the third parties to whom it is transferred in Türkiye or abroad; request correction; request deletion or destruction; request notification of these actions to third parties; object to a result against you produced by automated systems; and claim compensation for damage caused by unlawful processing.",
      "Apply in writing to {{EPOSTA}}. In the app you can delete your account via Settings > Delete my account. Last updated: {{TARIH}}." ] }
  ]
};

/* ---- Açık Rıza Beyanı (KVKK m.5/6/9): her madde AYRI işaretlenir ---- */
const RIZA_DOC = {
  title: "Açık Rıza Beyanı",
  sections: [
    { h: "Bu metin hakkında", p: [
      "Aşağıdaki her madde ayrı bir açık rızadır; Aydınlatma Metni'ni okuduğunuzu onaylamaktan bağımsızdır. Rızalar belirli bir konuya ilişkindir, bilgilendirmeye dayanır ve özgür iradenizle verilir. İstediğiniz zaman geri alabilirsiniz (aşağıya bakın). Veri sorumlusu: {{SORUMLU}} — {{EPOSTA}}." ] },
    { h: "Rıza 1 — Kişisel verilerin yurt dışına aktarılması ve yurt dışında saklanması", p: [
      "Hesap bilgilerimin, personel/işletme/eğitim evraklarımın, bakım ve çizelge kayıtlarımın ve uçuş kayıtlarımın Türkiye dışındaki sunucularda saklanmasına ve işlenmesine; bu amaçla Supabase (sunucu bölgesi: {{BOLGE}}), GitHub Pages ve Cloudflare (ABD), Esri (ABD), Open-Meteo ve web bildirim servisleri (Google, Apple, Mozilla) gibi yurt dışındaki hizmet sağlayıcılara aktarılmasına açık rıza veriyorum.",
      "Rıza vermemenin sonucu: Uygulamanın tüm altyapısı Türkiye dışında çalıştığından, bu rıza olmadan hesabınız kullanılamaz." ] },
    { h: "Rıza 2 — Özel nitelikli kişisel verilerin (sağlık) işlenmesi", p: [
      "Sağlık sertifikam gibi sağlık verisi niteliğindeki belgelerimin, çalıştığım işletmenin yöneticileri ve kalite yöneticisi tarafından uygulamaya yüklenmesine, saklanmasına ve geçerlilik takibi amacıyla işlenmesine açık rıza veriyorum.",
      "Bu belgelere yalnızca ilgili şirketin yetkili yöneticileri erişir. Rızayı geri alırsanız ilgili belgelerin silinmesini işletmenizden talep edebilirsiniz." ] },
    { h: "Rıza 3 — Konum verisi ve canlı paylaşım (Flight Log'da ayrıca istenir)", p: [
      "Uçuş kaydı için konumumun (enlem, boylam, yükseklik, hız, yön) Start–Stop arasında işlenmesine ve uçuş kaydı açıkken aynı şirketteki diğer kullanıcılara canlı gösterilmesine açık rıza veriyorum.",
      "Bu rıza, ilk kez Flight Log'u kullanırken ayrı bir pencerede istenir. Vermezseniz yalnızca uçuş kaydı kullanılamaz; uygulamanın diğer bölümleri çalışır." ] },
    { h: "Rızanın geri alınması", p: [
      "Rızanızı istediğiniz zaman {{EPOSTA}} adresine yazarak veya Ayarlar > Hesabımı sil ile geri alabilirsiniz. Geri alma, geri alma anına kadar yapılan işlemlerin hukuka uygunluğunu etkilemez. Konum rızasını ayrıca cihaz ayarlarından da geri alabilirsiniz.",
      "Son güncelleme: {{TARIH}}." ] }
  ]
};
const RIZA_DOC_EN = {
  title: "Explicit Consent Statement",
  sections: [
    { h: "About this text", p: [
      "Each item below is a separate explicit consent, independent of confirming that you have read the Disclosure Notice. Consents relate to a specific subject, are based on information and given of your free will. You can withdraw them at any time (see below). Data controller: {{SORUMLU}} — {{EPOSTA}}." ] },
    { h: "Consent 1 — Transfer and storage of personal data abroad", p: [
      "I give my explicit consent to my account information, staff/business/training documents, maintenance and schedule records and flight records being stored and processed on servers outside Türkiye, and for this purpose being transferred to service providers abroad such as Supabase (server region: {{BOLGE}}), GitHub Pages and Cloudflare (USA), Esri (USA), Open-Meteo and web notification services (Google, Apple, Mozilla).",
      "Consequence of not consenting: because the entire infrastructure of the app runs outside Türkiye, your account cannot be used without this consent." ] },
    { h: "Consent 2 — Processing of special-category personal data (health)", p: [
      "I give my explicit consent to documents of a health-data nature, such as my medical certificate, being uploaded by the admins and the quality manager of the operator I work for, stored, and processed for validity tracking.",
      "Only authorized admins of the relevant company can access these documents. If you withdraw consent you can ask your operator to delete the documents." ] },
    { h: "Consent 3 — Location data and live sharing (asked separately in Flight Log)", p: [
      "I give my explicit consent to my location (latitude, longitude, altitude, speed, heading) being processed between Start and Stop for flight recording and being shown live to other users in my company while flight recording is on.",
      "This consent is requested in a separate window when you first use Flight Log. If you do not give it, only flight recording is unavailable; the rest of the app works." ] },
    { h: "Withdrawing consent", p: [
      "You can withdraw your consent at any time by writing to {{EPOSTA}} or via Settings > Delete my account. Withdrawal does not affect the lawfulness of processing carried out until then. You can also withdraw location consent in your device settings.",
      "Last updated: {{TARIH}}." ] }
  ]
};
const PRIV_DOCS = { pol: [PRIV_DOC, PRIV_DOC_EN], ayd: [AYD_DOC, AYD_DOC_EN], riza: [RIZA_DOC, RIZA_DOC_EN] };
const privE = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function privHtml(kind) {
  const en = typeof I18N !== "undefined" && I18N.lang === "en", pair = PRIV_DOCS[kind] || PRIV_DOCS.pol;
  const DOC = en ? pair[1] : pair[0];
  const C = (typeof AERODOX !== "undefined" && AERODOX) || {};
  const fill = s => privE(s).replace(/\{\{SORUMLU\}\}/g, privE(C.CONTROLLER || "[Veri sorumlusu adı / unvanı]"))
    .replace(/\{\{EPOSTA\}\}/g, privE(C.CONTACT_EMAIL || "[iletişim e-postası]"))
    .replace(/\{\{BOLGE\}\}/g, privE(C.DATA_REGION || "[Supabase proje bölgesi]"))
    .replace(/\{\{TARIH\}\}/g, privE(C.POLICY_DATE || ""));
  return `<h1 style="font-size:22px;margin:0 0 12px">${privE(DOC.title)}</h1>` + DOC.sections.map(s =>
    `<h2 style="font-size:17px;margin:20px 0 6px">${privE(s.h)}</h2>` +
    (s.p || []).map(t => `<p style="margin:6px 0;line-height:1.5">${fill(t)}</p>`).join("") +
    (s.ul ? `<ul style="margin:6px 0;padding-left:20px;line-height:1.5">${s.ul.map(t => `<li style="margin:4px 0">${fill(t)}</li>`).join("")}</ul>` : "") +
    (s.p2 || []).map(t => `<p style="margin:6px 0;line-height:1.5">${fill(t)}</p>`).join("")).join("");
}
