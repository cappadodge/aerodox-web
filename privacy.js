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
      "Uçuş kayıtlarını yalnızca kaydı yapan kullanıcı görür. Başka kullanıcılar ve şirket yöneticisi kayıtlarınıza erişemez.",
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
const privE = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function privHtml() {
  const C = (typeof AERODOX !== "undefined" && AERODOX) || {};
  const fill = s => privE(s).replace(/\{\{SORUMLU\}\}/g, privE(C.CONTROLLER || "[Veri sorumlusu adı / unvanı]"))
    .replace(/\{\{EPOSTA\}\}/g, privE(C.CONTACT_EMAIL || "[iletişim e-postası]"))
    .replace(/\{\{BOLGE\}\}/g, privE(C.DATA_REGION || "[Supabase proje bölgesi]"))
    .replace(/\{\{TARIH\}\}/g, privE(C.POLICY_DATE || ""));
  return `<h1 style="font-size:22px;margin:0 0 12px">${privE(PRIV_DOC.title)}</h1>` + PRIV_DOC.sections.map(s =>
    `<h2 style="font-size:17px;margin:20px 0 6px">${privE(s.h)}</h2>` +
    (s.p || []).map(t => `<p style="margin:6px 0;line-height:1.5">${fill(t)}</p>`).join("") +
    (s.ul ? `<ul style="margin:6px 0;padding-left:20px;line-height:1.5">${s.ul.map(t => `<li style="margin:4px 0">${fill(t)}</li>`).join("")}</ul>` : "") +
    (s.p2 || []).map(t => `<p style="margin:6px 0;line-height:1.5">${fill(t)}</p>`).join("")).join("");
}
