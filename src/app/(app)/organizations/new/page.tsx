import { PageShell } from "@/shared/ui/PageShell";
import { Card } from "@/shared/ui/Card";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { OrganizationForm } from "@/modules/organizations/OrganizationForm";

export default async function NewOrganizationPage() {
  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canCreate) {
    return (
      <PageShell title="New organization" subtitle="Add a company to COMPASS.">
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can create organizations.</p>
        </Card>
      </PageShell>
    );
  }

  const supabase = await createServerSupabase();
  const [staffOptions, orgOptions] = await Promise.all([listStaffProfiles(supabase), listOrgOptions(supabase)]);

  return (
    <PageShell title="New organization" subtitle="Add a company to COMPASS.">
      <OrganizationForm mode="create" staffOptions={staffOptions} orgOptions={orgOptions} />
    </PageShell>
  );
}
