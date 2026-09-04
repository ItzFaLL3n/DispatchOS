import { describe, expect, it } from "vitest";
import {
  contactWindowStatus,
  nextContactWindow,
} from "@/lib/derive/contactWindow";

// A UTC instant that is <local time> in America/Chicago:
//   CST (winter, UTC-6): 2026-01-15T{h+6}:00:00Z
//   CDT (summer, UTC-5): 2026-07-15T{h+5}:00:00Z
const chicagoWinter = (h: number, m = 0) =>
  new Date(Date.UTC(2026, 0, 15, h + 6, m));
const chicagoSummer = (h: number, m = 0) =>
  new Date(Date.UTC(2026, 6, 15, h + 5, m));

describe("contactWindowStatus", () => {
  it("returns null when there is no timezone", () => {
    expect(contactWindowStatus(null, new Date())).toBeNull();
  });

  it("returns null for an unknown timezone rather than throwing", () => {
    expect(contactWindowStatus("Mars/Olympus", new Date())).toBeNull();
  });

  it("is green inside 09:00–20:00 local", () => {
    const w = contactWindowStatus("America/Chicago", chicagoWinter(9, 0));
    expect(w?.level).toBe("green");
    expect(w?.opensInMinutes).toBeNull();
    expect(w?.localTime).toBe("9:00 AM");
  });

  it("computes local time correctly across DST (same wall clock, different UTC)", () => {
    expect(contactWindowStatus("America/Chicago", chicagoWinter(14))?.localTime).toBe(
      "2:00 PM",
    );
    expect(contactWindowStatus("America/Chicago", chicagoSummer(14))?.localTime).toBe(
      "2:00 PM",
    );
  });

  it("is amber in the hour before opening, with opensInMinutes counting down", () => {
    const w = contactWindowStatus("America/Chicago", chicagoWinter(8, 30));
    expect(w?.level).toBe("amber");
    expect(w?.opensInMinutes).toBe(30);
  });

  it("is amber in the hour after closing", () => {
    expect(contactWindowStatus("America/Chicago", chicagoWinter(20, 30))?.level).toBe(
      "amber",
    );
  });

  it("is red late in the evening, opensInMinutes spanning to the next 09:00", () => {
    const w = contactWindowStatus("America/Chicago", chicagoSummer(21, 30));
    expect(w?.level).toBe("red");
    // 21:30 -> 09:00 next day = 11h 30m
    expect(w?.opensInMinutes).toBe(690);
  });

  it("is red overnight", () => {
    expect(contactWindowStatus("America/Chicago", chicagoWinter(3))?.level).toBe("red");
  });

  it("handles the exact boundaries", () => {
    expect(contactWindowStatus("America/Chicago", chicagoWinter(9, 0))?.level).toBe("green");
    expect(contactWindowStatus("America/Chicago", chicagoWinter(8, 59))?.level).toBe("amber");
    expect(contactWindowStatus("America/Chicago", chicagoWinter(19, 59))?.level).toBe("green");
    expect(contactWindowStatus("America/Chicago", chicagoWinter(20, 0))?.level).toBe("amber");
    expect(contactWindowStatus("America/Chicago", chicagoWinter(20, 59))?.level).toBe("amber");
    expect(contactWindowStatus("America/Chicago", chicagoWinter(21, 0))?.level).toBe("red");
  });

  it("reports the local weekday", () => {
    // 2026-01-15 is a Thursday
    expect(contactWindowStatus("America/Chicago", chicagoWinter(12))?.localDay).toBe("Thu");
  });
});

describe("nextContactWindow", () => {
  it("returns null when there is nothing to wait for", () => {
    expect(nextContactWindow(null)).toBeNull();
  });
  it("formats hours and minutes", () => {
    expect(nextContactWindow(90)).toBe("opens in 1h 30m");
    expect(nextContactWindow(45)).toBe("opens in 45m");
    expect(nextContactWindow(120)).toBe("opens in 2h");
    expect(nextContactWindow(0)).toBe("opens in 0m");
  });
});
