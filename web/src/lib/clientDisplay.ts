import type { BuildStatus, RetainerStatus } from "@/lib/data/types";
import type { StampTone } from "@/components/ui/Stamp";

export const RETAINER_TONE: Record<RetainerStatus, StampTone> = {
  "not-pitched": "neutral",
  pitched: "info",
  deferred: "warn",
  active: "good",
  declined: "bad",
};

export const BUILD_TONE: Record<BuildStatus, StampTone> = {
  "not-started": "neutral",
  "in-progress": "info",
  delivered: "good",
};
