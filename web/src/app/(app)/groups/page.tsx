import { listGroups } from "@/lib/data/groups";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { GroupList } from "@/components/groups/GroupList";

export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  const groups = await listGroups();

  return (
    <>
      <PageHeader
        formNo="002"
        title="Groups"
        sub="Facebook groups being worked. Rules, cadence, and last post."
      />
      <Panel>
        <GroupList groups={groups} />
      </Panel>
    </>
  );
}
