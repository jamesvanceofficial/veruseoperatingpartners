import { PageShell } from "@/shared/ui/PageShell";
import { Card } from "@/shared/ui/Card";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOrganizationById, listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { listContactOptions } from "@/modules/opportunities/data";
import { OpportunityForm } from "@/modules/opportunities/OpportunityForm";

export default async function NewOpportunityPage({ searchParams }: { searchParams: Promise<{ org_id?: string }> }) {
  const { org_id } = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canCreate) {
    return (
      <PageShell title="New opportunity" subtitle="Add an opportunity to the pipeline.">
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can create opportunities.</p>
        </Card>
      </PageShell>
    );
  }

  const supabase = await createServerSupabase();

  const lockedOrg = org_id ? await getOrganizationById(supabase, org_id) : null;
  const [staffOptions, orgOptions, initialContactOptions] = await Promise.all([
    listStaffProfiles(supabase),
    lockedOrg ? Promise.resolve([]) : listOrgOptions(supabase),
    lockedOrg ? listContactOptions(supabase, lockedOrg.id) : Promise.resolve([]),
  ]);

  return (
    <PageShell title="New opportunity" subtitle={lockedOrg ? `Add an opportunity for ${lockedOrg.name}.` : "Add an opportunity to the pipeline."}>
      <OpportunityForm
        mode="create"
        orgOptions={orgOptions}
        lockedOrg={lockedOrg ? { id: lockedOrg.id, name: lockedOrg.name } : undefined}
        initialContactOptions={initialContactOptions}
        staffOptions={staffOptions}
      />
    </PageShell>
  );
}
