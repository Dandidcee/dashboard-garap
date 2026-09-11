import { db } from "./db";
import type { Project, Settings, Wallet, LedgerEntry, CredentialFolder, Credential, Pantauan } from "./types";

export async function getSettings(): Promise<Settings> {
  const { rows } = await db().query("select * from settings where id = 1");
  return rows[0] as Settings;
}

export async function getWallets(): Promise<Wallet[]> {
  const { rows } = await db().query("select * from wallets order by label");
  return rows as Wallet[];
}

/** Semua project + wallet yang nempel + total modal/cair dari ledger. */
export async function getProjects(): Promise<Project[]> {
  const pool = db();
  const [projectsRes, linksRes, walletsRes, ledgerRes] = await Promise.all([
    pool.query("select * from projects order by created_at desc"),
    pool.query("select project_id, wallet_id from project_wallets"),
    pool.query("select * from wallets"),
    pool.query("select project_id, tipe, jumlah from ledger"),
  ]);

  const walletById = new Map(walletsRes.rows.map((w) => [w.id, w as Wallet]));
  const byProject = new Map<string, Wallet[]>();
  for (const l of linksRes.rows) {
    const w = walletById.get(l.wallet_id);
    if (!w) continue;
    byProject.set(l.project_id, [...(byProject.get(l.project_id) || []), w]);
  }

  const uang = new Map<string, { modal: number; cair: number }>();
  for (const r of ledgerRes.rows) {
    const cur = uang.get(r.project_id) || { modal: 0, cair: 0 };
    if (r.tipe === "modal") cur.modal += Number(r.jumlah);
    else cur.cair += Number(r.jumlah);
    uang.set(r.project_id, cur);
  }

  return projectsRes.rows.map((p) => {
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
  const { rows } = projectId
    ? await db().query("select * from ledger where project_id = $1 order by tanggal desc", [projectId])
    : await db().query("select * from ledger order by tanggal desc");
  return rows as LedgerEntry[];
}

export async function getCredentialFolders(): Promise<CredentialFolder[]> {
  const { rows } = await db().query(`
    select f.*, count(c.id)::int as jumlah
    from credential_folders f
    left join credentials c on c.folder_id = f.id
    group by f.id
    order by lower(f.nama)
  `);
  return rows as CredentialFolder[];
}

export async function getFolder(id: string): Promise<CredentialFolder | null> {
  const { rows } = await db().query(
    `select f.*, count(c.id)::int as jumlah
     from credential_folders f
     left join credentials c on c.folder_id = f.id
     where f.id = $1
     group by f.id`,
    [id]
  );
  return (rows[0] as CredentialFolder) ?? null;
}

export async function getCredentials(folderId: string): Promise<Credential[]> {
  const { rows } = await db().query(
    "select * from credentials where folder_id = $1 order by lower(akun)",
    [folderId]
  );
  return rows as Credential[];
}

export async function getPantauan(): Promise<Pantauan[]> {
  const { rows } = await db().query("select * from pantauan order by lower(handle)");
  return rows as Pantauan[];
}
