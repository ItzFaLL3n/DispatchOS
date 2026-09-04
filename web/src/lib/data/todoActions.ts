"use server";

import { revalidatePath } from "next/cache";
import { createTodo, deleteTodo, updateTodo } from "@/lib/data/todos";
import { parseTodoForm } from "@/lib/data/todoInput";
import { messageFor, type FormState } from "@/lib/data/errors";

export async function createTodoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await createTodo(parseTodoForm(formData, { mode: "create" }));
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath("/todo");
  revalidatePath("/clients/[id]", "page");
  return { ok: true };
}

export async function updateTodoAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing todo id." };
  try {
    await updateTodo(id, parseTodoForm(formData, { mode: "update" }));
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath("/todo");
  revalidatePath("/clients/[id]", "page");
  return { ok: true };
}

export async function deleteTodoAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteTodo(id);
    revalidatePath("/todo");
    revalidatePath("/clients/[id]", "page");
  }
}
