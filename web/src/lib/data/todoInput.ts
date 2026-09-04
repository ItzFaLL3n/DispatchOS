import { TODO_PRIORITIES, TODO_STATUSES } from "@/lib/data/types";
import type { TodoPriority, TodoStatus } from "@/lib/data/types";
import { ValidationError } from "@/lib/data/errors";
import { isIsoDate } from "@/lib/data/validate";

export type TodoWritable = {
  title: string;
  dueDate: string | null;
  priority: TodoPriority;
  status: TodoStatus;
  clientId: string | null;
  groupId: string | null;
};

export type ParsedTodoForm = Partial<TodoWritable>;

function raw(fd: FormData, key: string): string | undefined {
  const v = fd.get(key);
  return v == null ? undefined : String(v);
}

function inSet<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string,
): T {
  if (!allowed.includes(value as T)) {
    throw new ValidationError(`Invalid ${label}.`);
  }
  return value as T;
}

export function parseTodoForm(
  fd: FormData,
  opts: { mode: "create" | "update" },
): ParsedTodoForm {
  const out: ParsedTodoForm = {};
  const isCreate = opts.mode === "create";

  const titleRaw = raw(fd, "title");
  if (isCreate) {
    const title = (titleRaw ?? "").trim();
    if (!title) throw new ValidationError("A todo needs a title.");
    out.title = title;
  } else if (titleRaw !== undefined) {
    const title = titleRaw.trim();
    if (!title) throw new ValidationError("Title cannot be empty.");
    out.title = title;
  }

  const due = raw(fd, "dueDate");
  if (due !== undefined) {
    const v = due.trim();
    if (v === "") out.dueDate = null;
    else if (!isIsoDate(v)) throw new ValidationError("Due date must be a valid date.");
    else out.dueDate = v;
  }

  const priority = raw(fd, "priority");
  if (priority !== undefined && priority !== "") {
    out.priority = inSet(priority, TODO_PRIORITIES, "priority");
  } else if (isCreate) {
    out.priority = "medium";
  }

  const status = raw(fd, "status");
  if (status !== undefined && status !== "") {
    out.status = inSet(status, TODO_STATUSES, "status");
  } else if (isCreate) {
    out.status = "todo";
  }

  const clientId = raw(fd, "clientId");
  if (clientId !== undefined) out.clientId = clientId.trim() === "" ? null : clientId;

  const groupId = raw(fd, "groupId");
  if (groupId !== undefined) out.groupId = groupId.trim() === "" ? null : groupId;

  return out;
}
