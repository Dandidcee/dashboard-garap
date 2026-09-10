"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/supabase";
import type { Jenis, Status } from "@/lib/types";
import { AUTH_COOKIE, authCookieOptions } from "@/lib/auth";

function segarkan() {
  revalidatePath("/");
  revalidatePath("/projects");
  revalidatePath("/wallets");
  revalidatePath("/settings");
}

/* ---------------- Login ---------------- */

export async function login(_prev: unknown, form: FormData) {
  const password = String(form.get("password") || "");
  if (password !== process.env.APP_PASSWORD) return { error: "Password salah." };
  (await cookies()).set(AUTH_COOKIE, password, authCookieOptions());
  redirect("/");
}

export async function logout() {
  (await cookies()).delete(AUTH_COOKIE);
  redirect("/login");
}

/* ---------------- Project ---------------- */

export type ProjectInput = {
  id?: string;
  nama: string;
  jenis: Jenis;
  status: Status;
  link?: string;
  catatan?: string;
  walletIds: string[];
  fields: Record<string, unknown>;
};

export async function simpanProject(input: ProjectInput) {
  const sb = db();
  const row = {
    nama: input.nama.trim(),
    jenis: input.jenis,
    status: input.status,
    link: input.link?.trim() || null,
    catatan: input.catatan?.trim() || null,
    fields: input.fields || {},
  };

  let id = input.id;
  if (id) {
    const { error } = await sb.from("projects").update(row).eq("id", id);
    if (error) throw error;
  } else {
    const { data, error } = await sb.from("projects").insert(row).select("id").single();
    if (error) throw error;
    id = data.id;
  }

  await sb.from("project_wallets").delete().eq("project_id", id);
  if (input.walletIds.length) {
    const { error } = await sb
      .from("project_wallets")
      .insert(input.walletIds.map((wallet_id) => ({ project_id: id, wallet_id })));
    if (error) throw error;
  }

  segarkan();
  return { id: id as string };
}

export async function hapusProject(id: string) {
  const { error } = await db().from("projects").delete().eq("id", id);
  if (error) throw error;
  segarkan();
}

/** Tombol "Udah gue garap" — reset hitungan jatuh tempo. */
export async function tandaiDigarap(id: string) {
  const { error } = await db()
    .from("projects")
    .update({ last_done_at: new Date().toISOString(), last_notif: null })
    .eq("id", id);
  if (error) throw error;
  segarkan();
}

/** Sama kayak tandaiDigarap, tapi dipakai pas garapannya belum punya wallet — pasang walletnya sekalian. */
export async function garapDenganWallet(id: string, walletId: string) {
  const sb = db();
  const { error: e1 } = await sb.from("project_wallets").insert({ project_id: id, wallet_id: walletId });
  if (e1) throw e1;
  const { error: e2 } = await sb
    .from("projects")
    .update({ last_done_at: new Date().toISOString(), last_notif: null })
    .eq("id", id);
  if (e2) throw e2;
  segarkan();
}

/** Tombol "Konfirmasi" di garapan NFT — menghentikan notif berulang sampai jadwal mint diubah. */
export async function konfirmasiMint(id: string, fields: Record<string, unknown>) {
  const { error } = await db()
    .from("projects")
    .update({ fields: { ...fields, mint_ack: true }, last_notif: null })
    .eq("id", id);
  if (error) throw error;
  segarkan();
}

/** Tombol "Mulai garap" di dashboard — buat garapan yang munculnya cuma gara-gara status masih "belum". */
export async function ubahStatusProject(id: string, status: Status) {
  const { error } = await db().from("projects").update({ status }).eq("id", id);
  if (error) throw error;
  segarkan();
}

/* ---------------- Wallet ---------------- */

export async function simpanWallet(input: { id?: string; label: string; address?: string; chain?: string; catatan?: string }) {
  const sb = db();
  const row = {
    label: input.label.trim(),
    address: input.address?.trim() || null,
    chain: input.chain?.trim() || null,
    catatan: input.catatan?.trim() || null,
  };
  if (input.id) {
    const { error } = await sb.from("wallets").update(row).eq("id", input.id);
    if (error) throw error;
    segarkan();
    return { id: input.id };
  }
  const { data, error } = await sb.from("wallets").insert(row).select("*").single();
  if (error) throw error;
  segarkan();
  return { id: data.id as string, wallet: data };
}

export async function hapusWallet(id: string) {
  const { error } = await db().from("wallets").delete().eq("id", id);
  if (error) throw error;
  segarkan();
}

/* ---------------- Uang ---------------- */

export async function tambahLedger(input: {
  project_id: string;
  tipe: "modal" | "cair";
  jumlah: number;
  tanggal: string;
  catatan?: string;
}) {
  const { error } = await db().from("ledger").insert({
    project_id: input.project_id,
    tipe: input.tipe,
    jumlah: input.jumlah,
    tanggal: input.tanggal,
    catatan: input.catatan?.trim() || null,
  });
  if (error) throw error;
  segarkan();
}

export async function hapusLedger(id: string) {
  const { error } = await db().from("ledger").delete().eq("id", id);
  if (error) throw error;
  segarkan();
}

/* ---------------- Pengaturan ---------------- */

export async function simpanSettings(input: {
  timezone: string;
  testnet_jam: number;
  testnet_interval_hari: number;
  daily_jam: number;
  nft_jam: number;
}) {
  const { error } = await db()
    .from("settings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;
  segarkan();
}
