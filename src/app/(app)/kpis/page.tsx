import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function KpisPage() {
  return (
    <PageShell title="KPIs" subtitle="Performance metrics VERUS tracks across the business.">
      <EmptyState title="No KPIs yet" description="Business and client performance metrics will surface here." actionLabel="Add a KPI" />
    </PageShell>
  );
}
