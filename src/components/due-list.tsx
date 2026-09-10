"use client";

import { useState } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { tandaiDigarap, konfirmasiMint, ubahStatusProject } from "@/app/actions";
import { LABEL_JENIS, type Project } from "@/lib/types";
import { cn, pesanError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function DueList({ items }: { items: { project: Project; alasan: string; telat: boolean; viaStatus: boolean }[] }) {
  const [konfirmasiTarget, setKonfirmasiTarget] = useState<Project | null>(null);

  async function tandaiSudahGarap() {
    if (!konfirmasiTarget) return;
    try {
      await ubahStatusProject(konfirmasiTarget.id, "digarap");
      toast.success(`${konfirmasiTarget.nama} ditandai digarap.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal nyimpen."));
    } finally {
      setKonfirmasiTarget(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-border/70 bg-card p-6 text-center">
        <p className="font-semibold">Kosong buat hari ini</p>
        <p className="mt-1 text-sm text-muted-foreground">Semua garapan lagi aman.</p>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map(({ project: p, alasan, telat, viaStatus }) => (
          <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate font-bold leading-tight">{p.nama}</p>
                {(p.fields.mint_link || p.link) && (
                  <a href={p.fields.mint_link || p.link!} target="_blank" rel="noreferrer"
                     className="shrink-0 text-muted-foreground hover:text-primary">
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <p className={cn("text-xs", telat ? "font-semibold text-destructive" : "text-muted-foreground")}>
                {LABEL_JENIS[p.jenis]} · {alasan}
              </p>
            </div>
            {viaStatus ? (
              <Button size="sm" variant="outline" className="shrink-0" onClick={() => setKonfirmasiTarget(p)}>
                <CheckCircle2 className="mr-1.5 size-4" /> Udah digarap
              </Button>
            ) : p.jenis === "nft" ? (
              p.fields.mint_ack ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ok">
                  <CheckCircle2 className="size-4" /> Dikonfirmasi
                </span>
              ) : (
                <Button size="sm" variant="outline" className="shrink-0"
                  onClick={async () => {
                    await konfirmasiMint(p.id, p.fields);
                    toast.success(`${p.nama} dikonfirmasi, notif berhenti.`);
                  }}>
                  <CheckCircle2 className="mr-1.5 size-4" /> Konfirmasi
                </Button>
              )
            ) : (
              <Button size="sm" variant="outline" className="shrink-0"
                onClick={async () => { await tandaiDigarap(p.id); toast.success(`${p.nama} ditandai digarap.`); }}>
                <CheckCircle2 className="mr-1.5 size-4" /> Garap
              </Button>
            )}
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={!!konfirmasiTarget}
        onOpenChange={(v) => !v && setKonfirmasiTarget(null)}
        judul={`Tandai ${konfirmasiTarget?.nama} udah digarap?`}
        deskripsi='Status garapan ini bakal diubah jadi "Lagi digarap" dan ilang dari daftar Perlu digarap.'
        labelKonfirmasi="Udah digarap"
        onConfirm={tandaiSudahGarap}
      />
    </>
  );
}
