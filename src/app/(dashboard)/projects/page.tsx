import { Judul } from "@/components/app-shell";
import { ProjectsView } from "@/components/projects-view";
import { getProjects, getWallets } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const [projects, wallets] = await Promise.all([getProjects(), getWallets()]);
  return (
    <>
      <Judul sub="Semua garapan, wallet yang dipakai, dan hasilnya.">Garapan</Judul>
      <ProjectsView projects={projects} wallets={wallets} />
    </>
  );
}
