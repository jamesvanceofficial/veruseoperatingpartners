import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function SoftwareSupportPage() {
  return (
    <PageShell title="Software & Support" subtitle="Ongoing software and support subscriptions for every client.">
      <EmptyState title="No support subscriptions yet" description="Active support plans and their status will appear here." actionLabel="Add a subscription" />
    </PageShell>
  );
}
