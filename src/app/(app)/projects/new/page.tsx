import { PageShell } from "@/shared/ui/PageShell";
import { Card } from "@/shared/ui/Card";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOrganizationById, listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { listBuildPackageOptions } from "@/modules/buildPackages/data";
import { ProjectForm } from "@/modules/projects/ProjectForm";

export default async function NewProjectPage({ searchParams }: { searchParams: Promise<{ org_id?: string }> }) {
  const { org_id } = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canCreate) {
    return (
      <PageShell title="New project" subtitle="Add a project.">
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can create projects.</p>
        </Card>
      </PageShell>
    );
  }

  const supabase = await createServerSupabase();

  const lockedOrg = org_id ? await getOrganizationById(supabase, org_id) : null;
  const [staffOptions, orgOptions, initialBuildPackageOptions] = await Promise.all([
    listStaffProfiles(supabase),
    lockedOrg ? Promise.resolve([]) : listOrgOptions(supabase),
    lockedOrg ? listBuildPackageOptions(supabase, lockedOrg.id) : Promise.resolve([]),
  ]);

  return (
    <PageShell title="New project" subtitle={lockedOrg ? `Add a project for ${lockedOrg.name}.` : "Add a project."}>
      <ProjectForm
        mode="create"
        orgOptions={orgOptions}
        lockedOrg={lockedOrg ? { id: lockedOrg.id, name: lockedOrg.name } : undefined}
        staffOptions={staffOptions}
        initialBuildPackageOptions={initialBuildPackageOptions}
        initialPhaseOptions={[]}
      />
    </PageShell>
  );
}
