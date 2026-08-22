import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function SopLibraryPage() {
  return (
    <PageShell title="SOP Library" subtitle="Standard operating procedures VERUS installs and maintains.">
      <EmptyState title="No SOPs yet" description="Documented procedures for clients and internal use will live here." actionLabel="Add an SOP" />
    </PageShell>
  );
}
