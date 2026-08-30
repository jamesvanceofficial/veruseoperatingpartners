import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getProjectDetail } from "@/modules/projects/data";
import { listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { listBuildPackageOptions, listPhaseOptions } from "@/modules/buildPackages/data";
import { ProjectForm } from "@/modules/projects/ProjectForm";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);
  if (!canEdit) redirect(`/projects/${id}`);

  const supabase = await createServerSupabase();
  const detail = await getProjectDetail(supabase, id);
  if (!detail) notFound();

  const [staffOptions, orgOptions, buildPackageOptions, phaseOptions] = await Promise.all([
    listStaffProfiles(supabase),
    listOrgOptions(supabase),
    listBuildPackageOptions(supabase, detail.project.org_id),
    detail.project.build_package_id ? listPhaseOptions(supabase, detail.project.build_package_id) : Promise.resolve([]),
  ]);

  return (
    <PageShell title="Edit project" subtitle={`${detail.orgName} — ${detail.project.name}`}>
      <ProjectForm
        mode="edit"
        project={detail.project}
        orgOptions={orgOptions}
        staffOptions={staffOptions}
        initialBuildPackageOptions={buildPackageOptions}
        initialPhaseOptions={phaseOptions}
      />
    </PageShell>
  );
}
