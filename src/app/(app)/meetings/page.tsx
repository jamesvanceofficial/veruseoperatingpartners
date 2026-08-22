import { PageShell } from "@/shared/ui/PageShell";
import { EmptyState } from "@/shared/ui/EmptyState";

export default function MeetingsPage() {
  return (
    <PageShell title="Meetings" subtitle="Scheduled and past meetings across every client relationship.">
      <EmptyState title="No meetings yet" description="Scheduled meetings with leads and clients will appear here." actionLabel="Schedule a meeting" />
    </PageShell>
  );
}
