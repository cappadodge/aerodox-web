-- =====================================================================
-- AeroDoX: 3. SQL (SQL Editor'de bir kez çalıştır)
-- Balon bilgi sayfası için yeni alanlar.
-- =====================================================================
alter table public.balloons add column if not exists total_hours numeric not null default 0;  -- güncel toplam uçuş saati
alter table public.balloons add column if not exists last_maint_date date;                    -- son bakım tarihi
alter table public.balloons add column if not exists arc_start date;                          -- uçuşa elverişlilik başlangıç tarihi
alter table public.balloons add column if not exists temp_sensor_code text;                   -- ısı sensörü kodu
alter table public.balloons add column if not exists brand text;                              -- balon marka adı
alter table public.balloons add column if not exists model text;                              -- balon tip / model
alter table public.balloons add column if not exists fuel_tanks text;                         -- yakıt tankı seri numaraları (satır satır)
alter table public.balloons add column if not exists burner_serial text;                      -- burner seri numarası
alter table public.balloons add column if not exists insurance_start date;                    -- sigorta başlangıç tarihi

-- Düzenleme/silme yetkisi: yeni sütunlar için ek politika gerekmez.
-- Mevcut kurallar geçerli: balon ekleme/silme sadece yönetici, saat güncelleme şirket üyeleri.
