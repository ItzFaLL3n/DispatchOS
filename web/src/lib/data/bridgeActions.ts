"use server";

import { revalidatePath } from "next/cache";
import { setBridgeGateFlag } from "@/lib/data/clients";
import { createClientEvent } from "@/lib/data/events";

const FLAG_COLUMN = {
  "checkin-landed": "checkin_landed",
  "nothing-asked": "nothing_asked_since_delivery",
} as const;

type GateFlagKey = keyof typeof FLAG_COLUMN;

export async function toggleGateFlagAction(formData: FormData): Promise<void> {
  const clientId = String(formData.get("clientId") ?? "");
  const key = String(formData.get("flag") ?? "");
  if (!clientId || !(key in FLAG_COLUMN)) return;

  await setBridgeGateFlag(
    clientId,
    FLAG_COLUMN[key as GateFlagKey],
    formData.get("value") === "true",
  );
  revalidatePath(`/clients/${clientId}`);
  revalidatePath("/clients");
}

/** Log that the zero-ask check-in was sent. Does NOT mark it "landed" — that
 *  stays manual (landed = he replied), see the checklist toggle. */
export async function logCheckinAction(formData: FormData): Promise<void> {
  const clientId = String(formData.get("clientId") ?? "");
  if (!clientId) return;
  await createClientEvent(clientId, "touch", "zero-ask check-in sent");
  revalidatePath(`/clients/${clientId}`);
}
