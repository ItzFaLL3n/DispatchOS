import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

/**
 * Dashboard. The conversion board and nags land in tickets 09 and 11; ticket 01
 * ships the shell with this placeholder body.
 */
export default function DashboardPage() {
  return (
    <>
      <PageHeader
        formNo="000"
        title="Dashboard"
        sub="The conversion board — delivered clients by where they sit in the post-delivery sequence — lands in a later slice. Right now this is the ported shell."
      />
      <Panel title="Conversion board">
        <div className="empty-state">Coming in ticket 09.</div>
      </Panel>
    </>
  );
}
