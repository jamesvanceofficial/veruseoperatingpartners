import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Stat } from "@/shared/ui/Stat";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getOpenAndOverdueCounts } from "@/modules/support/data";
import { getStripeDashboardMetrics, getDataQualityIssues } from "@/modules/stripe/data";
import { getSubscriptionDashboardMetrics } from "@/modules/subscriptions/data";
import { DataQualityBanner } from "@/modules/stripe/DataQualityBanner";
import { StripeSyncButton } from "@/modules/stripe/StripeSyncButton";
import { formatSyncTime, formatUtcDate } from "@/modules/stripe/format";
import { formatCurrency } from "@/shared/format";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";

export default async function DashboardPage() {
  let ticketCounts = { open: 0, overdue: 0 };
  let mrr: Awaited<ReturnType<typeof getStripeDashboardMetrics>> | null = null;
  let issues: Awaited<ReturnType<typeof getDataQualityIssues>> | null = null;
  let lineItemMetrics: Awaited<ReturnType<typeof getSubscriptionDashboardMetrics>> | null = null;
  let loadError = false;
  try {
    // Revenue and the data-quality check read staff-only Stripe data, so they're shown to VERUS staff only.
    const user = await getSessionUser();
    const profileResult = user ? await getMyProfile(user.id) : null;
    const staff = profileResult?.status === "ok" && isVerusStaff(profileResult.profile.role);
    const supabase = await createServerSupabase();
    [ticketCounts, mrr, issues, lineItemMetrics] = await Promise.all([
      getOpenAndOverdueCounts(supabase),
      staff ? getStripeDashboardMetrics(supabase) : Promise.resolve(null),
      staff ? getDataQualityIssues(supabase) : Promise.resolve(null),
      // Services MRR: resold services on COMPASS subscription line items (revenue_category 'service') — the existing line-item calculation, unchanged.
      staff ? getSubscriptionDashboardMetrics(supabase) : Promise.resolve(null),
    ]);
  } catch {
    loadError = true;
  }

  const synced = mrr ? `synced ${formatSyncTime(mrr.lastSuccessfulSyncAt)}` : "";
  const scheduledNote = (s: { at: string; mrrAfter: number } | null) => (s ? ` → ${formatCurrency(s.mrrAfter)} from ${formatUtcDate(s.at)}.` : "");
  const servicesMRR = lineItemMetrics?.mrrByCategory.service ?? 0;
  // Total MRR = Product + Client (Stripe) + Services (COMPASS line items). Services has no scheduled changes, so it carries straight into the scheduled figure too.
  const totalMRR = (mrr?.totalMRR ?? 0) + servicesMRR;
  const totalScheduled = mrr?.totalScheduled ? { ...mrr.totalScheduled, mrrAfter: mrr.totalScheduled.mrrAfter + servicesMRR } : null;

  return (
    <PageShell title="Dashboard" subtitle="A single view of every deal, client, and system VERUS runs.">
      {!loadError && issues ? <DataQualityBanner issues={issues} /> : null}

      {!loadError && mrr ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="section-label">Revenue · Stripe and COMPASS line items</p>
              <p className="mt-1 text-[11.5px] text-[var(--muted)]">
                Last successful sync {formatSyncTime(mrr.lastSuccessfulSyncAt)} · syncs hourly
                {mrr.lastSync?.status === "error" ? (
                  <span className="text-[var(--red)]"> · latest attempt failed ({formatSyncTime(mrr.lastSync.started_at)}): {mrr.lastSync.error}</span>
                ) : null}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <LinkButton href="/subscriptions/stripe" variant="secondary">
                Stripe Subscriptions
              </LinkButton>
              <StripeSyncButton />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7">
            <Stat
              label="Total MRR"
              value={formatCurrency(totalMRR)}
              tone="gold"
              hint={`Product + Client (Stripe) + Services (COMPASS line items)${scheduledNote(totalScheduled) || "."} ${synced}`}
            />
            <Stat
              label="New MRR This Month"
              value={formatCurrency(mrr.newMRRThisMonth)}
              tone="green"
              hint={`Stripe: ${mrr.newThisMonthCount} subscription${mrr.newThisMonthCount === 1 ? "" : "s"} created this month (UTC). ${synced}`}
            />
            <Stat
              label="Product MRR"
              value={formatCurrency(mrr.productMRR)}
              hint={`Stripe: ${mrr.productCount} self-serve subscriber${mrr.productCount === 1 ? "" : "s"} who bought a product online, not tied to a client org (Verus Trading Bot). ${synced}`}
            />
            <Stat
              label="Client MRR"
              value={formatCurrency(mrr.clientMRR)}
              hint={`Stripe: ${mrr.clientCount} subscription${mrr.clientCount === 1 ? "" : "s"} belonging to a client org VERUS built and supports${scheduledNote(mrr.clientScheduled) || "."} ${synced}`}
            />
            <Stat
              label="Services MRR"
              value={formatCurrency(servicesMRR)}
              hint="COMPASS subscription line items in the service category: resold VA placement, marketing management, SEO, bookkeeping. Read live from COMPASS, not synced from Stripe."
            />
            <Stat
              label="Active Subscriptions"
              value={mrr.activeCount}
              hint={`Stripe: status active${mrr.unmatchedCount ? `, incl. ${mrr.unmatchedCount} unmatched` : ""}. ${synced}`}
            />
            <Stat
              label="Upcoming Renewals"
              value={mrr.upcomingRenewals}
              tone={mrr.upcomingRenewals > 0 ? "yellow" : "neutral"}
              hint={`Stripe: next invoice in the next 30 days, ${formatCurrency(mrr.upcomingRenewalsAmount)} total. ${synced}`}
            />
          </div>
          {mrr.pastDueCount > 0 ? (
            <div className="glass-panel border border-[color-mix(in_srgb,var(--red)_50%,transparent)] px-4 py-2.5">
              <p className="text-[12.5px] text-[var(--red)]">
                {mrr.pastDueCount} Stripe subscription{mrr.pastDueCount === 1 ? " is" : "s are"} past due.
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
