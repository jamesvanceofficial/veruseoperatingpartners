import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function BusinessAssessmentsPage() {
  return (
    <PageShell title="Business Assessments" subtitle="Discovery findings and Enterprise Scores for every prospect.">
      <EmptyState title="No assessments yet" description="Completed discovery calls will produce an assessment and score here." actionLabel="Start an assessment" />
    </PageShell>
  );
}
