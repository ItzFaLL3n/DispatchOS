"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/authActions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/button";

const INITIAL: LoginState = {};

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, INITIAL);

  return (
    <div className="login-wrap">
      <div className="login-inner">
        <PageHeader
          formNo="000"
          title="Dispatch OS"
          sub="Enter the access password to continue."
        />
        <Panel>
          <form action={formAction}>
            <input type="hidden" name="next" value={next} />
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                autoFocus
                required
              />
            </div>
            {state.error ? <div className="form-error">{state.error}</div> : null}
            <Button type="submit" variant="default" disabled={pending}>
              {pending ? "Checking…" : "Enter"}
            </Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
