import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrgOptions } from "@/modules/organizations/data";
import { listTickets, listStaffOptions } from "@/modules/support/data";
import { STATUS_LABELS, PRIORITY_LABELS, OPEN_STATUSES } from "@/modules/support/labels";
import { TICKET_STATUSES, TICKET_PRIORITIES, type TicketStatus, type TicketPriority } from "@/modules/support/types";
import { TicketListTable } from "@/modules/support/TicketListTable";

export default async function SupportTicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ org?: string; status?: string; priority?: string; assigned?: string }>;
}) {
  const params = await searchParams;

  const user = await getSessionUser();
  const profileResult = user ? await getMyProfile(user.id) : ({ status: "not_configured" } as const);
  const staff = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  const status = TICKET_STATUSES.includes(params.status as TicketStatus) ? (params.status as TicketStatus) : undefined;
  const priority = TICKET_PRIORITIES.includes(params.priority as TicketPriority) ? (params.priority as TicketPriority) : undefined;
  const hasFilters = Boolean(params.org || status || priority || params.assigned);

  let rows: Awaited<ReturnType<typeof listTickets>> = [];
  let orgOptions: { id: string; name: string }[] = [];
  let staffOptions: { id: string; name: string }[] = [];
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    const [ticketRows, orgs, staffList] = await Promise.all([
      listTickets(supabase, {
        orgId: params.org,
        status,
        // Default view (no status filter chosen): open tickets only,
        // per "Default view shows open tickets" — the sort by closeness
        // to breach happens below, since Postgres can't sort by a
        // computed SLA distance without a generated column.
        statuses: status ? undefined : OPEN_STATUSES,
        priority,
        assignedTo: params.assigned,
      }),
      staff ? listOrgOptions(supabase) : Promise.resolve([]),
      staff ? listStaffOptions(supabase) : Promise.resolve([]),
    ]);
    rows = ticketRows;
    orgOptions = orgs;
    staffOptions = staffList;
  } catch {
    loadError = true;
  }

  // Closest-to-breach first; no-SLA/no-due-date tickets sort last, not first.
  const sorted = [...rows].sort((a, b) => {
    if (!a.responseDueAt && !b.responseDueAt) return 0;
    if (!a.responseDueAt) return 1;
    if (!b.responseDueAt) return -1;
    return new Date(a.responseDueAt).getTime() - new Date(b.responseDueAt).getTime();
  });

  return (
    <PageShell title="Support Tickets" subtitle="Every client request, tracked against the response time its tier promises.">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {staff ? (
          <form method="GET" className="flex flex-wrap items-center gap-3">
            <Select name="org" defaultValue={params.org ?? ""}>
              <option value="">All clients</option>
              {orgOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
            <Select name="status" defaultValue={params.status ?? ""}>
              <option value="">Open tickets (default)</option>
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
            <Select name="priority" defaultValue={params.priority ?? ""}>
              <option value="">All priorities</option>
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </Select>
            <Select name="assigned" defaultValue={params.assigned ?? ""}>
              <option value="">Anyone assigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
            <Button type="submit" variant="secondary">
              Filter
            </Button>
            {hasFilters ? (
              <LinkButton href="/support-tickets" variant="secondary">
                Clear
              </LinkButton>
            ) : null}
          </form>
        ) : (
          <div />
        )}
        <LinkButton href="/support-tickets/new" variant="primary">
          {staff ? "New Ticket" : "Raise a Ticket"}
        </LinkButton>
      </div>

      {loadError ? (
        <EmptyState title="Support tickets aren't set up yet" description="The database migrations may not have been run yet." />
      ) : sorted.length === 0 ? (
        <EmptyState
          title={hasFilters ? "No tickets match those filters" : "No open tickets"}
          description={hasFilters ? "Try clearing a filter." : "Nothing is waiting on a response right now."}
        />
      ) : (
        <TicketListTable rows={sorted} showOrgColumn={staff} />
      )}
    </PageShell>
  );
}
