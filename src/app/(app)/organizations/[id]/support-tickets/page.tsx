import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { listTickets } from "@/modules/support/data";
import { TicketListTable } from "@/modules/support/TicketListTable";
import { LinkButton } from "@/shared/ui/LinkButton";
import { EmptyState } from "@/shared/ui/EmptyState";

export default async function OrganizationSupportTicketsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const rows = await listTickets(supabase, { orgId: id });

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Support Tickets</h2>
        <LinkButton href={`/support-tickets/new?org_id=${id}`} variant="primary">
          New Ticket
        </LinkButton>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="No tickets yet" description="Nothing has been opened for this client." />
      ) : (
        <TicketListTable rows={rows} showOrgColumn={false} />
      )}
    </div>
  );
}
