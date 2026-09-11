"use client";

import { useState } from "react";
import { ChevronRight, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { tandaiPantauan } from "@/app/actions";
import type { Pantauan } from "@/lib/types";
import { pesanError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ResponsiveModal, useDesktop } from "@/components/responsive-modal";

async function tandai(p: Pantauan) {
  try {
    await tandaiPantauan(p.id);
    toast.success(`@${p.handle} ditandai dipantau.`);
  } catch (e) {
    toast.error(pesanError(e, "Gagal nyimpen."));
  }
}

function Daftar({ items }: { items: Pantauan[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border/70 bg-card p-6 text-center">
        <p className="font-semibold">Kosong buat hari ini</p>
        <p className="mt-1 text-sm text-muted-foreground">Semua udah dipantau.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-3">
          <p className="min-w-0 flex-1 truncate font-bold tracking-tight">x.com/{p.handle}</p>
          <Button size="sm" variant="outline" className="shrink-0" onClick={() => tandai(p)}>
            <CheckCircle2 className="mr-1.5 size-4" /> Tandai
          </Button>
        </li>
      ))}
    </ul>
  );
}

/** Sama polanya kayak DueSection: apa adanya di desktop, diringkes jadi card di HP. */
export function PantauanSection({ items }: { items: Pantauan[] }) {
  const desktop = useDesktop();
  const [open, setOpen] = useState(false);

  if (desktop || items.length === 0) {
    return <Daftar items={items} />;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-lg border border-border/70 bg-card p-4 text-left transition-colors hover:border-foreground/30"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Eye className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold tracking-tight tnum">{items.length} akun belum dipantau</span>
        </span>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </button>

      <ResponsiveModal open={open} onOpenChange={setOpen} judul="Pantauan hari ini">
        <Daftar items={items} />
      </ResponsiveModal>
    </>
  );
}
