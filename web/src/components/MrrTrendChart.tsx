"use client";

import { AreaChart } from "@/components/charts/area-chart";
import { Area } from "@/components/charts/area";
import { XAxis } from "@/components/charts/x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import type { MrrSnapshot } from "@/lib/data/mrrSnapshots";

export function MrrTrendChart({ snapshots }: { snapshots: MrrSnapshot[] }) {
  if (snapshots.length < 2) {
    return (
      <div className="empty-state">
        Tracking starts today — check back after a few days for a trend line.
      </div>
    );
  }

  const data = snapshots.map((s) => ({ date: new Date(s.at), mrr: s.mrr }));

  return (
    <AreaChart data={data} aspectRatio="4 / 1">
      <Grid horizontal />
      <Area dataKey="mrr" fill="var(--chart-line-primary)" />
      <XAxis />
      <ChartTooltip />
    </AreaChart>
  );
}
