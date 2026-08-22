import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function BuildPackagesPage() {
  return (
    <PageShell title="Build Packages" subtitle="Proposed and approved scopes of work for each client.">
      <EmptyState title="No build packages yet" description="Packages assembled from a Build Recommendation will appear here." actionLabel="Create a build package" />
    </PageShell>
  );
}
