"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Search } from "lucide-react";
import { LABEL_JENIS, LABEL_STATUS, LABEL_WL, type Jenis, type LedgerEntry, type Project, type Status, type Wallet, type WlStatus } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Form-form ini gak dibutuhin pas halaman pertama kebuka, baru diunduh pas beneran diklik.
const ProjectForm = dynamic(() => import("./project-form").then((m) => m.ProjectForm), { ssr: false });
const LedgerForm = dynamic(() => import("./ledger-form").then((m) => m.LedgerForm), { ssr: false });

const TAB: (Jenis | "semua")[] = ["semua", "testnet", "nft", "retro", "general", "daily"];
const STATUS_TAB: (Status | "semua")[] = ["semua", "belum", "digarap", "selesai", "drop"];
const WL_TAB: (WlStatus | "semua")[] = ["semua", "belum", "wl", "fcfs", "gtd"];

export function ProjectsView({ projects, wallets, ledger }: { projects: Project[]; wallets: Wallet[]; ledger: LedgerEntry[] }) {
  const [tab, setTab] = useState<string>("semua");
  const [statusTab, setStatusTab] = useState<string>("semua");
  const [wlTab, setWlTab] = useState<string>("semua");
  const [cari, setCari] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);
  const [uang, setUang] = useState<Project | null>(null);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return projects.filter((p) => {
      if (tab !== "semua" && p.jenis !== tab) return false;
      if (statusTab !== "semua" && p.status !== statusTab) return false;
      if (tab === "nft" && wlTab !== "semua" && (p.fields.wl_status ?? "belum") !== wlTab) return false;
      if (!q) return true;
      return (
        p.nama.toLowerCase().includes(q) ||
        (p.catatan || "").toLowerCase().includes(q) ||
        p.wallets.some((w) => w.label.toLowerCase().includes(q) || (w.address || "").toLowerCase().includes(q))
      );
    });
  }, [projects, tab, statusTab, wlTab, cari]);

  function bukaBaru() {
    setEdit(null);
    setFormOpen(true);
  }

  return (
    <>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari nama project atau wallet"
            className="pl-9"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select value={tab} onValueChange={setTab}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TAB.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "semua" ? "Semua jenis" : LABEL_JENIS[t as Jenis]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusTab} onValueChange={setStatusTab}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {STATUS_TAB.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "semua" ? "Semua status" : LABEL_STATUS[s as Status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {tab === "nft" && (
          <Select value={wlTab} onValueChange={setWlTab}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WL_TAB.map((w) => (
                <SelectItem key={w} value={w}>
                  {w === "semua" ? "Semua status WL" : LABEL_WL[w as WlStatus]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {hasil.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-semibold">{cari || tab !== "semua" || statusTab !== "semua" || wlTab !== "semua" ? "Gak ada yang cocok" : "Belum ada garapan di sini"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {cari || tab !== "semua" || statusTab !== "semua" || wlTab !== "semua" ? "Coba filter atau kata kunci lain." : "Tambahin garapan pertama lo."}
          </p>
          {!cari && tab === "semua" && statusTab === "semua" && (
            <Button className="mt-4" onClick={bukaBaru}>
              <Plus className="mr-1.5 size-4" /> Tambah garapan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {hasil.map((p) => (
            <ProjectCard
              key={p.id} p={p}
              ledger={ledger.filter((l) => l.project_id === p.id)}
              wallets={wallets}
              onEdit={(x) => { setEdit(x); setFormOpen(true); }}
              onUang={setUang}
            />
          ))}
        </div>
      )}

      {/* Tombol tambah: melayang di HP, biasa di desktop */}
      <Button
        onClick={bukaBaru}
        aria-label="Tambah garapan"
        className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-md p-0 shadow-lg md:bottom-8 md:right-8"
      >
        <Plus className="size-6" />
      </Button>

      {formOpen && (
        <ProjectForm
          key={edit?.id ?? "baru"}
          open={formOpen}
          onOpenChange={setFormOpen}
          project={edit}
          wallets={wallets}
        />
      )}
      <LedgerForm open={!!uang} onOpenChange={(v) => !v && setUang(null)} project={uang} />
    </>
  );
}
