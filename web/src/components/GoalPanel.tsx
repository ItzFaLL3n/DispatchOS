"use client";

import { useActionState, useState } from "react";
import { updateMrrGoalAction } from "@/lib/data/settingsActions";
import { Button } from "@/components/ui/Button";
import type { FormState } from "@/lib/data/errors";

export function GoalPanel({
  currentMrr,
  mrrGoal,
}: {
  currentMrr: number;
  mrrGoal: number;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateMrrGoalAction,
    {},
  );

  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.ok) setEditing(false);
  }

  const pct = mrrGoal > 0 ? Math.min(100, Math.round((currentMrr / mrrGoal) * 100)) : 0;

  return (
    <div className="goal-panel">
      <div className="goal-panel-head">
        <div className="goal-panel-figures">
          <span className="goal-current">${currentMrr.toLocaleString()}</span>
          <span className="goal-sep">/</span>
          <span className="goal-target">${mrrGoal.toLocaleString()}/mo</span>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Cancel" : "Edit goal"}
        </button>
      </div>
      <div className="goal-bar-track">
        <div className="goal-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-panel-pct">{pct}% to goal — active retainer MRR</div>
      {editing ? (
        <form action={formAction} className="goal-edit-form">
          <input type="number" name="mrrGoal" defaultValue={mrrGoal} min={1} step={1} />
          <Button type="submit" variant="primary" size="sm" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          {state.error ? <span className="form-error">{state.error}</span> : null}
        </form>
      ) : null}
    </div>
  );
}
