"use client";

import { useState } from "react";
import { Plus, Trash2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { tambahPantauan, hapusPantauan, tandaiPantauan } from "@/app/actions";
import type { Pantauan } from "@/lib/types";
import { pesanError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ResponsiveModal } from "@/components/responsive-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";

export function PantauanView({ pantauan, belumHariIni }: { pantauan: Pantauan[]; belumHariIni: string[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [teks, setTeks] = useState("");
  const [loading, setLoading] = useState(false);
  const [hapusTarget, setHapusTarget] = useState<Pantauan | null>(null);

  const belum = new Set(belumHariIni);

  async function submit() {
    const baris = teks.split(/[\s,]+/).filter(Boolean);
    if (!baris.length) return toast.error("Belum ada handle yang diisi.");
    setLoading(true);
    try {
      const { jumlah } = await tambahPantauan(baris);
      toast.success(jumlah > 0 ? `${jumlah} akun ditambahkan.` : "Gak ada akun baru (mungkin udah ada semua).");
      setTeks("");
      setFormOpen(false);
    } catch (e) {
      toast.error(pesanError(e, "Gagal menyimpan."));
    } finally {
      setLoading(false);
    }
  }

  async function tandai(p: Pantauan) {
    try {
      await tandaiPantauan(p.id);
      toast.success(`@${p.handle} ditandai dipantau.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal nyimpen."));
    }
  }

  async function konfirmasiHapus() {
    if (!hapusTarget) return;
    try {
      await hapusPantauan(hapusTarget.id);
      toast.success(`@${hapusTarget.handle} dihapus.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal menghapus."));
    } finally {
      setHapusTarget(null);
    }
  }

  return (
    <>
      {pantauan.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-semibold">Belum ada yang dipantau</p>
          <p className="mt-1 text-sm text-muted-foreground">Tambahin akun pertama, boleh banyak sekaligus.</p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus className="mr-1.5 size-4" /> Tambah pantauan
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {pantauan.map((p) => {
            const sudah = !belum.has(p.id);
            return (
              <li key={p.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-3">
                <a
                  href={`https://x.com/${p.handle}`} target="_blank" rel="noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-1.5 font-semibold tracking-tight hover:text-primary"
                >
                  <span className="truncate">x.com/{p.handle}</span>
                  <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                </a>
                {sudah ? (
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ok">
                    <CheckCircle2 className="size-4" /> Udah dipantau
                  </span>
                ) : (
                  <Button size="sm" variant="outline" className="shrink-0" onClick={() => tandai(p)}>
                    <CheckCircle2 className="mr-1.5 size-4" /> Tandai
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="size-8 shrink-0 text-destructive" onClick={() => setHapusTarget(p)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      <Button
        onClick={() => setFormOpen(true)}
        aria-label="Tambah pantauan"
        className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-md p-0 shadow-lg md:bottom-8 md:right-8"
      >
        <Plus className="size-6" />
      </Button>

      <ResponsiveModal
        open={formOpen}
        onOpenChange={setFormOpen}
        judul="Tambah pantauan"
        deskripsi="Satu handle per baris, boleh satu doang atau banyak sekaligus."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="handles">Handle</Label>
            <Textarea
              id="handles" rows={6} value={teks} onChange={(e) => setTeks(e.target.value)} autoFocus
              placeholder={"@aiceking27\n@marianaloca888"}
            />
            <p className="text-xs text-muted-foreground">Boleh pake @, link x.com/twitter.com, atau handle polos — sama aja.</p>
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Tambah"}
          </Button>
        </div>
      </ResponsiveModal>

      <ConfirmDialog
        open={!!hapusTarget}
        onOpenChange={(v) => !v && setHapusTarget(null)}
        judul={`Berhenti pantau @${hapusTarget?.handle}?`}
        deskripsi="Gak bisa dibalikin."
        onConfirm={konfirmasiHapus}
      />
    </>
  );
}
