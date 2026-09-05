"use server";

import { revalidatePath } from "next/cache";
import { updateMrrGoal } from "@/lib/data/settings";
import { ValidationError, messageFor, type FormState } from "@/lib/data/errors";

export async function updateMrrGoalAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = String(formData.get("mrrGoal") ?? "");
  const value = Number(raw);
  try {
    if (!Number.isFinite(value) || value <= 0) {
      throw new ValidationError("Goal must be a number greater than 0.");
    }
    await updateMrrGoal(value);
  } catch (err) {
    return { error: messageFor(err) };
  }
  revalidatePath("/");
  return { ok: true };
}
