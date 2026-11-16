/* AviaDoX gizlilik politikası: tek kaynak (uygulama içi sayfa ve gizlilik.html bunu kullanır).
   Boş yerler config.js içindeki CONTROLLER / CONTACT_EMAIL / DATA_REGION alanlarından gelir. */
const PRIV_DOC = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni",
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
      "Konum yalnızca Flight Log'da siz Start düğmesine bastığınızda ve Stop'a basana kadar alınır. Android uygulamasında, uçuş sırasında ekran kapalıyken de iz kaydedebilmek için arka planda konum kullanılır; bu sırada bildirim çubuğunda \"Uçuş kaydı sürüyor\" bildirimi görünür. Uçuş dışında konumunuz alınmaz ve takip edilmez.",
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
      "Hizmet sağlayıcılar:" ], ul: [
      "Supabase: kimlik doğrulama, veritabanı ve özel dosya depolama (sunucu bölgesi: {{BOLGE}}).",
      "GitHub Pages: web uygulamasının barındırılması.",
      "Esri World Imagery: harita karoları. Harita görüntülenirken görüntülenen bölge ve IP adresiniz Esri sunucularına iletilir.",
      "Apple App Store / Google Play: uygulamanın dağıtımı (yalnızca mağazadan indirdiğinizde)." ] , p2: [
      "Bu hizmet sağlayıcıların sunucuları yurt dışında olabilir; bu nedenle verileriniz KVKK m.9 kapsamında yurt dışına aktarılabilir. Aktarım, hizmetin sunulması için gerekli olduğu ölçüde ve uygun güvencelerle yapılır.",
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
  title: "Privacy Policy and KVKK Disclosure Notice",
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
      "Location is captured only in Flight Log, from when you press Start until you press Stop. In the Android app, location is used in the background so the track can be recorded while the screen is off; a \"Flight recording in progress\" notification is shown in the notification bar. Outside a flight your location is not captured or tracked.",
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
      "Service providers:" ], ul: [
      "Supabase: authentication, database and private file storage (server region: {{BOLGE}}).",
      "GitHub Pages: hosting of the web application.",
      "Esri World Imagery: map tiles. While a map is displayed, the displayed area and your IP address are sent to Esri servers.",
      "Open-Meteo: weather forecasts. Requests for weather data may expose your IP address to this service.",
      "Apple App Store / Google Play: distribution of the app (only if you download it from a store)." ] , p2: [
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
const privE = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function privHtml() {
  const DOC = (typeof I18N !== "undefined" && I18N.lang === "en") ? PRIV_DOC_EN : PRIV_DOC;
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
