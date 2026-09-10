import { Judul } from "@/components/app-shell";
import { WalletManager } from "@/components/wallet-manager";
import { getProjects, getWallets } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function WalletsPage() {
  const [wallets, projects] = await Promise.all([getWallets(), getProjects()]);
  return (
    <>
      <Judul sub="Wallet di sini bisa dipasang ke garapan mana pun.">Wallet</Judul>
      <WalletManager wallets={wallets} projects={projects} />
    </>
  );
}
