import { listTodos } from "@/lib/data/todos";
import { listClients } from "@/lib/data/clients";
import { listGroups } from "@/lib/data/groups";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { TodoList } from "@/components/todo/TodoList";

export const dynamic = "force-dynamic";

export default async function TodoPage() {
  const [todos, clients, groups] = await Promise.all([
    listTodos(),
    listClients(),
    listGroups(),
  ]);

  return (
    <>
      <PageHeader
        formNo="006"
        title="Todo"
        sub="Follow-ups and tasks. Link one to the client or group it's about."
      />
      <Panel>
        <TodoList
          todos={todos}
          clients={clients.map((c) => ({ id: c.id, label: c.businessName }))}
          groups={groups.map((g) => ({ id: g.id, label: g.name }))}
        />
      </Panel>
    </>
  );
}
