import { notFound } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { Card } from "@/shared/ui/Card";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { getOpportunityById, listContactOptions } from "@/modules/opportunities/data";
import { OpportunityForm } from "@/modules/opportunities/OpportunityForm";

export default async function EditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const opportunity = await getOpportunityById(supabase, id);
  if (!opportunity) notFound();

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canEdit) {
    return (
      <PageShell title="Edit opportunity" subtitle={opportunity.name}>
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can edit opportunities.</p>
        </Card>
      </PageShell>
    );
  }

  const [staffOptions, orgOptions, initialContactOptions] = await Promise.all([
    listStaffProfiles(supabase),
    listOrgOptions(supabase),
    listContactOptions(supabase, opportunity.org_id),
  ]);

  return (
    <PageShell title="Edit opportunity" subtitle={opportunity.name}>
      <OpportunityForm
        mode="edit"
        opportunity={opportunity}
        orgOptions={orgOptions}
        initialContactOptions={initialContactOptions}
        staffOptions={staffOptions}
      />
    </PageShell>
  );
}
