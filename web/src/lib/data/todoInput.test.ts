import { describe, expect, it } from "vitest";
import { ValidationError } from "@/lib/data/errors";
import { parseTodoForm } from "@/lib/data/todoInput";

function form(entries: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
}

describe("parseTodoForm — create", () => {
  it("needs a title", () => {
    expect(() => parseTodoForm(form({}), { mode: "create" })).toThrow(ValidationError);
    expect(() => parseTodoForm(form({ title: "  " }), { mode: "create" })).toThrow(
      ValidationError,
    );
  });

  it("defaults priority to medium and status to todo", () => {
    expect(parseTodoForm(form({ title: "call him" }), { mode: "create" })).toEqual({
      title: "call him",
      priority: "medium",
      status: "todo",
    });
  });

  it("validates priority and status against the allowed sets", () => {
    expect(() =>
      parseTodoForm(form({ title: "x", priority: "urgent" }), { mode: "create" }),
    ).toThrow(ValidationError);
    expect(() =>
      parseTodoForm(form({ title: "x", status: "blocked" }), { mode: "create" }),
    ).toThrow(ValidationError);
  });

  it("takes a valid due date, rejects a bad one, clears a blank one", () => {
    expect(
      parseTodoForm(form({ title: "x", dueDate: "2026-09-20" }), { mode: "create" }).dueDate,
    ).toBe("2026-09-20");
    expect(() =>
      parseTodoForm(form({ title: "x", dueDate: "soon" }), { mode: "create" }),
    ).toThrow(ValidationError);
    expect(
      parseTodoForm(form({ title: "x", dueDate: "" }), { mode: "create" }).dueDate,
    ).toBeNull();
  });

  it("keeps client/group ids, treats blank as null", () => {
    expect(
      parseTodoForm(form({ title: "x", clientId: "abc", groupId: "" }), {
        mode: "create",
      }),
    ).toMatchObject({ clientId: "abc", groupId: null });
  });

  it("treats the 'none' picker sentinel as null", () => {
    expect(
      parseTodoForm(form({ title: "x", clientId: "none", groupId: "none" }), {
        mode: "create",
      }),
    ).toMatchObject({ clientId: null, groupId: null });
  });
});

describe("parseTodoForm — update", () => {
  it("returns only the submitted fields", () => {
    expect(parseTodoForm(form({ status: "done" }), { mode: "update" })).toEqual({
      status: "done",
    });
  });

  it("rejects a blank title on update", () => {
    expect(() => parseTodoForm(form({ title: " " }), { mode: "update" })).toThrow(
      ValidationError,
    );
  });
});
