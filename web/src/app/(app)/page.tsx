import Link from "next/link";
import { listClients } from "@/lib/data/clients";
import { listOpenAscensionSignalClientIds, listRecentMistakes } from "@/lib/data/events";
import { getSettings } from "@/lib/data/settings";
import { serverEnv } from "@/lib/env";
import {
  BOARD_COLUMNS,
  boardCardHint,
  conversionColumn,
  type BoardColumn,
} from "@/lib/derive/board";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ContactWindow } from "@/components/ContactWindow";
import { DashboardNags } from "@/components/DashboardNags";
import { GoalPanel } from "@/components/GoalPanel";
import { MistakesList } from "@/components/MistakesList";
import { PipelineChart } from "@/components/PipelineChart";
import type { Client } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [clients, openSignalIds, mistakes, settings] = await Promise.all([
    listClients(),
    listOpenAscensionSignalClientIds(),
    listRecentMistakes(),
    getSettings(),
  ]);
  const openSignalClientIds = new Set(openSignalIds);
  const operatorTz = serverEnv.operatorTz;
  const now = new Date();
  const currentMrr = clients
    .filter((c) => c.retainerStatus === "active")
    .reduce((sum, c) => sum + c.mrr, 0);

  const phaseCounts: Record<number, number> = {};
  for (const c of clients) {
    phaseCounts[c.phase] = (phaseCounts[c.phase] ?? 0) + 1;
  }

  const inBuild = clients.filter((c) => c.buildStatus !== "delivered");
  const byColumn = new Map<BoardColumn, Client[]>(
    BOARD_COLUMNS.map((col) => [col.key, []]),
  );
  for (const c of clients) {
    if (c.buildStatus !== "delivered") continue;
    byColumn.get(conversionColumn(c).column)?.push(c);
  }

  return (
    <>
      <PageHeader
        formNo="000"
        title="Dashboard"
        sub="Delivered clients by where they sit in the post-delivery sequence. Clients still in build sit in the strip below."
      />

      <div className="dashboard-goal-row">
        <Panel title="Revenue goal">
          <GoalPanel currentMrr={currentMrr} mrrGoal={settings.mrrGoal} />
        </Panel>
        <Panel title={`Open mistakes (${mistakes.length})`}>
          <MistakesList mistakes={mistakes} />
        </Panel>
      </div>

      <Panel title="Pipeline by phase" className="stack-panel-top">
        <PipelineChart counts={phaseCounts} />
      </Panel>

      <div className="board stack-panel-top">
        {BOARD_COLUMNS.map((col) => {
          const items = byColumn.get(col.key) ?? [];
          return (
            <div key={col.key} className="board-col">
              <div className="board-col-head">
                <span>{col.label}</span>
                <span className="board-col-count">{items.length}</span>
              </div>
              {items.length === 0 ? (
                <div className="board-col-empty">—</div>
              ) : (
                items.map((c) => {
                  const { dataWarning } = conversionColumn(c);
                  return (
                    <Link
                      key={c.id}
                      href={`/clients/${c.id}`}
                      className="board-card"
                    >
                      <div className="board-card-name">
                        {c.businessName}
                        {dataWarning ? (
                          <span
                            className="board-warn"
                            title="delivered but phase is below 8"
                          >
                            !
                          </span>
                        ) : null}
                      </div>
                      <ContactWindow
                        variant="inline"
                        timezone={c.timezone}
                        operatorTz={operatorTz}
                      />
                      <div className="board-card-hint">{boardCardHint(c, now)}</div>
                    </Link>
                  );
                })
              )}
            </div>
          );
        })}
      </div>

      <Panel title="Needs attention" className="stack-panel-top">
        <DashboardNags
          clients={clients}
          openSignalClientIds={openSignalClientIds}
          now={now}
        />
      </Panel>

      {inBuild.length > 0 ? (
        <Panel title={`In build (${inBuild.length})`} className="stack-panel-top">
          <div className="inbuild-strip">
            {inBuild.map((c) => (
              <Link key={c.id} href={`/clients/${c.id}`} className="inbuild-chip">
                <span>{c.businessName}</span>
                <span className="inbuild-phase">P{c.phase}</span>
              </Link>
            ))}
          </div>
        </Panel>
      ) : null}
    </>
  );
}
