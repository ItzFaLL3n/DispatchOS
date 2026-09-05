"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createClientAction, type FormState } from "@/lib/data/clientActions";
import { ClientFormFields } from "@/components/clients/ClientFormFields";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/button";

export default function NewClientPage() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createClientAction,
    {},
  );

  return (
    <>
      <PageHeader
        formNo="001"
        title="New client"
        sub="Business name, source, offer type and build status are required. Everything else can be filled in later."
      />
      <div className="btn-row record-toolbar">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/clients">← All clients</Link>
        </Button>
      </div>
      <Panel>
        <form action={formAction}>
          <ClientFormFields />
          {state.error ? <div className="form-error">{state.error}</div> : null}
          <div className="btn-row">
            <Button type="submit" variant="default" disabled={pending}>
              {pending ? "Creating…" : "Create client"}
            </Button>
          </div>
        </form>
      </Panel>
    </>
  );
}
