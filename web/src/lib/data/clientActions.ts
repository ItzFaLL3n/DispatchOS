"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  applyPhaseUpdate,
  createClient,
  deleteClient,
  updateClient,
} from "@/lib/data/clients";
import { parseClientForm } from "@/lib/data/clientInput";
import { parsePhaseForm } from "@/lib/data/phaseInput";
import { messageFor, type FormState } from "@/lib/data/errors";

export type { FormState };

export async function createClientAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  let newId: string;
  try {
    const parsed = parseClientForm(formData, { mode: "create" });
    const created = await createClient(parsed);
    newId = created.id;
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath("/clients");
  redirect(`/clients/${newId}`);
}

export async function updateClientAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing client id." };
  try {
    const patch = parseClientForm(formData, { mode: "update" });
    await updateClient(id, patch);
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  return { ok: true };
}

export async function applyPhaseAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing client id." };
  try {
    const patch = parsePhaseForm(formData);
    await applyPhaseUpdate(id, patch);
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  return { ok: true };
}

export async function deleteClientAction(formData: FormData): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (id) {
    await deleteClient(id);
    revalidatePath("/clients");
  }
  redirect("/clients");
}
