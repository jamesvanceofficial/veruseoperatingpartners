import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function OrganizationsPage() {
  return (
    <PageShell title="Organizations" subtitle="Every client organization VERUS has onboarded.">
      <EmptyState title="No organizations yet" description="Client organizations will appear here once onboarded." actionLabel="Add an organization" />
    </PageShell>
  );
}
