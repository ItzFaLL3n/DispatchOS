/**
 * "Is it a reasonable time to text this client?" — pure, no I/O.
 *
 * Window: 09:00–20:00 in the client's own timezone counts as green; the hour on
 * either side (08:00–09:00, 20:00–21:00) is amber; everything else is red. Any
 * day of the week — hauling operators work weekends.
 *
 * Local time is derived from the given UTC instant with Intl (the IANA tz
 * database, including DST rules, ships in the JS runtime — no library).
 */

export type ContactLevel = "green" | "amber" | "red";

export type ContactWindow = {
  level: ContactLevel;
  localTime: string; // e.g. "3:14 PM"
  localDay: string; // e.g. "Tue"
  /** Minutes until the next local 09:00; null when the window is green. */
  opensInMinutes: number | null;
};

const OPEN = 9 * 60;
const CLOSE = 20 * 60;
const AMBER_BEFORE = 8 * 60;
const AMBER_AFTER = 21 * 60;
const DAY = 24 * 60;

export function contactWindowStatus(
  timezone: string | null | undefined,
  now: Date,
): ContactWindow | null {
  if (!timezone) return null;

  let hour: number;
  let minute: number;
  let localDay: string;
  let localTime: string;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hourCycle: "h23",
      hour: "2-digit",
      minute: "2-digit",
      weekday: "short",
    }).formatToParts(now);
    const part = (type: string) =>
      parts.find((p) => p.type === type)?.value ?? "";
    hour = Number.parseInt(part("hour"), 10) % 24;
    minute = Number.parseInt(part("minute"), 10);
    localDay = part("weekday");
    localTime = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  } catch {
    return null; // unknown / malformed timezone
  }

  const mins = hour * 60 + minute;

  let level: ContactLevel;
  if (mins >= OPEN && mins < CLOSE) level = "green";
  else if (
    (mins >= AMBER_BEFORE && mins < OPEN) ||
    (mins >= CLOSE && mins < AMBER_AFTER)
  ) {
    level = "amber";
  } else {
    level = "red";
  }

  const opensInMinutes =
    level === "green" ? null : mins < OPEN ? OPEN - mins : DAY - mins + OPEN;

  return { level, localTime, localDay, opensInMinutes };
}

export function nextContactWindow(opensInMinutes: number | null): string | null {
  if (opensInMinutes == null) return null;
  const h = Math.floor(opensInMinutes / 60);
  const m = opensInMinutes % 60;
  if (h === 0) return `opens in ${m}m`;
  if (m === 0) return `opens in ${h}h`;
  return `opens in ${h}h ${m}m`;
}
