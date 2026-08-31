import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Stat } from "@/shared/ui/Stat";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getOpenAndOverdueCounts } from "@/modules/support/data";
import { getSubscriptionDashboardMetrics } from "@/modules/subscriptions/data";
import { formatCurrency } from "@/shared/format";

export default async function DashboardPage() {
  let ticketCounts = { open: 0, overdue: 0 };
  let mrrMetrics: Awaited<ReturnType<typeof getSubscriptionDashboardMetrics>> | null = null;
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    [ticketCounts, mrrMetrics] = await Promise.all([getOpenAndOverdueCounts(supabase), getSubscriptionDashboardMetrics(supabase)]);
  } catch {
    loadError = true;
  }

  return (
    <PageShell title="Dashboard" subtitle="A single view of every deal, client, and system VERUS runs.">
      {!loadError && mrrMetrics ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Revenue</p>
            <LinkButton href="/subscriptions" variant="secondary">
              View Subscriptions
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Stat label="Total MRR" value={formatCurrency(mrrMetrics.totalMRR)} tone="gold" />
            <Stat label="New MRR This Month" value={formatCurrency(mrrMetrics.newMRRThisMonth)} tone="green" />
            <Stat label="Software MRR" value={formatCurrency(mrrMetrics.mrrByCategory.software)} />
            <Stat label="Service MRR" value={formatCurrency(mrrMetrics.mrrByCategory.service)} />
            <Stat label="Active Subscriptions" value={mrrMetrics.activeCount} />
            <Stat label="Upcoming Renewals" value={mrrMetrics.upcomingRenewals} tone={mrrMetrics.upcomingRenewals > 0 ? "yellow" : "neutral"} />
          </div>
          {mrrMetrics.pastDueCount > 0 ? (
            <div className="glass-panel border border-[color-mix(in_srgb,var(--red)_50%,transparent)] px-4 py-2.5">
              <p className="text-[12.5px] text-[var(--red)]">
                {mrrMetrics.pastDueCount} account{mrrMetrics.pastDueCount === 1 ? " is" : "s are"} past due.
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loadError ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Support</p>
            <LinkButton href="/support-tickets" variant="secondary">
              View Tickets
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Stat label="Open Tickets" value={ticketCounts.open} />
            <Stat label="Overdue" value={ticketCounts.overdue} tone={ticketCounts.overdue > 0 ? "red" : "green"} />
          </div>
        </div>
      ) : null}

      <EmptyState
        title="Nothing else to show yet"
        description="Your pipeline and client data will surface here once it exists."
        actionLabel="Add a lead"
        actionHref="/organizations/new"
      />
    </PageShell>
  );
}
