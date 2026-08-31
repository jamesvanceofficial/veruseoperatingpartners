import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Stat } from "@/shared/ui/Stat";
import { LinkButton } from "@/shared/ui/LinkButton";
import { DangerZone } from "@/shared/ui/DangerZone";
import { formatCurrency, formatDate } from "@/shared/format";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSubscriptionDetail, getSubscriptionDeletePreview } from "@/modules/subscriptions/data";
import { STATUS_LABELS, STATUS_TONE } from "@/modules/subscriptions/labels";
import { SubscriptionStatusControl } from "@/modules/subscriptions/SubscriptionControls";
import { LineItemsTable } from "@/modules/subscriptions/LineItemsTable";
import { AddLineItemPanel } from "@/modules/subscriptions/AddLineItemPanel";
import { SUPPORT_TIER_INFO } from "@/modules/assessments/buildTiers";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <p className="text-[13px] text-[var(--cream)]">{value ?? "—"}</p>
    </div>
  );
}

export default async function SubscriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const detail = await getSubscriptionDetail(supabase, id);
  if (!detail) notFound();

  const { subscription } = detail;
  const deletePreview = await getSubscriptionDeletePreview(supabase, id);

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/subscriptions" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← Subscriptions
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{subscription.plan_name}</h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Link href={`/organizations/${subscription.org_id}`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              {detail.orgName}
            </Link>
            {subscription.support_tier ? <Badge tone="gold">{SUPPORT_TIER_INFO[subscription.support_tier].label}</Badge> : null}
            <Badge tone={STATUS_TONE[subscription.status]}>{STATUS_LABELS[subscription.status]}</Badge>
            {detail.buildPackageLabel ? <span className="text-[12px] text-[var(--muted)]">· from {detail.buildPackageLabel}</span> : null}
          </div>
        </div>
        <LinkButton href={`/subscriptions/${id}/edit`}>Edit</LinkButton>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="MRR" value={formatCurrency(detail.mrr)} tone="gold" />
        <Stat label="Software MRR" value={formatCurrency(detail.mrrByCategory.software)} />
        <Stat label="Service MRR" value={formatCurrency(detail.mrrByCategory.service)} />
        <Stat label="Seats" value={subscription.seats ?? "—"} />
      </div>

      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="section-label">Status</p>
          <div className="mt-1.5">
            <SubscriptionStatusControl subscriptionId={id} status={subscription.status} />
          </div>
        </div>
        <Field label="Start date" value={formatDate(subscription.start_date)} />
        <Field label="Renewal date" value={subscription.renewal_date ? formatDate(subscription.renewal_date) : "—"} />
        <Field label="First billing date" value={subscription.first_billing_date ? formatDate(subscription.first_billing_date) : "—"} />
        <Field label="Cancelled" value={subscription.cancelled_at ? formatDate(subscription.cancelled_at) : "—"} />
      </Card>

      {subscription.billing_notes ? (
        <Card>
          <p className="mb-2 section-label">Notes</p>
          <p className="whitespace-pre-wrap text-[13px] text-[var(--cream)]">{subscription.billing_notes}</p>
        </Card>
      ) : null}

      <div className="flex flex-col gap-4">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Line Items</h2>
        <LineItemsTable lineItems={detail.lineItems} subscriptionId={id} />
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Add a Line Item</h2>
        <AddLineItemPanel subscriptionId={id} supportTier={subscription.support_tier} />
      </div>

      <DangerZone
        itemLabel="this subscription"
        confirmMessage={`Delete "${deletePreview.planName}" for ${detail.orgName}? This also deletes its ${deletePreview.lineItemCount} line item${deletePreview.lineItemCount === 1 ? "" : "s"}. This can't be undone.`}
        deleteUrl={`/api/subscriptions/${id}`}
        redirectUrl="/subscriptions"
      />
    </div>
  );
}
