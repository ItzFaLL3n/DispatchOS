"use client";

import { useActionState, useEffect, useState } from "react";
import { applyPhaseAction, type FormState } from "@/lib/data/clientActions";
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
import { BUILD_STATUSES, PHASE_LABELS } from "@/lib/data/types";
import type { BuildStatus, Client } from "@/lib/data/types";

const PHASES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export function PhasePanel({ client }: { client: Client }) {
  const [phase, setPhase] = useState(client.phase);
  const [phaseSubstate, setPhaseSubstate] = useState(client.phaseSubstate ?? "");
  const [buildStatus, setBuildStatus] = useState(client.buildStatus);
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
          <Label htmlFor="phase">Phase</Label>
          <Select
            value={String(phase)}
            onValueChange={(v) => setPhase(Number(v))}
            name="phase"
          >
            <SelectTrigger id="phase" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHASES.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  {p} — {PHASE_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="field">
          {substateOptions.length > 0 ? (
            <>
              <Label htmlFor="phaseSubstate">Sub-state</Label>
              <Select
                value={phaseSubstate}
                onValueChange={setPhaseSubstate}
                name="phaseSubstate"
              >
                <SelectTrigger id="phaseSubstate" className="w-full">
                  <SelectValue placeholder="none" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">none</SelectItem>
                  {substateOptions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <>
              <Label>Sub-state</Label>
              <div className="field-note">only at phase 8 (bridge) or 9 (domain-trigger)</div>
            </>
          )}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="nextActionAt">Next action — date</Label>
          <Input
            id="nextActionAt"
            name="nextActionAt"
            type="date"
            defaultValue={client.nextActionAt ?? ""}
          />
        </div>
        <div className="field">
          <Label htmlFor="nextActionNote">Next action — note</Label>
          <Input
            id="nextActionNote"
            name="nextActionNote"
            type="text"
            defaultValue={client.nextActionNote ?? ""}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="doNotPitchUntil">Do not pitch until</Label>
          <Input
            id="doNotPitchUntil"
            name="doNotPitchUntil"
            type="date"
            defaultValue={client.doNotPitchUntil ?? ""}
          />
        </div>
        <div className="field">
          <Label htmlFor="buildStatus">Build status</Label>
          <Select
            value={buildStatus}
            onValueChange={(v) => setBuildStatus(v as BuildStatus)}
            name="buildStatus"
          >
            <SelectTrigger id="buildStatus" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUILD_STATUSES.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {state.error ? <div className="form-error">{state.error}</div> : null}
      <div className="btn-row">
        <Button type="submit" variant="default" disabled={pending}>
          {pending ? "Saving…" : "Save phase"}
        </Button>
        {toast ? <span className="inline-toast">Saved</span> : null}
      </div>
    </form>
  );
}
