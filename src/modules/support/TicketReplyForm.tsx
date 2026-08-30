"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/shared/ui/FormField";

/** Staff gets the internal-note toggle; a client only ever posts a real, client-visible reply. */
export function TicketReplyForm({ ticketId, canLeaveInternalNotes }: { ticketId: string; canLeaveInternalNotes: boolean }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/support-tickets/${ticketId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, isInternal }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      setBody("");
      setIsInternal(false);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={isInternal ? "Internal note — staff only, never seen by the client…" : "Write a reply…"}
        required
      />
      <div className="flex items-center justify-between gap-3">
        {canLeaveInternalNotes ? (
          <label className="flex items-center gap-2 text-[12px] text-[var(--muted)]">
            <input type="checkbox" checked={isInternal} onChange={(e) => setIsInternal(e.target.checked)} />
            Internal note (staff only)
          </label>
        ) : (
          <span />
        )}
        <Button type="submit" variant={isInternal ? "secondary" : "primary"} loading={submitting} className="px-5 py-2 text-[13px]">
          {isInternal ? "Add Internal Note" : "Send Reply"}
        </Button>
      </div>
      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}
    </form>
  );
}
