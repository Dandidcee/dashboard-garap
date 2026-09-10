import { Judul } from "@/components/app-shell";
import { ProjectsView } from "@/components/projects-view";
import { getProjects, getWallets, getLedger } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, wallets, ledger] = await Promise.all([getProjects(), getWallets(), getLedger()]);
  return (
    <>
      <Judul sub="Semua garapan, wallet yang dipakai, dan hasilnya.">Garapan</Judul>
      <ProjectsView projects={projects} wallets={wallets} ledger={ledger} />
    </>
  );
}
