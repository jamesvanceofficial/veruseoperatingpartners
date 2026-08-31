import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listSubscriptions } from "@/modules/subscriptions/data";
import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "@/modules/subscriptions/types";
import { STATUS_LABELS } from "@/modules/subscriptions/labels";
import { SubscriptionListTable } from "@/modules/subscriptions/SubscriptionListTable";
import { SUPPORT_TIERS, SUPPORT_TIER_INFO, type SupportTier } from "@/modules/assessments/buildTiers";

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ status?: string; tier?: string }> }) {
  const params = await searchParams;
  const status = SUBSCRIPTION_STATUSES.includes(params.status as SubscriptionStatus) ? (params.status as SubscriptionStatus) : undefined;
  const tier = SUPPORT_TIERS.includes(params.tier as SupportTier) ? (params.tier as SupportTier) : undefined;
  const hasFilters = Boolean(status || tier);

  let rows: Awaited<ReturnType<typeof listSubscriptions>> = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    rows = await listSubscriptions(supabase, { status, tier });
  } catch {
    loadError = true;
  }

  return (
    <PageShell title="Subscriptions" subtitle="Every Software, Systems & Support subscription, and the MRR it carries.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <Select name="status" defaultValue={params.status ?? ""}>
            <option value="">All statuses</option>
            {SUBSCRIPTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
          <Select name="tier" defaultValue={params.tier ?? ""}>
            <option value="">All tiers</option>
            {SUPPORT_TIERS.map((t) => (
              <option key={t} value={t}>
                {SUPPORT_TIER_INFO[t].label}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters ? (
            <LinkButton href="/subscriptions" variant="secondary">
              Clear
            </LinkButton>
          ) : null}
        </form>
        <LinkButton href="/subscriptions/new" variant="primary">
          New Subscription
        </LinkButton>
      </div>

      {loadError ? (
        <EmptyState title="Subscriptions aren't set up yet" description="The database migrations may not have been run yet." />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No subscriptions match those filters" : "No subscriptions yet"}
          description={hasFilters ? "Try clearing a filter." : "Create one from a completed build package, or start one manually."}
        />
      ) : (
        <SubscriptionListTable rows={rows} />
      )}
    </PageShell>
  );
}
