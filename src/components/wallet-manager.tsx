"use client";

import { useState } from "react";
import { Plus, Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import { hapusWallet, simpanWallet } from "@/app/actions";
import type { Project, Wallet } from "@/lib/types";
import { pesanError } from "@/lib/utils";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WalletManager({ wallets, projects }: { wallets: Wallet[]; projects: Project[] }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("");
  const [loading, setLoading] = useState(false);

  const dipakai = (id: string) => projects.filter((p) => p.wallets.some((w) => w.id === id)).length;

  async function tambah() {
    if (!label.trim()) return toast.error("Label wallet belum diisi.");
    setLoading(true);
    try {
      await simpanWallet({ label, address, chain });
      setLabel(""); setAddress(""); setChain(""); setOpen(false);
      toast.success("Wallet ditambahkan.");
    } catch (e) {
      toast.error(pesanError(e, "Gagal menyimpan."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {wallets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-semibold">Belum ada wallet</p>
          <p className="mt-1 text-sm text-muted-foreground">Tambahin wallet biar bisa dipasang ke garapan.</p>
          <Button className="mt-4" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 size-4" /> Tambah wallet
          </Button>
        </div>
      ) : (
        <ul className="space-y-2">
          {wallets.map((w) => (
            <li key={w.id} className="flex items-center gap-3 rounded-lg border border-border/70 bg-card p-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-tight">{w.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {w.address || "tanpa alamat"}{w.chain ? ` · ${w.chain}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground tnum">Dipakai di {dipakai(w.id)} garapan</p>
              </div>
              {w.address && (
                <Button variant="ghost" size="icon" className="size-8"
                  onClick={() => { navigator.clipboard.writeText(w.address!); toast.success("Alamat disalin."); }}>
                  <Copy className="size-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="size-8 text-destructive"
                onClick={async () => { await hapusWallet(w.id); toast.success(`${w.label} dihapus.`); }}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button onClick={() => setOpen(true)} className="fixed bottom-20 right-4 z-30 h-14 px-5 shadow-lg md:bottom-8 md:right-8">
        <Plus className="mr-1.5 size-5" /> Wallet
      </Button>

      <ResponsiveModal open={open} onOpenChange={setOpen} judul="Wallet baru">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wl">Label</Label>
            <Input id="wl" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Wallet 1" autoFocus />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wa">Alamat</Label>
            <Input id="wa" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wc">Chain</Label>
            <Input id="wc" value={chain} onChange={(e) => setChain(e.target.value)} placeholder="EVM, Solana, ..." />
          </div>
          <Button onClick={tambah} disabled={loading} className="w-full">
            {loading ? "Menyimpan..." : "Tambah wallet"}
          </Button>
        </div>
      </ResponsiveModal>
    </>
  );
}
