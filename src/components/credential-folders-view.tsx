"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { simpanFolder, hapusFolder } from "@/app/actions";
import type { CredentialFolder } from "@/lib/types";
import { pesanError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveModal } from "@/components/responsive-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function CredentialFoldersView({ folders }: { folders: CredentialFolder[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState<CredentialFolder | null>(null);
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [hapusTarget, setHapusTarget] = useState<CredentialFolder | null>(null);

  function bukaBaru() {
    setEdit(null);
    setNama("");
    setFormOpen(true);
  }

  function bukaEdit(f: CredentialFolder) {
    setEdit(f);
    setNama(f.nama);
    setFormOpen(true);
  }

  async function submit() {
    if (!nama.trim()) return toast.error("Nama folder belum diisi.");
    setLoading(true);
    try {
      await simpanFolder({ id: edit?.id, nama });
      toast.success(edit ? "Folder diubah." : "Folder ditambahkan.");
      setFormOpen(false);
    } catch (e) {
      toast.error(pesanError(e, "Gagal menyimpan."));
    } finally {
      setLoading(false);
    }
  }

  async function konfirmasiHapus() {
    if (!hapusTarget) return;
    try {
      await hapusFolder(hapusTarget.id);
      toast.success(`${hapusTarget.nama} dihapus.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal menghapus."));
    } finally {
      setHapusTarget(null);
    }
  }

  return (
    <>
      {folders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-semibold">Belum ada folder</p>
          <p className="mt-1 text-sm text-muted-foreground">Bikin folder buat mulai nyimpen kredensial.</p>
          <Button className="mt-4" onClick={bukaBaru}>
            <Plus className="mr-1.5 size-4" /> Folder baru
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {folders.map((f) => (
            <div key={f.id} className="relative rounded-lg border border-border/70 bg-card p-4">
              <Link href={`/credentials/${f.id}`} className="block pr-8">
                <p className="truncate font-bold leading-tight tracking-tight">{f.nama}</p>
                <p className="mt-0.5 text-xs text-muted-foreground tnum">{f.jumlah} akun</p>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 size-8">
                    <MoreVertical className="size-4" />
                    <span className="sr-only">Menu {f.nama}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => bukaEdit(f)}>
                    <Pencil className="mr-2 size-4" /> Ubah nama
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onSelect={(e) => { e.preventDefault(); setHapusTarget(f); }}
                  >
                    <Trash2 className="mr-2 size-4" /> Hapus
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}

      <Button
        onClick={bukaBaru}
        aria-label="Folder baru"
        className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-md p-0 shadow-lg md:bottom-8 md:right-8"
      >
        <Plus className="size-6" />
      </Button>

      <ResponsiveModal open={formOpen} onOpenChange={setFormOpen} judul={edit ? "Ubah folder" : "Folder baru"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fnama">Nama folder</Label>
            <Input id="fnama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Misal: Monad, Exchange, ..." autoFocus />
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : edit ? "Simpan perubahan" : "Tambah folder"}
          </Button>
        </div>
      </ResponsiveModal>

      <ConfirmDialog
        open={!!hapusTarget}
        onOpenChange={(v) => !v && setHapusTarget(null)}
        judul={`Hapus folder ${hapusTarget?.nama}?`}
        deskripsi="Semua kredensial di dalam folder ini ikut kehapus. Gak bisa dibalikin."
        onConfirm={konfirmasiHapus}
      />
    </>
  );
}
