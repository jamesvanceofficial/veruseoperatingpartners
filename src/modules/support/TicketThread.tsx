import { Badge } from "@/shared/ui/Badge";
import { formatDateTime } from "@/shared/format";
import type { TicketReply } from "./types";

/**
 * Internal notes render in a visibly distinct, amber-bordered block —
 * never the same treatment as a real client-visible reply, so staff can
 * never mistake one for the other while scanning the thread.
 */
export function TicketThread({ replies }: { replies: TicketReply[] }) {
  if (replies.length === 0) {
    return <p className="text-[12.5px] text-[var(--muted)]">No replies yet.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {replies.map((r) =>
        r.is_internal ? (
          <div key={r.id} className="flex flex-col gap-1.5 rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--yellow)_45%,transparent)] bg-[color-mix(in_srgb,var(--yellow)_8%,transparent)] p-4">
            <div className="flex items-center gap-2">
              <Badge tone="yellow">Internal Note</Badge>
              <span className="text-[11px] text-[var(--muted)]">
                {r.authorName ?? "Unknown"} · {formatDateTime(r.created_at)}
              </span>
            </div>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--cream)]">{r.body}</p>
          </div>
        ) : (
          <div key={r.id} className="glass-panel flex flex-col gap-1.5 p-4">
            <span className="text-[11px] text-[var(--muted)]">
              {r.authorName ?? "Unknown"} · {formatDateTime(r.created_at)}
            </span>
            <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--cream)]">{r.body}</p>
          </div>
        )
      )}
    </div>
  );
}
