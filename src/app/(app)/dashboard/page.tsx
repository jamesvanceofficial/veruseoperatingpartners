import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function DashboardPage() {
  return (
    <PageShell title="Dashboard" subtitle="A single view of every deal, client, and system VERUS runs.">
      <EmptyState title="Nothing to show yet" description="Your pipeline and client data will surface here once it exists." actionLabel="Add a lead" />
    </PageShell>
  );
}
