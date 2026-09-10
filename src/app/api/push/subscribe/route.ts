import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";

export async function POST(req: Request) {
  const sub = await req.json();
  const { error } = await db().from("settings").update({ push_subscription: sub }).eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const { error } = await db().from("settings").update({ push_subscription: null }).eq("id", 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
