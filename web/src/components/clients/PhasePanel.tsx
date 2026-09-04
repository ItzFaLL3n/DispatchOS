"use client";

import { useActionState, useEffect, useState } from "react";
import { applyPhaseAction, type FormState } from "@/lib/data/clientActions";
import { Button } from "@/components/ui/Button";
import { BUILD_STATUSES } from "@/lib/data/types";
import type { Client } from "@/lib/data/types";

const PHASES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function PhasePanel({ client }: { client: Client }) {
  const [phase, setPhase] = useState(client.phase);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    applyPhaseAction,
    {},
  );

  const [handled, setHandled] = useState(state);
  const [toast, setToast] = useState(false);
  if (state !== handled) {
    setHandled(state);
    if (state.ok) setToast(true);
  }
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  const substateOptions =
    phase === 8 ? ["bridge"] : phase === 9 ? ["domain-trigger"] : [];

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={client.id} />

      <div className="field-row">
        <div className="field">
          <label htmlFor="phase">Phase</label>
          <select
            id="phase"
            name="phase"
            value={phase}
            onChange={(e) => setPhase(Number(e.target.value))}
          >
            {PHASES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          {substateOptions.length > 0 ? (
            <>
              <label htmlFor="phaseSubstate">Sub-state</label>
              <select
                id="phaseSubstate"
                name="phaseSubstate"
                defaultValue={client.phaseSubstate ?? ""}
              >
                <option value="">none</option>
                {substateOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <label>Sub-state</label>
              <div className="field-note">only at phase 8 (bridge) or 9 (domain-trigger)</div>
            </>
          )}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="nextActionAt">Next action — date</label>
          <input
            id="nextActionAt"
            name="nextActionAt"
            type="date"
            defaultValue={client.nextActionAt ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="nextActionNote">Next action — note</label>
          <input
            id="nextActionNote"
            name="nextActionNote"
            type="text"
            defaultValue={client.nextActionNote ?? ""}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="doNotPitchUntil">Do not pitch until</label>
          <input
            id="doNotPitchUntil"
            name="doNotPitchUntil"
            type="date"
            defaultValue={client.doNotPitchUntil ?? ""}
          />
        </div>
        <div className="field">
          <label htmlFor="buildStatus">Build status</label>
          <select
            id="buildStatus"
            name="buildStatus"
            defaultValue={client.buildStatus}
          >
            {BUILD_STATUSES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.error ? <div className="form-error">{state.error}</div> : null}
      <div className="btn-row">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save phase"}
        </Button>
        {toast ? <span className="inline-toast">Saved</span> : null}
      </div>
    </form>
  );
}
