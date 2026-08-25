import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { LinkButton } from "@/shared/ui/LinkButton";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { cn } from "@/shared/ui/cn";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listStaffProfiles } from "@/modules/organizations/data";
import { listOpportunities, listDueNextActions, getPipelineStats } from "@/modules/opportunities/data";
import { sortOpportunityRows } from "@/modules/opportunities/sort";
import { PIPELINE_STAGES, STAGE_LABELS } from "@/modules/opportunities/labels";
import { PipelineTotalValue, ValueByStageCard, NextActionsDue } from "@/modules/opportunities/PipelineSummary";
import { KanbanBoard } from "@/modules/opportunities/KanbanBoard";
import { OpportunityListTable } from "@/modules/opportunities/OpportunityListTable";
import type { OpportunityListRow } from "@/modules/opportunities/types";
import type { PipelineStats } from "@/modules/opportunities/types";

type SearchParams = { view?: string; stage?: string; owner?: string; sort?: string; dir?: string };

function buildQuery(params: SearchParams, overrides: Partial<SearchParams>): string {
  const merged = { ...params, ...overrides };
  const usp = new URLSearchParams();
  for (const [k, v] of Object.entries(merged)) {
    if (v) usp.set(k, v);
  }
  const qs = usp.toString();
  return qs ? `?${qs}` : "";
}

export default async function CrmPipelinePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const view = params.view === "table" ? "table" : "board";
  const todayIso = new Date().toISOString().slice(0, 10);

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let rows: OpportunityListRow[] = [];
  let dueRows: OpportunityListRow[] = [];
  let stats: PipelineStats = { totalValue: 0, byStage: [] };
  let staffOptions: { id: string; full_name: string | null; email: string | null }[] = [];
  let loadError = false;

  try {
    const supabase = await createServerSupabase();
    [rows, dueRows, stats, staffOptions] = await Promise.all([
      listOpportunities(supabase, { stage: params.stage, owner: params.owner }),
      listDueNextActions(supabase, todayIso),
      getPipelineStats(supabase),
      listStaffProfiles(supabase),
    ]);
  } catch {
    loadError = true;
  }

  const tableRows = view === "table" ? sortOpportunityRows(rows, params.sort, params.dir) : rows;
  const hasFilters = Boolean(params.stage || params.owner);

  return (
    <PageShell title="CRM Pipeline" subtitle="Every opportunity from first contact through signed build package.">
      {loadError ? (
        <EmptyState
          title="Pipeline isn't available yet"
          description="The database migrations may not have been run yet — check back once they are."
        />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            <PipelineTotalValue stats={stats} />
            <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
              <ValueByStageCard stats={stats} />
              <NextActionsDue rows={dueRows} todayIso={todayIso} />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="glass-panel flex gap-1 p-1">
                <Link
                  href={buildQuery(params, { view: "board" })}
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-1.5 text-[12px] font-medium transition-colors duration-150",
                    view === "board" ? "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-[var(--gold-light)]" : "text-[var(--muted)] hover:text-[var(--cream)]"
                  )}
                >
                  Board
                </Link>
                <Link
                  href={buildQuery(params, { view: "table" })}
                  className={cn(
                    "rounded-[var(--radius-sm)] px-3 py-1.5 text-[12px] font-medium transition-colors duration-150",
                    view === "table" ? "bg-[color-mix(in_srgb,var(--gold)_16%,transparent)] text-[var(--gold-light)]" : "text-[var(--muted)] hover:text-[var(--cream)]"
                  )}
                >
                  Table
                </Link>
              </div>

              <form method="GET" className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="view" value={view} />
                <Select name="stage" defaultValue={params.stage ?? ""}>
                  <option value="">All stages</option>
                  {PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {STAGE_LABELS[s]}
                    </option>
                  ))}
                </Select>
                <Select name="owner" defaultValue={params.owner ?? ""}>
                  <option value="">All owners</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name ?? s.email ?? "Unnamed"}
                    </option>
                  ))}
                </Select>
                <Button type="submit" variant="secondary">
                  Filter
                </Button>
                {hasFilters ? (
                  <Link href={buildQuery({ view }, {})} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
                    Clear
                  </Link>
                ) : null}
              </form>
            </div>

            {canCreate ? (
              <LinkButton href="/crm-pipeline/new" variant="primary">
                New opportunity
              </LinkButton>
            ) : null}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              title={hasFilters ? "No opportunities match your filters" : "No opportunities yet"}
              description={hasFilters ? "Try a different filter or clear it." : "Add the first opportunity to start the pipeline."}
            />
          ) : view === "board" ? (
            <KanbanBoard rows={rows} todayIso={todayIso} />
          ) : (
            <OpportunityListTable rows={tableRows} sortState={{ sort: params.sort ?? "name", dir: params.dir ?? "asc", searchParams: params }} />
          )}
        </>
      )}
    </PageShell>
  );
}
