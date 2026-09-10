"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db, withTransaction } from "@/lib/db";
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
  const nama = input.nama.trim();
  const link = input.link?.trim() || null;
  const catatan = input.catatan?.trim() || null;
  const fields = JSON.stringify(input.fields || {});

  const id = await withTransaction(async (client) => {
    let id = input.id;
    if (id) {
      await client.query(
        `update projects set nama=$1, jenis=$2, status=$3, link=$4, catatan=$5, fields=$6 where id=$7`,
        [nama, input.jenis, input.status, link, catatan, fields, id]
      );
    } else {
      const res = await client.query(
        `insert into projects (nama, jenis, status, link, catatan, fields)
         values ($1,$2,$3,$4,$5,$6) returning id`,
        [nama, input.jenis, input.status, link, catatan, fields]
      );
      id = res.rows[0].id;
    }

    await client.query(`delete from project_wallets where project_id=$1`, [id]);
    if (input.walletIds.length) {
      const placeholders = input.walletIds.map((_, i) => `($1, $${i + 2})`).join(", ");
      await client.query(
        `insert into project_wallets (project_id, wallet_id) values ${placeholders}`,
        [id, ...input.walletIds]
      );
    }

    return id as string;
  });

  segarkan();
  return { id };
}

export async function hapusProject(id: string) {
  await db().query("delete from projects where id=$1", [id]);
  segarkan();
}

/** Tombol "Udah gue garap" — reset hitungan jatuh tempo. */
export async function tandaiDigarap(id: string) {
  await db().query("update projects set last_done_at=now(), last_notif=null where id=$1", [id]);
  segarkan();
}

/** Sama kayak tandaiDigarap, tapi dipakai pas garapannya belum punya wallet — pasang walletnya sekalian. */
export async function garapDenganWallet(id: string, walletId: string) {
  await withTransaction(async (client) => {
    await client.query("insert into project_wallets (project_id, wallet_id) values ($1,$2)", [id, walletId]);
    await client.query("update projects set last_done_at=now(), last_notif=null where id=$1", [id]);
  });
  segarkan();
}

/** Tombol "Konfirmasi" di garapan NFT — menghentikan notif berulang sampai jadwal mint diubah. */
export async function konfirmasiMint(id: string, fields: Record<string, unknown>) {
  await db().query(
    "update projects set fields=$2::jsonb, last_notif=null where id=$1",
    [id, JSON.stringify({ ...fields, mint_ack: true })]
  );
  segarkan();
}

/** Tombol "Udah digarap" di dashboard — buat garapan yang munculnya cuma gara-gara status masih "belum". */
export async function ubahStatusProject(id: string, status: Status) {
  await db().query("update projects set status=$2 where id=$1", [id, status]);
  segarkan();
}

/** Sama kayak ubahStatusProject, tapi dipakai pas garapannya belum punya wallet — pasang walletnya sekalian. */
export async function ubahStatusDenganWallet(id: string, walletId: string, status: Status) {
  await withTransaction(async (client) => {
    await client.query("insert into project_wallets (project_id, wallet_id) values ($1,$2)", [id, walletId]);
    await client.query("update projects set status=$2 where id=$1", [id, status]);
  });
  segarkan();
}

/* ---------------- Wallet ---------------- */

export async function simpanWallet(input: { id?: string; label: string; address?: string; chain?: string; catatan?: string }) {
  const label = input.label.trim();
  const address = input.address?.trim() || null;
  const chain = input.chain?.trim() || null;
  const catatan = input.catatan?.trim() || null;

  if (input.id) {
    await db().query(
      "update wallets set label=$1, address=$2, chain=$3, catatan=$4 where id=$5",
      [label, address, chain, catatan, input.id]
    );
    segarkan();
    return { id: input.id };
  }

  const res = await db().query(
    "insert into wallets (label, address, chain, catatan) values ($1,$2,$3,$4) returning *",
    [label, address, chain, catatan]
  );
  segarkan();
  return { id: res.rows[0].id as string, wallet: res.rows[0] };
}

export async function hapusWallet(id: string) {
  await db().query("delete from wallets where id=$1", [id]);
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
  await db().query(
    "insert into ledger (project_id, tipe, jumlah, tanggal, catatan) values ($1,$2,$3,$4,$5)",
    [input.project_id, input.tipe, input.jumlah, input.tanggal, input.catatan?.trim() || null]
  );
  segarkan();
}

export async function hapusLedger(id: string) {
  await db().query("delete from ledger where id=$1", [id]);
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
  await db().query(
    `update settings set timezone=$1, testnet_jam=$2, testnet_interval_hari=$3, daily_jam=$4, nft_jam=$5, updated_at=now()
     where id=1`,
    [input.timezone, input.testnet_jam, input.testnet_interval_hari, input.daily_jam, input.nft_jam]
  );
  segarkan();
}
