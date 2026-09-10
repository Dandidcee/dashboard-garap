"use client";

import { ExternalLink, MoreVertical, Pencil, Trash2, Coins, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { hapusProject, tandaiDigarap } from "@/app/actions";
import { LABEL_JENIS, LABEL_STATUS, LABEL_WL, type Project } from "@/lib/types";
import { rupiah, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function selisihHari(iso: string | null) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function ProjectCard({
  p,
  onEdit,
  onUang,
}: {
  p: Project;
  onEdit: (p: Project) => void;
  onUang: (p: Project) => void;
}) {
  const hari = selisihHari(p.last_done_at);
  const perluTombolGarap = p.jenis === "testnet" || p.jenis === "daily";

  return (
    <article className="relative overflow-hidden rounded-lg border border-border/70 bg-card">
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-bold leading-tight">{p.nama}</h3>
              {p.link && (
                <a href={p.link} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary">
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
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreVertical className="size-4" />
                <span className="sr-only">Menu {p.nama}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(p)}>
                <Pencil className="mr-2 size-4" /> Ubah
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onUang(p)}>
                <Coins className="mr-2 size-4" /> Catat uang
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={async () => {
                  await hapusProject(p.id);
                  toast.success(`${p.nama} dihapus.`);
                }}
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
              <a href={p.fields.mint_link} target="_blank" rel="noreferrer"
                 className="text-xs font-medium text-primary underline underline-offset-2">
                Buka mint
              </a>
            )}
          </div>
        )}

        <div className="flex items-end justify-between gap-3 border-t border-border/60 pt-3">
          <div>
            <p className="text-[11px] text-muted-foreground">Profit</p>
            <p className={cn("text-base font-extrabold tnum", p.profit > 0 ? "text-ok" : p.profit < 0 ? "text-destructive" : "")}>
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
                onClick={async () => {
                  await tandaiDigarap(p.id);
                  toast.success(`${p.nama} ditandai digarap.`);
                }}
              >
                <CheckCircle2 className="mr-1.5 size-4" /> Udah digarap
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
