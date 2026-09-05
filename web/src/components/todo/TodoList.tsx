"use client";

import { useActionState, useState } from "react";
import {
  createTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from "@/lib/data/todoActions";
import { Button } from "@/components/ui/Button";
import { Stamp, type StampTone } from "@/components/ui/Stamp";
import { TODO_PRIORITIES, TODO_STATUSES } from "@/lib/data/types";
import type { Todo, TodoPriority, TodoStatus } from "@/lib/data/types";
import type { FormState } from "@/lib/data/errors";

export type PickOption = { id: string; label: string };

const PRIORITY_TONE: Record<TodoPriority, StampTone> = {
  low: "neutral",
  medium: "info",
  high: "bad",
};
const STATUS_TONE: Record<TodoStatus, StampTone> = {
  todo: "neutral",
  "in-progress": "info",
  done: "good",
};

function LinkPicker({
  name,
  label,
  options,
  value,
}: {
  name: string;
  label: string;
  options: PickOption[];
  value?: string | null;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <select name={name} defaultValue={value ?? ""}>
        <option value="">—</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function TodoRow({
  todo,
  clients,
  groups,
}: {
  todo: Todo;
  clients: PickOption[];
  groups: PickOption[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    updateTodoAction,
    {},
  );

  return (
    <div className={`todo-row todo-${todo.status}`}>
      <form action={action} className="todo-form">
        <input type="hidden" name="id" value={todo.id} />
        <div className="field todo-title-field">
          <label>Title</label>
          <input type="text" name="title" defaultValue={todo.title} required />
        </div>
        <div className="field">
          <label>Due</label>
          <input type="date" name="dueDate" defaultValue={todo.dueDate ?? ""} />
        </div>
        <div className="field">
          <label>Priority</label>
          <select name="priority" defaultValue={todo.priority}>
            {TODO_PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Status</label>
          <select name="status" defaultValue={todo.status}>
            {TODO_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <LinkPicker name="clientId" label="Client" options={clients} value={todo.clientId} />
        <LinkPicker name="groupId" label="Group" options={groups} value={todo.groupId} />
        <div className="todo-row-actions">
          <Button type="submit" size="sm" variant="default" disabled={pending}>
            Save
          </Button>
        </div>
      </form>
      <form action={deleteTodoAction} className="todo-delete">
        <input type="hidden" name="id" value={todo.id} />
        <button type="submit" className="btn btn-ghost btn-sm btn-danger">
          Delete
        </button>
      </form>
      {state.error ? <div className="form-error">{state.error}</div> : null}
    </div>
  );
}

export function TodoList({
  todos,
  clients,
  groups,
}: {
  todos: Todo[];
  clients: PickOption[];
  groups: PickOption[];
}) {
  const [statusFilter, setStatusFilter] = useState<TodoStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | "all">("all");
  const [createState, createAction, creating] = useActionState<FormState, FormData>(
    createTodoAction,
    {},
  );

  const shown = todos.filter(
    (t) =>
      (statusFilter === "all" || t.status === statusFilter) &&
      (priorityFilter === "all" || t.priority === priorityFilter),
  );

  return (
    <>
      <form action={createAction} className="todo-form todo-create">
        <div className="field todo-title-field">
          <label htmlFor="new-title">New todo</label>
          <input id="new-title" type="text" name="title" required autoComplete="off" />
        </div>
        <div className="field">
          <label htmlFor="new-due">Due</label>
          <input id="new-due" type="date" name="dueDate" />
        </div>
        <div className="field">
          <label htmlFor="new-priority">Priority</label>
          <select id="new-priority" name="priority" defaultValue="medium">
            {TODO_PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <LinkPicker name="clientId" label="Client" options={clients} />
        <LinkPicker name="groupId" label="Group" options={groups} />
        <div className="todo-row-actions">
          <Button type="submit" size="sm" variant="default" disabled={creating}>
            Add
          </Button>
        </div>
        {createState.error ? (
          <div className="form-error">{createState.error}</div>
        ) : null}
      </form>

      <div className="todo-filters">
        <label>
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as TodoStatus | "all")}
          >
            <option value="all">all</option>
            {TODO_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select
            value={priorityFilter}
            onChange={(e) =>
              setPriorityFilter(e.target.value as TodoPriority | "all")
            }
          >
            <option value="all">all</option>
            {TODO_PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <span className="todo-count">
          {shown.length} of {todos.length}
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="empty-state">No todos match.</div>
      ) : (
        <ul className="todo-listing">
          {shown.map((t) => (
            <li key={t.id} className="todo-item">
              <div className="todo-stamps">
                <Stamp tone={PRIORITY_TONE[t.priority]}>{t.priority}</Stamp>
                <Stamp tone={STATUS_TONE[t.status]}>{t.status}</Stamp>
              </div>
              <TodoRow todo={t} clients={clients} groups={groups} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
