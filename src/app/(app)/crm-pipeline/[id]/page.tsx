import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOpportunityDetail, getOpportunityDeletePreview } from "@/modules/opportunities/data";
import { STAGE_LABELS, STAGE_TONE } from "@/modules/opportunities/labels";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { LinkButton } from "@/shared/ui/LinkButton";
import { DangerZone } from "@/shared/ui/DangerZone";
import { formatCurrency, formatDate } from "@/shared/format";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="section-label">{label}</p>
      <p className="text-[13px] text-[var(--cream)]">{value ?? "—"}</p>
    </div>
  );
}

export default async function OpportunityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const detail = await getOpportunityDetail(supabase, id);
  if (!detail) notFound();

  const { opportunity, orgName, ownerName, primaryContactName, stageHistory } = detail;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let deleteConfirmMessage = "";
  if (canEdit) {
    const preview = await getOpportunityDeletePreview(supabase, id);
    const lines = [`Delete "${opportunity.name}"? This cannot be undone.`];
    if (preview.linkedItems.length > 0) {
      lines.push("Linked records below will be kept but unlinked from this opportunity:");
      lines.push(...preview.linkedItems.map((i) => `• ${i.count} ${i.label}`));
    }
    deleteConfirmMessage = lines.join("\n");
  }

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/crm-pipeline" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← CRM Pipeline
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{opportunity.name}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={STAGE_TONE[opportunity.stage]}>{STAGE_LABELS[opportunity.stage]}</Badge>
            <Link href={`/organizations/${opportunity.org_id}`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              {orgName}
            </Link>
          </div>
        </div>
        {canEdit ? <LinkButton href={`/crm-pipeline/${id}/edit`}>Edit opportunity</LinkButton> : null}
      </div>

      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Field label="Organization" value={<Link href={`/organizations/${opportunity.org_id}`} className="hover:text-[var(--gold-light)]">{orgName}</Link>} />
        <Field label="Primary contact" value={primaryContactName} />
        <Field label="Owner" value={ownerName} />
        <Field label="Source" value={opportunity.source} />
        <Field label="Expected value" value={formatCurrency(opportunity.expected_value)} />
        <Field label="Probability" value={opportunity.probability !== null ? `${opportunity.probability}%` : null} />
        <Field label="Next action" value={opportunity.next_action} />
        <Field label="Next action date" value={formatDate(opportunity.next_action_date)} />
        <Field label="Lost reason" value={opportunity.lost_reason} />
        <Field label="Stage changed" value={formatDate(opportunity.stage_changed_at)} />
        <Field label="Created" value={formatDate(opportunity.created_at)} />
        <Field label="Last updated" value={formatDate(opportunity.updated_at)} />
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="section-label">Pain Points</p>
        <p className="whitespace-pre-wrap text-[13px] text-[var(--cream)]">{opportunity.pain_points ?? "None recorded."}</p>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="section-label">Business Goals</p>
        <p className="whitespace-pre-wrap text-[13px] text-[var(--cream)]">{opportunity.business_goals ?? "None recorded."}</p>
      </Card>

      <Card className="flex flex-col gap-3">
        <p className="section-label">Notes</p>
        <p className="whitespace-pre-wrap text-[13px] text-[var(--cream)]">{opportunity.notes ?? "No notes yet."}</p>
      </Card>

      <Card className="flex flex-col gap-2">
        <p className="mb-1 section-label">Stage History</p>
        {stageHistory.length === 0 ? (
          <p className="text-[12.5px] text-[var(--muted)]">No stage changes recorded yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--hairline)]">
            {stageHistory.map((h) => (
              <div key={h.id} className="flex items-center justify-between gap-3 py-2">
                <div className="flex items-center gap-2">
                  {h.from_stage ? <Badge tone={STAGE_TONE[h.from_stage]}>{STAGE_LABELS[h.from_stage]}</Badge> : <Badge>Created</Badge>}
                  <span className="text-[var(--muted)]">→</span>
                  <Badge tone={STAGE_TONE[h.to_stage]}>{STAGE_LABELS[h.to_stage]}</Badge>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-[var(--cream)]">{formatDate(h.changed_at)}</p>
                  <p className="text-[11px] text-[var(--muted)]">{h.changedByName ?? "Unknown"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {canEdit ? (
        <DangerZone
          itemLabel="this opportunity"
          confirmMessage={deleteConfirmMessage}
          deleteUrl={`/api/opportunities/${id}`}
          redirectUrl="/crm-pipeline"
        />
      ) : null}
    </div>
  );
}
