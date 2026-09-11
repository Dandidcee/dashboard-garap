"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Search } from "lucide-react";
import { toast } from "sonner";
import type { Wallet } from "@/lib/types";
import { pesanError, cn } from "@/lib/utils";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Muncul kalau garapan mau ditandai digarap tapi belum punya wallet nempel.
 * Bisa pilih lebih dari satu wallet — sebagian garapan emang dikerjain pake beberapa wallet sekaligus.
 * Aksi sesudah milih ditentuin sama pemanggilnya lewat onSubmit — bisa "tandai digarap" biasa atau "ubah status".
 */
export function PilihWalletDialog({
  project,
  wallets,
  onOpenChange,
  onSubmit,
}: {
  project: { id: string; nama: string } | null;
  wallets: Wallet[];
  onOpenChange: (v: boolean) => void;
  onSubmit: (walletIds: string[]) => Promise<void>;
}) {
  const [terpilih, setTerpilih] = useState<string[]>([]);
  const [cari, setCari] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project) { setTerpilih([]); setCari(""); }
  }, [project]);

  const toggle = (id: string) =>
    setTerpilih((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));

  const terfilter = wallets.filter((w) => {
    const q = cari.trim().toLowerCase();
    if (!q) return true;
    return w.label.toLowerCase().includes(q) || (w.chain || "").toLowerCase().includes(q);
  });

  async function submit() {
    if (!project || terpilih.length === 0) return;
    setLoading(true);
    try {
      await onSubmit(terpilih);
      toast.success(`${project.nama} ditandai digarap.`);
      onOpenChange(false);
    } catch (e) {
      toast.error(pesanError(e, "Gagal nyimpen."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResponsiveModal
      open={!!project}
      onOpenChange={onOpenChange}
      judul="Pakai wallet yang mana?"
      deskripsi={project ? `${project.nama} belum punya wallet — pilih satu atau lebih biar kecatat.` : undefined}
    >
      <div className="space-y-4">
        {wallets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada wallet tersimpan. Tambahin dulu di halaman{" "}
            <Link href="/wallets" className="text-primary underline underline-offset-2">Wallet</Link>.
          </p>
        ) : (
          <>
            {wallets.length > 5 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input value={cari} onChange={(e) => setCari(e.target.value)} placeholder="Cari wallet..." className="h-9 pl-8 text-sm" />
              </div>
            )}
            <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border border-border p-1">
              {terfilter.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">Gak ketemu.</p>
              ) : (
                terfilter.map((w) => {
                  const dipilih = terpilih.includes(w.id);
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => toggle(w.id)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        dipilih ? "bg-primary/15 text-primary" : "hover:bg-accent"
                      )}
                    >
                      <span className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded border",
                        dipilih ? "border-primary bg-primary text-primary-foreground" : "border-border"
                      )}>
                        {dipilih && <Check className="size-3" />}
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        {w.label}{w.chain && <span className="ml-1.5 text-xs opacity-70">{w.chain}</span>}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
            <p className="text-xs text-muted-foreground tnum">{terpilih.length} dipilih</p>
          </>
        )}
        <Button onClick={submit} disabled={loading || terpilih.length === 0} className="w-full">
          {loading ? "Nyimpen..." : "Tandai digarap"}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
