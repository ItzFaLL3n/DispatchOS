import Link from "next/link";
import { listClients } from "@/lib/data/clients";
import { RETAINER_TONE } from "@/lib/clientDisplay";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stamp } from "@/components/ui/Stamp";

// Reads live pipeline data — never prerender.
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <>
      <PageHeader
        formNo="001"
        title="Clients"
        sub="Every prospect and client in the pipeline. Phase tracking and the timeline come in later slices."
      />
      <Panel
        title={`${clients.length} client${clients.length === 1 ? "" : "s"}`}
        actions={
          <Link href="/clients/new" className="btn btn-primary btn-sm">
            New client
          </Link>
        }
      >
        {clients.length === 0 ? (
          <div className="empty-state">
            No clients yet. Run <code>pnpm seed</code> to load the real pipeline
            (ticket 04), or add one with “New client”.
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Contact</th>
                <th>Phase</th>
                <th>Retainer</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link href={`/clients/${c.id}`}>{c.businessName}</Link>
                  </td>
                  <td>{c.contactName ?? "—"}</td>
                  <td>
                    {c.phase}
                    {c.phaseSubstate ? ` · ${c.phaseSubstate}` : ""}
                  </td>
                  <td>
                    <Stamp tone={RETAINER_TONE[c.retainerStatus]}>
                      {c.retainerStatus}
                    </Stamp>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>
    </>
  );
}
