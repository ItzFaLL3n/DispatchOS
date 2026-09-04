import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

/**
 * Scaffold placeholder so the nav is fully navigable from ticket 01. Individual
 * pages are replaced by their own tickets (03 clients, 12 todo, 13 groups,
 * 14 creator/schedule/library).
 */
export function ComingSoon({
  formNo,
  title,
  note,
}: {
  formNo: string;
  title: string;
  note: string;
}) {
  return (
    <>
      <PageHeader formNo={formNo} title={title} sub={note} />
      <Panel>
        <div className="empty-state">Not built yet — {note}</div>
      </Panel>
    </>
  );
}
