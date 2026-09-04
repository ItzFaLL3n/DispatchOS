import Link from "next/link";
import { Stamp, type StampTone } from "@/components/ui/Stamp";
import type { Todo, TodoPriority } from "@/lib/data/types";

const PRIORITY_TONE: Record<TodoPriority, StampTone> = {
  low: "neutral",
  medium: "info",
  high: "bad",
};

/** Read-only list of a client's open todos on the record page. Manage in /todo. */
export function ClientTodos({ todos }: { todos: Todo[] }) {
  if (todos.length === 0) {
    return <div className="empty-state">No open todos.</div>;
  }
  return (
    <ul className="client-todos">
      {todos.map((t) => (
        <li key={t.id} className="client-todo">
          <Stamp tone={PRIORITY_TONE[t.priority]}>{t.priority}</Stamp>
          <span className="client-todo-title">{t.title}</span>
          <span className="client-todo-meta">
            {t.status}
            {t.dueDate ? ` · due ${t.dueDate}` : ""}
          </span>
        </li>
      ))}
      <li className="client-todo-manage">
        <Link href="/todo">manage in Todo →</Link>
      </li>
    </ul>
  );
}
