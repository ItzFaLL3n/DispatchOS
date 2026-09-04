import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient } from "@/lib/data/clients";
import { listClientEvents } from "@/lib/data/events";
import { listOpenTodosForClient } from "@/lib/data/todos";
import { serverEnv } from "@/lib/env";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ClientRecord } from "@/components/clients/ClientRecord";
import { PhasePanel } from "@/components/clients/PhasePanel";
import { BridgeGate } from "@/components/clients/BridgeGate";
import { ClientTodos } from "@/components/clients/ClientTodos";
import { Timeline } from "@/components/clients/Timeline";
import { DeleteClientButton } from "@/components/clients/DeleteClientButton";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, events, openTodos] = await Promise.all([
    getClient(id),
    listClientEvents(id),
    listOpenTodosForClient(id),
  ]);
  if (!client) notFound();
  const operatorTz = serverEnv.operatorTz;

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

      <Panel title="Phase & sequence" className="stack-panel">
        <PhasePanel
          key={`${client.phase}-${client.phaseSubstate}-${client.nextActionAt}-${client.nextActionNote}-${client.doNotPitchUntil}-${client.buildStatus}`}
          client={client}
        />
      </Panel>

      {client.buildStatus === "delivered" ? (
        <Panel title="Bridge gate — Phase 8.5" className="stack-panel">
          <BridgeGate client={client} />
        </Panel>
      ) : null}

      <Panel
        title="Record"
        className="stack-panel"
        actions={<DeleteClientButton id={client.id} name={client.businessName} />}
      >
        <ClientRecord client={client} operatorTz={operatorTz} />
      </Panel>

      <Panel title="Open todos" className="stack-panel">
        <ClientTodos todos={openTodos} />
      </Panel>

      <Panel title="Timeline">
        <Timeline clientId={client.id} events={events} operatorTz={operatorTz} />
      </Panel>
    </>
  );
}
