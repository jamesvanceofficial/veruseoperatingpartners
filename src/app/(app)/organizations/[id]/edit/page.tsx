import { notFound } from "next/navigation";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOrganizationById, listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { OrganizationForm } from "@/modules/organizations/OrganizationForm";
import { Card } from "@/shared/ui/Card";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const org = await getOrganizationById(supabase, id);
  if (!org) notFound();

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canEdit) {
    return (
      <Card>
        <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can edit organizations.</p>
      </Card>
    );
  }

  const [staffOptions, orgOptions] = await Promise.all([listStaffProfiles(supabase), listOrgOptions(supabase, id)]);

  return <OrganizationForm mode="edit" organization={org} staffOptions={staffOptions} orgOptions={orgOptions} />;
}
