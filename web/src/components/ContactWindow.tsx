"use client";

import { useSyncExternalStore } from "react";
import {
  contactWindowStatus,
  nextContactWindow,
} from "@/lib/derive/contactWindow";

// One shared 30-second clock for every ContactWindow on the page.
const TICK_MS = 30_000;
let cached: { bucket: number; date: Date } = { bucket: -1, date: new Date(0) };

function subscribe(onChange: () => void): () => void {
  const id = setInterval(onChange, TICK_MS);
  return () => clearInterval(id);
}
function getSnapshot(): Date {
  const now = Date.now();
  const bucket = Math.floor(now / TICK_MS);
  if (bucket !== cached.bucket) cached = { bucket, date: new Date(now) };
  return cached.date;
}
function getServerSnapshot(): null {
  return null;
}
function useNow(): Date | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function operatorClock(tz: string, now: Date): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now);
  } catch {
    return "—";
  }
}

/**
 * Live client-local clock + contact-window light. Renders a stable placeholder
 * until mounted so the server and client markup agree.
 */
export function ContactWindow({
  timezone,
  contactHours,
  operatorTz,
  variant = "full",
}: {
  timezone: string | null;
  contactHours?: string | null;
  operatorTz: string;
  variant?: "full" | "inline";
}) {
  const now = useNow();

  if (!now) {
    return <span className="cw-placeholder">…</span>;
  }

  if (!timezone) {
    if (variant === "inline") {
      return <span className="cw-muted">no timezone</span>;
    }
    return (
      <div className="cw">
        <span className="cw-muted">timezone not set</span>
        {contactHours ? <span className="cw-hours">{contactHours}</span> : null}
      </div>
    );
  }

  const w = contactWindowStatus(timezone, now);
  if (!w) {
    return <span className="cw-muted">bad timezone: {timezone}</span>;
  }

  const opens = nextContactWindow(w.opensInMinutes);

  if (variant === "inline") {
    return (
      <span className="cw-inline">
        <span className={`cw-dot cw-dot-${w.level}`} aria-hidden="true" />
        <span className="cw-time">
          {w.localDay} {w.localTime}
        </span>
        {opens ? <span className="cw-opens"> · {opens}</span> : null}
      </span>
    );
  }

  return (
    <div className="cw">
      <span className={`cw-dot cw-dot-${w.level}`} aria-hidden="true" />
      <span className="cw-time">
        {w.localDay} {w.localTime}
      </span>
      <span className="cw-you"> · you: {operatorClock(operatorTz, now)}</span>
      {opens ? <span className="cw-opens"> · {opens}</span> : null}
      {contactHours ? <span className="cw-hours">{contactHours}</span> : null}
    </div>
  );
}
