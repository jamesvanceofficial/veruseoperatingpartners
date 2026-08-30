import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Stat } from "@/shared/ui/Stat";
import { LinkButton } from "@/shared/ui/LinkButton";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getOpenAndOverdueCounts } from "@/modules/support/data";

export default async function DashboardPage() {
  let counts = { open: 0, overdue: 0 };
  let loadError = false;
  try {
    const supabase = await createServerSupabase();
    counts = await getOpenAndOverdueCounts(supabase);
  } catch {
    loadError = true;
  }

  return (
    <PageShell title="Dashboard" subtitle="A single view of every deal, client, and system VERUS runs.">
      {!loadError ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="section-label">Support</p>
            <LinkButton href="/support-tickets" variant="secondary">
              View Tickets
            </LinkButton>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Stat label="Open Tickets" value={counts.open} />
            <Stat label="Overdue" value={counts.overdue} tone={counts.overdue > 0 ? "red" : "green"} />
          </div>
        </div>
      ) : null}

      <EmptyState
        title="Nothing else to show yet"
        description="Your pipeline and client data will surface here once it exists."
        actionLabel="Add a lead"
        actionHref="/organizations/new"
      />
    </PageShell>
  );
}
