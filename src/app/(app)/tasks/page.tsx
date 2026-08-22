import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function TasksPage() {
  return (
    <PageShell title="Tasks" subtitle="Work assigned across every project and client.">
      <EmptyState title="No tasks yet" description="Tasks created on a project will show up here." actionLabel="Add a task" />
    </PageShell>
  );
}
