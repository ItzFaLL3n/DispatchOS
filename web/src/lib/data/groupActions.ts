"use server";

import { revalidatePath } from "next/cache";
import { createGroup, deleteGroup, updateGroup } from "@/lib/data/groups";
import { parseGroupForm } from "@/lib/data/groupInput";
import { messageFor, type FormState } from "@/lib/data/errors";

export async function createGroupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  try {
    await createGroup(parseGroupForm(formData, { mode: "create" }));
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath("/groups");
  revalidatePath("/todo");
  return { ok: true };
}

export async function updateGroupAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing group id." };
  try {
    await updateGroup(id, parseGroupForm(formData, { mode: "update" }));
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath("/groups");
  revalidatePath("/todo");
  return { ok: true };
}

export async function deleteGroupAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteGroup(id);
    revalidatePath("/groups");
    revalidatePath("/todo");
  }
}
