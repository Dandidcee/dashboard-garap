"use client";

import { useState } from "react";
import { Plus, MoreVertical, Pencil, Trash2, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { simpanCredential, hapusCredential } from "@/app/actions";
import type { Credential } from "@/lib/types";
import { pesanError } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveModal } from "@/components/responsive-modal";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function BarisSandi({ sandi }: { sandi: string }) {
  const [tampil, setTampil] = useState(false);
  return (
    <div className="mt-1.5 flex items-center gap-1">
      <p className="min-w-0 flex-1 truncate font-mono text-sm text-muted-foreground">
        {tampil ? sandi : "•".repeat(Math.min(sandi.length, 12))}
      </p>
      <Button type="button" variant="ghost" size="icon" className="size-7 shrink-0" onClick={() => setTampil((v) => !v)}>
        {tampil ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </Button>
      <Button
        type="button" variant="ghost" size="icon" className="size-7 shrink-0"
        onClick={() => { navigator.clipboard.writeText(sandi); toast.success("Sandi disalin."); }}
      >
        <Copy className="size-3.5" />
      </Button>
    </div>
  );
}

export function CredentialsView({ folderId, credentials }: { folderId: string; credentials: Credential[] }) {
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState<Credential | null>(null);
  const [nama, setNama] = useState("");
  const [akun, setAkun] = useState("");
  const [website, setWebsite] = useState("");
  const [sandi, setSandi] = useState("");
  const [tampilSandi, setTampilSandi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hapusTarget, setHapusTarget] = useState<Credential | null>(null);

  function bukaBaru() {
    setEdit(null);
    setNama(""); setAkun(""); setWebsite(""); setSandi(""); setTampilSandi(false);
    setFormOpen(true);
  }

  function bukaEdit(c: Credential) {
    setEdit(c);
    setNama(c.nama); setAkun(c.akun); setWebsite(c.website ?? ""); setSandi(c.sandi); setTampilSandi(false);
    setFormOpen(true);
  }

  async function submit() {
    if (!nama.trim()) return toast.error("Nama belum diisi.");
    if (!akun.trim()) return toast.error("Username/email belum diisi.");
    if (!sandi) return toast.error("Sandi belum diisi.");
    setLoading(true);
    try {
      await simpanCredential({ id: edit?.id, folder_id: folderId, nama, akun, website, sandi });
      toast.success(edit ? "Kredensial diubah." : "Kredensial ditambahkan.");
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
      await hapusCredential(hapusTarget.id);
      toast.success(`${hapusTarget.nama} dihapus.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal menghapus."));
    } finally {
      setHapusTarget(null);
    }
  }

  return (
    <>
      {credentials.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-semibold">Belum ada kredensial</p>
          <p className="mt-1 text-sm text-muted-foreground">Tambahin akun pertama di folder ini.</p>
          <Button className="mt-4" onClick={bukaBaru}>
            <Plus className="mr-1.5 size-4" /> Tambah kredensial
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {credentials.map((c) => (
            <li key={c.id} className="rounded-lg border border-border/70 bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate font-semibold leading-tight tracking-tight">{c.nama}</p>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noreferrer" className="shrink-0 text-muted-foreground hover:text-primary">
                        <ExternalLink className="size-3.5" />
                      </a>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.akun}</p>
                  <BarisSandi sandi={c.sandi} />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 shrink-0">
                      <MoreVertical className="size-4" />
                      <span className="sr-only">Menu {c.nama}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => bukaEdit(c)}>
                      <Pencil className="mr-2 size-4" /> Ubah
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={(e) => { e.preventDefault(); setHapusTarget(c); }}
                    >
                      <Trash2 className="mr-2 size-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        onClick={bukaBaru}
        aria-label="Tambah kredensial"
        className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-md p-0 shadow-lg md:bottom-8 md:right-8"
      >
        <Plus className="size-6" />
      </Button>

      <ResponsiveModal open={formOpen} onOpenChange={setFormOpen} judul={edit ? "Ubah kredensial" : "Kredensial baru"}>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cnama">Nama</Label>
            <Input id="cnama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Misal: Discord, Email utama" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cakun">Username / email</Label>
            <Input id="cakun" value={akun} onChange={(e) => setAkun(e.target.value)} placeholder="nama@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cweb">Website login (opsional)</Label>
            <Input id="cweb" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" inputMode="url" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="csandi">Sandi</Label>
            <div className="relative">
              <Input
                id="csandi" type={tampilSandi ? "text" : "password"} value={sandi}
                onChange={(e) => setSandi(e.target.value)} className="pr-10"
              />
              <button
                type="button" onClick={() => setTampilSandi((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {tampilSandi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
          <Button onClick={submit} disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : edit ? "Simpan perubahan" : "Tambah kredensial"}
          </Button>
        </div>
      </ResponsiveModal>

      <ConfirmDialog
        open={!!hapusTarget}
        onOpenChange={(v) => !v && setHapusTarget(null)}
        judul={`Hapus ${hapusTarget?.nama}?`}
        deskripsi="Gak bisa dibalikin."
        onConfirm={konfirmasiHapus}
      />
    </>
  );
}
