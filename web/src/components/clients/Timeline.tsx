"use client";

import { useActionState } from "react";
import { addEventAction, resolveSignalAction, resolveMistakeAction } from "@/lib/data/eventActions";
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
import { USER_EVENT_KINDS } from "@/lib/data/types";
import type { ClientEvent, EventKind } from "@/lib/data/types";
import type { FormState } from "@/lib/data/errors";

const KIND_LABEL: Record<EventKind, string> = {
  note: "Note",
  touch: "Touch",
  "ascension-signal": "Ascension signal",
  "phase-change": "Phase change",
  system: "System",
  "ai-action": "AI action",
  mistake: "Mistake",
};

function formatWhen(iso: string, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function Timeline({
  clientId,
  events,
  operatorTz,
}: {
  clientId: string;
  events: ClientEvent[];
  operatorTz: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    addEventAction,
    {},
  );

  const openSignals = events.filter(
    (e) => e.kind === "ascension-signal" && !e.resolvedAt,
  ).length;

  return (
    <>
      {openSignals > 0 ? (
        <div className="signal-flag">
          {openSignals} open ascension signal{openSignals === 1 ? "" : "s"} — a
          client-driven buying signal to follow up on.
        </div>
      ) : null}

      <form action={formAction} className="event-form" key={events.length}>
        <input type="hidden" name="clientId" value={clientId} />
        <div className="field-row">
          <div className="field event-kind-field">
            <Label htmlFor="kind">Type</Label>
            <Select defaultValue="note" name="kind">
              <SelectTrigger id="kind" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_EVENT_KINDS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {KIND_LABEL[k]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="field">
            <Label htmlFor="body">What happened</Label>
            <Input id="body" name="body" type="text" required autoComplete="off" />
          </div>
        </div>
        {state.error ? <div className="form-error">{state.error}</div> : null}
        <div className="btn-row">
          <Button type="submit" variant="default" size="sm" disabled={pending}>
            {pending ? "Adding…" : "Add to timeline"}
          </Button>
        </div>
      </form>

      <ol className="timeline">
        {events.length === 0 ? (
          <li className="empty-state">No entries yet.</li>
        ) : null}
        {events.map((e) => (
          <li key={e.id} className={`timeline-item timeline-${e.kind}`}>
            <div className="timeline-meta">
              <span className="timeline-kind">{KIND_LABEL[e.kind]}</span>
              <span className="timeline-when">{formatWhen(e.at, operatorTz)}</span>
              {e.kind === "ascension-signal" || e.kind === "mistake" ? (
                e.resolvedAt ? (
                  <span className="timeline-resolved">
                    {e.kind === "mistake" ? "addressed" : "resolved"}
                  </span>
                ) : (
                  <form
                    action={e.kind === "mistake" ? resolveMistakeAction : resolveSignalAction}
                    className="timeline-resolve"
                  >
                    <input type="hidden" name="clientId" value={clientId} />
                    <input type="hidden" name="eventId" value={e.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      {e.kind === "mistake" ? "Mark addressed" : "Mark resolved"}
                    </Button>
                  </form>
                )
              ) : null}
            </div>
            <div className="timeline-body">{e.body}</div>
          </li>
        ))}
      </ol>
    </>
  );
}
