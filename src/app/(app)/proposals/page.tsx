import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listOrgOptions } from "@/modules/organizations/data";
import { listProposals } from "@/modules/proposals/data";
import { PROPOSAL_STATUSES } from "@/modules/proposals/types";
import { STATUS_LABELS } from "@/modules/proposals/labels";
import { ProposalListTable } from "@/modules/proposals/ProposalListTable";
import type { ProposalListRow, ProposalStatus } from "@/modules/proposals/types";

export default async function ProposalsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; status?: string }>;
}) {
  const params = await searchParams;

  let rows: ProposalListRow[] = [];
  let orgOptions: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    [rows, orgOptions] = await Promise.all([
      listProposals(supabase, { orgId: params.org, status: params.status as ProposalStatus | undefined }),
      listOrgOptions(supabase),
    ]);
  } catch {
    loadError = true;
  }

  const hasFilters = Boolean(params.org || params.status);

  return (
    <PageShell title="Proposals" subtitle="The document that gets signed — generated from a completed assessment, editable before it's sent.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <Select name="org" defaultValue={params.org ?? ""}>
            <option value="">All organizations</option>
            {orgOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            {PROPOSAL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters ? (
            <Link href="/proposals" className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {loadError ? (
        <EmptyState
          title="Proposals aren't available yet"
          description="The database migrations may not have been run yet — check back once they are."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No proposals match your filters" : "No proposals yet"}
          description={
            hasFilters
              ? "Try a different filter or clear it."
              : "Generate one from a completed Full Assessment's report."
          }
        />
      ) : (
        <ProposalListTable rows={rows} />
      )}
    </PageShell>
  );
}
