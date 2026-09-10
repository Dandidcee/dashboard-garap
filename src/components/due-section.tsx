"use client";

import { useState } from "react";
import { ChevronRight, ListChecks } from "lucide-react";
import type { Due } from "@/lib/due";
import type { Wallet } from "@/lib/types";
import { DueList } from "./due-list";
import { ResponsiveModal, useDesktop } from "./responsive-modal";

/** Di desktop tampil apa adanya (ruang cukup). Di HP diringkes jadi satu card, isinya kebuka lewat popup. */
export function DueSection({ items, wallets }: { items: Due[]; wallets: Wallet[] }) {
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);

  if (desktop || items.length === 0) {
    return <DueList items={items} wallets={wallets} />;
  }

  const telat = items.filter((i) => i.telat).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-card p-4 text-left transition-colors hover:border-foreground/30"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <ListChecks className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold tracking-tight tnum">{items.length} garapan perlu digarap</span>
          {telat > 0 && <span className="block text-xs font-semibold text-destructive">{telat} udah telat</span>}
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>

      <ResponsiveModal open={open} onOpenChange={setOpen} judul="Perlu digarap">
        <DueList items={items} wallets={wallets} />
      </ResponsiveModal>
    </>
  );
}
