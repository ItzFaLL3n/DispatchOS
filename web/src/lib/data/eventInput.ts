import { USER_EVENT_KINDS } from "@/lib/data/types";
import type { UserEventKind } from "@/lib/data/types";
import { ValidationError } from "@/lib/data/errors";

const MAX_BODY = 2000;

export function parseEventForm(fd: FormData): { kind: UserEventKind; body: string } {
  const kind = String(fd.get("kind") ?? "");
  const body = String(fd.get("body") ?? "").trim();

  if (!(USER_EVENT_KINDS as readonly string[]).includes(kind)) {
    throw new ValidationError("Pick an event type.");
  }
  if (body === "") {
    throw new ValidationError("Add a note for the timeline entry.");
  }
  if (body.length > MAX_BODY) {
    throw new ValidationError(`Keep it under ${MAX_BODY} characters.`);
  }

  return { kind: kind as UserEventKind, body };
}
