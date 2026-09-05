import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BUILD_STATUSES,
  CLIENT_SOURCES,
  OFFER_TYPES,
  RETAINER_STATUSES,
} from "@/lib/data/types";
import type { Client } from "@/lib/data/types";
import { TIMEZONES } from "@/lib/timezones";

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
        <Label htmlFor="businessName">Business name</Label>
        <Input
          id="businessName"
          name="businessName"
          type="text"
          required
          defaultValue={v(client?.businessName)}
        />
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="contactName">Contact name</Label>
          <Input id="contactName" name="contactName" type="text" defaultValue={v(client?.contactName)} />
        </div>
        <div className="field">
          <Label htmlFor="location">Location / service area</Label>
          <Input id="location" name="location" type="text" defaultValue={v(client?.location)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="source">Source</Label>
          <Select defaultValue={v(client?.source) || undefined} name="source">
            <SelectTrigger id="source" className="w-full">
              <SelectValue placeholder="— select —" />
            </SelectTrigger>
            <SelectContent>
              {CLIENT_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="field">
          <Label htmlFor="offerType">Offer type</Label>
          <Select defaultValue={v(client?.offerType) || undefined} name="offerType">
            <SelectTrigger id="offerType" className="w-full">
              <SelectValue placeholder="— select —" />
            </SelectTrigger>
            <SelectContent>
              {OFFER_TYPES.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="buildStatus">Build status</Label>
          <Select defaultValue={client?.buildStatus ?? "not-started"} name="buildStatus">
            <SelectTrigger id="buildStatus" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUILD_STATUSES.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="field">
          <Label htmlFor="retainerStatus">Retainer status</Label>
          <Select defaultValue={client?.retainerStatus ?? "not-pitched"} name="retainerStatus">
            <SelectTrigger id="retainerStatus" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RETAINER_STATUSES.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="retainerTier">Retainer tier</Label>
          <Input id="retainerTier" name="retainerTier" type="text" defaultValue={v(client?.retainerTier)} />
        </div>
        <div className="field">
          <Label htmlFor="mrr">MRR</Label>
          <Input id="mrr" name="mrr" type="number" min="0" step="1" defaultValue={v(client?.mrr ?? 0)} />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="timezone">Timezone</Label>
          <Select defaultValue={v(client?.timezone) || undefined} name="timezone">
            <SelectTrigger id="timezone" className="w-full">
              <SelectValue placeholder="— none —" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>
                  {tz}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="field">
          <Label htmlFor="contactHours">Contact hours note</Label>
          <Input
            id="contactHours"
            name="contactHours"
            type="text"
            placeholder="e.g. evenings only"
            defaultValue={v(client?.contactHours)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <Label htmlFor="siteUrl">Site URL</Label>
          <Input id="siteUrl" name="siteUrl" type="text" defaultValue={v(client?.siteUrl)} />
        </div>
        <div className="field">
          <Label htmlFor="domain">Domain</Label>
          <Input id="domain" name="domain" type="text" defaultValue={v(client?.domain)} />
        </div>
      </div>

      <div className="field">
        <Label htmlFor="paypalPlanUrl">PayPal plan URL</Label>
        <Input id="paypalPlanUrl" name="paypalPlanUrl" type="text" defaultValue={v(client?.paypalPlanUrl)} />
      </div>

      <div className="field">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" defaultValue={v(client?.notes)} />
      </div>

      <div className="field">
        <Label htmlFor="briefMd">Brief (markdown)</Label>
        <Textarea
          id="briefMd"
          name="briefMd"
          rows={10}
          defaultValue={v(client?.briefMd)}
        />
      </div>
    </>
  );
}
