"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { simpanWallet } from "@/app/actions";
import type { Wallet } from "@/lib/types";
import { pesanError } from "@/lib/utils";
import { CHAIN_PRESET } from "@/lib/chains";
import { ComboboxInput } from "./combobox-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Pilih wallet yang dipakai project ini. Wallet baru yang dibuat di sini
 * langsung masuk ke daftar wallet global, jadi bisa dipakai project lain.
 */
export function WalletPicker({
  semua,
  terpilih,
  onChange,
  onWalletBaru,
}: {
  semua: Wallet[];
  terpilih: string[];
  onChange: (ids: string[]) => void;
  onWalletBaru: (w: Wallet) => void;
}) {
  const [buka, setBuka] = useState(false);
  const [label, setLabel] = useState("");
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState("");
  const [loading, setLoading] = useState(false);
  const [cari, setCari] = useState("");

  const toggle = (id: string) =>
    onChange(terpilih.includes(id) ? terpilih.filter((x) => x !== id) : [...terpilih, id]);

  const terfilter = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return semua;
    return semua.filter(
      (w) => w.label.toLowerCase().includes(q) || (w.chain || "").toLowerCase().includes(q) || (w.address || "").toLowerCase().includes(q)
    );
  }, [semua, cari]);

  async function tambah() {
    if (!label.trim()) return toast.error("Label wallet belum diisi.");
    setLoading(true);
    try {
      const res = await simpanWallet({ label, address, chain });
      if (res.wallet) {
        onWalletBaru(res.wallet as Wallet);
        onChange([...terpilih, res.wallet.id]);
      }
      setLabel(""); setAddress(""); setChain(""); setBuka(false);
      toast.success("Wallet ditambahkan.");
    } catch (e) {
      toast.error(pesanError(e, "Wallet gagal disimpan."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Wallet yang dipakai</Label>
        <span className="text-xs text-muted-foreground tnum">{terpilih.length} dipilih</span>
      </div>

      {semua.length === 0 && !buka ? (
        <p className="text-sm text-muted-foreground">Belum ada wallet tersimpan. Tambahin satu di bawah.</p>
      ) : (
        <DropdownMenu onOpenChange={(v) => !v && setCari("")}>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="w-full justify-between font-normal">
              <span className="truncate text-left">
                {terpilih.length === 0
                  ? "Pilih wallet"
                  : semua.filter((w) => terpilih.includes(w.id)).map((w) => w.label).join(", ")}
              </span>
              <ChevronDown className="ml-2 size-4 shrink-0 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-72 overflow-y-auto">
            <div className="sticky top-0 z-10 -mx-1 -mt-1 mb-1 bg-popover p-1.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  onKeyDown={(e) => e.stopPropagation()}
                  placeholder="Cari wallet..."
                  className="h-8 pl-8 text-sm"
                  autoFocus
                />
              </div>
            </div>
            {terfilter.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">Gak ketemu.</p>
            ) : (
              terfilter.map((w) => (
                <DropdownMenuCheckboxItem
                  key={w.id}
                  checked={terpilih.includes(w.id)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => toggle(w.id)}
                >
                  {w.label}
                  {w.chain && <span className="ml-1.5 text-[11px] text-muted-foreground">{w.chain}</span>}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {buka ? (
        <div className="space-y-2 rounded-lg border border-border p-3">
          <Input placeholder="Label, misal: Wallet 1" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Input placeholder="Alamat (opsional)" value={address} onChange={(e) => setAddress(e.target.value)} />
          <ComboboxInput
            value={chain}
            onChange={setChain}
            options={[...new Set([...CHAIN_PRESET, ...semua.map((w) => w.chain).filter((c): c is string => !!c)])]}
            placeholder="Chain (opsional)"
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={tambah} disabled={loading}>
              Simpan wallet
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setBuka(false)}>
              Batal
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" variant="outline" size="sm" onClick={() => setBuka(true)}>
          <Plus className="mr-1 size-4" /> Wallet baru
        </Button>
      )}
    </div>
  );
}
