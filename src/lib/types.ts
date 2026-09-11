export type Jenis = "testnet" | "nft" | "retro" | "general" | "daily";
export type Status = "belum" | "digarap" | "selesai" | "drop";
export type WlStatus = "gtd" | "fcfs" | "wl" | "belum";

export type NftFields = {
  wl_status?: WlStatus;
  mint_price?: number;
  mint_date?: string | null;
  mint_link?: string;
  /** true = user udah konfirmasi, notif berulang berhenti sampai tanggal mint diubah lagi */
  mint_ack?: boolean;
};

export type TestnetFields = { interval_hari?: number };

export type Wallet = {
  id: string;
  label: string;
  address: string | null;
  chain: string | null;
  catatan: string | null;
};

export type CredentialFolder = {
  id: string;
  nama: string;
  created_at: string;
  jumlah: number;
};

export type Credential = {
  id: string;
  folder_id: string;
  akun: string;
  website: string | null;
  sandi: string;
  created_at: string;
};

export type LedgerEntry = {
  id: string;
  project_id: string;
  tanggal: string;
  tipe: "modal" | "cair";
  jumlah: number;
  catatan: string | null;
};

export type Project = {
  id: string;
  nama: string;
  jenis: Jenis;
  status: Status;
  link: string | null;
  catatan: string | null;
  fields: NftFields & TestnetFields;
  last_done_at: string | null;
  last_notif: string | null;
  created_at: string;
  wallets: Wallet[];
  modal: number;
  cair: number;
  profit: number;
};

export type Settings = {
  timezone: string;
  testnet_jam: number;
  testnet_interval_hari: number;
  daily_jam: number;
  /** berapa jam sebelum jadwal mint notif NFT mulai dikirim (bukan lagi jam-of-day) */
  nft_jam: number;
  push_subscription: unknown | null;
};

export const LABEL_JENIS: Record<Jenis, string> = {
  testnet: "Testnet",
  nft: "NFT",
  retro: "Retro",
  general: "General",
  daily: "Daily",
};

export const LABEL_STATUS: Record<Status, string> = {
  belum: "Belum digarap",
  digarap: "Lagi digarap",
  selesai: "Selesai",
  drop: "Di-drop",
};

export const LABEL_WL: Record<WlStatus, string> = {
  gtd: "GTD",
  fcfs: "FCFS",
  wl: "WL",
  belum: "Belum dapat WL",
};
