import { Judul } from "@/components/app-shell";
import { PushToggle } from "@/components/push-toggle";
import { SettingsForm } from "@/components/settings-form";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();
  return (
    <>
      <Judul sub="Atur kapan tiap jenis garapan mengingatkan lo.">Pengaturan</Judul>

      <section className="mb-8 rounded-lg border border-border/70 bg-card p-4">
        <h2 className="mb-3 font-bold">Notifikasi di perangkat ini</h2>
        <PushToggle />
      </section>

      <SettingsForm awal={settings} />
    </>
  );
}
