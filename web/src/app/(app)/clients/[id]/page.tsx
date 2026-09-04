import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient } from "@/lib/data/clients";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ClientRecord } from "@/components/clients/ClientRecord";
import { DeleteClientButton } from "@/components/clients/DeleteClientButton";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return (
    <>
      <PageHeader
        formNo="001"
        title={client.businessName}
        sub={`${client.slug} · phase ${client.phase} · ${client.buildStatus}`}
      />
      <div className="btn-row record-toolbar">
        <Link href="/clients" className="btn btn-ghost btn-sm">
          ← All clients
        </Link>
      </div>
      <Panel
        title="Record"
        actions={<DeleteClientButton id={client.id} name={client.businessName} />}
      >
        <ClientRecord client={client} />
      </Panel>
    </>
  );
}
