"use client";

import { useState } from "react";
import { toast } from "sonner";
import { simpanProject, tambahLedger } from "@/app/actions";
import { LABEL_JENIS, LABEL_STATUS, LABEL_WL, type Jenis, type Project, type Status, type Wallet, type WlStatus } from "@/lib/types";
import { ResponsiveModal } from "./responsive-modal";
import { WalletPicker } from "./wallet-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, pesanError } from "@/lib/utils";

const JENIS: Jenis[] = ["testnet", "nft", "retro", "general", "daily"];
const STATUS: Status[] = ["belum", "digarap", "selesai", "drop"];
const WL: WlStatus[] = ["belum", "wl", "fcfs", "gtd"];

const garisJenis: Record<Jenis, string> = {
  testnet: "border-jenis-testnet bg-jenis-testnet/10 text-jenis-testnet",
  nft: "border-jenis-nft bg-jenis-nft/10 text-jenis-nft",
  retro: "border-jenis-retro bg-jenis-retro/10 text-jenis-retro",
  general: "border-jenis-general bg-jenis-general/10 text-jenis-general",
  daily: "border-jenis-daily bg-jenis-daily/10 text-jenis-daily",
};

/** input datetime-local butuh format YYYY-MM-DDTHH:mm di waktu lokal */
function keLocalInput(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function ProjectForm({
  open,
  onOpenChange,
  project,
  wallets,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  project?: Project | null;
  wallets: Wallet[];
}) {
  const [daftarWallet, setDaftarWallet] = useState(wallets);
  const [nama, setNama] = useState(project?.nama ?? "");
  const [jenis, setJenis] = useState<Jenis>(project?.jenis ?? "testnet");
  const [status, setStatus] = useState<Status>(project?.status ?? "belum");
  const [link, setLink] = useState(project?.link ?? "");
  const [catatan, setCatatan] = useState(project?.catatan ?? "");
  const [walletIds, setWalletIds] = useState<string[]>(project?.wallets.map((w) => w.id) ?? []);

  const [interval, setInterval] = useState(String(project?.fields.interval_hari ?? ""));
  const [wlStatus, setWlStatus] = useState<WlStatus>(project?.fields.wl_status ?? "belum");
  const [mintPrice, setMintPrice] = useState(String(project?.fields.mint_price ?? ""));
  const [mintDate, setMintDate] = useState(keLocalInput(project?.fields.mint_date));
  const [mintLink, setMintLink] = useState(project?.fields.mint_link ?? "");
  const [modalAwal, setModalAwal] = useState("");
  const [loading, setLoading] = useState(false);

  const punyaJadwalMint = wlStatus === "gtd" || wlStatus === "fcfs";

  async function submit() {
    if (!nama.trim()) return toast.error("Nama project belum diisi.");

    const fields: Record<string, unknown> = {};
    if (jenis === "testnet" && interval) fields.interval_hari = Number(interval);
    if (jenis === "nft") {
      fields.wl_status = wlStatus;
      if (mintPrice) fields.mint_price = Number(mintPrice);
      if (mintDate) fields.mint_date = new Date(mintDate).toISOString();
      if (mintLink) fields.mint_link = mintLink.trim();
    }

    setLoading(true);
    try {
      const res = await simpanProject({ id: project?.id, nama, jenis, status, link, catatan, walletIds, fields });
      if (!project && jenis === "retro" && Number(modalAwal) > 0) {
        await tambahLedger({
          project_id: res.id,
          tipe: "modal",
          jumlah: Number(modalAwal),
          tanggal: new Date().toISOString().slice(0, 10),
          catatan: "Modal awal",
        });
      }
      toast.success(project ? "Perubahan disimpan." : "Garapan ditambahkan.");
      onOpenChange(false);
    } catch (e) {
      toast.error(pesanError(e, "Gagal menyimpan. Coba lagi."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      judul={project ? "Ubah garapan" : "Garapan baru"}
      deskripsi="Kolom yang muncul menyesuaikan jenis garapan."
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label>Jenis</Label>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
            {JENIS.map((j) => (
              <button
                key={j}
                type="button"
                onClick={() => setJenis(j)}
                className={cn(
                  "rounded-md border py-2 text-xs font-semibold transition-colors",
                  jenis === j ? garisJenis[j] : "border-border text-muted-foreground hover:border-foreground/40"
                )}
              >
                {LABEL_JENIS[j]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="nama">Nama project</Label>
          <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Monad, Linea, ..." />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Status garapan</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {STATUS.map((s) => <SelectItem key={s} value={s}>{LABEL_STATUS[s]}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link project</Label>
            <Input id="link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://" inputMode="url" />
          </div>
        </div>

        {/* ---- khusus testnet ---- */}
        {jenis === "testnet" && (
          <div className="space-y-2">
            <Label htmlFor="interval">Ingetin tiap berapa hari</Label>
            <Input
              id="interval" type="number" min={1} inputMode="numeric"
              value={interval} onChange={(e) => setInterval(e.target.value)}
              placeholder="Kosongin buat ikut pengaturan umum"
            />
            <p className="text-xs text-muted-foreground">
              Hitungannya dari transaksi terakhir project ini, bukan dari tanggal dibuat.
            </p>
          </div>
        )}

        {/* ---- khusus NFT ---- */}
        {jenis === "nft" && (
          <div className="space-y-4 rounded-lg border border-jenis-nft/30 bg-jenis-nft/5 p-3">
            <div className="space-y-2">
              <Label>Status whitelist</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {WL.map((w) => (
                  <button
                    key={w} type="button" onClick={() => setWlStatus(w)}
                    className={cn(
                      "rounded-md border py-2 text-xs font-semibold transition-colors",
                      wlStatus === w ? "border-jenis-nft bg-jenis-nft/15 text-jenis-nft" : "border-border text-muted-foreground"
                    )}
                  >
                    {LABEL_WL[w]}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mp">Mint price</Label>
                <Input id="mp" type="number" step="any" inputMode="decimal" value={mintPrice}
                  onChange={(e) => setMintPrice(e.target.value)} placeholder="0.05" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ml">Mint link</Label>
                <Input id="ml" value={mintLink} onChange={(e) => setMintLink(e.target.value)} placeholder="https://" inputMode="url" />
              </div>
            </div>

            {punyaJadwalMint ? (
              <div className="space-y-2">
                <Label htmlFor="md">Tanggal & jam mint</Label>
                <Input id="md" type="datetime-local" value={mintDate} onChange={(e) => setMintDate(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  Jam mulai notif diatur di Pengaturan. Ganti tanggal ini nyalain notifnya lagi kalau tadinya udah dikonfirmasi.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Tanggal mint muncul setelah status jadi FCFS atau GTD.
              </p>
            )}
          </div>
        )}

        {/* ---- khusus retro (garapan baru doang, modal berikutnya lewat "Catat uang") ---- */}
        {jenis === "retro" && !project && (
          <div className="space-y-2 rounded-lg border border-jenis-retro/30 bg-jenis-retro/5 p-3">
            <Label htmlFor="modal">Modal awal (Rupiah)</Label>
            <Input
              id="modal" type="number" min={0} inputMode="numeric"
              value={modalAwal} onChange={(e) => setModalAwal(e.target.value)}
              placeholder="Kosongin kalau belum keluar modal"
            />
            <p className="text-xs text-muted-foreground">
              Otomatis kecatat sebagai modal keluar. Modal tambahan berikutnya lewat tombol <b>Catat uang</b> di kartu garapannya.
            </p>
          </div>
        )}

        <WalletPicker
          semua={daftarWallet}
          terpilih={walletIds}
          onChange={setWalletIds}
          onWalletBaru={(w) => setDaftarWallet((d) => [...d, w])}
        />

        <div className="space-y-2">
          <Label htmlFor="catatan">Catatan</Label>
          <Textarea id="catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={3} />
        </div>

        <Button onClick={submit} disabled={loading} className="w-full">
          {loading ? "Menyimpan..." : project ? "Simpan perubahan" : "Tambah garapan"}
        </Button>
      </div>
    </ResponsiveModal>
  );
}
