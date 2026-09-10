"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Jam jalan di sisi client — dirender kosong dulu supaya gak beda sama server pas hydration. */
export function LiveClock({ compact = false, className }: { compact?: boolean; className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <div className={cn(compact ? "h-5 w-16" : "h-10 w-28", className)} aria-hidden />;
  }

  const jam = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: compact ? undefined : "2-digit" });
  const tanggal = now.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

  if (compact) {
    return <p className={cn("text-sm font-bold tabular-nums tracking-tight text-primary", className)}>{jam}</p>;
  }

  return (
    <div className={className}>
      <p className="text-2xl font-extrabold tabular-nums tracking-tight text-primary">{jam}</p>
      <p className="text-[11px] text-muted-foreground">{tanggal}</p>
    </div>
  );
}
