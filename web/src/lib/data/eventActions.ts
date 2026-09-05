"use server";

import { revalidatePath } from "next/cache";
import { createClientEvent, resolveAscensionSignal, resolveMistake } from "@/lib/data/events";
import { parseEventForm } from "@/lib/data/eventInput";
import { messageFor, type FormState } from "@/lib/data/errors";

export async function addEventAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const clientId = String(formData.get("clientId") ?? "");
  if (!clientId) return { error: "Missing client id." };
  try {
    const { kind, body } = parseEventForm(formData);
    await createClientEvent(clientId, kind, body);
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath(`/clients/${clientId}`);
  return { ok: true };
}

export async function resolveSignalAction(formData: FormData): Promise<void> {
  const clientId = String(formData.get("clientId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  if (!clientId || !eventId) return;
  await resolveAscensionSignal(eventId);
  revalidatePath(`/clients/${clientId}`);
}

export async function resolveMistakeAction(formData: FormData): Promise<void> {
  const clientId = String(formData.get("clientId") ?? "");
  const eventId = String(formData.get("eventId") ?? "");
  if (!clientId || !eventId) return;
  await resolveMistake(eventId);
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/");
}
