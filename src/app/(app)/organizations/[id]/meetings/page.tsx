import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listMeetings } from "@/modules/meetings/data";
import { MeetingListTable } from "@/modules/meetings/MeetingListTable";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";

export default async function OrganizationMeetingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const rows = await listMeetings(supabase, { orgId: id });

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Meetings</h2>
        {canCreate ? (
          <LinkButton href={`/meetings/new?org_id=${id}`} variant="primary">
            Schedule a meeting
          </LinkButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No meetings yet" description="Schedule the first meeting with this client." />
      ) : (
        <MeetingListTable rows={rows} showOrgColumn={false} />
      )}
    </div>
  );
}
