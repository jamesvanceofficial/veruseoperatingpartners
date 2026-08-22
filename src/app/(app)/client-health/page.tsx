import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function ClientHealthPage() {
  return (
    <PageShell title="Client Health" subtitle="Retention and upsell signals across the client base.">
      <EmptyState title="No client health data yet" description="Retention and upsell signals will surface here as clients onboard." actionLabel="Add a health signal" />
    </PageShell>
  );
}
