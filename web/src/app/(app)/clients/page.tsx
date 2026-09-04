import { listClients } from "@/lib/data/clients";
import type { RetainerStatus } from "@/lib/data/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stamp, type StampTone } from "@/components/ui/Stamp";

// Reads live pipeline data — never prerender.
export const dynamic = "force-dynamic";

const RETAINER_TONE: Record<RetainerStatus, StampTone> = {
  "not-pitched": "neutral",
  pitched: "info",
  deferred: "warn",
  active: "good",
  declined: "bad",
};

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <>
      <PageHeader
        formNo="001"
        title="Clients"
        sub="Every prospect and client in the pipeline. Editing, phase tracking, and the timeline come in later slices."
      />
      <Panel title={`${clients.length} client${clients.length === 1 ? "" : "s"}`}>
        {clients.length === 0 ? (
          <div className="empty-state">
            No clients yet. Run <code>pnpm seed</code> to load the real pipeline
            (ticket 04).
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
                  <td>{c.businessName}</td>
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
