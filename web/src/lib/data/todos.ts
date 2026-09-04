import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase";
import { snakeizeKeys } from "@/lib/data/camelize";
import { mapTodoRow } from "@/lib/data/mappers";
import type { ParsedTodoForm } from "@/lib/data/todoInput";
import type { Todo } from "@/lib/data/types";

const SELECT = "*";

export async function listTodos(): Promise<Todo[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("todos")
    .select(SELECT)
    .order("status", { ascending: true })
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`listTodos: ${error.message}`);
  return (data ?? []).map((r) => mapTodoRow(r as Record<string, unknown>));
}

/** A client's todos that are not done, for the record page. */
export async function listOpenTodosForClient(clientId: string): Promise<Todo[]> {
  const { data, error } = await getSupabaseAdmin()
    .from("todos")
    .select(SELECT)
    .eq("client_id", clientId)
    .neq("status", "done")
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    throw new Error(`listOpenTodosForClient(${clientId}): ${error.message}`);
  }
  return (data ?? []).map((r) => mapTodoRow(r as Record<string, unknown>));
}

export async function createTodo(input: ParsedTodoForm): Promise<Todo> {
  const { data, error } = await getSupabaseAdmin()
    .from("todos")
    .insert(snakeizeKeys(input as Record<string, unknown>))
    .select(SELECT)
    .single();

  if (error) throw new Error(`createTodo: ${error.message}`);
  return mapTodoRow(data as Record<string, unknown>);
}

export async function updateTodo(id: string, patch: ParsedTodoForm): Promise<Todo> {
  const body = snakeizeKeys(patch as Record<string, unknown>);
  if (Object.keys(body).length === 0) {
    const { data, error } = await getSupabaseAdmin()
      .from("todos")
      .select(SELECT)
      .eq("id", id)
      .single();
    if (error) throw new Error(`updateTodo(${id}): ${error.message}`);
    return mapTodoRow(data as Record<string, unknown>);
  }

  const { data, error } = await getSupabaseAdmin()
    .from("todos")
    .update(body)
    .eq("id", id)
    .select(SELECT)
    .single();

  if (error) throw new Error(`updateTodo(${id}): ${error.message}`);
  return mapTodoRow(data as Record<string, unknown>);
}

export async function deleteTodo(id: string): Promise<void> {
  const { error } = await getSupabaseAdmin().from("todos").delete().eq("id", id);
  if (error) throw new Error(`deleteTodo(${id}): ${error.message}`);
}
