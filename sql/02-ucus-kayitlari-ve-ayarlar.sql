-- =====================================================================
-- AeroDoX: 2. SQL (1. SQL'den SONRA, SQL Editor'de bir kez çalıştır)
-- Ekler: yumuşak personel silme, şirket ayarları (logo, NOTAM KML),
--        uçuş kayıtları tablosu ve depolama izinleri.
-- =====================================================================

-- 1) Personeli silmek yerine pasife al (geçmiş çizelge ve evraklar korunur)
alter table public.staff add column if not exists active boolean not null default true;

-- 2) Şirket ayarları: logo_path zaten var; NOTAM KML yolu eklenir
alter table public.companies add column if not exists kml_path text;

-- 3) Uçuş kayıtları (GPX dosyası depoda, özet bilgi burada)
create table if not exists public.flights (
  id uuid primary key,                                   -- uygulama üretir (çevrimdışı kayıt için)
  company_id uuid not null references public.companies(id) on delete cascade,
  pilot_user uuid default auth.uid() references auth.users(id) on delete set null,
  pilot_name text,
  name text not null,                                    -- Flight_YYYY-MM-DD_HH-mm-ss.gpx
  started_at timestamptz not null,
  ended_at timestamptz not null,
  duration_sec numeric not null default 0,
  max_alt numeric,
  distance_m numeric not null default 0,
  point_count int not null default 0,
  sim boolean not null default false,                    -- test (simülasyon) kaydı
  file_path text not null,
  created_at timestamptz default now()
);
create index if not exists flights_company_started on public.flights (company_id, started_at desc);
alter table public.flights enable row level security;

drop policy if exists flights_select on public.flights;
create policy flights_select on public.flights for select to authenticated
  using (company_id = public.auth_company());

drop policy if exists flights_insert on public.flights;
create policy flights_insert on public.flights for insert to authenticated
  with check (company_id = public.auth_company() and pilot_user = auth.uid());

-- Silme: yönetici, 90 günü dolan kayıt veya kişinin kendi test kaydı
drop policy if exists flights_delete on public.flights;
create policy flights_delete on public.flights for delete to authenticated
  using (company_id = public.auth_company() and (
    public.is_admin()
    or started_at < now() - interval '90 days'
    or (sim and pilot_user = auth.uid())
  ));

-- 4) Depolama: uçuş dosyaları (<şirket>/flights/...) herhangi bir şirket üyesi silebilsin
--    (90 gün temizliği ve test kayıtları için). Evrak dosyalarını yine sadece yönetici siler.
drop policy if exists flights_files_delete on storage.objects;
create policy flights_files_delete on storage.objects for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = public.auth_company()::text
    and (storage.foldername(name))[2] = 'flights'
  );

-- 5) Personel listesinde sadece aktifleri görmek için yardımcı görünüm gerekmez;
--    uygulama active=true olanları filtreler.

-- =====================================================================
-- Kullanıcı ekleme (her yeni kullanıcı için):
--  1) Supabase > Authentication > Users > Add user > Create new user
--     E-posta: kullaniciadi@aerodox.app   (uygulamada "kullaniciadi" yazılarak girilir)
--     Parola belirle, "Auto Confirm User" işaretli olsun.
--  2) Aşağıdaki satırı çalıştır (ad, e-posta, şirket adı ve rolü değiştir):
--
-- insert into public.profiles (id, company_id, full_name, role)
-- select u.id, c.id, 'Ahmet Yılmaz', 'staff'            -- yönetici için 'admin'
-- from auth.users u, public.companies c
-- where u.email = 'ahmet@aerodox.app' and c.name = 'Göreme Balonculuk AŞ';
-- =====================================================================
