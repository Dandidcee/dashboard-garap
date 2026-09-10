"use client";

import { useState } from "react";
import { toast } from "sonner";
import { tambahLedger } from "@/app/actions";
import type { Project } from "@/lib/types";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, pesanError } from "@/lib/utils";

export function LedgerForm({
  open,
  onOpenChange,
  project,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project: Project | null;
}) {
  const [tipe, setTipe] = useState<"cair" | "modal">("cair");
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(() => new Date().toISOString().slice(0, 10));
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);

  if (!project) return null;

  async function submit() {
    const n = Number(jumlah);
    if (!n || n <= 0) return toast.error("Jumlahnya belum diisi.");
    setLoading(true);
    try {
      await tambahLedger({ project_id: project!.id, tipe, jumlah: n, tanggal, catatan });
      toast.success(tipe === "cair" ? "Pemasukan dicatat." : "Modal dicatat.");
      setJumlah(""); setCatatan("");
      onOpenChange(false);
    } catch (e) {
      toast.error(pesanError(e, "Gagal mencatat. Coba lagi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange} judul="Catat uang" deskripsi={project.nama}>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-1.5">
          <button type="button" onClick={() => setTipe("cair")}
            className={cn("rounded-md border py-2.5 text-sm font-semibold",
              tipe === "cair" ? "border-ok bg-ok/15 text-ok" : "border-border text-muted-foreground")}>
            Cair
          </button>
          <button type="button" onClick={() => setTipe("modal")}
            className={cn("rounded-md border py-2.5 text-sm font-semibold",
              tipe === "modal" ? "border-destructive bg-destructive/15 text-destructive" : "border-border text-muted-foreground")}>
            Modal keluar
          </button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jumlah">Jumlah (Rupiah)</Label>
          <Input id="jumlah" type="number" inputMode="numeric" value={jumlah}
            onChange={(e) => setJumlah(e.target.value)} placeholder="1500000" autoFocus />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tgl">Tanggal</Label>
          <Input id="tgl" type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          <p className="text-xs text-muted-foreground">Tanggal ini yang dipakai buat rekap bulanan dan tahunan.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ket">Keterangan</Label>
          <Input id="ket" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Opsional" />
        </div>

        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? "Mencatat..." : "Catat"}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
