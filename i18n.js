/* AviaDoX: dil (TR/EN) ve tema (otomatik/açık/koyu). Kaynak metinler Türkçe kalır;
   İngilizce seçilince ekrandaki metinler DOM'a yazıldıkça sözlükten çevrilir (mantık/veri etkilenmez). */
const I18N = (() => {
  const LK = "aviadox-lang", TK = "aviadox-theme";
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  let lang = get(LK) || (/^tr/i.test(navigator.language || "tr") ? "tr" : "en");
  let theme = get(TK) || "auto";

  // Düzenli ifadeler (sayı içeren cümleler) önce uygulanır
  const RX = [
    [/(.*) için rol "(.*)" yapılsın mı\?/g, 'Set the role of $1 to "$2"?'],
    [/(^|\s)1 kişi şirkete katılmak için onayınızı bekliyor \(Ayarlar > Katılım istekleri\)/g, "$11 person is waiting for your approval to join the company (Settings > Join requests)"],
    [/100 saatlik bakım için (\d+) saat kaldı/g, "100-hour maintenance: $1 hours left"],
    [/100 saatlik bakım gecikti \((\d+) saat aşıldı\)/g, "100-hour maintenance overdue ($1 hours over)"],
    [/yıllık bakım için (\d+) gün kaldı/g, "annual maintenance: $1 days left"],
    [/yıllık bakım (\d+) gün gecikti/g, "annual maintenance $1 days overdue"],
    [/(\d+) kişi şirkete katılmak için onayınızı bekliyor \(Ayarlar > Katılım istekleri\)/g, "$1 people are waiting for your approval to join the company (Settings > Join requests)"],
    [/: haftalık 6 gün limiti aşıldı \((\d+) gün\)/g, ": weekly 6-day limit exceeded ($1 days)"],
    [/ bu hafta (\d+)\. gününe girecek\. Haftalık 6 gün limiti aşılıyor, yine de kaydedilsin mi\?/g, " will reach day $1 this week. The weekly 6-day limit would be exceeded. Save anyway?"],
    [/Uyarı: (.*) bu hafta 5\. gününe ulaştı\. 1 gün hakkı kaldı\./g, "Warning: $1 reached day 5 this week. 1 day left."],
    [/: bu hafta 5 gün uçtu, 1 gün hakkı kaldı/g, ": flew 5 days this week, 1 day left"],
    [/(\d+) gün kaldı/g, "$1 days left"],
    [/(\d+) saat kaldı/g, "$1 hours left"],
    [/(\d+) m kaldı/g, "$1 m left"],
    [/(\d+) nokta\)\. Kaydedilsin mi\?/g, "$1 points). Save it?"],
    [/(\d+) nokta\)\. Silinecek:/g, "$1 points). To be removed:"],
    [/(\d+) saha, (\d+) hat, (\d+) nokta yüklendi ve tüm cihazlara dağıtıldı\./g, "$1 areas, $2 lines, $3 points uploaded and distributed to all devices."],
    [/(\d+) gün sonra otomatik silinir\./g, "Deleted automatically after $1 days."],
    [/ için şirkete erişim kaldırılsın mı\? Giriş yapabilir ama hiçbir veriyi göremez\./g, ": remove access to the company? They can sign in but will not see any data."],
    [/(.*) listeden çıkarılsın mı\? Geçmiş çizelge kayıtları ve yüklenmiş evrakları saklanır\./g, "Remove $1 from the list? Past schedule records and uploaded documents are kept."],
    [/(.*) balonu listeden çıkarılsın mı\?/g, "Remove balloon $1 from the list?"],
    [/(.*) normal kullanıcı yapılsın mı\?/g, "Make $1 a regular user?"],
    [/(.*) yönetici yapılsın mı\? Tüm şirket verilerini görebilir ve değiştirebilir\./g, "Make $1 an admin? They can see and change all company data."],
    [/Uçuş sırasında uygulama toplam (.+?) arka planda kaldı; bu sürelerde konum kaydedilmedi \(GPX'te iz kopuk görünür\)\. Ekranı açık tut\./g, "During the flight the app was in the background for $1 in total; no location was recorded during that time (the GPX track will show a gap). Keep the screen on."],
    [/Yarım kalan uçuş bulundu \(/g, "An unfinished flight was found ("],
    [/(\d+) saat · uçuş/g, "$1 h · flight"],
    [/çalışma (\d+(?:\.\d+)?) sa · uçuş (\d+(?:\.\d+)?) sa/g, "duty $1 h · flight $2 h"],
    [/(.+?) sınırına (\d+) m kaldı/g, "$2 m to the boundary of $1"],
    [/Kayıtlar (\d+) gün sonra otomatik silinir\. Kayıtlar önce cihaza, sonra sunucuya kaydedilir; yalnızca sen görürsün\./g, "Records are deleted automatically after $1 days. Records are saved to the device first, then to the server; only you can see them."],
    [/(\d{4}-\d{2}) özeti/g, "$1 summary"]
  ];

  const D = {
    // --- menü / başlıklar ---
    "Panel": "Dashboard", "Şirket": "Company", "Personel": "Staff", "Bakım": "Maintenance", "Çizelge": "Schedule", "Ayarlar": "Settings",
    "Hava Durumu": "Weather", "Slot Merkezi": "Slot Center", "Balonlar": "Balloons", "Kayıtlar": "Records",
    "Şirket Evrakları": "Company Documents", "Personel Evrakları": "Staff Documents", "Balon Bakımı": "Balloon Maintenance", "Pilot Çizelgesi": "Pilot Schedule",
    "Menü": "Menu", "Çıkış": "Log out", "Hoş geldin,": "Welcome,", "Yönetici": "Admin", "Yükleniyor…": "Loading…", "Veriler yükleniyor…": "Loading data…",
    "Balon operasyonları için evrak ve uçuş takibi": "Documents and flight tracking for balloon operations",
    // --- giriş / kayıt ---
    "Giriş Yap": "Sign in", "Giriş yapılıyor…": "Signing in…", "Kayıt ol": "Sign up", "Hesabın yok mu? Kayıt ol": "No account? Sign up",
    "Kullanıcı adı": "Username", "Parola": "Password", "Kullanıcı adı:": "Username:",
    "Gizlilik Politikası": "Privacy Policy", "Gizlilik Politikası ve KVKK Aydınlatma Metni": "Privacy Policy and KVKK Disclosure Notice",
    "‹ Girişe dön": "‹ Back to sign in", "‹ Geri": "‹ Back",
    "Kullanıcı adı ve parolayı girin.": "Enter your username and password.", "Kullanıcı adı veya parola hatalı.": "Incorrect username or password.",
    "Kullanıcı adı 3-30 karakter olmalı; sadece küçük harf (a-z), rakam ve . _ - kullanın. Türkçe karakter ve boşluk olmaz.": "Username must be 3-30 characters: only lowercase letters (a-z), digits and . _ - are allowed. No Turkish characters or spaces.",
    "Bu kullanıcı adı alınmış. Başka bir kullanıcı adı deneyin.": "This username is taken. Try another one.",
    "Parola en az 8 karakter olmalı.": "Password must be at least 8 characters.", "Parolalar aynı değil.": "Passwords do not match.",
    "Parola kabul edilmedi: daha uzun ve karışık bir parola seçin.": "Password not accepted: choose a longer, more complex password.",
    "Devam etmek için Gizlilik Politikası'nı kabul etmelisiniz.": "You must accept the Privacy Policy to continue.",
    "Kayıt şu an kapalı. Yöneticinizle iletişime geçin.": "Sign-up is currently closed. Contact your admin.",
    "Hesap oluşturuldu ama oturum açılamadı. Girişe dönüp deneyin.": "Account created but sign-in failed. Go back to sign in and try again.",
    "Oturum süresi doldu, yeniden giriş yapın.": "Session expired, please sign in again.",
    "İnternet bağlantısı yok veya sunucuya ulaşılamıyor.": "No internet connection or the server is unreachable.",
    "Kayıt ol. Hesabın, çalıştığın şirketin yöneticisi onaylayınca açılır.": "Sign up. Your account is activated once your company's admin approves it.",
    "Şirket adını yazın.": "Enter the company name.", "İsim girin.": "Enter a name.", "Tüm alanları doldurun.": "Fill in all fields.",
    "Başvur": "Apply", "Başvurun alındı.": "Your application was received.",
    "şirketinin yöneticisi hesabını onayladığında giriş yapabileceksin. Onaydan sonra aşağıdaki Yenile düğmesine bas.": "You will be able to sign in once the admin of this company approves your account. After approval, press the Refresh button below.",
    "Yenile": "Refresh", "↻ Yenile": "↻ Refresh",
    "Hesabın silindi.": "Your account was deleted.",
    "Hesabınız henüz bir personel kaydına bağlanmamış. Lütfen yöneticinize başvurun.": "Your account is not linked to a staff record yet. Please contact your admin.",
    // --- panel ---
    "Şirket evrakı": "Company document", "Personel evrakı": "Staff document", "30 gün içinde dolacak": "Expiring within 30 days", "Süresi dolmuş": "Expired",
    "Dikkat gerektirenler": "Needs attention", "Şu an uyarı yok.": "No alerts right now.", "Acil": "Urgent", "Yaklaşıyor": "Approaching",
    "📷 Fotoğrafımı değiştir": "📷 Change my photo", "Süresi doldu": "Expired", "Geçerli": "Valid", "Yakında dolacak": "Expiring soon", "Tamam": "OK",
    // --- evraklar ---
    "İşletme El Kitabı": "Operations Manual", "İşletme Şartları": "Operating Conditions", "Balon Sigorta Evrakları": "Balloon Insurance Documents", "CAO Anlaşmaları": "CAO Agreements",
    "Balon Telsiz Ruhsatları": "Balloon Radio Licenses", "Balon Tescil": "Balloon Registration", "Balon Uçuşa Elverişlilik Evrakları": "Balloon Airworthiness Documents",
    "Dil Yeterlilik Belgesi": "Language Proficiency Certificate", "Pilot Lisansı": "Pilot License", "Sağlık Sertifikası": "Medical Certificate", "Mezuniyet Diploması": "Graduation Diploma",
    "İlk Yardım Belgesi": "First Aid Certificate", "KDM Belgeleri": "KDM Certificates",
    "Bu kategoride evrak yok.": "No documents in this category.", "Henüz evrak yok.": "No documents yet.", "Bitiş tarihi yok": "No expiry date", "Bitiş:": "Expires:",
    "Bitiş tarihi (isteğe bağlı)": "Expiry date (optional)", "Görüntüle": "View", "🗑 Evrakı sil": "🗑 Delete document", "Yükle": "Upload", "Evrak yükle": "Upload document",
    "➕ Bu kategoriye evrak yükle": "➕ Upload to this category", "Yüklenenler": "Uploaded", "evrak durumu": "document status", "Eksik": "Missing", "eksik": "missing", "Yüklendi": "Uploaded",
    "Evrak silindi": "Document deleted", "Evrak yüklendi": "Document uploaded", "Bu evrak silinsin mi? Geri alınamaz.": "Delete this document? This cannot be undone.",
    "Dosya en fazla 45 MB olabilir.": "File can be at most 45 MB.", "Lütfen bir dosya seçin.": "Please choose a file.", "Dosya kaydedilemedi:": "File could not be saved:",
    "Yaklaşan": "Upcoming", "Süresiz": "No expiry",
    // --- personel ---
    "➕ Pilot / personel ekle": "➕ Add pilot / staff", "Ad Soyad": "Full name", "Ekle": "Add", "Eklendi": "Added", "Henüz personel yok.": "No staff yet.",
    "🗑 Bu personeli çıkar": "🗑 Remove this staff member", "‹ Personel listesi": "‹ Staff list", "Personel listeden çıkarıldı": "Staff member removed from the list",
    "Yer Ekibi": "Ground crew", "Önce personel ekleyin.": "Add staff first.", "Önce pilot ekleyin.": "Add a pilot first.",
    "🔗 Giriş hesabı": "🔗 Login account", "Bağlı değil": "Not linked", "· bağlı değil": "· not linked", "giriş hesabı bağlı değil": "login account not linked",
    "Bu kişinin giriş hesabını seç. Bağlanan kullanıcı sadece bu kişinin evraklarını görür ve yükleyebilir.": "Select this person's login account. The linked user can only see and upload this person's documents.",
    "Hesap bağlandı": "Account linked", "Bağlantı kaldırıldı": "Link removed", "Bu hesap başka bir personele bağlı.": "This account is linked to another staff member.", "hesap:": "account:",
    // --- bakım ---
    "Periyodik bakım": "Periodic maintenance", "Aylık bakım çizelgesi": "Monthly maintenance schedule", "🔧 100 saatlik bakım çizelgesi": "🔧 100-hour maintenance schedule",
    "Kalan süre 10 saat veya 10 günün altına inince panelde bildirim çıkar. Ayrıntı için balonun adına dokun.": "A notice appears on the dashboard when the remaining time drops below 10 hours or 10 days. Tap the balloon name for details.",
    "Henüz balon yok.": "No balloons yet.", "Bakım gecikti": "Maintenance overdue", "Güncel uçuş saati": "Current flight hours", "Son bakım": "Last maintenance",
    "Bu bakımdan beri": "Since this maintenance", "Yıllık bakım": "Annual maintenance", "Yıllık bakım:": "Annual maintenance:", "tarih yok": "no date", "gün)": "days)",
    "➕ Balon ekle": "➕ Add balloon", "Balon ekle": "Add balloon", "Balon eklendi": "Balloon added", "Tescil (örn. TC-ABC)": "Registration (e.g. TC-ABC)",
    "Güncel toplam uçuş saati": "Current total flight hours", "Son 100 saatlik bakımdan beri uçulan saat": "Hours flown since last 100-hour maintenance", "Yıllık bakım bitiş tarihi": "Annual maintenance expiry date",
    "‹ Balon listesi": "‹ Balloon list", "📋 Balon bilgileri": "📋 Balloon info", "Balon bilgileri kaydedildi": "Balloon info saved", "Balon (tescil)": "Balloon (registration)",
    "Balon marka adı": "Balloon brand name", "Balon tip / model": "Balloon type / model", "Burner seri numarası": "Burner serial number", "Isı sensörü kodu": "Heat sensor code",
    "Yakıt tankı seri numaraları": "Fuel tank serial numbers", "Balon sigorta başlangıç tarihi": "Balloon insurance start date", "Uçuşa elverişlilik başlangıç tarihi": "Airworthiness start date",
    "100 saatlik periyodik bakım": "100-hour periodic maintenance", "Yıllık periyodik bakım": "Annual periodic maintenance", "100 saatlik bakıma kalan:": "Until 100-hour maintenance:",
    "100 saatlik bakım yapıldı": "100-hour maintenance done", "Yıllık bakım yapıldı (+1 yıl)": "Annual maintenance done (+1 year)", "Saat ekle": "Add hours", "Son bakım tarihi:": "Last maintenance date:",
    "Bakım türü": "Maintenance type", "Bakım işlem tarihi": "Maintenance date", "Yapılan bakım": "Work performed", "Önleyici": "Preventive", "Düzeltici": "Corrective", "Önleyici bakım": "Preventive maintenance", "Düzeltici bakım": "Corrective maintenance",
    "önleyici": "preventive", "düzeltici": "corrective", "Bakım kaydı eklendi": "Maintenance record added", "bakım kaydı eklenemedi": "maintenance record could not be added", "Bu ay bakım kaydı yok.": "No maintenance records this month.",
    "Bu bakım kaydı silinsin mi?": "Delete this maintenance record?", "Bu kayıt silinsin mi?": "Delete this record?", "Kayıt silindi": "Record deleted", "Kayıt güncellendi": "Record updated",
    "Balon, yapılan bakım ve tarih gerekli.": "Balloon, work performed and date are required.", "Tescil boş olamaz.": "Registration cannot be empty.", "Tescil girin.": "Enter the registration.",
    "Önce Balonlar sekmesinden balon ekleyin.": "Add a balloon from the Balloons tab first.", "bakım çizelgesi": "maintenance schedule",
    "Sunucuda güncelleme izni yok (9. SQL çalıştırılmalı).": "No update permission on the server (SQL 9 must be run).", "gecikti (": "overdue (",
    // --- çizelge ---
    "Çizelge": "Schedule", "✈️ Uçtu": "✈️ Flew", "Uçtu": "Flew", "🏖️ İzinli": "🏖️ On leave", "İzinli": "On leave", "🚫 Alana gidildi, uçuş iptal": "🚫 Went to field, flight cancelled",
    "❌ Önceden iptal (alana gidilmedi)": "❌ Cancelled in advance (did not go to field)", "Alana gidildi, iptal": "Went to field, cancelled", "Önceden iptal, alana gidilmedi": "Cancelled in advance, did not go to field",
    "✈️ Uçtu · 🏖️ İzinli · 🚫 Alana gidildi, uçuş iptal · ❌ Önceden iptal, alana gidilmedi": "✈️ Flew · 🏖️ On leave · 🚫 Went to field, flight cancelled · ❌ Cancelled in advance, did not go to field",
    "Kural: haftada en fazla 6 gün. Alana gidilen iptal günü de uçtu sayılır. 5. günde uyarı verilir. Bir gün önceden iptal (❌) günü sayacı sıfırlar.": "Rule: at most 6 days per week. A cancelled day where the crew went to the field also counts as flown. A warning is given on day 5. A day cancelled in advance (❌) resets the counter.",
    "📅 Bu hafta uçuş günleri": "📅 Flight days this week", "bu hafta": "this week", "uçuş günü": "flight days", "uçuş sa.": "flight h.", "çalışma sa.": "duty h.", "Uçuş saati toplamı": "Total flight hours", "Çalışma saati toplamı": "Total duty hours",
    "· çalışma": "· duty", "Tarih ve uçuş saatini girin.": "Enter the date and flight hours.", "Uçuş saati çalışma saatinden büyük olamaz.": "Flight hours cannot exceed duty hours.",
    ": bu hafta 6 gün doldu, artık uçamaz": ": 6 days reached this week, cannot fly anymore", "Uyarı:": "Warning:", "Bu kaydı silme yetkiniz yok.": "You do not have permission to delete this record.", "Bu işlem için yetkiniz yok.": "You do not have permission for this action.",
    "Ocak": "January", "Şubat": "February", "Mart": "March", "Nisan": "April", "Mayıs": "May", "Haziran": "June", "Temmuz": "July", "Ağustos": "August", "Eylül": "September", "Ekim": "October", "Kasım": "November", "Aralık": "December",
    "Pzt": "Mon", "Sal": "Tue", "Çar": "Wed", "Per": "Thu", "Cum": "Fri", "Cmt": "Sat", "Paz": "Sun",
    // --- ayarlar ---
    "📷 Profil fotoğrafım": "📷 My profile photo", "Panelde sadece senin hesabında görünür. Kare kırpılır ve küçültülür.": "Shown only on your own dashboard. The image is cropped to a square and resized.",
    "Fotoğrafı yükle": "Upload photo", "Fotoğrafı kaldır": "Remove photo", "Fotoğraf güncellendi": "Photo updated", "Fotoğraf kaldırıldı": "Photo removed", "Fotoğraf işlenemedi.": "Photo could not be processed.",
    "Fotoğraf çok büyük.": "Photo is too large.", "Bir fotoğraf seçin.": "Choose a photo.", "Bir görsel seçin.": "Choose an image.", "Görsel okunamadı. JPG veya PNG deneyin.": "Image could not be read. Try JPG or PNG.",
    "🔑 Parolamı değiştir": "🔑 Change my password", "Parolayı değiştir": "Change password", "Yeni parola (en az 8 karakter)": "New password (at least 8 characters)", "Yeni parola (tekrar)": "New password (repeat)", "Parola değiştirildi": "Password changed",
    "🖼️ Şirket logosu": "🖼️ Company logo", "Panelde görünür. PNG veya JPG, en fazla 2 MB.": "Shown on the dashboard. PNG or JPG, at most 2 MB.", "Logoyu yükle": "Upload logo", "Logo güncellendi": "Logo updated", "Logo en fazla 2 MB olmalı.": "Logo must be at most 2 MB.",
    "👤 Yeni kullanıcı ekleme": "👤 Adding new users", "Çalışanlar giriş ekranında Kayıt ol'a basıp listeden şirketi seçerek başvurur. Yukarıdaki Katılım istekleri bölümünden onaylarsın.": "Employees apply by tapping Sign up on the login screen and choosing the company from the list. You approve them in the Join requests section above.",
    "Çalışanlar kayıt olurken listeden şirketi seçer:": "When signing up, employees pick the company from the list:",
    "📨 Katılım istekleri": "📨 Join requests", "Onayla": "Approve", "Reddet": "Reject", "Kullanıcı onaylandı": "User approved", "Başvuru reddedildi": "Application rejected", "Bu başvuru reddedilsin mi?": "Reject this application?",
    ". Onayladığın kişi normal kullanıcı olarak girer. Bir rol seçersen personel kaydı da açılır ve hesaba otomatik bağlanır.": ". The person you approve joins as a regular user. If you choose a role, a staff record is created and linked to the account automatically.",
    "Personel kaydı oluşturma": "Create staff record", "👥 Kullanıcılar (": "👥 Users (", "Şirketine giriş yapabilen hesaplar. Rol atayabilir ya da erişimi kaldırabilirsin. Erişimi kaldırılan kişinin personel kaydı ve evrakları silinmez.": "Accounts that can sign in to your company. You can assign roles or remove access. The staff record and documents of a person whose access is removed are not deleted.",
    "Yönetici yap": "Make admin", "Normal kullanıcı yap": "Make regular user", "Bu kullanıcı": "This user", "Rol güncellendi": "Role updated", "Erişim kaldırıldı": "Access removed", "Sil": "Delete", "🗑 Sil": "🗑 Delete", "Emin misin? Sil": "Are you sure? Delete",
    "🔒 Gizlilik": "🔒 Privacy", "Hangi verileri neden işlediğimizi ve haklarını okuyabilirsin.": "Read which data we process and why, and what your rights are.", "🗑 Hesabımı sil": "🗑 Delete my account", "Hesabımı kalıcı olarak sil": "Delete my account permanently",
    "Giriş hesabın, profilin, fotoğrafın ve uçuş kayıtların kalıcı olarak silinir. Geri alınamaz. Personel kaydın ve evraklar işletmeye aittir, yöneticin siler. Şirketin tek yöneticisiysen önce başka birini yönetici yap.": "Your login account, profile, photo and flight records are permanently deleted. This cannot be undone. Your staff record and documents belong to the company; your admin removes them. If you are the only admin, make someone else an admin first.",
    "Onay için kutuya SİL yazın.": "Type SİL in the box to confirm.", "SİL": "SİL", "Hesabın ve uçuş kayıtların kalıcı olarak silinecek. Bu işlem geri alınamaz. Devam edilsin mi?": "Your account and flight records will be permanently deleted. This cannot be undone. Continue?",
    "ℹ️ Hesap": "ℹ️ Account", "Görünüm ve dil": "Appearance and language", "Tema": "Theme", "Dil": "Language", "Otomatik (cihaz)": "Automatic (device)", "Açık": "Light", "Koyu": "Dark",
    "ni okudum, kabul ediyorum.": "I have read and accept it.",
    // --- gizlilik sayfası kısa metin ---
    
    // --- flight log ---
    "🗺️ Harita": "🗺️ Map", "📁 Kayıtlar": "📁 Records", "Start": "Start", "Stop": "Stop", "Merkeze al": "Center", "Kapat": "Close", "Temizle": "Clear", "Paylaş": "Share", "İndir": "Download", "Tekrar dene": "Try again", "Boş uçuş": "Empty flight", "Test": "Test",
    "Test konumu (simülasyon)": "Test location (simulation)", "Test konumu bekleniyor…": "Waiting for test location…", "SIMULASYON / TEST KAYDI": "SIMULATION / TEST RECORD", "Konum bekleniyor…": "Waiting for location…",
    "Yükseklik m": "Altitude m", "Yer hızı km/sa": "Ground speed km/h", "Dikey hız m/s": "Vertical speed m/s", "Rüzgar yön° / km/sa": "Wind dir° / km/h", "Süre": "Duration", "Mevcut süre": "Current duration", "Yeni süre": "New duration",
    "· Mesafe": "· Distance", "· Maks. yükseklik": "· Max. altitude", "· Baro yükseklik: tarayıcıda yok, GPS kullanılıyor": "· Barometric altitude: not available in the browser, using GPS", "Toplam": "Total", "km ·": "km ·",
    "Günlük kayıt": "Daily log", "Günlük kayıtlar": "Daily logs", "Rezervasyon": "Booking", "Diğer": "Other",
    "Henüz kayıtlı uçuş yok. Harita sekmesinden Start ile uçuşu başlat.": "No saved flights yet. Start a flight with Start in the Map tab.",
    "Uçuş kaydı sürüyor. Konum arka planda alınıyor.": "Flight recording in progress. Location is being captured in the background.",
    "Uçuş kaydı sürüyor. Çıkış yaparsan uçuş durdurulup kaydedilir. Çıkmak için Çıkış'a tekrar bas.": "Flight recording in progress. If you log out the flight will be stopped and saved. Press Log out again to leave.",
    "Uçuşta bu uygulamayı açık ve ekranı uyanık tut. Arka plana almak veya ekranı kilitlemek konum kaydını durdurur (Android uygulamasında bu sorun yok).": "During a flight keep this app open and the screen awake. Sending it to the background or locking the screen stops location recording (not an issue in the Android app).",
    "Ekran uyanık tutulamıyor. Ayarlar > Ekran ve Parlaklık > Otomatik Kilit > Hiçbir Zaman yapın; ekran kilitlenirse kayıt durur.": "The screen cannot be kept awake. Set Settings > Display & Brightness > Auto-Lock > Never; if the screen locks, recording stops.",
    "Bu pencerede kalıcı depolama kullanılamıyor: kayıtlar yalnızca sayfa açıkken saklanır. GPX dosyalarını hemen paylaşın veya indirin.": "Persistent storage is not available in this window: records are kept only while the page is open. Share or download the GPX files right away.",
    "Kayıtlar önce cihaza, sonra sunucuya kaydedilir; yalnızca sen görürsün.": "Records are saved to the device first, then to the server; only you can see them.",
    "Kayıtlar önce cihaza, sonra sunucuya kaydedilir;": "Records are saved to the device first, then to the server;", "yalnızca sen görürsün": "only you can see them", "arka planda kaldı; bu sürelerde konum kaydedilmedi (GPX'te iz kopuk görünür). Ekranı açık tut.": "stayed in the background; no location was recorded during that time (the GPX track will show a gap). Keep the screen on.",
    "Konum alınamıyor (GPS sinyali yok veya cihaz desteklemiyor).": "Location unavailable (no GPS signal or the device does not support it).", "Konum alınamıyor.": "Location unavailable.", "Konum başlatılamadı:": "Location could not be started:",
    "Henüz konum alınamadı. Konum iznini verin ve GPS sinyalini bekleyin.": "No location yet. Grant location permission and wait for a GPS signal.",
    "Konum izni verilmedi veya bu pencerede engelli. Tarayıcı/uygulama ayarlarından konuma izin verin. Gömülü pencerede engellenirse aşağıdaki Test konumunu kullanabilirsiniz.": "Location permission was not granted or is blocked in this window. Allow location in the browser/app settings. If blocked in an embedded window, you can use the Test location below.",
    "Konum izni verilmedi. Ayarlar > Uygulamalar > AviaDoX > İzinler > Konum > Her zaman izin ver.": "Location permission not granted. Settings > Apps > AviaDoX > Permissions > Location > Allow all the time.",
    "Konum zaman aşımına uğradı, GPS sinyali bekleniyor.": "Location timed out, waiting for a GPS signal.", "Bu cihaz/tarayıcı konum desteklemiyor. Test konumunu kullanabilirsiniz.": "This device/browser does not support location. You can use the Test location.",
    "Uçuş sürerken test konumu değiştirilemez.": "The test location cannot be changed during a flight.", "Uçuş açılamadı:": "Flight could not be opened:", "Uçuş çok kısa: kaydedilecek yeterli veri yok (en az 2 nokta).": "Flight too short: not enough data to save (at least 2 points).",
    "Yarım kalan uçuş bulundu (": "An unfinished flight was found (", "nokta). Kaydedilsin mi?": "points). Save it?", "Kurtarılamadı:": "Could not recover:", "Kaydediliyor…": "Saving…", "Kaydedildi:": "Saved:",
    "GPX dosyasını paylaş / kaydet": "Share / save GPX file", "GPX indir": "Download GPX", "GPX indirildi:": "GPX downloaded:", "GPX dosyası alınamadı:": "GPX file could not be obtained:", "GPX okunamadı": "GPX could not be read", "AviaDoX uçuş kaydı": "AviaDoX flight record",
    "Balon uçuş kaydı (GPX)": "Balloon flight record (GPX)", "Bu cihaz paylaşımı desteklemiyor, dosya indiriliyor.": "This device does not support sharing; downloading the file.", "Paylaşılamadı:": "Could not share:", "Silinemedi:": "Could not delete:",
    "Emin misin? Kırp": "Are you sure? Trim", "✂️ Kırp": "✂️ Trim", "Kırp ve kaydet": "Trim and save", "Kırpılacak süreyi dakika olarak girin.": "Enter the amount to trim in minutes.", "Çok fazla kırpılıyor: geriye en az 10 saniyelik uçuş kalmalı.": "Too much is being trimmed: at least 10 seconds of flight must remain.",
    "Kırpıldı. Yeni süre": "Trimmed. New duration", "Kırpılamadı:": "Could not trim:", "Bilinmeyen hata": "Unknown error",
    "Bu işlemde kalan:": "Remaining:",
    "NOTAM KML (şirket)": "NOTAM KML (company)", "📍 NOTAM KML yükle": "📍 Upload NOTAM KML", "NOTAM KML yüklenmedi (yönetici yükler)": "NOTAM KML not uploaded (admin uploads it)", "KML yüklenmedi (KMZ desteklenmez)": "KML not uploaded (KMZ not supported)",
    "NOTAM KML dosyasını yalnızca yönetici yükleyebilir.": "Only an admin can upload the NOTAM KML file.", "KML okunamadı.": "KML could not be read.", "KML dosyası çok büyük (en fazla 8 MB).": "KML file is too large (max 8 MB).", "KML içinde poligon, hat veya nokta bulunamadı.": "No polygon, line or point found in the KML.",
    "Geçersiz KML dosyası (KMZ ise önce KML olarak dışa aktarın)": "Invalid KML file (if it is KMZ, export it as KML first)", "⚠ NOTAM sahası içindesin:": "⚠ You are inside a NOTAM area:", "KML'ye git": "Go to KML", "Uydu görüntüsü yüklenemedi (internet veya erişim izni)": "Satellite imagery could not be loaded (internet or access permission)",
    "Uçuş kaydı": "Flight record",
    // --- hava durumu ---
    "Kapadokya (Göreme)": "Cappadocia (Göreme)", "Airgram (48 saat)": "Airgram (48 hours)", "Yağış mm": "Precip. mm", "Bulut %": "Cloud %", "Hamle kt": "Gust kt", "Sıcaklık °C": "Temp °C", "Sıcaklık": "Temperature", "Hamle (kt)": "Gust (kt)", "Görüş": "Visibility", "Yüzey rüzgârı (kt)": "Surface wind (kt)",
    "Güncelleme:": "Updated:", "otomatik yenilenir": "refreshes automatically", "Renkler:": "Colors:", "Hava verisi alınamadı. İnternet bağlantını kontrol et.": "Weather data could not be fetched. Check your internet connection.", "Güncellenemedi, eski veri gösteriliyor.": "Could not update, showing old data.",
    "Kutu içi sayı: rüzgâr hızı (knot). Ok: rüzgârın gittiği yön. Yatay kaydır →": "Number in box: wind speed (knots). Arrow: direction the wind is blowing toward. Scroll horizontally →",
    "Veri: Open-Meteo model tahminidir. Uçuş kararı için resmî kaynakları (MGM, SHGM/DHMİ) ve sorumlu pilotun değerlendirmesini esas alın.": "Data: Open-Meteo model forecast. For flight decisions rely on official sources (MGM, SHGM/DHMİ) and the pilot in command's assessment.",
    "MGM Kapadokya airgramı ↗": "MGM Cappadocia airgram ↗", "METAR / TAF (LTAZ)": "METAR / TAF (LTAZ)", "TAF şu an alınamadı": "TAF is not available right now", "Kaynak: Slot Merkezi sayfası (HEZARFEN Rasat)": "Source: Slot Center page (HEZARFEN Rasat)",
    // --- slot merkezi ---
    "Kapadokya Slot Merkezi": "Cappadocia Slot Center", "Güncelleme": "Update", "Henüz veri yok": "No data yet", "UÇULABİLİR": "FLYABLE", "UÇULMAZ": "NO FLIGHT", "UÇULMAZ (sarı bayrak)": "NO FLIGHT (yellow flag)",
    "Veri bekleniyor… (ilk güncelleme birkaç dakika sürebilir)": "Waiting for data… (the first update may take a few minutes)", "Bildirim": "Notification", "Slot kararı değiştiğinde haber ver": "Notify me when the slot decision changes",
    "🔔 Bildirimleri aç": "🔔 Enable notifications", "🔕 Bildirimi kapat": "🔕 Turn off notifications", "Bu tarayıcı bildirimi desteklemiyor.": "This browser does not support notifications.", "İzin verilmedi. Tarayıcı/telefon ayarlarından bildirimlere izin ver.": "Permission was not granted. Allow notifications in browser/phone settings.",
    "Bildirim açılamadı:": "Notifications could not be enabled:", "Slot Merkezi bildirimleri açıldı ✔": "Slot Center notifications enabled ✔", "🔔 Slot Merkezi güncellendi": "🔔 Slot Center updated", "Slot Merkezi sayfası ↗": "Slot Center page ↗",
    "Kırmızı/sarı bayrak: kalkış izni verilmez. Yeşilde nihai uçuş kararı pilot ve işletmeye aittir. Bilgi resmî sayfadan otomatik alınır ve gecikebilir; resmî kaynağı esas alın.": "Red/yellow flag: no takeoff clearance. On green, the final flight decision rests with the pilot and operator. Information is fetched automatically from the official page and may be delayed; rely on the official source.",
    "Son kontrol:": "Last check:", "Geçerli:": "Valid:", "Sektör": "Sector", "Bölge": "Region",
    "Android uygulamasında (APK) arka plan bildirimi henüz yok; uygulama açıkken sayfa anlık güncellenir. Bildirim için telefonda tarayıcıdan siteyi ana ekrana ekleyebilirsin.": "The Android app (APK) has no background notifications yet; the page updates live while the app is open. For notifications, add the site to your home screen from the phone browser.",
    "ile ekleyip ana ekran simgesinden aç (iOS 16.4+), sonra bu butonu kullan.": "then open it from the home screen icon (iOS 16.4+), and use this button.", "Ana Ekrana Ekle": "Add to Home Screen", "Paylaş ▸": "Share ▸",
    "iPhone'da bildirim için uygulamayı Safari ▸ Paylaş ▸": "For notifications on iPhone, add the app via Safari ▸ Share ▸",
    "iPhone\\'da bildirim için uygulamayı Safari ▸ Paylaş ▸": "For notifications on iPhone, add the app via Safari ▸ Share ▸",
    // --- uyarılar ---
    "Bu hafta": "This week", "Veriden sorumlu yönetici": "Data manager (full admin)", "Uçuş işletme yöneticisi": "Flight operations manager", "Yer işletme yöneticisi": "Ground operations manager", "Kalite yöneticisi": "Quality manager",
    "Rol atayabilir ya da erişimi kaldırabilirsin.": "You can assign roles or remove access.",
    "Şirketini seç": "Select your company", "Tür": "Type", "(kaynak:": "(source:", "➕ Bakım kaydı ekle": "➕ Add maintenance record", "Örn. 100 saatlik bakım, burner conta değişimi": "E.g. 100-hour maintenance, burner gasket replacement",
    "yönetici": "admin", "saat": "hours", "gün": "days", "✏️ Bilgileri düzenle (yönetici)": "✏️ Edit info (admin)", "100 saatlik bakımdan beri uçulan saat": "Hours flown since the 100-hour maintenance",
    "(her satıra bir tane)": "(one per line)", "🗑 Balonu çıkar": "🗑 Remove balloon", "Uçuş saati ekle": "Add flight hours", "aylık çizelge": "monthly schedule", "Çalışma süresi (saat)": "Duty time (hours)", "Uçuş süresi (saat)": "Flight time (hours)",
    "personel kaydı bağlı değil": "no staff record linked", "personel kaydı bağlı": "staff record linked", "Kullanıcı": "User", "Erişimi kaldır": "Remove access", "Onay için SİL yaz": "Type SİL to confirm",
    "Çalıştığın şirketin adı (tam ve doğru yaz)": "Name of the company you work for (type it fully and correctly)", "Kullanıcı adı (küçük harf, rakam, . _ -)": "Username (lowercase letters, digits, . _ -)",
    "Parola (en az 8 karakter)": "Password (at least 8 characters)", "Parola (tekrar)": "Password (repeat)", "Tarih": "Date", "Tescil": "Registration", "Balon": "Balloon", "Kullanıcı yok.": "No users.", "Bekleyen istek yok.": "No pending requests.",
    "Kayıt yok.": "No records.", "Bu ay kayıt yok.": "No records this month.", "Vazgeç": "Cancel", "Başvurun reddedildi. Şirket adını kontrol edip tekrar başvurabilirsin.": "Your application was rejected. Check the company name and apply again.",
    "Hesabın henüz bir şirkete bağlı değil. Çalıştığın şirketin adını yazıp başvur.": "Your account is not linked to a company yet. Enter the name of the company you work for and apply.", "Şirket adı (tam ve doğru yaz)": "Company name (type it fully and correctly)",
    "Son bakım tarihi": "Last maintenance date", "Alana gidildi, uçuş iptal ·": "Went to field, flight cancelled ·", "🗑 Kaydı sil": "🗑 Delete record", "✏️ Kaydı düzenle": "✏️ Edit record", "📁 Arşivlenmiş ay: sadece görüntülenir.": "📁 Archived month: view only.",
    "Baştan (dk)": "From start (min)", "Sondan (dk)": "From end (min)", "✂️ Uçuşu kırp": "✂️ Trim flight", "Uçuşu kırp": "Trim flight", "Silmek istediğin süreyi dakika olarak yaz (örn. 5 veya 2.5). Geri alınamaz.": "Enter the number of minutes to remove (e.g. 5 or 2.5). Cannot be undone.",
    "Yakınlaştır": "Zoom in", "Uzaklaştır": "Zoom out", "Rüzgar yön": "Wind dir", "Senkron uyarısı:": "Sync warning:", "sınırına": "boundary", "m kaldı": "m left", "Kayıtlar": "Records", "gün sonra otomatik silinir.": "days, then deleted automatically.",
    "⚠": "⚠", "(adsız)": "(unnamed)", "(arşiv)": "(archive)", "(güncel)": "(current)", "(silinmiş)": "(deleted)", "kayıt ·": "records ·", "İyi": "Good", "Gecikti": "Overdue", "özeti": "summary", "Evet": "Yes", "Hayır": "No", "İptal": "Cancel", "Kaydet": "Save", "Güncelle": "Update"
  };
  const L = "A-Za-zÇĞİÖŞÜçğıöşü0-9";
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const keys = Object.keys(D).sort((a, b) => b.length - a.length);
  const big = new RegExp(keys.map(k => (/^[A-Za-zÇĞİÖŞÜçğıöşü]/.test(k) ? `(?<![${L}])` : "") + esc(k) + (/[A-Za-zÇĞİÖŞÜçğıöşü]$/.test(k) ? `(?![${L}])` : "")).join("|"), "g");
  function tx(s) {
    if (lang === "tr" || !s || typeof s !== "string") return s;
    if (!/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(s)) return s;
    let o = s;
    for (const [r, v] of RX) o = o.replace(r, v);
    return o.replace(big, m => D[m] != null ? D[m] : m);
  }
  const ATTR = ["placeholder", "title", "aria-label", "alt"];
  const SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 0 };
  function walk(n) {
    if (lang === "tr") return;
    if (n.nodeType === 3) { const p = n.parentNode; if (p && SKIP[p.nodeName]) return; const v = n.nodeValue, t = tx(v); if (t !== v) n.nodeValue = t; return; }
    if (n.nodeType !== 1 || SKIP[n.nodeName]) return;
    if (n.nodeName === "OPTION" && !n.hasAttribute("value")) n.setAttribute("value", n.textContent);
    for (const a of ATTR) if (n.hasAttribute(a)) { const v = n.getAttribute(a), t = tx(v); if (t !== v) n.setAttribute(a, t); }
    for (let c = n.firstChild; c; c = c.nextSibling) walk(c);
  }
  let mo = null;
  function init() {
    document.documentElement.lang = lang;
    applyTheme();
    if (lang === "tr" || mo) return;
    mo = new MutationObserver(ms => {
      mo.disconnect();
      try {
        for (const m of ms) {
          if (m.type === "childList") m.addedNodes.forEach(walk);
          else if (m.type === "characterData") walk(m.target);
          else if (m.type === "attributes") { const v = m.target.getAttribute(m.attributeName), t = tx(v); if (v && t !== v) m.target.setAttribute(m.attributeName, t); }
        }
      } finally { mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR }); }
    });
    walk(document.body);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
    if (document.title) document.title = tx(document.title);
  }
  const _alert = window.alert.bind(window), _confirm = window.confirm.bind(window);
  window.alert = m => _alert(tx(String(m)));
  window.confirm = m => _confirm(tx(String(m)));

  function applyTheme() {
    const r = document.documentElement;
    if (theme === "light" || theme === "dark") r.setAttribute("data-theme", theme); else r.removeAttribute("data-theme");
    const dark = theme === "dark" || (theme === "auto" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
    let m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", dark ? "#08121f" : "#0b3d91");
  }
  function refresh() { if (typeof S !== "undefined" && S && S.user && typeof render === "function") render(); else location.reload(); }
  function setLang(l) { lang = l === "en" ? "en" : "tr"; put(LK, lang); if (lang === "tr") location.reload(); else { init(); refresh(); } }
  function setTheme(t) { theme = ["light", "dark"].includes(t) ? t : "auto"; put(TK, theme); applyTheme(); }
  function controls(compact) {
    const sel = (id, v, opts, fn) => `<select id="${id}" onchange="${fn}(this.value)" style="${compact ? "width:auto;margin:0;padding:8px" : ""}">${opts.map(([k, t]) => `<option value="${k}"${k === v ? " selected" : ""}>${t}</option>`).join("")}</select>`;
    const sL = sel("lg_", lang, [["tr", "Türkçe"], ["en", "English"]], "I18N.setLang"), sT = sel("th_", theme, [["auto", "Otomatik (cihaz)"], ["light", "Açık"], ["dark", "Koyu"]], "I18N.setTheme");
    return compact ? `<div style="display:flex;gap:8px;justify-content:center;margin-top:14px">${sL}${sT}</div>`
      : `<div class="card"><b>🎨 Görünüm ve dil</b><div style="height:8px"></div><label class="mu">Dil</label>${sL}<label class="mu">Tema</label>${sT}</div>`;
  }
  if (document.readyState === "loading") { applyTheme(); document.addEventListener("DOMContentLoaded", init); } else init();
  return { tx, setLang, setTheme, controls, get lang() { return lang; }, get theme() { return theme; } };
})();
const tx = I18N.tx;
