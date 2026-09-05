"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import type { GeneratedPost, PostOfferType } from "@/lib/ai/templateGenerate";

export type GroupOption = { id: string; label: string };

type Mode = "ai" | "template";

const OFFER_OPTIONS: { value: PostOfferType; label: string }[] = [
  { value: "website", label: "Free website" },
  { value: "review-agent", label: "Google review agent" },
  { value: "both", label: "Website + review agent" },
];

const COST_OPTIONS = ["free", "at no cost", "on the house"];

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function Creator({ groups }: { groups: GroupOption[] }) {
  const [mode, setMode] = useState<Mode>("ai");
  const [niche, setNiche] = useState("junk removal businesses");
  const [offerType, setOfferType] = useState<PostOfferType>("website");
  const [spots, setSpots] = useState("2");
  const [costPhrase, setCostPhrase] = useState("free");
  const [extra, setExtra] = useState("");
  const [groupId, setGroupId] = useState("");

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function flashToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          niche: niche.trim() || "junk removal businesses",
          offerType,
          spots: spots.trim() || "2",
          costPhrase,
          extra: extra.trim(),
          groupId: groupId || null,
        }),
      });
      if (!res.ok) throw new Error("Generate failed");
      const data = (await res.json()) as { result: GeneratedPost; usedTemplate: boolean };
      setResult(data.result);
      if (mode === "ai" && data.usedTemplate) {
        flashToast("Live AI generation failed — used template instead");
      }
    } catch {
      flashToast("Generation failed — try again");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy(text: string) {
    const ok = await copyText(text);
    flashToast(ok ? "Copied" : "Copy failed");
  }

  return (
    <>
      <Panel>
        <div className="creator-mode-row">
          <div className="panel-title">Generation mode</div>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-opt ${mode === "ai" ? "active" : ""}`}
              onClick={() => setMode("ai")}
            >
              Live AI
            </button>
            <button
              type="button"
              className={`toggle-opt ${mode === "template" ? "active" : ""}`}
              onClick={() => setMode("template")}
            >
              Template
            </button>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="c-niche">Niche / audience</label>
            <input
              id="c-niche"
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="c-offer">Offer</label>
            <select
              id="c-offer"
              value={offerType}
              onChange={(e) => setOfferType(e.target.value as PostOfferType)}
            >
              {OFFER_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="c-spots">Spots available</label>
            <input
              id="c-spots"
              type="number"
              min={1}
              max={10}
              value={spots}
              onChange={(e) => setSpots(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="c-cost">Cost phrasing</label>
            <select id="c-cost" value={costPhrase} onChange={(e) => setCostPhrase(e.target.value)}>
              {COST_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="c-group">Group (applies its posting rules)</label>
            <select id="c-group" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">— none —</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="c-extra">Additional context</label>
          <textarea
            id="c-extra"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="e.g. posting in a generalized small-business group, keep it broader than junk removal"
          />
        </div>

        <div className="btn-row">
          <Button variant="default" onClick={handleGenerate} disabled={generating}>
            Generate post
          </Button>
          {generating ? <span className="creator-status">asking claude...</span> : null}
        </div>
      </Panel>

      {toast ? <span className="inline-toast">{toast}</span> : null}

      {result ? (
        <Panel title="Generated post" className="stack-panel">
          <div className="output-grid">
            <div className="output-card">
              <h4>Gif post version</h4>
              <div className="output-text">{result.gifVersion}</div>
              <div className="btn-row output-card-actions">
                <Button size="sm" onClick={() => handleCopy(result.gifVersion)}>
                  Copy
                </Button>
              </div>
            </div>
            <div className="output-card">
              <h4>Normal version</h4>
              <div className="output-text">{result.normalVersion}</div>
              <div className="btn-row output-card-actions">
                <Button size="sm" onClick={() => handleCopy(result.normalVersion)}>
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}
    </>
  );
}
