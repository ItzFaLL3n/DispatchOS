import { listGroups } from "@/lib/data/groups";
import { PageHeader } from "@/components/ui/PageHeader";
import { Creator } from "@/components/creator/Creator";

export const dynamic = "force-dynamic";

export default async function CreatorPage() {
  const groups = await listGroups();

  return (
    <>
      <PageHeader
        formNo="003"
        title="Creator"
        sub="Builds the gif-post and normal-post pair, following the rules on file."
      />
      <Creator groups={groups.map((g) => ({ id: g.id, label: g.name }))} />
    </>
  );
}
