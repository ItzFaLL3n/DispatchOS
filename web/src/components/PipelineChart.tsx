"use client";

import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { PHASE_LABELS } from "@/lib/data/types";

/** Count of clients currently sitting at each intake phase (1-10). */
export function PipelineChart({ counts }: { counts: Record<number, number> }) {
  const data = Array.from({ length: 10 }, (_, i) => {
    const phase = i + 1;
    return { phase: `P${phase}`, label: PHASE_LABELS[phase], count: counts[phase] ?? 0 };
  });

  return (
    <BarChart data={data} xDataKey="phase" aspectRatio="4 / 1" barGap={0.35}>
      <Grid horizontal />
      <Bar dataKey="count" fill="var(--chart-line-primary)" />
      <BarXAxis />
      <ChartTooltip />
    </BarChart>
  );
}
