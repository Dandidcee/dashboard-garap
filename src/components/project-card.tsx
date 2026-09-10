"use client";

import { useState } from "react";
import { ExternalLink, MoreVertical, Pencil, Trash2, Coins, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { hapusProject, tandaiDigarap, konfirmasiMint, garapDenganWallet } from "@/app/actions";
import { LABEL_JENIS, LABEL_STATUS, LABEL_WL, type LedgerEntry, type Project, type Wallet } from "@/lib/types";
import { rupiah, cn, pesanError } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PilihWalletDialog } from "@/components/pilih-wallet-dialog";
import { ResponsiveModal } from "@/components/responsive-modal";

function selisihHari(iso: string | null) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

function fmtTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function Baris({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{children}</span>
    </div>
  );
}

export function ProjectCard({
  p,
  ledger,
  wallets,
  onEdit,
  onUang,
}: {
  p: Project;
  ledger: LedgerEntry[];
  wallets: Wallet[];
  onEdit: (p: Project) => void;
  onUang: (p: Project) => void;
}) {
  const hari = selisihHari(p.last_done_at);
  const perluTombolGarap = p.jenis === "testnet" || p.jenis === "daily";
  const [konfirmasiHapus, setKonfirmasiHapus] = useState(false);
  const [detail, setDetail] = useState(false);
  const [pilihWallet, setPilihWallet] = useState(false);

  async function konfirmasiHapusProject() {
    try {
      await hapusProject(p.id);
      toast.success(`${p.nama} dihapus.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal menghapus."));
    } finally {
      setKonfirmasiHapus(false);
    }
  }

  async function garap() {
    if (p.wallets.length === 0) {
      setPilihWallet(true);
      return;
    }
    try {
      await tandaiDigarap(p.id);
      toast.success(`${p.nama} ditandai digarap.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal nyimpen."));
    }
  }

  async function konfirmasi() {
    try {
      await konfirmasiMint(p.id, p.fields);
      toast.success(`${p.nama} dikonfirmasi, notif berhenti.`);
    } catch (e) {
      toast.error(pesanError(e, "Gagal nyimpen."));
    }
  }

  const ledgerUrut = [...ledger].sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return (
    <>
      <article
        role="button"
        tabIndex={0}
        onClick={() => setDetail(true)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setDetail(true); } }}
        className="relative cursor-pointer overflow-hidden rounded-lg border border-border/70 bg-card transition-colors hover:border-foreground/30"
      >
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate font-bold leading-tight tracking-tight">{p.nama}</h3>
                {p.link && (
                  <a href={p.link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                     className="text-muted-foreground hover:text-primary">
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {LABEL_JENIS[p.jenis]} · {LABEL_STATUS[p.status]} · {p.wallets.length} wallet
              </p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <MoreVertical className="size-4" />
                  <span className="sr-only">Menu {p.nama}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={() => onEdit(p)}>
                  <Pencil className="mr-2 size-4" /> Ubah
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onUang(p)}>
                  <Coins className="mr-2 size-4" /> Catat uang
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={(e) => { e.preventDefault(); setKonfirmasiHapus(true); }}
                >
                  <Trash2 className="mr-2 size-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {p.jenis === "nft" && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="outline" className="border-jenis-nft/50 text-jenis-nft">
                {LABEL_WL[p.fields.wl_status ?? "belum"]}
              </Badge>
              {p.fields.mint_price != null && (
                <Badge variant="secondary" className="tnum">{p.fields.mint_price} mint</Badge>
              )}
              {p.fields.mint_date && (
                <Badge variant="secondary" className="tnum">
                  {new Date(p.fields.mint_date).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </Badge>
              )}
              {p.fields.mint_link && (
                <a href={p.fields.mint_link} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
                   className="text-xs font-medium text-primary underline underline-offset-2">
                  Buka mint
                </a>
              )}
            </div>
          )}

          <div className="flex items-end justify-between gap-3 border-t border-border/60 pt-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Profit</p>
              <p className={cn("mt-0.5 text-base font-extrabold tracking-tight tnum", p.profit > 0 ? "text-ok" : p.profit < 0 ? "text-destructive" : "")}>
                {rupiah(p.profit)}
              </p>
              {p.modal > 0 && (
                <p className="text-[11px] text-muted-foreground tnum">
                  cair {rupiah(p.cair)} · modal {rupiah(p.modal)}
                </p>
              )}
            </div>

            {perluTombolGarap && (
              <div className="text-right">
                <p className="mb-1 text-[11px] text-muted-foreground tnum">
                  {hari === null ? "belum pernah" : hari === 0 ? "digarap hari ini" : `${hari} hari lalu`}
                </p>
                <Button
                  size="sm" variant="outline"
                  onClick={(e) => { e.stopPropagation(); garap(); }}
                >
                  <CheckCircle2 className="mr-1.5 size-4" /> Udah digarap
                </Button>
              </div>
            )}
          </div>
        </div>
      </article>

      <ConfirmDialog
        open={konfirmasiHapus}
        onOpenChange={setKonfirmasiHapus}
        judul={`Hapus ${p.nama}?`}
        deskripsi="Semua catatan uang dan wallet yang nempel ke garapan ini ikut kehapus. Gak bisa dibalikin."
        onConfirm={konfirmasiHapusProject}
      />

      <ResponsiveModal
        open={detail}
        onOpenChange={setDetail}
        judul={p.nama}
        deskripsi={`${LABEL_JENIS[p.jenis]} · ${LABEL_STATUS[p.status]}`}
      >
        <div className="space-y-5">
          {p.link && (
            <a href={p.link} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-1.5 text-sm font-medium text-primary underline underline-offset-2">
              Buka link project <ExternalLink className="size-3.5" />
            </a>
          )}

          {p.catatan && (
            <div className="rounded-lg border border-border/70 bg-secondary/40 p-3 text-sm">
              {p.catatan}
            </div>
          )}

          {p.jenis === "testnet" && p.fields.interval_hari && (
            <div className="rounded-lg border border-jenis-testnet/30 bg-jenis-testnet/5 p-3">
              <Baris label="Ingetin tiap">{p.fields.interval_hari} hari</Baris>
            </div>
          )}

          {p.jenis === "nft" && (
            <div className="rounded-lg border border-jenis-nft/30 bg-jenis-nft/5 p-3">
              <Baris label="Whitelist">{LABEL_WL[p.fields.wl_status ?? "belum"]}</Baris>
              {p.fields.mint_price != null && <Baris label="Mint price">{p.fields.mint_price}</Baris>}
              {p.fields.mint_date && (
                <Baris label="Jadwal mint">
                  {new Date(p.fields.mint_date).toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </Baris>
              )}
              {p.fields.mint_date && <Baris label="Notif">{p.fields.mint_ack ? "Dikonfirmasi ✓" : "Masih diingetin"}</Baris>}
              {p.fields.mint_link && (
                <Baris label="Link mint">
                  <a href={p.fields.mint_link} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                    Buka
                  </a>
                </Baris>
              )}
            </div>
          )}

          <div>
            <p className="mb-2 text-sm font-bold tracking-tight">Wallet ({p.wallets.length})</p>
            {p.wallets.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada wallet dipasang.</p>
            ) : (
              <ul className="space-y-1.5">
                {p.wallets.map((w) => (
                  <li key={w.id} className="rounded-lg border border-border/70 bg-secondary/30 p-2.5 text-sm">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="font-medium tracking-tight">{w.label}</p>
                      {w.chain && <Badge variant="secondary" className="px-1.5 py-0 text-[10px] font-medium">{w.chain}</Badge>}
                    </div>
                    {w.address && <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{w.address}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between">
              <p className="text-sm font-bold tracking-tight">Uang</p>
              <p className={cn("text-lg font-extrabold tracking-tight tnum", p.profit > 0 ? "text-ok" : p.profit < 0 ? "text-destructive" : "")}>
                {rupiah(p.profit)}
              </p>
            </div>
            {ledgerUrut.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada catatan uang.</p>
            ) : (
              <ul>
                {ledgerUrut.map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-2 border-b border-border/50 py-2 text-sm last:border-0">
                    <div className="min-w-0">
                      <p className={cn("font-medium", l.tipe === "cair" ? "text-ok" : "text-destructive")}>
                        {l.tipe === "cair" ? "Cair" : "Modal keluar"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {fmtTanggal(l.tanggal)}{l.catatan ? ` · ${l.catatan}` : ""}
                      </p>
                    </div>
                    <p className={cn("shrink-0 tnum font-semibold", l.tipe === "cair" ? "text-ok" : "text-destructive")}>
                      {l.tipe === "cair" ? "+" : "-"}{rupiah(l.jumlah)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
            <Button size="sm" variant="outline" onClick={() => { setDetail(false); onEdit(p); }}>
              <Pencil className="mr-1.5 size-4" /> Ubah
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setDetail(false); onUang(p); }}>
              <Coins className="mr-1.5 size-4" /> Catat uang
            </Button>
            {perluTombolGarap && (
              <Button size="sm" variant="outline" onClick={garap}>
                <CheckCircle2 className="mr-1.5 size-4" /> Udah digarap
              </Button>
            )}
            {p.jenis === "nft" && p.fields.mint_date && !p.fields.mint_ack && (
              <Button size="sm" variant="outline" onClick={konfirmasi}>
                <CheckCircle2 className="mr-1.5 size-4" /> Konfirmasi
              </Button>
            )}
            <Button
              size="sm" variant="outline" className="ml-auto text-destructive hover:text-destructive"
              onClick={() => { setDetail(false); setKonfirmasiHapus(true); }}
            >
              <Trash2 className="mr-1.5 size-4" /> Hapus
            </Button>
          </div>
        </div>
      </ResponsiveModal>

      <PilihWalletDialog
        project={pilihWallet ? p : null}
        wallets={wallets}
        onOpenChange={setPilihWallet}
        onSubmit={(walletId) => garapDenganWallet(p.id, walletId)}
      />
    </>
  );
}
