import { redirect } from "next/navigation";
import { PageShell } from "@/shared/ui/PageShell";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { listOrgOptions } from "@/modules/organizations/data";
import { TicketForm } from "@/modules/support/TicketForm";

export default async function NewSupportTicketPage({ searchParams }: { searchParams: Promise<{ org_id?: string }> }) {
  const { org_id } = await searchParams;

  const user = await getSessionUser();
  if (!user) redirect("/login?next=/support-tickets/new");
  const profileResult = await getMyProfile(user.id);
  const staff = profileResult.status === "ok" && isVerusStaff(profileResult.profile.role);

  let orgOptions: { id: string; name: string }[] | undefined;
  if (staff) {
    const supabase = await createServerSupabase();
    orgOptions = await listOrgOptions(supabase);
  }

  return (
    <PageShell
      title={staff ? "New Support Ticket" : "Raise a Support Ticket"}
      subtitle={staff ? "Log a request on behalf of a client." : "Tell us what's going on — we'll respond within your plan's response time."}
    >
      <div className="max-w-2xl">
        <TicketForm orgOptions={orgOptions} defaultOrgId={org_id} />
      </div>
    </PageShell>
  );
}
