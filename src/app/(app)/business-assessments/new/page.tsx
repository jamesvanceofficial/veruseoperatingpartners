import { PageShell } from "@/shared/ui/PageShell";
import { Card } from "@/shared/ui/Card";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOrganizationById, listOrgOptions } from "@/modules/organizations/data";
import { NewAssessmentForm } from "@/modules/assessments/NewAssessmentForm";

export default async function NewAssessmentPage({ searchParams }: { searchParams: Promise<{ org_id?: string }> }) {
  const { org_id } = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canCreate) {
    return (
      <PageShell title="New assessment" subtitle="Start a Quick Scan or Full Assessment.">
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can start assessments.</p>
        </Card>
      </PageShell>
    );
  }

  const supabase = await createServerSupabase();
  const lockedOrg = org_id ? await getOrganizationById(supabase, org_id) : null;
  const orgOptions = lockedOrg ? [] : await listOrgOptions(supabase);

  return (
    <PageShell title="New assessment" subtitle={lockedOrg ? `Start an assessment for ${lockedOrg.name}.` : "Start a Quick Scan or Full Assessment."}>
      <NewAssessmentForm orgOptions={orgOptions} lockedOrg={lockedOrg ? { id: lockedOrg.id, name: lockedOrg.name } : undefined} />
    </PageShell>
  );
}
