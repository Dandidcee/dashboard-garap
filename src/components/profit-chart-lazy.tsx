"use client";

import dynamic from "next/dynamic";

/** Recharts itu berat — baru diunduh pas beneran mau dipake, bukan ikut nimbun bundle awal. */
export const ProfitChartLazy = dynamic(() => import("./profit-chart").then((m) => m.ProfitChart), {
  ssr: false,
  loading: () => <div className="h-[220px] animate-pulse rounded-lg bg-muted" />,
});
