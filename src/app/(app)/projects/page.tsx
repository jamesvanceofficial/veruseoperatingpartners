import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function ProjectsPage() {
  return (
    <PageShell title="Projects" subtitle="Active builds in progress across every client.">
      <EmptyState title="No projects yet" description="A signed build package will create a project here." actionLabel="Add a project" />
    </PageShell>
  );
}
