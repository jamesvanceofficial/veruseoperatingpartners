import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function DocumentsPage() {
  return (
    <PageShell title="Documents" subtitle="Contracts, proposals, and files shared with clients.">
      <EmptyState title="No documents yet" description="Contracts, proposals, and shared files will live here." actionLabel="Upload a document" />
    </PageShell>
  );
}
