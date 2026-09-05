import { bridgeGateStatus } from "@/lib/derive/bridgeGate";
import {
  logCheckinAction,
  toggleGateFlagAction,
} from "@/lib/data/bridgeActions";
import { Button } from "@/components/ui/button";
import type { Client } from "@/lib/data/types";

/**
 * The Phase 8.5 bridge checklist for a delivered client: three auto items +
 * two manual toggles, resolving to a single "ready to pitch" / "not ready"
 * verdict. Server component — the toggles are plain form actions.
 */
export function BridgeGate({ client }: { client: Client }) {
  if (client.buildStatus !== "delivered") return null;
  const gate = bridgeGateStatus(client, new Date());

  return (
    <div className="gate">
      <div className={`gate-verdict gate-verdict-${gate.ready ? "ready" : "not"}`}>
        {gate.ready
          ? "Ready to pitch"
          : `Not ready — ${gate.missing.join(" · ")}`}
      </div>

      <ul className="gate-items">
        {gate.items.map((item) => (
          <li key={item.key} className="gate-item">
            <span
              className={`gate-box${item.met ? " gate-box-met" : ""}`}
              aria-hidden="true"
            />
            <span className="gate-label">{item.label}</span>
            <span className="gate-source">{item.source}</span>
            {item.source === "manual" ? (
              <form action={toggleGateFlagAction} className="gate-toggle">
                <input type="hidden" name="clientId" value={client.id} />
                <input type="hidden" name="flag" value={item.key} />
                <input
                  type="hidden"
                  name="value"
                  value={item.met ? "false" : "true"}
                />
                <Button type="submit" variant="ghost" size="sm">
                  {item.met ? "unmark" : "mark met"}
                </Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      <form action={logCheckinAction} className="gate-log">
        <input type="hidden" name="clientId" value={client.id} />
        <Button type="submit" size="sm">
          Log zero-ask check-in
        </Button>
        <span className="field-note">
          adds a timeline entry; tick “check-in landed” above once he replies
        </span>
      </form>
    </div>
  );
}
