import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getProposalDetail } from "@/modules/proposals/data";
import { ProposalForm } from "@/modules/proposals/ProposalForm";

export default async function EditProposalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);
  if (!canEdit) redirect(`/proposals/${id}`);

  const supabase = await createServerSupabase();
  const detail = await getProposalDetail(supabase, id);
  if (!detail) notFound();

  return (
    <PageShell title="Edit proposal" subtitle={`${detail.orgName} — adjust scope, price, terms, and wording before sending.`}>
      <ProposalForm orgName={detail.orgName} proposal={detail.proposal} />
    </PageShell>
  );
}
