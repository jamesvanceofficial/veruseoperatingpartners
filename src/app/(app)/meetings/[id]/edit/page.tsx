import { notFound, redirect } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { getMeetingDetail, getMeetingAttendeesForEdit } from "@/modules/meetings/data";
import { listStaffProfiles, listOrgOptions } from "@/modules/organizations/data";
import { listContactOptions, listOpportunityOptions } from "@/modules/opportunities/data";
import { listBuildPackageOptions } from "@/modules/buildPackages/data";
import { listProjectOptions } from "@/modules/projects/data";
import { MeetingForm } from "@/modules/meetings/MeetingForm";

export default async function EditMeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canEdit = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);
  if (!canEdit) redirect(`/meetings/${id}`);

  const supabase = await createServerSupabase();
  const detail = await getMeetingDetail(supabase, id);
  if (!detail) notFound();
  const { meeting } = detail;

  const [staffOptions, orgOptions, initialAttendees, initialContactOptions] = await Promise.all([
    listStaffProfiles(supabase),
    listOrgOptions(supabase),
    getMeetingAttendeesForEdit(supabase, id),
    meeting.org_id ? listContactOptions(supabase, meeting.org_id) : Promise.resolve([]),
  ]);

  let initialRelatedOptions: { id: string; label: string }[] = [];
  if (meeting.org_id && meeting.opportunity_id) {
    const opts = await listOpportunityOptions(supabase, meeting.org_id);
    initialRelatedOptions = opts.map((o) => ({ id: o.id, label: o.name }));
  } else if (meeting.org_id && meeting.build_package_id) {
    const opts = await listBuildPackageOptions(supabase, meeting.org_id);
    initialRelatedOptions = opts;
  } else if (meeting.org_id && meeting.project_id) {
    const opts = await listProjectOptions(supabase, meeting.org_id);
    initialRelatedOptions = opts.map((o) => ({ id: o.id, label: o.name }));
  }
  return (
    <PageShell title="Edit meeting" subtitle={meeting.title}>
      <MeetingForm
        mode="edit"
        meeting={meeting}
        orgOptions={orgOptions}
        staffOptions={staffOptions}
        initialAttendees={initialAttendees}
        initialContactOptions={initialContactOptions}
        initialRelatedOptions={initialRelatedOptions}
      />
    </PageShell>
  );
}
