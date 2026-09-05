import Link from "next/link";
import { listClients } from "@/lib/data/clients";
import { serverEnv } from "@/lib/env";
import { RETAINER_TONE } from "@/lib/clientDisplay";
import { PHASE_LABELS } from "@/lib/data/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stamp } from "@/components/ui/Stamp";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ContactWindow } from "@/components/ContactWindow";

// Reads live pipeline data — never prerender.
export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await listClients();
  const operatorTz = serverEnv.operatorTz;

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
          <Button variant="default" size="sm" asChild>
            <Link href="/clients/new">New client</Link>
          </Button>
        }
      >
        {clients.length === 0 ? (
          <div className="empty-state">
            No clients yet. Run <code>pnpm seed</code> to load the real pipeline
            (ticket 04), or add one with “New client”.
          </div>
        ) : (
          <Table className="table">
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Their time</TableHead>
                <TableHead>Phase</TableHead>
                <TableHead>Retainer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/clients/${c.id}`}>{c.businessName}</Link>
                  </TableCell>
                  <TableCell>{c.contactName ?? "—"}</TableCell>
                  <TableCell>
                    <ContactWindow
                      variant="inline"
                      timezone={c.timezone}
                      operatorTz={operatorTz}
                    />
                  </TableCell>
                  <TableCell>
                    {c.phase} — {PHASE_LABELS[c.phase] ?? "?"}
                    {c.phaseSubstate ? ` · ${c.phaseSubstate}` : ""}
                  </TableCell>
                  <TableCell>
                    <Stamp tone={RETAINER_TONE[c.retainerStatus]}>
                      {c.retainerStatus}
                    </Stamp>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </>
  );
}
