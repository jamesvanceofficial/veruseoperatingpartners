"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Textarea } from "@/shared/ui/FormField";

export function ProposalAcceptDeclineWidget({ token }: { token: string }) {
  const [mode, setMode] = useState<"choose" | "accept" | "decline" | "done">("choose");
  const [outcome, setOutcome] = useState<"accepted" | "declined" | null>(null);
  const [signedName, setSignedName] = useState("");
  const [signedTitle, setSignedTitle] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!signedName.trim()) {
      setError("Enter your name to accept.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/proposal/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedName, signedTitle }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not record acceptance — try again.");
        setSubmitting(false);
        return;
      }
      setOutcome("accepted");
      setMode("done");
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  async function handleDecline(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/public/proposal/${token}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not record your response — try again.");
        setSubmitting(false);
        return;
      }
      setOutcome("declined");
      setMode("done");
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (mode === "done") {
    return (
      <Card strong className="no-print flex flex-col gap-1 text-center">
        <p className="text-[14px] font-semibold text-[var(--cream)]">
          {outcome === "accepted" ? "Thank you — this proposal has been accepted." : "This proposal has been marked as declined."}
        </p>
        <p className="text-[12px] text-[var(--muted)]">You can close this page.</p>
      </Card>
    );
  }

  if (mode === "accept") {
    return (
      <Card strong className="no-print flex flex-col gap-3">
        <p className="section-label">Accept this proposal</p>
        <form onSubmit={handleAccept} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label="Printed name" htmlFor="signedName">
              <Input id="signedName" value={signedName} onChange={(e) => setSignedName(e.target.value)} required />
            </FormField>
            <FormField label="Title" htmlFor="signedTitle">
              <Input id="signedTitle" value={signedTitle} onChange={(e) => setSignedTitle(e.target.value)} />
            </FormField>
          </div>
          {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" loading={submitting}>
              Confirm acceptance
            </Button>
            <Button type="button" variant="ghost" onClick={() => setMode("choose")}>
              Back
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  if (mode === "decline") {
    return (
      <Card strong className="no-print flex flex-col gap-3">
        <p className="section-label">Decline this proposal</p>
        <form onSubmit={handleDecline} className="flex flex-col gap-3">
          <FormField label="Reason (optional)" htmlFor="reason">
            <Textarea id="reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </FormField>
          {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="secondary" loading={submitting}>
              Confirm decline
            </Button>
            <Button type="button" variant="ghost" onClick={() => setMode("choose")}>
              Back
            </Button>
          </div>
        </form>
      </Card>
    );
  }

  return (
    <Card strong className="no-print flex items-center justify-between gap-4">
      <p className="text-[13px] text-[var(--cream)]">Ready to move forward?</p>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" onClick={() => setMode("decline")}>
          Decline
        </Button>
        <Button type="button" variant="primary" onClick={() => setMode("accept")}>
          Accept
        </Button>
      </div>
    </Card>
  );
}
