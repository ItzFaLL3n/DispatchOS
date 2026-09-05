"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/ui/Panel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  const [groupId, setGroupId] = useState("none");

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
          groupId: groupId === "none" ? null : groupId,
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
          <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
            <TabsList>
              <TabsTrigger value="ai">Live AI</TabsTrigger>
              <TabsTrigger value="template">Template</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="field-row">
          <div className="field">
            <Label htmlFor="c-niche">Niche / audience</Label>
            <Input
              id="c-niche"
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>
          <div className="field">
            <Label htmlFor="c-offer">Offer</Label>
            <Select value={offerType} onValueChange={(v) => setOfferType(v as PostOfferType)}>
              <SelectTrigger id="c-offer" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OFFER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <Label htmlFor="c-spots">Spots available</Label>
            <Input
              id="c-spots"
              type="number"
              min={1}
              max={10}
              value={spots}
              onChange={(e) => setSpots(e.target.value)}
            />
          </div>
          <div className="field">
            <Label htmlFor="c-cost">Cost phrasing</Label>
            <Select value={costPhrase} onValueChange={setCostPhrase}>
              <SelectTrigger id="c-cost" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COST_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="field-row">
          <div className="field">
            <Label htmlFor="c-group">Group (applies its posting rules)</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger id="c-group" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— none —</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="field">
          <Label htmlFor="c-extra">Additional context</Label>
          <Textarea
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
