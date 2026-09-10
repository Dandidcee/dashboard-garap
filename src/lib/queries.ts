import { db } from "./supabase";
import type { Project, Settings, Wallet, LedgerEntry } from "./types";

export async function getSettings(): Promise<Settings> {
  const { data, error } = await db().from("settings").select("*").eq("id", 1).single();
  if (error) throw error;
  return data as Settings;
}

export async function getWallets(): Promise<Wallet[]> {
  const { data, error } = await db().from("wallets").select("*").order("label");
  if (error) throw error;
  return (data || []) as Wallet[];
}

/** Semua project + wallet yang nempel + total modal/cair dari ledger. */
export async function getProjects(): Promise<Project[]> {
  const sb = db();
  const [{ data: projects, error: e1 }, { data: links, error: e2 }, { data: wallets, error: e3 }, { data: ledger, error: e4 }] =
    await Promise.all([
      sb.from("projects").select("*").order("created_at", { ascending: false }),
      sb.from("project_wallets").select("*"),
      sb.from("wallets").select("*"),
      sb.from("ledger").select("project_id, tipe, jumlah"),
    ]);
  for (const e of [e1, e2, e3, e4]) if (e) throw e;

  const walletById = new Map((wallets || []).map((w) => [w.id, w as Wallet]));
  const byProject = new Map<string, Wallet[]>();
  for (const l of links || []) {
    const w = walletById.get(l.wallet_id);
    if (!w) continue;
    byProject.set(l.project_id, [...(byProject.get(l.project_id) || []), w]);
  }

  const uang = new Map<string, { modal: number; cair: number }>();
  for (const r of ledger || []) {
    const cur = uang.get(r.project_id) || { modal: 0, cair: 0 };
    if (r.tipe === "modal") cur.modal += Number(r.jumlah);
    else cur.cair += Number(r.jumlah);
    uang.set(r.project_id, cur);
  }

  return (projects || []).map((p) => {
    const u = uang.get(p.id) || { modal: 0, cair: 0 };
    return {
      ...p,
      wallets: byProject.get(p.id) || [],
      modal: u.modal,
      cair: u.cair,
      profit: u.cair - u.modal,
    } as Project;
  });
}

export async function getLedger(projectId?: string): Promise<LedgerEntry[]> {
  let q = db().from("ledger").select("*").order("tanggal", { ascending: false });
  if (projectId) q = q.eq("project_id", projectId);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as LedgerEntry[];
}
