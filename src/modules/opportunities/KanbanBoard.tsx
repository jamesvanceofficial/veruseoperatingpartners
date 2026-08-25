"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/ui/cn";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatDate } from "@/shared/format";
import { PIPELINE_STAGES, STAGE_LABELS, STAGE_TONE, type PipelineStage } from "./labels";
import type { OpportunityListRow } from "./types";

function groupByStage(rows: OpportunityListRow[]): Record<PipelineStage, OpportunityListRow[]> {
  const grouped = Object.fromEntries(PIPELINE_STAGES.map((s) => [s, [] as OpportunityListRow[]])) as Record<PipelineStage, OpportunityListRow[]>;
  for (const row of rows) grouped[row.stage]?.push(row);
  return grouped;
}

/** Native HTML5 drag-and-drop — no library needed. A drop calls the stage-move endpoint, which is what actually writes to opportunity_stage_history; a failed move reverts the optimistic local state. */
export function KanbanBoard({ rows, todayIso }: { rows: OpportunityListRow[]; todayIso: string }) {
  const router = useRouter();
  const [board, setBoard] = useState<Record<PipelineStage, OpportunityListRow[]>>(() => groupByStage(rows));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDrop(targetStage: PipelineStage) {
    const id = draggingId;
    setDraggingId(null);
    if (!id) return;

    let sourceStage: PipelineStage | null = null;
    for (const stage of PIPELINE_STAGES) {
      if (board[stage].some((r) => r.id === id)) {
        sourceStage = stage;
        break;
      }
    }
    if (!sourceStage || sourceStage === targetStage) return;

    const moved = board[sourceStage].find((r) => r.id === id);
    if (!moved) return;

    const previousBoard = board;
    setBoard({
      ...board,
      [sourceStage]: board[sourceStage].filter((r) => r.id !== id),
      [targetStage]: [...board[targetStage], { ...moved, stage: targetStage }],
    });
    setError(null);

    try {
      const res = await fetch(`/api/opportunities/${id}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: targetStage }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setBoard(previousBoard);
        setError(payload.error ?? "Could not move that opportunity.");
        return;
      }
      router.refresh();
    } catch {
      setBoard(previousBoard);
      setError("Could not move that opportunity — check your connection.");
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}
      {/* Escapes the page's own padding (.bleed-x cancels it exactly) so the
          board uses the full content width beside the sidebar, then
          reapplies that same padding as scroll-content inset — column one
          still lines up with the page's other content, but the row can
          scroll well past where the padded content would have stopped, and
          the browser's native horizontal scrollbar sits directly under it. */}
      <div className="bleed-x">
        <div className="flex gap-4 overflow-x-auto px-12 pb-4">
          {PIPELINE_STAGES.map((stage) => {
            const cards = board[stage];
            const stageValue = cards.reduce((sum, c) => sum + Number(c.expected_value ?? 0), 0);
            return (
              <div
                key={stage}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(stage)}
                className="glass-panel flex w-72 shrink-0 flex-col gap-2.5 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge tone={STAGE_TONE[stage]}>{STAGE_LABELS[stage]}</Badge>
                  <span className="text-[11px] text-[var(--muted)]">{cards.length}</span>
                </div>
                <p className="font-tabular text-[11px] text-[var(--muted)]">{formatCurrency(stageValue)}</p>

                <div className="flex flex-col gap-2">
                  {cards.map((card) => {
                    const overdue = Boolean(card.next_action_date && card.next_action_date < todayIso);
                    const dueToday = card.next_action_date === todayIso;
                    return (
                      <Link
                        key={card.id}
                        href={`/crm-pipeline/${card.id}`}
                        draggable
                        onDragStart={() => setDraggingId(card.id)}
                        onDragEnd={() => setDraggingId(null)}
                        className={cn(
                          "glass-panel row-hover-lift flex cursor-grab flex-col gap-1.5 p-3.5 text-left active:cursor-grabbing",
                          draggingId === card.id && "opacity-40"
                        )}
                      >
                        <p className="text-[12.5px] font-medium text-[var(--cream)]">{card.name}</p>
                        <p className="text-[11px] text-[var(--muted)]">{card.orgName}</p>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-tabular text-[12px] text-[var(--gold-light)]">{formatCurrency(card.expected_value)}</span>
                          {card.ownerName ? <span className="text-[10.5px] text-[var(--muted)]">{card.ownerName}</span> : null}
                        </div>
                        {card.next_action ? (
                          <div className="flex items-center gap-1.5">
                            <Badge tone={overdue ? "red" : dueToday ? "yellow" : "neutral"}>
                              {card.next_action_date ? formatDate(card.next_action_date) : "No date"}
                            </Badge>
                            <span className="truncate text-[10.5px] text-[var(--muted)]">{card.next_action}</span>
                          </div>
                        ) : null}
                      </Link>
                    );
                  })}
                  {cards.length === 0 ? <p className="py-2 text-center text-[11px] text-[var(--muted)]">No opportunities</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
