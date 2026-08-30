import Link from "next/link";
import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrgOptions } from "@/modules/organizations/data";
import { listMeetings } from "@/modules/meetings/data";
import { MEETING_TYPES, MEETING_TYPE_LABELS } from "@/modules/meetings/labels";
import { MeetingListTable } from "@/modules/meetings/MeetingListTable";
import type { MeetingListRow } from "@/modules/meetings/types";

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; type?: string }>;
}) {
  const params = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const canCreate = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let rows: MeetingListRow[] = [];
  let orgOptions: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    [rows, orgOptions] = await Promise.all([listMeetings(supabase, { orgId: params.org, type: params.type }), listOrgOptions(supabase)]);
  } catch {
    loadError = true;
  }

  const hasFilters = Boolean(params.org || params.type);

  return (
    <PageShell title="Meetings" subtitle="Scheduled and past meetings across every client relationship.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <Select name="org" defaultValue={params.org ?? ""}>
            <option value="">All organizations</option>
            {orgOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </Select>
          <Select name="type" defaultValue={params.type ?? ""}>
            <option value="">All types</option>
            {MEETING_TYPES.map((t) => (
              <option key={t} value={t}>
                {MEETING_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
          <Button type="submit" variant="secondary">
            Filter
          </Button>
          {hasFilters ? (
            <Link href="/meetings" className="text-[12px] text-[var(--muted)] hover:text-[var(--cream)]">
              Clear
            </Link>
          ) : null}
        </form>
        {canCreate ? (
          <LinkButton href="/meetings/new" variant="primary">
            Schedule a meeting
          </LinkButton>
        ) : null}
      </div>

      {loadError ? (
        <EmptyState title="Meetings aren't available yet" description="The database migrations may not have been run yet — check back once they are." />
      ) : rows.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No meetings match your filters" : "No meetings yet"}
          description={hasFilters ? "Try a different filter or clear it." : "Schedule a meeting with a lead, client, or internally."}
        />
      ) : (
        <MeetingListTable rows={rows} />
      )}
    </PageShell>
  );
}
