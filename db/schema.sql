-- ============================================================
-- Airdrop Dashboard - skema database
-- Jalanin: psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================

create extension if not exists "pgcrypto";

-- Wallet dipakai lintas project
create table if not exists wallets (
  id         uuid primary key default gen_random_uuid(),
  label      text not null,
  address    text,
  chain      text,
  catatan    text,
  created_at timestamptz not null default now()
);

-- Project = satu garapan airdrop
create table if not exists projects (
  id           uuid primary key default gen_random_uuid(),
  nama         text not null,
  jenis        text not null check (jenis in ('testnet','nft','retro','general','daily')),
  status       text not null default 'belum' check (status in ('belum','digarap','selesai','drop')),
  link         text,
  catatan      text,
  -- field khusus per jenis:
  --   testnet -> { "interval_hari": 3 }
  --   nft     -> { "wl_status": "gtd|fcfs|wl|belum", "mint_price": 0.05,
  --                "mint_date": "2026-09-20T13:00:00Z", "mint_link": "https://..." }
  fields       jsonb not null default '{}'::jsonb,
  last_done_at timestamptz,          -- terakhir digarap (testnet & daily)
  last_notif   timestamptz,          -- anti notif dobel
  created_at   timestamptz not null default now()
);

create table if not exists project_wallets (
  project_id uuid references projects(id) on delete cascade,
  wallet_id  uuid references wallets(id)  on delete cascade,
  primary key (project_id, wallet_id)
);

-- Tiap pemasukan / pengeluaran punya tanggal sendiri,
-- supaya rekap per bulan & per tahun bisa dihitung.
create table if not exists ledger (
  id         uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  tanggal    date not null default current_date,
  tipe       text not null check (tipe in ('modal','cair')),
  jumlah     numeric(18,2) not null,
  catatan    text,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id                    int primary key default 1 check (id = 1),
  timezone              text not null default 'Asia/Jakarta',
  testnet_jam           int  not null default 9,   -- 0-23, waktu lokal
  testnet_interval_hari int  not null default 3,
  daily_jam             int  not null default 8,
  nft_jam               int  not null default 20,
  pantauan_jam          int  not null default 8,
  push_subscription     jsonb,
  updated_at            timestamptz not null default now()
);

insert into settings (id) values (1) on conflict (id) do nothing;

-- Kredensial dikelompokin per folder (misal per project atau per kategori).
create table if not exists credential_folders (
  id         uuid primary key default gen_random_uuid(),
  nama       text not null,
  created_at timestamptz not null default now()
);

create table if not exists credentials (
  id         uuid primary key default gen_random_uuid(),
  folder_id  uuid not null references credential_folders(id) on delete cascade,
  akun       text not null,   -- username atau email
  website    text,            -- opsional
  sandi      text not null,
  created_at timestamptz not null default now()
);

-- Akun (misal X/Twitter) yang dipantau tiap hari.
create table if not exists pantauan (
  id           uuid primary key default gen_random_uuid(),
  handle       text not null,          -- tanpa @, misal "aiceking27"
  last_done_at timestamptz,            -- terakhir dipantau
  last_notif   timestamptz,            -- anti notif dobel
  created_at   timestamptz not null default now()
);

create index if not exists idx_projects_jenis    on projects (jenis);
create index if not exists idx_projects_nama     on projects (lower(nama));
create index if not exists idx_ledger_project    on ledger (project_id);
create index if not exists idx_ledger_tanggal    on ledger (tanggal);
create index if not exists idx_credentials_folder on credentials (folder_id);
create unique index if not exists idx_pantauan_handle on pantauan (lower(handle));
