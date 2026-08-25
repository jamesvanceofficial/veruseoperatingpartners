import { notFound } from "next/navigation";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getOrganizationOverview } from "@/modules/organizations/data";
import { ORG_TYPE_LABELS, ORG_STATUS_LABELS, HEALTH_LABELS } from "@/modules/organizations/labels";
import { Card } from "@/shared/ui/Card";
import { Stat } from "@/shared/ui/Stat";
import { formatCurrency, formatDate, formatNumber } from "@/shared/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className="text-[13px] text-[var(--cream)]">{value ?? "—"}</p>
    </div>
  );
}

export default async function OrganizationOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const overview = await getOrganizationOverview(supabase, id);
  if (!overview) notFound();

  const { org } = overview;

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Enterprise Score"
          value={overview.latestAssessment?.score ?? "—"}
          hint={overview.latestAssessment ? (overview.latestAssessment.band ?? undefined) : "No completed assessment yet"}
          tone="gold"
        />
        <Stat
          label="Client Health"
          value={overview.healthStatus ? HEALTH_LABELS[overview.healthStatus] : "—"}
          hint={overview.healthPeriod ? formatDate(overview.healthPeriod) : "Not scored yet"}
          tone={overview.healthStatus ?? "neutral"}
        />
        <Stat label="Current MRR" value={formatCurrency(overview.mrr)} hint="Sum of active subscription line items" />
        <Stat label="Lifetime Revenue" value={formatCurrency(overview.lifetimeRevenue)} hint="Net paid revenue transactions" />
      </div>

      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Type" value={ORG_TYPE_LABELS[org.type]} />
        <Field label="Status" value={ORG_STATUS_LABELS[org.status]} />
        <Field label="Industry" value={org.industry} />
        <Field label="Website" value={org.website} />
        <Field label="Phone" value={org.phone} />
        <Field label="Primary address" value={org.primary_address} />
        <Field label="Employees (est.)" value={formatNumber(org.employee_count_estimate)} />
        <Field label="Annual revenue (est.)" value={formatCurrency(org.annual_revenue_estimate)} />
        <Field label="Source" value={org.source} />
        <Field label="Referred by" value={overview.referredByName} />
        <Field label="Assigned owner" value={overview.ownerName} />
        <Field label="Created" value={formatDate(org.created_at)} />
        <Field label="Last updated" value={formatDate(org.updated_at)} />
      </Card>

      <Card>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">Notes</p>
        <p className="whitespace-pre-wrap text-[13px] text-[var(--cream)]">{org.notes ?? "No notes yet."}</p>
      </Card>
    </div>
  );
}
