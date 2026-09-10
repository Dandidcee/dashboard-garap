"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, ListChecks, Wallet, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { LiveClock } from "@/components/live-clock";

const menu = [
  { href: "/", label: "Ringkasan", icon: LayoutGrid },
  { href: "/projects", label: "Garapan", icon: ListChecks },
  { href: "/wallets", label: "Wallet", icon: Wallet },
  { href: "/settings", label: "Pengaturan", icon: Settings2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  return (
    <div className="min-h-dvh md:flex">
      {/* Desktop: sidebar — nempel diem pas konten di sebelahnya di-scroll */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 overflow-y-auto border-r border-border/60 p-4 md:block">
        <div className="mb-8 px-2">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-extrabold leading-tight tracking-tight">Rekap Airdrop</p>
            <ThemeToggle />
          </div>
          <LiveClock />
        </div>
        <nav className="space-y-1">
          {menu.map((m) => {
            const aktif = path === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  aktif ? "bg-secondary font-semibold text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                )}
              >
                <m.icon className="size-4" />
                {m.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile: top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/60 bg-background/95 px-4 py-3 backdrop-blur md:hidden">
        <p className="text-base font-extrabold tracking-tight">Rekap Airdrop</p>
        <div className="flex items-center gap-3">
          <LiveClock compact />
          <ThemeToggle />
        </div>
      </header>

      <div className="min-w-0 flex-1 pb-24 md:pb-8">
        <div className="mx-auto max-w-screen-2xl px-4 py-5 md:px-10 md:py-8">{children}</div>
      </div>

      {/* Mobile: tab bar bawah */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur md:hidden">
        <div className="flex" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
          {menu.map((m) => {
            const aktif = path === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
                  aktif ? "text-primary" : "text-muted-foreground"
                )}
              >
                <m.icon className="size-5" />
                {m.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Judul({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{children}</h1>
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    </header>
  );
}
