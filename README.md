# Rekap Airdrop

Dashboard pribadi buat nyatet garapan airdrop: testnet, NFT, general, dan daily.
Punya pengingat otomatis lewat notifikasi HP, rekap profit per bulan/tahun, dan pencarian project.

---

## Yang perlu disiapin

- Node 20+
- Server Postgres (14+) — bisa di VPS sendiri, atau lokal buat development

## Pemasangan

### 1. Install

```bash
npm install
```

### 2. Bikin komponen shadcn

Komponen dasar shadcn sengaja tidak ikut di repo ini supaya versinya selalu ikut versi terbaru.
Jalanin sekali:

```bash
npx shadcn@latest add button input label textarea select tabs badge dialog drawer dropdown-menu sonner card alert-dialog
```

Kalau ditanya soal menimpa `components.json` atau `globals.css`, **pilih no** — dua file itu sudah disetel tema navy-emas.

### 3. Database

Bikin database Postgres kosong (`createdb airdrop` atau lewat panel VPS-nya), terus jalanin schema-nya:

```bash
psql "postgres://user:password@host:5432/airdrop" -f db/schema.sql
```

### 4. Isi environment

```bash
cp .env.example .env.local
```

Isi yang perlu:

| Variabel | Ambil dari |
|---|---|
| `DATABASE_URL` | connection string Postgres kamu, format `postgres://user:pass@host:5432/db` |
| `APP_PASSWORD` | bebas, ini password buat masuk dashboard |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` |
| `VAPID_SUBJECT` | `mailto:` + email lo |
| `CRON_SECRET` | bebas, dipakai buat manggil `/api/cron` dari luar |
| `PROJECTS_API_KEY` | bebas, dipakai script eksternal buat nambah/update garapan lewat `/api/projects` |

### 5. Jalanin

```bash
npm run dev
```

### 6. Deploy ke VPS

```bash
npm run build
npm run start   # jalan di port 3000, taruh di belakang nginx/reverse proxy
```

Enaknya pakai process manager biar tetep jalan abis restart server, misal `pm2`:

```bash
pm2 start npm --name rekap-airdrop -- run start
pm2 save
```

**Cron notifikasi** gak ada di VPS biasa (beda sama Vercel/Netlify yang punya scheduled function bawaan) —
daftarin sendiri lewat `crontab -e`:

```cron
*/30 * * * * curl -s -H "Authorization: Bearer ISI_CRON_SECRET_DI_SINI" https://domain-kamu.com/api/cron
```

### 7. Nyalain notifikasi di HP

1. Buka URL domain kamu di **Chrome Android**
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

> Di VPS, notif 30-menitan ini seakurat cron job yang kamu daftarin (lihat bagian Deploy ke VPS
> di atas) — gak ada batasan platform kayak di Vercel/Netlify.

## Kenapa profit disimpan di tabel terpisah

Tabel `ledger` nyimpen tiap pemasukan dan pengeluaran beserta tanggalnya, bukan satu angka
di project. Satu project bisa cair berkali-kali di bulan berbeda — kalau cuma satu kolom,
rekap bulanan dan tahunan gak mungkin dihitung. Angka profit di kartu project dijumlah
otomatis dari tabel ini.

## Nambah/update garapan dari luar

`POST /api/projects` nerima JSON dari script eksternal (misal automasi testnet), dilindungi API key:

```bash
curl -X POST https://domain-kamu.com/api/projects \
  -H "Authorization: Bearer ISI_PROJECTS_API_KEY_DI_SINI" \
  -H "Content-Type: application/json" \
  -d '{
    "nama": "Monad",
    "jenis": "testnet",
    "status": "digarap",
    "walletIds": ["uuid-wallet-yang-udah-ada"],
    "fields": { "interval_hari": 3 }
  }'
```

Sertain `"id"` (uuid project yang udah ada) buat update, bukan bikin baru. `jenis` wajib salah satu dari
`testnet | nft | retro | general | daily`. Balesnya `{ "ok": true, "id": "..." }`.

## Struktur

```
src/
  app/
    (dashboard)/
      page.tsx             ringkasan: yang perlu digarap + profit
      projects/page.tsx    daftar garapan, filter per jenis & status, pencarian
      wallets/page.tsx     wallet dipakai lintas garapan
      settings/page.tsx    jam notifikasi tiap jenis
    actions.ts             semua operasi tulis ke database (Server Actions)
    api/cron/route.ts      pengirim notifikasi
    api/projects/route.ts  endpoint buat script eksternal
  lib/
    db.ts                  koneksi Postgres (pg) + helper transaksi
    due.ts                 penentu jatuh tempo — dipakai layar & cron, jadi selalu sama
    queries.ts             baca data
db/schema.sql
```

## Catatan

- Aplikasi ini single-user. `DATABASE_URL` dan `PROJECTS_API_KEY` cuma dipakai di server, jangan pernah dibawa ke client.
- Login cuma password sederhana lewat cookie.
- Notifikasi tersimpan per perangkat. Kalau ganti HP, nyalain ulang dari halaman Pengaturan.
