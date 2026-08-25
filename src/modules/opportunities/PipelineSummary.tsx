import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { Stat } from "@/shared/ui/Stat";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatDate } from "@/shared/format";
import { PRICING_HINT } from "./pricing";
import { STAGE_LABELS, STAGE_TONE } from "./labels";
import type { PipelineStats, OpportunityListRow } from "./types";

export function PipelineValueSummary({ stats }: { stats: PipelineStats }) {
  return (
    <div className="flex flex-col gap-3">
      <Stat label="Total Pipeline Value" value={formatCurrency(stats.totalValue)} hint={PRICING_HINT} tone="gold" />
      <Card className="flex flex-col gap-1">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">Value by Stage</p>
        <div className="flex flex-col divide-y divide-[var(--hairline)]">
          {stats.byStage.map((s) => (
            <div key={s.stage} className="flex items-center justify-between gap-3 py-2">
              <Badge tone={STAGE_TONE[s.stage]}>{STAGE_LABELS[s.stage]}</Badge>
              <span className="text-[11px] text-[var(--muted)]">
                {s.count} {s.count === 1 ? "opportunity" : "opportunities"}
              </span>
              <span className="font-tabular text-[12.5px] text-[var(--cream)]">{formatCurrency(s.value)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function NextActionsDue({ rows, todayIso }: { rows: OpportunityListRow[]; todayIso: string }) {
  return (
    <Card className="flex h-full flex-col gap-2">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">Next Actions Due</p>
      {rows.length === 0 ? (
        <p className="text-[12px] text-[var(--muted)]">Nothing due or overdue.</p>
      ) : (
        <div className="flex flex-col divide-y divide-[var(--hairline)]">
          {rows.map((r) => {
            const overdue = Boolean(r.next_action_date && r.next_action_date < todayIso);
            return (
              <Link key={r.id} href={`/crm-pipeline/${r.id}`} className="row-hover-lift flex items-center justify-between gap-3 py-2">
                <div>
                  <p className="text-[12.5px] font-medium text-[var(--cream)]">{r.name}</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {r.orgName} · {r.next_action}
                  </p>
                </div>
                <Badge tone={overdue ? "red" : "yellow"}>{r.next_action_date ? formatDate(r.next_action_date) : "—"}</Badge>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
