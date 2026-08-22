import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function CrmPipelinePage() {
  return (
    <PageShell title="CRM Pipeline" subtitle="Every lead from first contact through signed build package.">
      <EmptyState title="No leads yet" description="Leads will move through Discovery, Enterprise Score, and Proposal here." actionLabel="Add a lead" />
    </PageShell>
  );
}
