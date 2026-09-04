import {
  BUILD_STATUSES,
  CLIENT_SOURCES,
  OFFER_TYPES,
  RETAINER_STATUSES,
} from "@/lib/data/types";
import type { Client } from "@/lib/data/types";

/**
 * The editable client fields, shared by the "new client" form and the record
 * edit form. Phase / dates / bridge-gate flags are ticket 06, not here.
 * No hooks — safe to render inside a client form component.
 */
export function ClientFormFields({ client }: { client?: Client }) {
  const v = <T,>(x: T | null | undefined): string =>
    x === null || x === undefined ? "" : String(x);

  return (
    <>
      <div className="field">
        <label htmlFor="businessName">Business name</label>
        <input
          id="businessName"
          name="businessName"
          type="text"
          required
          defaultValue={v(client?.businessName)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="contactName">Contact name</label>
          <input id="contactName" name="contactName" type="text" defaultValue={v(client?.contactName)} />
        </div>
        <div className="field">
          <label htmlFor="location">Location / service area</label>
          <input id="location" name="location" type="text" defaultValue={v(client?.location)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="source">Source</label>
          <select id="source" name="source" defaultValue={v(client?.source)} required={!client}>
            <option value="">— select —</option>
            {CLIENT_SOURCES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="offerType">Offer type</label>
          <select id="offerType" name="offerType" defaultValue={v(client?.offerType)} required={!client}>
            <option value="">— select —</option>
            {OFFER_TYPES.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="buildStatus">Build status</label>
          <select
            id="buildStatus"
            name="buildStatus"
            defaultValue={client?.buildStatus ?? "not-started"}
            required
          >
            {BUILD_STATUSES.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="retainerStatus">Retainer status</label>
          <select
            id="retainerStatus"
            name="retainerStatus"
            defaultValue={client?.retainerStatus ?? "not-pitched"}
            required
          >
            {RETAINER_STATUSES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="retainerTier">Retainer tier</label>
          <input id="retainerTier" name="retainerTier" type="text" defaultValue={v(client?.retainerTier)} />
        </div>
        <div className="field">
          <label htmlFor="mrr">MRR</label>
          <input id="mrr" name="mrr" type="number" min="0" step="1" defaultValue={v(client?.mrr ?? 0)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="timezone">Timezone (IANA)</label>
          <input
            id="timezone"
            name="timezone"
            type="text"
            placeholder="America/Chicago"
            defaultValue={v(client?.timezone)}
          />
        </div>
        <div className="field">
          <label htmlFor="contactHours">Contact hours note</label>
          <input id="contactHours" name="contactHours" type="text" defaultValue={v(client?.contactHours)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="siteUrl">Site URL</label>
          <input id="siteUrl" name="siteUrl" type="text" defaultValue={v(client?.siteUrl)} />
        </div>
        <div className="field">
          <label htmlFor="domain">Domain</label>
          <input id="domain" name="domain" type="text" defaultValue={v(client?.domain)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="paypalPlanUrl">PayPal plan URL</label>
        <input id="paypalPlanUrl" name="paypalPlanUrl" type="text" defaultValue={v(client?.paypalPlanUrl)} />
      </div>

      <div className="field">
        <label htmlFor="notes">Notes</label>
        <textarea id="notes" name="notes" defaultValue={v(client?.notes)} />
      </div>

      <div className="field">
        <label htmlFor="briefMd">Brief (markdown)</label>
        <textarea
          id="briefMd"
          name="briefMd"
          rows={10}
          defaultValue={v(client?.briefMd)}
        />
      </div>
    </>
  );
}
