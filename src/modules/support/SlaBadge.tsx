import { Badge } from "@/shared/ui/Badge";
import { getSlaState } from "./sla";

/** The one place an approaching/missed response deadline gets rendered — list and detail both use this, so "impossible to miss" means the same thing everywhere. */
export function SlaBadge({ responseDueAt, firstRespondedAt }: { responseDueAt: string | null; firstRespondedAt: string | null }) {
  const state = getSlaState(responseDueAt, firstRespondedAt, new Date());

  if (state.kind === "no_sla") return <Badge tone="neutral">No SLA</Badge>;
  if (state.kind === "met") return <Badge tone="green">Responded</Badge>;
  if (state.kind === "overdue") return <Badge tone="red">Overdue {state.overdueBy}</Badge>;
  if (state.kind === "due_soon") return <Badge tone="yellow">Due in {state.dueIn}</Badge>;
  return <Badge tone="neutral">Due in {state.dueIn}</Badge>;
}
