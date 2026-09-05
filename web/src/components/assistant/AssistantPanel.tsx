"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ProposedAction } from "@/lib/assistant/guardrail";

type ResolvedAction = {
  action: ProposedAction;
  classification: "auto-eligible" | "always-confirm";
  status: "applied" | "pending";
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposedActions: ResolvedAction[] | null;
  createdAt: string;
};

function describeAction(action: ProposedAction): string {
  if (action.kind === "update" && action.entity === "client") {
    return `Update client: ${Object.entries(action.fields).map(([k, v]) => `${k} → ${JSON.stringify(v)}`).join(", ")}`;
  }
  if (action.kind === "create" && action.entity === "todo") {
    const data = action.data as { title?: string };
    return `Create todo: ${data.title ?? "(untitled)"}`;
  }
  if (action.kind === "create" && action.entity === "clientEvent") {
    const data = action.data as { kind?: string; body?: string };
    return `Log ${data.kind ?? "event"}: ${data.body ?? ""}`;
  }
  if (action.kind === "create" && action.entity === "client") {
    const data = action.data as { businessName?: string };
    return `Create new client: ${data.businessName ?? "(unnamed)"}`;
  }
  if (action.kind === "delete") {
    return `Delete ${action.entity} ${action.id}`;
  }
  return "Proposed action";
}

/**
 * The slide-out CRM assistant (spec 0003). Reachable from any page via the
 * sidebar trigger. `clientId` scopes the conversation and, when set, is
 * threaded through to the worker so it can answer "this client" questions
 * without being told again. No thread-history management beyond one
 * ongoing thread per client (or the general one) — see the spec's Out of
 * Scope. Locally-resolved pending cards (approved/rejected this session)
 * are tracked in component state only; reopening the panel after a reload
 * can briefly re-show an already-approved card as pending until you look at
 * the client record itself — a known v1 gap, not a correctness bug (nothing
 * double-applies; approve is idempotent to click again, just needless).
 */
export function AssistantPanel({
  open,
  onClose,
  clientId,
}: {
  open: boolean;
  onClose: () => void;
  clientId: string | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [clientLabel, setClientLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [mode, setMode] = useState<"chat" | "dm">("chat");
  const [model, setModel] = useState<"sonnet" | "opus" | "haiku">("sonnet");
  const [error, setError] = useState<string | null>(null);
  const [resolvedKeys, setResolvedKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const qs = clientId ? `?clientId=${encodeURIComponent(clientId)}` : "";
        const res = await fetch(`/api/assistant/messages${qs}`);
        const data = await res.json();
        if (cancelled) return;
        setMessages(data.messages ?? []);
        setClientLabel(data.clientLabel ?? null);
      } catch {
        if (!cancelled) setError("Couldn't load this conversation.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [open, clientId]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, role: "user", content: text, proposedActions: null, createdAt: new Date().toISOString() },
    ]);
    try {
      const res = await fetch("/api/assistant/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, message: text, autoMode, mode, model }),
      });
      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as { reply: string; actions: ResolvedAction[] };
      setMessages((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}-a`,
          role: "assistant",
          content: data.reply,
          proposedActions: data.actions,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      setError("The assistant didn't respond — try again.");
    } finally {
      setSending(false);
    }
  }

  async function handleApprove(action: ProposedAction, key: string) {
    try {
      await fetch("/api/assistant/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      setResolvedKeys((prev) => new Set(prev).add(key));
    } catch {
      setError("Couldn't apply that — try again.");
    }
  }

  function handleReject(key: string) {
    setResolvedKeys((prev) => new Set(prev).add(key));
  }

  if (!open) return null;

  return (
    <div className="assistant-panel" role="complementary" aria-label="CRM assistant">
        <div className="assistant-panel-header">
          <div>
            <div className="panel-title">Assistant</div>
            {clientLabel ? <div className="assistant-scope">{clientLabel}</div> : null}
          </div>
          <div className="assistant-header-actions">
            <div className="toggle-group">
              <button
                type="button"
                className={`toggle-opt ${!autoMode ? "active" : ""}`}
                onClick={() => setAutoMode(false)}
              >
                Confirm
              </button>
              <button
                type="button"
                className={`toggle-opt ${autoMode ? "active" : ""}`}
                onClick={() => setAutoMode(true)}
              >
                Auto
              </button>
            </div>
            <button type="button" className="assistant-close" aria-label="Close assistant" onClick={onClose}>
              ×
            </button>
          </div>
        </div>

        <div className="assistant-mode-row">
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-opt ${mode === "chat" ? "active" : ""}`}
              onClick={() => setMode("chat")}
            >
              Chat
            </button>
            <button
              type="button"
              className={`toggle-opt ${mode === "dm" ? "active" : ""}`}
              onClick={() => setMode("dm")}
            >
              DM thread
            </button>
          </div>
          <div className="toggle-group">
            {(["sonnet", "opus", "haiku"] as const).map((m) => (
              <button
                key={m}
                type="button"
                className={`toggle-opt ${model === m ? "active" : ""}`}
                onClick={() => setModel(m)}
              >
                {m[0].toUpperCase() + m.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="assistant-messages">
          {loading ? <div className="empty-state">Loading…</div> : null}
          {!loading && messages.length === 0 ? (
            <div className="empty-state">
              Ask it something about {clientLabel ?? "your pipeline"}, or paste a DM thread.
            </div>
          ) : null}
          {messages.map((m) => (
            <div key={m.id} className={`assistant-message assistant-message-${m.role}`}>
              <div className="assistant-message-body">{m.content}</div>
              {m.proposedActions?.map((ra, i) => {
                const key = `${m.id}-${i}`;
                const resolved = resolvedKeys.has(key);
                return (
                  <div key={key} className="assistant-action-card">
                    <div className="assistant-action-desc">{describeAction(ra.action)}</div>
                    {ra.status === "applied" ? (
                      <span className="stamp stamp-good">applied</span>
                    ) : resolved ? (
                      <span className="stamp stamp-neutral">resolved</span>
                    ) : (
                      <div className="btn-row">
                        <Button size="sm" variant="primary" onClick={() => handleApprove(ra.action, key)}>
                          Approve
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleReject(key)}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <div className="assistant-input-row">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              mode === "dm"
                ? "Paste the DM thread — the assistant will draft the next reply."
                : "Ask about this client…"
            }
            rows={mode === "dm" ? 6 : 2}
          />
          <Button variant="primary" onClick={handleSend} disabled={sending || !input.trim()}>
            {sending ? "…" : "Send"}
          </Button>
        </div>
    </div>
  );
}
