import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Judul } from "@/components/app-shell";
import { CredentialsView } from "@/components/credentials-view";
import { getFolder, getCredentials } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function FolderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const folder = await getFolder(id);
  if (!folder) notFound();

  const credentials = await getCredentials(id);

  return (
    <>
      <Link href="/credentials" className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="size-4" /> Kredensial
      </Link>
      <Judul sub={`${credentials.length} akun tersimpan`}>{folder.nama}</Judul>
      <CredentialsView folderId={id} credentials={credentials} />
    </>
  );
}
