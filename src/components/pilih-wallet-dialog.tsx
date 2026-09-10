"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { garapDenganWallet } from "@/app/actions";
import type { Wallet } from "@/lib/types";
import { pesanError } from "@/lib/utils";
import { ResponsiveModal } from "./responsive-modal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Muncul kalau garapan mau ditandai digarap tapi belum punya wallet nempel.
 * Milih wallet di sini langsung masangnya ke garapan itu sekalian nandain digarap.
 */
export function PilihWalletDialog({
  project,
  wallets,
  onOpenChange,
}: {
  project: { id: string; nama: string } | null;
  wallets: Wallet[];
  onOpenChange: (v: boolean) => void;
}) {
  const [walletId, setWalletId] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!project || !walletId) return;
    setLoading(true);
    try {
      await garapDenganWallet(project.id, walletId);
      toast.success(`${project.nama} ditandai digarap.`);
      setWalletId("");
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
      onOpenChange={(v) => { onOpenChange(v); if (!v) setWalletId(""); }}
      judul="Pakai wallet yang mana?"
      deskripsi={project ? `${project.nama} belum punya wallet — pilih dulu biar kecatat.` : undefined}
    >
      <div className="space-y-4">
        {wallets.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Belum ada wallet tersimpan. Tambahin dulu di halaman{" "}
            <Link href="/wallets" className="text-primary underline underline-offset-2">Wallet</Link>.
          </p>
        ) : (
          <Select value={walletId} onValueChange={setWalletId}>
            <SelectTrigger><SelectValue placeholder="Pilih wallet" /></SelectTrigger>
            <SelectContent>
              {wallets.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.label}{w.chain ? ` · ${w.chain}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <Button onClick={submit} disabled={loading || !walletId} className="w-full">
          {loading ? "Nyimpen..." : "Tandai digarap"}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
