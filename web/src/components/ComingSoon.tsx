import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";

/**
 * Placeholder for the Phase 2 posting workflow (Creator, Schedule, Library) —
 * ticket 14 keeps them as stubs on purpose, real pages are Phase 2 work.
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
