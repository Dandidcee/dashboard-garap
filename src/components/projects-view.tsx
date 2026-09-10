"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { LABEL_JENIS, LABEL_STATUS, type Jenis, type Project, type Status, type Wallet } from "@/lib/types";
import { ProjectCard } from "./project-card";
import { ProjectForm } from "./project-form";
import { LedgerForm } from "./ledger-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB: (Jenis | "semua")[] = ["semua", "testnet", "nft", "retro", "general", "daily"];
const STATUS_TAB: (Status | "semua")[] = ["semua", "belum", "digarap", "selesai", "drop"];

export function ProjectsView({ projects, wallets }: { projects: Project[]; wallets: Wallet[] }) {
  const [tab, setTab] = useState<string>("semua");
  const [statusTab, setStatusTab] = useState<string>("semua");
  const [cari, setCari] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);
  const [uang, setUang] = useState<Project | null>(null);

  const hasil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    return projects.filter((p) => {
      if (tab !== "semua" && p.jenis !== tab) return false;
      if (statusTab !== "semua" && p.status !== statusTab) return false;
      if (!q) return true;
      return (
        p.nama.toLowerCase().includes(q) ||
        (p.catatan || "").toLowerCase().includes(q) ||
        p.wallets.some((w) => w.label.toLowerCase().includes(q) || (w.address || "").toLowerCase().includes(q))
      );
    });
  }, [projects, tab, statusTab, cari]);

  const jumlah = (j: string) => (j === "semua" ? projects.length : projects.filter((p) => p.jenis === j).length);
  const jumlahStatus = (s: string) => (s === "semua" ? projects.length : projects.filter((p) => p.status === s).length);

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

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {TAB.map((t) => (
              <TabsTrigger key={t} value={t} className="shrink-0">
                {t === "semua" ? "Semua" : LABEL_JENIS[t as Jenis]}
                <span className="ml-1.5 text-xs opacity-60 tnum">{jumlah(t)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <Tabs value={statusTab} onValueChange={setStatusTab}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {STATUS_TAB.map((s) => (
              <TabsTrigger key={s} value={s} className="shrink-0">
                {s === "semua" ? "Semua status" : LABEL_STATUS[s as Status]}
                <span className="ml-1.5 text-xs opacity-60 tnum">{jumlahStatus(s)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {hasil.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-14 text-center">
          <p className="font-semibold">{cari || tab !== "semua" || statusTab !== "semua" ? "Gak ada yang cocok" : "Belum ada garapan di sini"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {cari || tab !== "semua" || statusTab !== "semua" ? "Coba filter atau kata kunci lain." : "Tambahin garapan pertama lo."}
          </p>
          {!cari && tab === "semua" && statusTab === "semua" && (
            <Button className="mt-4" onClick={bukaBaru}>
              <Plus className="mr-1.5 size-4" /> Tambah garapan
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {hasil.map((p) => (
            <ProjectCard key={p.id} p={p} onEdit={(x) => { setEdit(x); setFormOpen(true); }} onUang={setUang} />
          ))}
        </div>
      )}

      {/* Tombol tambah: melayang di HP, biasa di desktop */}
      <Button
        onClick={bukaBaru}
        className="fixed bottom-20 right-4 z-30 h-14 px-5 shadow-lg md:bottom-8 md:right-8"
      >
        <Plus className="mr-1.5 size-5" /> Garapan
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
