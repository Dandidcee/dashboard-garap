import { Pool, types, type PoolClient } from "pg";

// pg default-nya balikin date/timestamptz sebagai objek Date dan numeric sebagai string.
// Sisa kode di app ini nganggep semuanya string/number (format lama waktu masih Supabase),
// jadi dipaksa balik ke situ di titik ini aja — gak perlu ubah query lain manapun.
types.setTypeParser(types.builtins.DATE, (v) => v);
types.setTypeParser(types.builtins.TIMESTAMPTZ, (v) => {
  if (!v) return v;
  // Postgres kadang balikin offset 2 digit doang ("+00", bukan "+00:00"), yang gak valid buat Date().
  const iso = v.replace(" ", "T").replace(/([+-]\d{2})$/, "$1:00");
  return new Date(iso).toISOString();
});
types.setTypeParser(types.builtins.NUMERIC, (v) => (v === null ? null : parseFloat(v)));

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export function db() {
  if (!globalForPg.pgPool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error("DATABASE_URL belum diisi di .env");
    globalForPg.pgPool = new Pool({ connectionString });
  }
  return globalForPg.pgPool;
}

/** Bungkus beberapa query jadi satu transaksi — commit bareng, rollback bareng kalau ada yang gagal. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db().connect();
  try {
    await client.query("begin");
    const hasil = await fn(client);
    await client.query("commit");
    return hasil;
  } catch (e) {
    await client.query("rollback");
    throw e;
  } finally {
    client.release();
  }
}
