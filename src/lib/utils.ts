import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Ambil pesan error asli (server action / database) buat ditampilin di toast, biar gak "gagal, coba lagi" doang. */
export function pesanError(e: unknown, fallback: string) {
  if (e instanceof Error && e.message) return e.message;
  return fallback;
}

export function rupiah(n: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n || 0);
}

/** Jam berapa sekarang di timezone user (0-23). */
export function jamLokal(tz: string, at: Date = new Date()) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: tz }).format(at)
  );
}

/** Tanggal lokal dalam format YYYY-MM-DD. */
export function tanggalLokal(tz: string, at: Date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(at);
}

/** "@handle", "x.com/handle", "https://twitter.com/handle/" dll -> "handle" polos. */
export function bersihkanHandle(raw: string) {
  let h = raw.trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^(www\.)?(x\.com|twitter\.com)\//i, "")
    .replace(/^@/, "");
  const potong = h.search(/[/?#]/);
  if (potong !== -1) h = h.slice(0, potong);
  return h.trim();
}
