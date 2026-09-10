import type { Config } from "@netlify/functions";

/**
 * Netlify Scheduled Function. Gantinya vercel.json cron di Vercel —
 * cuma manggil /api/cron yang beneran ngirim notifikasinya, logikanya
 * tetep di satu tempat (src/app/api/cron/route.ts).
 */
export default async () => {
  const base = process.env.URL || process.env.DEPLOY_PRIME_URL;
  if (!base) return new Response("Site URL belum kebaca", { status: 500 });

  const res = await fetch(`${base}/api/cron`, {
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  return new Response(await res.text(), { status: res.status });
};

export const config: Config = {
  schedule: "*/30 * * * *",
};
