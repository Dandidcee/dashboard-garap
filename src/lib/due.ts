import type { Pantauan, Project, Settings } from "./types";
import { tanggalLokal } from "./utils";

export type Due = {
  project: Project;
  alasan: string;
  /** semakin kecil semakin mendesak */
  urutan: number;
  telat: boolean;
  /** true = munculnya cuma gara-gara status masih "belum", bukan jadwal jenisnya — tombol dashboard perlu ganti status, bukan tandai-digarap */
  viaStatus: boolean;
};

const HARI = 86_400_000;

/**
 * Menentukan garapan yang jatuh tempo.
 * Dipakai bareng oleh dashboard dan cron notifikasi, supaya
 * yang lo lihat di layar sama persis dengan yang dikirim ke notif.
 */
export function hitungDue(projects: Project[], s: Settings, now = new Date()): Due[] {
  const hariIni = tanggalLokal(s.timezone, now);
  const out: Due[] = [];

  for (const p of projects) {
    if (p.status === "selesai" || p.status === "drop") continue;

    let masuk = false;

    if (p.jenis === "daily") {
      const terakhir = p.last_done_at ? tanggalLokal(s.timezone, new Date(p.last_done_at)) : null;
      if (terakhir !== hariIni) {
        out.push({
          project: p,
          alasan: terakhir ? "Belum digarap hari ini" : "Belum pernah digarap",
          urutan: 0,
          telat: false,
          viaStatus: false,
        });
        masuk = true;
      }
    } else if (p.jenis === "testnet") {
      const interval = p.fields.interval_hari || s.testnet_interval_hari;
      if (!p.last_done_at) {
        out.push({ project: p, alasan: "Belum ada transaksi", urutan: 1, telat: false, viaStatus: false });
        masuk = true;
      } else {
        const lewat = Math.floor((now.getTime() - new Date(p.last_done_at).getTime()) / HARI);
        if (lewat >= interval) {
          out.push({
            project: p,
            alasan: `Terakhir transaksi ${lewat} hari lalu`,
            urutan: 2 - Math.min(lewat / 100, 1),
            telat: lewat >= interval * 2,
            viaStatus: false,
          });
          masuk = true;
        }
      }
    } else if (p.jenis === "nft") {
      const md = p.fields.mint_date ? new Date(p.fields.mint_date) : null;
      if (md) {
        const jam = (md.getTime() - now.getTime()) / 3_600_000;
        if (jam <= s.nft_jam && jam >= -2) {
          out.push({
            project: p,
            alasan: jam < 0 ? "Mint lagi jalan" : `Mint ${Math.max(1, Math.round(jam))} jam lagi`,
            urutan: -1,
            telat: false,
            viaStatus: false,
          });
          masuk = true;
        }
      }
    }

    // Belum digarap sama sekali (jenis apapun) dan belum ke-flag di atas -> tetep muncul, biar gak ketelan.
    if (!masuk && p.status === "belum") {
      out.push({ project: p, alasan: "Belum digarap", urutan: 3, telat: false, viaStatus: true });
    }
  }

  return out.sort((a, b) => a.urutan - b.urutan);
}

/** Handle yang belum dipantau hari ini — dipakai bareng dashboard dan cron, sama kayak hitungDue. */
export function hitungDuePantauan(items: Pantauan[], s: Settings, now = new Date()): Pantauan[] {
  const hariIni = tanggalLokal(s.timezone, now);
  return items.filter((p) => {
    const terakhir = p.last_done_at ? tanggalLokal(s.timezone, new Date(p.last_done_at)) : null;
    return terakhir !== hariIni;
  });
}

/** Ringkasan uang per bulan / per tahun dari tabel ledger. */
export function rekapPeriode(rows: { tanggal: string; tipe: string; jumlah: number }[], mode: "bulan" | "tahun") {
  const map = new Map<string, { modal: number; cair: number }>();
  for (const r of rows) {
    const key = mode === "bulan" ? r.tanggal.slice(0, 7) : r.tanggal.slice(0, 4);
    const cur = map.get(key) || { modal: 0, cair: 0 };
    if (r.tipe === "modal") cur.modal += Number(r.jumlah);
    else cur.cair += Number(r.jumlah);
    map.set(key, cur);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periode, v]) => ({ periode, ...v, profit: v.cair - v.modal }));
}
