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

export default async function OrganizationSubscriptionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const subscriptions = await listSubscriptionsForOrg(supabase, id);

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-[14px] font-semibold text-[var(--cream)]">Subscription</h2>

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
