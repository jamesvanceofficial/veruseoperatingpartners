import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getProposalDetail, getProposalDeletePreview } from "@/modules/proposals/data";
import { STATUS_LABELS, STATUS_TONE } from "@/modules/proposals/labels";
import { ProposalDocument } from "@/modules/proposals/ProposalDocument";
import { ProposalShareLinkPanel } from "@/modules/proposals/ProposalShareLinkPanel";
import { MarkSentButton } from "@/modules/proposals/MarkSentButton";
import { getBuildPackageByAssessmentId } from "@/modules/buildPackages/data";
import { CreateBuildPackageButton } from "@/modules/buildPackages/CreateBuildPackageButton";
import { Badge } from "@/shared/ui/Badge";
import { Card } from "@/shared/ui/Card";
import { LinkButton } from "@/shared/ui/LinkButton";
import { DangerZone } from "@/shared/ui/DangerZone";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const detail = await getProposalDetail(supabase, id);
  if (!detail) notFound();

  const { proposal, orgName, preparedByName } = detail;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  const existingBuildPackage = proposal.assessment_id ? await getBuildPackageByAssessmentId(supabase, proposal.assessment_id) : null;

  const isActive = Boolean(proposal.share_token) && !proposal.share_token_revoked_at && (!proposal.share_token_expires_at || new Date(proposal.share_token_expires_at).getTime() > Date.now());

  let deleteConfirmMessage = "";
  if (canEdit) {
    const preview = await getProposalDeletePreview(supabase, id);
    deleteConfirmMessage = `Delete this proposal for ${preview.companyName} (status: ${STATUS_LABELS[preview.status]})? This cannot be undone.`;
  }

  return (
    <div className="page-container flex flex-1 flex-col gap-6 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/proposals" className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
            ← Proposals
          </Link>
          <h1 className="mt-1 text-[19px] font-semibold text-[var(--cream)]">{proposal.company_name}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Badge tone={STATUS_TONE[proposal.status]}>{STATUS_LABELS[proposal.status]}</Badge>
            <Link href={`/organizations/${proposal.org_id}`} className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              {orgName}
            </Link>
          </div>
        </div>
        {canEdit ? (
          <div className="flex items-center gap-2">
            {proposal.status === "draft" ? <MarkSentButton proposalId={id} /> : null}
            <LinkButton href={`/proposals/${id}/edit`}>Edit proposal</LinkButton>
          </div>
        ) : null}
      </div>

      {canEdit ? (
        <ProposalShareLinkPanel proposalId={id} initialToken={proposal.share_token} initialExpiresAt={proposal.share_token_expires_at} initialActive={isActive} />
      ) : null}

      {proposal.status === "accepted" ? (
        <Card className="flex items-center justify-between gap-3">
          {existingBuildPackage ? (
            <>
              <p className="text-[12.5px] text-[var(--muted)]">This proposal&apos;s build package has already been created.</p>
              <LinkButton href={`/build-packages/${existingBuildPackage.id}`}>View build package →</LinkButton>
            </>
          ) : proposal.assessment_id ? (
            <>
              <p className="text-[12.5px] text-[var(--muted)]">Accepted — create the build package from the source assessment.</p>
              {canEdit ? <CreateBuildPackageButton assessmentId={proposal.assessment_id} /> : null}
            </>
          ) : (
            <p className="text-[12.5px] text-[var(--muted)]">Accepted — no source assessment on file, so no build package can be generated automatically.</p>
          )}
        </Card>
      ) : null}

      {proposal.status === "declined" && proposal.decline_reason ? (
        <Card>
          <p className="section-label mb-1">Decline reason</p>
          <p className="text-[13px] text-[var(--cream)]">{proposal.decline_reason}</p>
        </Card>
      ) : null}

      <Card className="mx-auto w-full max-w-[860px] p-8">
        <ProposalDocument proposal={proposal} preparedByName={preparedByName} />
      </Card>

      {canEdit ? (
        <DangerZone itemLabel="this proposal" confirmMessage={deleteConfirmMessage} deleteUrl={`/api/proposals/${id}`} redirectUrl="/proposals" />
      ) : null}
    </div>
  );
}
