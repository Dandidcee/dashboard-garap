import { Judul } from "@/components/app-shell";
import { CredentialFoldersView } from "@/components/credential-folders-view";
import { getCredentialFolders } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function CredentialsPage() {
  const folders = await getCredentialFolders();
  return (
    <>
      <Judul sub="Login website & sandi, dikelompokin per folder.">Kredensial</Judul>
      <CredentialFoldersView folders={folders} />
    </>
  );
}
