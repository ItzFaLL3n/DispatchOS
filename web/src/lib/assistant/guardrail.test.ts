import { describe, expect, it } from "vitest";
import { classifyAction } from "@/lib/assistant/guardrail";
import type { ProposedAction } from "@/lib/assistant/guardrail";

function updateClient(fields: Record<string, unknown>): ProposedAction {
  return { kind: "update", entity: "client", id: "c1", fields };
}

describe("classifyAction — always-confirm hard-rule fields", () => {
  it.each(["retainerStatus", "phase", "phaseSubstate", "doNotPitchUntil"])(
    "flags a client update touching %s",
    (field) => {
      expect(classifyAction(updateClient({ [field]: "anything" }))).toBe("always-confirm");
    },
  );

  it("flags a mixed action: one protected field taints the whole action", () => {
    const action = updateClient({ notes: "called, left voicemail", phase: 9 });
    expect(classifyAction(action)).toBe("always-confirm");
  });
});

describe("classifyAction — deletes always require confirm", () => {
  it.each(["client", "group", "todo"] as const)("flags a %s delete", (entity) => {
    expect(classifyAction({ kind: "delete", entity, id: "x1" })).toBe("always-confirm");
  });
});

describe("classifyAction — auto-eligible", () => {
  it("a client update touching only non-hard-rule fields", () => {
    const action = updateClient({ notes: "called, left voicemail" });
    expect(classifyAction(action)).toBe("auto-eligible");
  });

  it("a client update touching several non-hard-rule fields at once", () => {
    const action = updateClient({ contactHours: "evenings only", siteUrl: "https://x.example.com" });
    expect(classifyAction(action)).toBe("auto-eligible");
  });

  it("creating a todo", () => {
    expect(
      classifyAction({ kind: "create", entity: "todo", data: { title: "follow up" } }),
    ).toBe("auto-eligible");
  });

  it("creating a client event (note, touch, or ascension-signal)", () => {
    for (const eventKind of ["note", "touch", "ascension-signal"]) {
      expect(
        classifyAction({
          kind: "create",
          entity: "clientEvent",
          data: { clientId: "c1", kind: eventKind, body: "x" },
        }),
      ).toBe("auto-eligible");
    }
  });
});
