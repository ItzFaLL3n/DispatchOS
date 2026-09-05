"use client";

import { useActionState, useEffect, useState } from "react";
import { updateClientAction, type FormState } from "@/lib/data/clientActions";
import { ClientFormFields } from "@/components/clients/ClientFormFields";
import { ContactWindow } from "@/components/ContactWindow";
import { Button } from "@/components/ui/Button";
import { Stamp } from "@/components/ui/Stamp";
import { BUILD_TONE, RETAINER_TONE } from "@/lib/clientDisplay";
import type { Client } from "@/lib/data/types";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="record-row">
      <div className="record-label">{label}</div>
      <div className="record-value">{children}</div>
    </div>
  );
}

const dash = (s: string | null) => (s && s.trim() !== "" ? s : "—");

export function ClientRecord({
  client,
  operatorTz,
}: {
  client: Client;
  operatorTz: string;
}) {
  const [editing, setEditing] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    updateClientAction,
    {},
  );
  const [toast, setToast] = useState(false);

  // Adjust local state when a save result arrives (render-phase, not an effect).
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.ok) {
      setEditing(false);
      setToast(true);
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 2000);
    return () => clearTimeout(t);
  }, [toast]);

  if (editing) {
    return (
      <form action={formAction}>
        <input type="hidden" name="id" value={client.id} />
        <ClientFormFields client={client} />
        {state.error ? <div className="form-error">{state.error}</div> : null}
        <div className="btn-row">
          <Button type="submit" variant="default" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <>
      <div className="record-topline">
        <ContactWindow
          timezone={client.timezone}
          contactHours={client.contactHours}
          operatorTz={operatorTz}
        />
        <Button variant="default" size="sm" onClick={() => setEditing(true)}>
          Edit
        </Button>
      </div>

      <div className="record-view">
        <Row label="Business">{client.businessName}</Row>
        <Row label="Slug">{client.slug}</Row>
        <Row label="Contact">{dash(client.contactName)}</Row>
        <Row label="Location">{dash(client.location)}</Row>
        <Row label="Timezone">{dash(client.timezone)}</Row>
        <Row label="Contact hours">{dash(client.contactHours)}</Row>
        <Row label="Source">{dash(client.source)}</Row>
        <Row label="Offer type">{dash(client.offerType)}</Row>
        <Row label="Build status">
          <Stamp tone={BUILD_TONE[client.buildStatus]}>{client.buildStatus}</Stamp>
        </Row>
        <Row label="Retainer">
          <Stamp tone={RETAINER_TONE[client.retainerStatus]}>
            {client.retainerStatus}
          </Stamp>
        </Row>
        <Row label="Retainer tier">{dash(client.retainerTier)}</Row>
        <Row label="MRR">{client.mrr}</Row>
        <Row label="Site URL">{dash(client.siteUrl)}</Row>
        <Row label="Domain">{dash(client.domain)}</Row>
        <Row label="PayPal plan URL">{dash(client.paypalPlanUrl)}</Row>
        <Row label="Phase">
          {client.phase}
          {client.phaseSubstate ? ` · ${client.phaseSubstate}` : ""}
        </Row>
        <Row label="Notes">{dash(client.notes)}</Row>
      </div>

      <div className="record-brief">
        <div className="record-label">Brief</div>
        <pre className="brief-md">{client.briefMd ?? "—"}</pre>
      </div>

      {toast ? <div className="toast show">Saved</div> : null}
    </>
  );
}
