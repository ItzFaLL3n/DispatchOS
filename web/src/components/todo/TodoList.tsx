"use client";

import { useActionState, useState } from "react";
import {
  createTodoAction,
  deleteTodoAction,
  updateTodoAction,
} from "@/lib/data/todoActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <Label>{label}</Label>
      <Select defaultValue={value ?? "none"} name={name}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">—</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.id} value={o.id}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function PrioritySelect({ defaultValue }: { defaultValue: TodoPriority }) {
  return (
    <Select defaultValue={defaultValue} name="priority">
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TODO_PRIORITIES.map((p) => (
          <SelectItem key={p} value={p}>
            {p}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function StatusSelect({ defaultValue }: { defaultValue: TodoStatus }) {
  return (
    <Select defaultValue={defaultValue} name="status">
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TODO_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {s}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
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
          <Label>Title</Label>
          <Input type="text" name="title" defaultValue={todo.title} required />
        </div>
        <div className="field">
          <Label>Due</Label>
          <Input type="date" name="dueDate" defaultValue={todo.dueDate ?? ""} />
        </div>
        <div className="field">
          <Label>Priority</Label>
          <PrioritySelect defaultValue={todo.priority} />
        </div>
        <div className="field">
          <Label>Status</Label>
          <StatusSelect defaultValue={todo.status} />
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
        <Button type="submit" variant="ghost" size="sm">
          Delete
        </Button>
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
          <Label htmlFor="new-title">New todo</Label>
          <Input id="new-title" type="text" name="title" required autoComplete="off" />
        </div>
        <div className="field">
          <Label htmlFor="new-due">Due</Label>
          <Input id="new-due" type="date" name="dueDate" />
        </div>
        <div className="field">
          <Label htmlFor="new-priority">Priority</Label>
          <PrioritySelect defaultValue="medium" />
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
        <div className="field">
          <Label htmlFor="status-filter">Status</Label>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as TodoStatus | "all")}
          >
            <SelectTrigger id="status-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              {TODO_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="field">
          <Label htmlFor="priority-filter">Priority</Label>
          <Select
            value={priorityFilter}
            onValueChange={(v) => setPriorityFilter(v as TodoPriority | "all")}
          >
            <SelectTrigger id="priority-filter" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">all</SelectItem>
              {TODO_PRIORITIES.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
