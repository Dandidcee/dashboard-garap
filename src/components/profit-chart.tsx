"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { rupiah } from "@/lib/utils";

export function ProfitChart({ data }: { data: { periode: string; profit: number }[] }) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Grafik muncul setelah lo catat pemasukan pertama.
      </p>
    );
  }

  const label = (p: string) => {
    const [y, m] = p.split("-");
    if (!m) return y;
    return new Date(Number(y), Number(m) - 1).toLocaleDateString("id-ID", { month: "short", year: "2-digit" });
  };

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="periode" tickFormatter={label} tickLine={false} axisLine={false}
               tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
        <YAxis tickFormatter={(v) => `${Math.round(v / 1_000_000)}jt`} tickLine={false} axisLine={false}
               tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} width={44} />
        <Tooltip
          cursor={{ fill: "hsl(var(--secondary))" }}
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: 10,
            fontSize: 13,
          }}
          labelFormatter={label}
          formatter={(v: number) => [rupiah(v), "Profit"]}
        />
        <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  );
}
