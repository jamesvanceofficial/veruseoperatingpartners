import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { cn } from "@/shared/ui/cn";
import { SCOPE_CATEGORY_LABELS } from "./labels";
import { ScopeItemStatusSelect } from "./ScopeItemStatusSelect";
import type { BuildPackagePhaseDetail } from "./types";

export function BuildPackagePhaseCard({
  buildPackageId,
  phase,
  canEdit,
}: {
  buildPackageId: string;
  phase: BuildPackagePhaseDetail;
  canEdit: boolean;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[14.5px] font-semibold text-[var(--cream)]">
          Phase {phase.phase_number} — {phase.name}
        </p>
        <Badge tone="neutral">{phase.week_start === phase.week_end ? `Week ${phase.week_start}` : `Weeks ${phase.week_start}-${phase.week_end}`}</Badge>
      </div>

      {phase.category_name && phase.category_score !== null ? (
        <p className="text-[11.5px] text-[var(--muted)]">
          Ranked constraint — {phase.category_name} scored {Number(phase.category_score).toFixed(1)}/10 on the source assessment.
        </p>
      ) : null}

      <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--hairline)]">
        <div className="h-full rounded-full bg-[var(--gold)]" style={{ width: `${phase.progressPct}%` }} />
      </div>
      <p className="text-[11px] text-[var(--muted)]">{phase.progressPct}% complete</p>

      <div className="flex flex-col divide-y divide-[var(--hairline)]">
        {phase.scopeItems.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
            <div className="flex items-center gap-2.5">
              <Badge tone="neutral">{SCOPE_CATEGORY_LABELS[item.scope_category]}</Badge>
              <span className={cn("text-[12.5px]", item.status === "complete" ? "text-[var(--muted)] line-through" : "text-[var(--cream)]")}>
                {item.description}
              </span>
            </div>
            {canEdit ? (
              <ScopeItemStatusSelect buildPackageId={buildPackageId} itemId={item.id} status={item.status} />
            ) : (
              <Badge tone={item.status === "complete" ? "green" : item.status === "in_progress" ? "yellow" : "neutral"}>
                {item.status === "complete" ? "Complete" : item.status === "in_progress" ? "In Progress" : "Not Started"}
              </Badge>
            )}
          </div>
        ))}
        {phase.scopeItems.length === 0 ? <p className="py-2.5 text-[12px] text-[var(--muted)]">No scope items in this phase.</p> : null}
      </div>
    </Card>
  );
}
