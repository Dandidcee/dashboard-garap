"use client";

import { useState } from "react";
import { toast } from "sonner";
import { simpanSettings, logout } from "@/app/actions";
import type { Settings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, pesanError } from "@/lib/utils";

const ZONA = ["Asia/Jakarta", "Asia/Makassar", "Asia/Jayapura"];
const JAM = Array.from({ length: 24 }, (_, i) => i);

function PilihJam({ value, onChange, id }: { value: number; onChange: (n: number) => void; id: string }) {
  return (
    <Select value={String(value)} onValueChange={(v) => onChange(Number(v))}>
      <SelectTrigger id={id}><SelectValue /></SelectTrigger>
      <SelectContent className="max-h-64">
        {JAM.map((j) => (
          <SelectItem key={j} value={String(j)}>{String(j).padStart(2, "0")}:00</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SettingsForm({ awal }: { awal: Settings }) {
  const [s, setS] = useState(awal);
  const [loading, setLoading] = useState(false);

  async function simpan() {
    setLoading(true);
    try {
      await simpanSettings({
        timezone: s.timezone,
        testnet_jam: s.testnet_jam,
        testnet_interval_hari: s.testnet_interval_hari,
        daily_jam: s.daily_jam,
        nft_jam: s.nft_jam,
      });
      toast.success("Pengaturan disimpan.");
    } catch (e) {
      toast.error(pesanError(e, "Gagal menyimpan."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="tz">Zona waktu</Label>
        <Select value={s.timezone} onValueChange={(v) => setS({ ...s, timezone: v })}>
          <SelectTrigger id="tz"><SelectValue /></SelectTrigger>
          <SelectContent>{ZONA.map((z) => <SelectItem key={z} value={z}>{z}</SelectItem>)}</SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">Semua jam di bawah mengikuti zona ini.</p>
      </div>

      <div className="space-y-4 rounded-lg border border-jenis-testnet/30 bg-jenis-testnet/5 p-4">
        <p className="text-sm font-bold">Testnet</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="tj">Jam notifikasi</Label>
            <PilihJam id="tj" value={s.testnet_jam} onChange={(n) => setS({ ...s, testnet_jam: n })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ti">Ingetin tiap berapa hari</Label>
            <Input id="ti" type="number" min={1} inputMode="numeric" value={s.testnet_interval_hari}
              onChange={(e) => setS({ ...s, testnet_interval_hari: Number(e.target.value) })} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Project yang punya interval sendiri pakai angkanya masing-masing.
        </p>
      </div>

      <div className="space-y-4 rounded-lg border border-jenis-daily/30 bg-jenis-daily/5 p-4">
        <p className="text-sm font-bold">Daily</p>
        <div className="space-y-2 sm:max-w-[50%]">
          <Label htmlFor="dj">Jam notifikasi harian</Label>
          <PilihJam id="dj" value={s.daily_jam} onChange={(n) => setS({ ...s, daily_jam: n })} />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border border-jenis-nft/30 bg-jenis-nft/5 p-4">
        <p className="text-sm font-bold">NFT</p>
        <div className="space-y-2 sm:max-w-[60%]">
          <Label htmlFor="nj">Mulai ingetin berapa jam sebelum mint</Label>
          <Input
            id="nj" type="number" min={1} inputMode="numeric" value={s.nft_jam}
            onChange={(e) => setS({ ...s, nft_jam: Math.max(1, Number(e.target.value) || 1) })}
          />
          <div className="flex flex-wrap gap-1.5">
            {[6, 12, 24, 48, 72].map((j) => (
              <button
                key={j} type="button" onClick={() => setS({ ...s, nft_jam: j })}
                className={cn(
                  "rounded-md border px-2 py-1 text-[11px] transition-colors",
                  s.nft_jam === j ? "border-jenis-nft bg-jenis-nft/15 text-jenis-nft" : "border-border text-muted-foreground hover:border-jenis-nft/50"
                )}
              >
                {j % 24 === 0 ? `${j / 24} hari` : `${j} jam`}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          {s.nft_jam >= 24 && `≈ ${(s.nft_jam / 24).toFixed(1).replace(/\.0$/, "")} hari sebelum jadwal mint. `}
          Sesudah masuk window itu, notifnya kekirim ulang tiap 30 menit sampai lo tekan <b>Konfirmasi</b> di dashboard.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={simpan} disabled={loading}>{loading ? "Menyimpan..." : "Simpan pengaturan"}</Button>
        <form action={logout}>
          <Button type="submit" variant="ghost">Keluar</Button>
        </form>
      </div>
    </div>
  );
}
