import { Judul } from "@/components/app-shell";
import { PantauanView } from "@/components/pantauan-view";
import { getPantauan, getSettings } from "@/lib/queries";
import { hitungDuePantauan } from "@/lib/due";

export const dynamic = "force-dynamic";

export default async function PantauanPage() {
  const [pantauan, settings] = await Promise.all([getPantauan(), getSettings()]);
  const belumHariIni = hitungDuePantauan(pantauan, settings).map((p) => p.id);

  return (
    <>
      <Judul sub={`${pantauan.length} akun dipantau`}>Pantauan</Judul>
      <PantauanView pantauan={pantauan} belumHariIni={belumHariIni} />
    </>
  );
}
