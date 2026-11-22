import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listSubscriptionsForOrg } from "@/modules/subscriptions/data";
import { STATUS_LABELS, STATUS_TONE } from "@/modules/subscriptions/labels";
import { LineItemsTable } from "@/modules/subscriptions/LineItemsTable";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Stat } from "@/shared/ui/Stat";
import { EmptyState } from "@/shared/ui/EmptyState";
import { formatCurrency } from "@/shared/format";
import { SUPPORT_TIER_INFO } from "@/modules/assessments/buildTiers";
import { listStripeSubscriptionsForOrg } from "@/modules/stripe/data";
import { formatSyncTime, formatUtcDate } from "@/modules/stripe/format";

export default async function OrganizationSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  // Stripe rows are staff-only (RLS) — a client viewer simply gets none, so the section doesn't render for them.
  const [subscriptions, stripeSubs] = await Promise.all([listSubscriptionsForOrg(supabase, id), listStripeSubscriptionsForOrg(supabase, id).catch(() => [])]);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[14px] font-semibold text-[var(--cream)]">Subscription</h2>

      {stripeSubs.length > 0 ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Stripe · Billing of Record</p>
            <Link href="/subscriptions/stripe" className="text-[11.5px] text-[var(--gold-light)] hover:underline">
              All Stripe subscriptions →
            </Link>
          </div>
          {stripeSubs.map((s) => (
            <Card key={s.id} className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] font-medium text-[var(--cream)]">{s.product_name}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={s.status === "active" ? "green" : "neutral"}>{s.status.replace(/_/g, " ")}</Badge>
                    <span className="text-[11px] text-[var(--muted)]">
                      {s.stripe_subscription_id} · synced {formatSyncTime(s.last_synced_at)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6">
                  <Stat label="MRR Now" value={formatCurrency(s.mrr)} tone="gold" />
                  <Stat
                    label="Next Invoice"
                    value={s.next_invoice_date ? formatCurrency(s.next_invoice_amount) : "—"}
                    hint={s.next_invoice_date ? formatUtcDate(s.next_invoice_date) : undefined}
                  />
                  {s.scheduled_change_at ? (
                    <Stat label="Scheduled MRR" value={formatCurrency(s.scheduled_mrr)} tone="green" hint={`from ${formatUtcDate(s.scheduled_change_at)}`} />
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col gap-1 text-[12px] text-[var(--muted)]">
                {s.items.map((item, i) => (
                  <p key={`now-${i}`}>
                    Now: {item.product_name} — {formatCurrency(item.unit_amount)} × {item.quantity} / {item.interval}
                  </p>
                ))}
                {(s.scheduled_items ?? []).map((item, i) => (
                  <p key={`sched-${i}`} className="text-[var(--cream)]">
                    From {formatUtcDate(s.scheduled_change_at)}: {item.product_name} — {formatCurrency(item.unit_amount)} × {item.quantity} / {item.interval}
                  </p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : null}

      {subscriptions.length === 0 ? (
        <EmptyState title="No subscription yet" description="Create one from a completed build package, or start one from Subscriptions → New Subscription." />
      ) : (
        subscriptions.map((detail) => (
          <div key={detail.subscription.id} className="flex flex-col gap-4">
            <Card className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <Link href={`/subscriptions/${detail.subscription.id}`} className="text-[13px] font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
                  {detail.subscription.plan_name}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  {detail.subscription.support_tier ? <Badge tone="gold">{SUPPORT_TIER_INFO[detail.subscription.support_tier].label}</Badge> : null}
                  <Badge tone={STATUS_TONE[detail.subscription.status]}>{STATUS_LABELS[detail.subscription.status]}</Badge>
                </div>
              </div>
              <div className="flex gap-6">
                <Stat label="MRR" value={formatCurrency(detail.mrr)} tone="gold" />
                <Stat label="Software" value={formatCurrency(detail.mrrByCategory.software)} />
                <Stat label="Service" value={formatCurrency(detail.mrrByCategory.service)} />
              </div>
            </Card>
            <LineItemsTable lineItems={detail.lineItems} subscriptionId={detail.subscription.id} />
          </div>
        ))
      )}
    </div>
  );
}
