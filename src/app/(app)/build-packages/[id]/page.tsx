import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getBuildPackageDetail, getBuildPackageDeletePreview } from "@/modules/buildPackages/data";
import { BUILD_PACKAGE_STATUS_LABELS, BUILD_PACKAGE_STATUS_TONE, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "@/modules/buildPackages/labels";
import { BuildPackagePhaseCard } from "@/modules/buildPackages/BuildPackagePhaseCard";
import { BUILD_TIER_INFO, computeFirstBillingDate, STABILIZATION_PERIOD_DAYS } from "@/modules/assessments/buildTiers";
import { ASSESSMENT_TYPE_LABELS } from "@/modules/assessments/labels";
import { listProjectsForBuildPackage } from "@/modules/projects/data";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONE } from "@/modules/projects/labels";
import { GenerateProjectsButton } from "@/modules/projects/GenerateProjectsButton";
import { getSubscriptionByBuildPackageId } from "@/modules/subscriptions/data";
import { CreateSubscriptionButton } from "@/modules/subscriptions/CreateSubscriptionButton";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { Stat } from "@/shared/ui/Stat";
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

export default async function BuildPackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const detail = await getBuildPackageDetail(supabase, id);
  if (!detail) notFound();

  const { buildPackage, orgName, paymentStatus, assessmentType, assessmentCompletedAt, phases, overallProgressPct } = detail;
  const tierInfo = BUILD_TIER_INFO[buildPackage.tier];
  const firstBillingDate = computeFirstBillingDate(buildPackage.handover_date);

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  const generatedProjects = await listProjectsForBuildPackage(supabase, id);
  const existingSubscription = await getSubscriptionByBuildPackageId(supabase, id);

  let deleteConfirmMessage = "";
  if (canEdit) {
    const preview = await getBuildPackageDeletePreview(supabase, id);
    const lines = [`Delete this ${tierInfo.label} for ${orgName}? This cannot be undone.`];
    lines.push("This will also permanently delete:");
    lines.push(`• ${preview.phaseCount} phase${preview.phaseCount === 1 ? "" : "s"}`);
    lines.push(`• ${preview.scopeItemCount} scope item${preview.scopeItemCount === 1 ? "" : "s"}`);
    if (preview.itemsWithProgressCount > 0) {
      lines.push(
        `Note: ${preview.itemsWithProgressCount} of those scope item${preview.itemsWithProgressCount === 1 ? "" : "s"} already ${preview.itemsWithProgressCount === 1 ? "has" : "have"} progress recorded (in progress or complete) — that progress will be lost.`
      );
    }
    lines.push("The linked opportunity (if any) will move back to Build Package Proposed. The source assessment is not affected.");
    deleteConfirmMessage = lines.join("\n");
  }

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/build-packages" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← Build Packages
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{tierInfo.label}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={BUILD_PACKAGE_STATUS_TONE[buildPackage.status]}>{BUILD_PACKAGE_STATUS_LABELS[buildPackage.status]}</Badge>
            <Link href={`/organizations/${buildPackage.org_id}`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              {orgName}
            </Link>
            {assessmentType ? (
              <span className="text-[12px] text-[var(--muted)]">
                · from {ASSESSMENT_TYPE_LABELS[assessmentType]}
                {assessmentCompletedAt ? ` completed ${formatDate(assessmentCompletedAt)}` : ""}
              </span>
            ) : null}
          </div>
        </div>
        {canEdit ? <LinkButton href={`/build-packages/${id}/edit`}>Edit build package</LinkButton> : null}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Price" value={formatCurrency(buildPackage.price)} tone="gold" />
        <Stat
          label="Payment Status"
          value={PAYMENT_STATUS_LABELS[paymentStatus]}
          tone={paymentStatus === "paid_in_full" ? "green" : paymentStatus === "deposit_paid" ? "yellow" : "neutral"}
        />
        <Stat label="Overall Progress" value={`${overallProgressPct}%`} tone="gold" />
        <Stat
          label="First Billing"
          value={firstBillingDate ? formatDate(firstBillingDate) : "—"}
          hint={firstBillingDate ? undefined : `Set once handover date is known (${STABILIZATION_PERIOD_DAYS} days after)`}
        />
      </div>

      <Card className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Deposit amount" value={formatCurrency(buildPackage.deposit_amount)} />
        <Field label="Deposit paid" value={buildPackage.deposit_paid_at ? formatDate(buildPackage.deposit_paid_at) : "Not yet"} />
        <Field label="Balance amount" value={formatCurrency(buildPackage.balance_amount)} />
        <Field label="Balance paid" value={buildPackage.balance_paid_at ? formatDate(buildPackage.balance_paid_at) : "Not yet"} />
        <Field label="Start date" value={formatDate(buildPackage.start_date)} />
        <Field label="Target completion" value={formatDate(buildPackage.target_completion_date)} />
        <Field label="Handover date" value={formatDate(buildPackage.handover_date)} />
        <Field label="Created" value={formatDate(buildPackage.created_at)} />
      </Card>

      <Card>
        <p className="mb-2 section-label">Notes</p>
        <p className="whitespace-pre-wrap text-[13px] text-[var(--cream)]">{buildPackage.notes ?? "No notes yet."}</p>
      </Card>

      <div className="flex flex-col gap-4">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Phases</h2>
        {phases.length === 0 ? (
          <Card>
            <p className="text-[12.5px] text-[var(--muted)]">No phases were generated for this build package.</p>
          </Card>
        ) : (
          phases.map((phase) => <BuildPackagePhaseCard key={phase.id} buildPackageId={id} phase={phase} canEdit={canEdit} />)
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-[var(--cream)]">Projects</h2>
          {canEdit && generatedProjects.length === 0 ? <GenerateProjectsButton buildPackageId={id} /> : null}
        </div>
        {generatedProjects.length === 0 ? (
          <Card>
            <p className="text-[12.5px] text-[var(--muted)]">
              No projects generated yet — one click turns each phase into a project and each scope item into a task.
            </p>
          </Card>
        ) : (
          <Card className="flex flex-col divide-y divide-[var(--hairline)]">
            {generatedProjects.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                <Link href={`/projects/${p.id}`} className="text-[12.5px] text-[var(--cream)] hover:text-[var(--gold-light)]">
                  {p.name}
                </Link>
                <Badge tone={PROJECT_STATUS_TONE[p.status as keyof typeof PROJECT_STATUS_TONE]}>
                  {PROJECT_STATUS_LABELS[p.status as keyof typeof PROJECT_STATUS_LABELS]}
                </Badge>
              </div>
            ))}
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Subscription</h2>
        <Card className="flex items-center justify-between gap-3">
          {existingSubscription ? (
            <>
              <p className="text-[12.5px] text-[var(--muted)]">This build package already has a subscription.</p>
              <LinkButton href={`/subscriptions/${existingSubscription.id}`}>View subscription →</LinkButton>
            </>
          ) : (
            <>
              <p className="text-[12.5px] text-[var(--muted)]">
                {buildPackage.handover_date
                  ? "Create the ongoing Software, Systems & Support subscription for this client."
                  : "Set a handover date above before creating this build's subscription."}
              </p>
              {canEdit && buildPackage.handover_date ? <CreateSubscriptionButton buildPackageId={id} /> : null}
            </>
          )}
        </Card>
      </div>

      {canEdit ? (
        <DangerZone
          itemLabel="this build package"
          confirmMessage={deleteConfirmMessage}
          deleteUrl={`/api/build-packages/${id}`}
          redirectUrl="/build-packages"
        />
      ) : null}
    </div>
  );
}
