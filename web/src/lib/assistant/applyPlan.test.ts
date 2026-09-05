import { describe, expect, it } from "vitest";
import { actionClientId, planApply, summarizeAction } from "@/lib/assistant/applyPlan";
import type { ProposedAction } from "@/lib/assistant/guardrail";

describe("planApply — client update", () => {
  it("routes non-hard-rule fields to updateClient", () => {
    const action: ProposedAction = {
      kind: "update",
      entity: "client",
      id: "c1",
      fields: { notes: "called", contactHours: "evenings" },
    };
    expect(planApply(action)).toEqual([
      { fn: "updateClient", id: "c1", patch: { notes: "called", contactHours: "evenings" } },
    ]);
  });

  it("routes phase-tracker fields (including buildStatus) to applyPhaseUpdate, not updateClient", () => {
    const action: ProposedAction = {
      kind: "update",
      entity: "client",
      id: "c1",
      fields: { phase: 9, buildStatus: "delivered" },
    };
    expect(planApply(action)).toEqual([
      { fn: "applyPhaseUpdate", id: "c1", patch: { phase: 9, buildStatus: "delivered" } },
    ]);
  });

  it("splits a mixed action into both steps", () => {
    const action: ProposedAction = {
      kind: "update",
      entity: "client",
      id: "c1",
      fields: { notes: "called", phase: 9 },
    };
    expect(planApply(action)).toEqual([
      { fn: "updateClient", id: "c1", patch: { notes: "called" } },
      { fn: "applyPhaseUpdate", id: "c1", patch: { phase: 9 } },
    ]);
  });
});

describe("planApply — creates", () => {
  it("todo", () => {
    const action: ProposedAction = {
      kind: "create",
      entity: "todo",
      data: { title: "follow up", clientId: "c1" },
    };
    expect(planApply(action)).toEqual([
      { fn: "createTodo", data: { title: "follow up", clientId: "c1" } },
    ]);
  });

  it("client event", () => {
    const action: ProposedAction = {
      kind: "create",
      entity: "clientEvent",
      data: { clientId: "c1", kind: "touch", body: "called" },
    };
    expect(planApply(action)).toEqual([
      { fn: "createClientEvent", clientId: "c1", kind: "touch", body: "called" },
    ]);
  });

  it("client, from a brief", () => {
    const data = { businessName: "Acme Hauling", source: "fb-dm", offerType: "free-website", buildStatus: "not-started" };
    const action: ProposedAction = { kind: "create", entity: "client", data };
    expect(planApply(action)).toEqual([{ fn: "createClient", data }]);
  });
});

describe("planApply — deletes", () => {
  it.each(["client", "group", "todo"] as const)("%s maps to the matching delete fn", (entity) => {
    const fn = entity === "client" ? "deleteClient" : entity === "group" ? "deleteGroup" : "deleteTodo";
    expect(planApply({ kind: "delete", entity, id: "x1" })).toEqual([{ fn, id: "x1" }]);
  });
});

describe("summarizeAction", () => {
  it("names the changed fields for a client update", () => {
    expect(
      summarizeAction({ kind: "update", entity: "client", id: "c1", fields: { notes: "x", phase: 9 } }),
    ).toBe("AI updated: notes, phase");
  });

  it("names the todo title for a todo create", () => {
    expect(
      summarizeAction({ kind: "create", entity: "todo", data: { title: "follow up" } }),
    ).toBe("AI created todo: follow up");
  });

  it("falls back to a generic title when a todo has no title yet", () => {
    expect(summarizeAction({ kind: "create", entity: "todo", data: {} })).toBe(
      "AI created todo: a todo",
    );
  });

  it("names the business for a client create", () => {
    expect(
      summarizeAction({ kind: "create", entity: "client", data: { businessName: "Acme Hauling" } }),
    ).toBe("AI created this client from a pasted brief (Acme Hauling)");
  });
});

describe("actionClientId", () => {
  it("a client update's own id", () => {
    expect(
      actionClientId({ kind: "update", entity: "client", id: "c1", fields: {} }),
    ).toBe("c1");
  });

  it("a todo's clientId when linked", () => {
    expect(
      actionClientId({ kind: "create", entity: "todo", data: { clientId: "c1" } }),
    ).toBe("c1");
  });

  it("null for an unlinked todo", () => {
    expect(actionClientId({ kind: "create", entity: "todo", data: {} })).toBeNull();
  });

  it("null for a client-event create (it logs its own entry, no summary needed)", () => {
    expect(
      actionClientId({
        kind: "create",
        entity: "clientEvent",
        data: { clientId: "c1", kind: "note", body: "x" },
      }),
    ).toBeNull();
  });

  it("null for a client create (no id exists yet — applyAction resolves the new id itself)", () => {
    expect(
      actionClientId({ kind: "create", entity: "client", data: { businessName: "Acme" } }),
    ).toBeNull();
  });
});
