# Rekap Airdrop

Dashboard pribadi buat nyatet garapan airdrop: testnet, NFT, general, dan daily.
Punya pengingat otomatis lewat notifikasi HP, rekap profit per bulan/tahun, dan pencarian project.

---

## Yang perlu disiapin

- Node 20+
- Akun Supabase (free tier cukup)
- Akun Vercel (free tier cukup, sekaligus buat penjadwal notifikasi)

## Pemasangan

### 1. Install

```bash
npm install
```

### 2. Bikin komponen shadcn

Komponen dasar shadcn sengaja tidak ikut di repo ini supaya versinya selalu ikut versi terbaru.
Jalanin sekali:

```bash
npx shadcn@latest add button input label textarea select tabs badge dialog drawer dropdown-menu sonner card
```

Kalau ditanya soal menimpa `components.json` atau `globals.css`, **pilih no** — dua file itu sudah disetel tema navy-emas.

### 3. Database

Buka Supabase → **SQL Editor** → **New query** → tempel isi `supabase/schema.sql` → **Run**.

### 4. Isi environment

```bash
cp .env.example .env.local
```

Isi yang perlu:

| Variabel | Ambil dari |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | halaman yang sama, bagian `service_role` |
| `APP_PASSWORD` | bebas, ini password buat masuk dashboard |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | `mailto:` + email lo |
| `CRON_SECRET` | bebas |

### 5. Jalanin

```bash
npm run dev
```

### 6. Deploy

Push ke GitHub → import di Vercel → salin semua isi `.env.local` ke **Environment Variables** → Deploy.
`vercel.json` sudah mendaftarkan cron tiap jam, otomatis aktif setelah deploy pertama.

### 7. Nyalain notifikasi di HP

1. Buka URL Vercel-nya di **Chrome Android**
2. Menu titik tiga → **Add to Home screen** (biar jalan kayak aplikasi)
3. Buka dari home screen → **Pengaturan** → **Nyalakan**
4. Tekan **Kirim notif percobaan** buat mastiin

---

## Cara kerja pengingat

Cron jalan tiap 30 menit. Testnet, daily, dan general dicek terhadap jam notifikasi yang
diatur di halaman Pengaturan (kirim sekali, lalu jeda 12 jam). NFT dicek beda: begitu
waktu sekarang masuk window "berapa jam sebelum mint" (diatur di Pengaturan, per jenis,
bukan per jam-of-day), notifnya dikirim ulang **tiap kali cron jalan (±30 menit)** sampai
lo tekan tombol **Konfirmasi** di dashboard. Ubah tanggal mint project itu lagi bakal
nyalain ulang notifnya.

| Jenis | Kapan dianggap jatuh tempo |
|---|---|
| **Testnet** | transaksi terakhir udah lewat X hari (default 3, bisa diatur per project) |
| **Daily** | belum ditandai digarap hari ini |
| **NFT** | sekarang udah masuk window "X jam sebelum mint" dan belum dikonfirmasi |
| **General** | tidak dijadwalkan, cuma dicatat |

Notifnya bisa diklik langsung ke link project. Di dashboard, tiap garapan testnet/daily
punya tombol **Garap** yang nge-reset hitungan; garapan NFT punya tombol **Konfirmasi**
yang menghentikan notif berulang.

> Vercel Hobby (free) tier membatasi cron ke sekali per hari untuk beberapa akun — kalau
> notif 30 menitan ini gak konsisten kekirim di production, cek plan Vercel-nya (Pro
> ngedukung jadwal cron sesering ini tanpa batasan itu).

## Kenapa profit disimpan di tabel terpisah

Tabel `ledger` nyimpen tiap pemasukan dan pengeluaran beserta tanggalnya, bukan satu angka
di project. Satu project bisa cair berkali-kali di bulan berbeda — kalau cuma satu kolom,
rekap bulanan dan tahunan gak mungkin dihitung. Angka profit di kartu project dijumlah
otomatis dari tabel ini.

## Struktur

```
src/
  app/
    page.tsx              ringkasan: yang perlu digarap + profit
    projects/page.tsx     daftar garapan, filter per jenis, pencarian
    wallets/page.tsx      wallet dipakai lintas garapan
    settings/page.tsx     jam notifikasi tiap jenis
    actions.ts            semua operasi tulis ke database
    api/cron/route.ts     pengirim notifikasi
  lib/
    due.ts                penentu jatuh tempo — dipakai layar & cron, jadi selalu sama
    queries.ts            baca data
supabase/schema.sql
```

## Catatan

- Aplikasi ini single-user. Service role key hanya dipakai di server, jangan pernah dibawa ke client.
- Login cuma password sederhana lewat cookie. Kalau mau lebih ketat, pasang Vercel Authentication di Project Settings.
- Notifikasi tersimpan per perangkat. Kalau ganti HP, nyalain ulang dari halaman Pengaturan.
