import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function WebsiteFunnelBuildsPage() {
  return (
    <PageShell title="Website & Funnel Builds" subtitle="Marketing sites and funnels VERUS has built or is building.">
      <EmptyState title="No builds yet" description="Website and funnel builds tied to a project will appear here." actionLabel="Add a build" />
    </PageShell>
  );
}
