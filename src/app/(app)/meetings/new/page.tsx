import { PageShell } from "@/shared/ui/PageShell";
import { Card } from "@/shared/ui/Card";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getOrganizationById, listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { listContactOptions } from "@/modules/opportunities/data";
import { MeetingForm } from "@/modules/meetings/MeetingForm";

export default async function NewMeetingPage({ searchParams }: { searchParams: Promise<{ org_id?: string }> }) {
  const { org_id } = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  if (!canCreate) {
    return (
      <PageShell title="Schedule a meeting" subtitle="Add a meeting.">
        <Card>
          <p className="text-[12.5px] text-[var(--muted)]">Only VERUS admins/staff can schedule meetings.</p>
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
    <PageShell title="Schedule a meeting" subtitle={lockedOrg ? `Add a meeting for ${lockedOrg.name}.` : "Add a meeting."}>
      <MeetingForm
        mode="create"
        orgOptions={orgOptions}
        lockedOrg={lockedOrg ? { id: lockedOrg.id, name: lockedOrg.name } : undefined}
        staffOptions={staffOptions}
        initialAttendees={[]}
        initialContactOptions={initialContactOptions}
        initialRelatedOptions={[]}
      />
    </PageShell>
  );
}
