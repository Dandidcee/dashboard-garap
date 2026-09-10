import { Judul } from "@/components/app-shell";
import { DueSection } from "@/components/due-section";
import { ProfitChart } from "@/components/profit-chart";
import { getLedger, getProjects, getSettings } from "@/lib/queries";
import { hitungDue, rekapPeriode } from "@/lib/due";
import { rupiah, tanggalLokal, cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [projects, settings, ledger] = await Promise.all([getProjects(), getSettings(), getLedger()]);

  const due = hitungDue(projects, settings);
  const perBulan = rekapPeriode(ledger, "bulan");
  const bulanIni = tanggalLokal(settings.timezone).slice(0, 7);
  const tahunIni = bulanIni.slice(0, 4);

  const total = projects.reduce((a, p) => a + p.profit, 0);
  const profitBulan = perBulan.find((r) => r.periode === bulanIni)?.profit ?? 0;
  const profitTahun = rekapPeriode(ledger, "tahun").find((r) => r.periode === tahunIni)?.profit ?? 0;
  const aktif = projects.filter((p) => p.status === "belum" || p.status === "digarap").length;

  return (
    <>
      <Judul sub={`${aktif} garapan jalan · ${projects.length} total`}>Ringkasan</Judul>

      {/* Yang paling sering dicari: apa yang harus digarap sekarang */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-bold">Perlu digarap</h2>
          <span className="hidden text-sm text-muted-foreground tnum md:inline">{due.length} item</span>
        </div>
        <DueSection items={due} />
      </section>

      <section className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {[
          { label: "Profit bulan ini", nilai: profitBulan },
          { label: "Profit tahun ini", nilai: profitTahun },
          { label: "Total sejak awal", nilai: total },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border/70 bg-card p-4 last:col-span-2 md:last:col-span-1">
            <p className="text-xs text-muted-foreground">{k.label}</p>
            <p className={cn("mt-1 text-xl font-extrabold tnum md:text-2xl",
              k.nilai > 0 ? "text-primary" : k.nilai < 0 ? "text-destructive" : "")}>
              {rupiah(k.nilai)}
            </p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-3 font-bold">Profit per bulan</h2>
        <div className="rounded-lg border border-border/70 bg-card p-3">
          <ProfitChart data={perBulan.slice(-12)} />
        </div>
      </section>
    </>
  );
}
