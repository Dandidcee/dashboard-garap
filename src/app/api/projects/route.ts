import { NextResponse } from "next/server";
import { simpanProject } from "@/app/actions";
import type { Jenis, Status } from "@/lib/types";

export const dynamic = "force-dynamic";

const JENIS_VALID: Jenis[] = ["testnet", "nft", "retro", "general", "daily"];
const STATUS_VALID: Status[] = ["belum", "digarap", "selesai", "drop"];

/**
 * Endpoint buat script eksternal nambah/update project lewat JSON.
 * Auth: header "Authorization: Bearer <PROJECTS_API_KEY>".
 *
 * Body:
 *   { "nama": "...", "jenis": "testnet|nft|retro|general|daily",
 *     "status"?: "belum|digarap|selesai|drop", "link"?: "...", "catatan"?: "...",
 *     "walletIds"?: ["uuid", ...], "fields"?: {...} }
 * Sertain "id" (uuid project yang udah ada) buat update, bukan bikin baru.
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (!process.env.PROJECTS_API_KEY || auth !== `Bearer ${process.env.PROJECTS_API_KEY}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "body harus JSON valid" }, { status: 400 });
  }

  const nama = typeof body.nama === "string" ? body.nama.trim() : "";
  if (!nama) return NextResponse.json({ error: "nama wajib diisi" }, { status: 400 });

  const jenis = body.jenis as Jenis;
  if (!JENIS_VALID.includes(jenis)) {
    return NextResponse.json({ error: `jenis harus salah satu dari: ${JENIS_VALID.join(", ")}` }, { status: 400 });
  }

  const status = STATUS_VALID.includes(body.status as Status) ? (body.status as Status) : "belum";
  const walletIds = Array.isArray(body.walletIds)
    ? body.walletIds.filter((x): x is string => typeof x === "string")
    : [];
  const fields =
    typeof body.fields === "object" && body.fields !== null ? (body.fields as Record<string, unknown>) : {};

  try {
    const { id } = await simpanProject({
      id: typeof body.id === "string" ? body.id : undefined,
      nama,
      jenis,
      status,
      link: typeof body.link === "string" ? body.link : undefined,
      catatan: typeof body.catatan === "string" ? body.catatan : undefined,
      walletIds,
      fields,
    });
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
