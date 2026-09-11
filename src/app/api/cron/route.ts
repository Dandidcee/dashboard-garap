import { NextResponse } from "next/server";
import webpush from "web-push";
import { db } from "@/lib/db";
import { getProjects, getSettings, getPantauan } from "@/lib/queries";
import { hitungDue, hitungDuePantauan } from "@/lib/due";
import { jamLokal } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function siapkanVapid() {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:admin@example.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
}

async function kirim(sub: unknown, judul: string, isi: string, url = "/") {
  siapkanVapid();
  await webpush.sendNotification(
    sub as webpush.PushSubscription,
    JSON.stringify({ title: judul, body: isi, url }),
    { urgency: "high" }
  );
}

/** true kalau langganan push-nya udah gak valid lagi (dan sekalian dibersihin). */
async function langgananKedaluwarsa(e: unknown) {
  const status = (e as { statusCode?: number }).statusCode;
  if (status !== 404 && status !== 410) return false;
  await db().query("update settings set push_subscription=null where id=1");
  return true;
}

/**
 * Dipanggil Vercel Cron tiap jam.
 * Tiap jenis garapan punya jam notifnya sendiri di tabel settings,
 * jadi cron cuma bertugas ngecek "sekarang udah jamnya belum".
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const settings = await getSettings();

  if (!settings.push_subscription) {
    return NextResponse.json({ skip: "notifikasi belum dinyalakan di perangkat mana pun" });
  }

  // Tombol "kirim notif percobaan" di halaman pengaturan
  if (url.searchParams.get("test")) {
    await kirim(settings.push_subscription, "Notifikasi aktif", "Kalau ini muncul, pengingat lo bakal jalan.", "/");
    return NextResponse.json({ ok: true, test: true });
  }

  const auth = req.headers.get("authorization");
  const dariVercel = req.headers.get("x-vercel-cron") !== null;
  if (!dariVercel && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const jam = jamLokal(settings.timezone, now);
  const projects = await getProjects();
  const due = hitungDue(projects, settings, now);
  const pantauan = await getPantauan();
  const duePantauan = hitungDuePantauan(pantauan, settings, now);

  const jamPerJenis: Record<string, number> = {
    testnet: settings.testnet_jam,
    daily: settings.daily_jam,
    general: settings.daily_jam,
  };

  const dikirim: string[] = [];

  for (const { project: p, alasan } of due) {
    if (p.jenis === "nft") {
      // NFT diingetin berulang tiap cron jalan (idealnya tiap 30 menit) sampai dikonfirmasi.
      if (p.fields.mint_ack) continue;
      if (p.last_notif && now.getTime() - new Date(p.last_notif).getTime() < 25 * 60_000) continue;
    } else {
      if (jamPerJenis[p.jenis] !== jam) continue;
      // sudah dinotif dalam 12 jam terakhir? lewati
      if (p.last_notif && now.getTime() - new Date(p.last_notif).getTime() < 12 * 3_600_000) continue;
    }

    const judul =
      p.jenis === "nft" ? `Mint ${p.nama}` :
      p.jenis === "daily" ? `Garapan harian: ${p.nama}` :
      `Waktunya transaksi: ${p.nama}`;

    try {
      await kirim(settings.push_subscription, judul, alasan, p.fields.mint_link || p.link || "/");
      await db().query("update projects set last_notif=$2 where id=$1", [p.id, now.toISOString()]);
      dikirim.push(p.nama);
    } catch (e) {
      if (await langgananKedaluwarsa(e)) {
        return NextResponse.json({ error: "langganan kedaluwarsa, nyalakan ulang di Pengaturan" }, { status: 200 });
      }
    }
  }

  for (const p of settings.pantauan_jam === jam ? duePantauan : []) {
    if (p.last_notif && now.getTime() - new Date(p.last_notif).getTime() < 12 * 3_600_000) continue;

    try {
      await kirim(settings.push_subscription, "Pantauan hari ini", `Cek @${p.handle}`, `https://x.com/${p.handle}`);
      await db().query("update pantauan set last_notif=$2 where id=$1", [p.id, now.toISOString()]);
      dikirim.push(`@${p.handle}`);
    } catch (e) {
      if (await langgananKedaluwarsa(e)) {
        return NextResponse.json({ error: "langganan kedaluwarsa, nyalakan ulang di Pengaturan" }, { status: 200 });
      }
    }
  }

  return NextResponse.json({ jam, total_due: due.length + duePantauan.length, dikirim });
}
