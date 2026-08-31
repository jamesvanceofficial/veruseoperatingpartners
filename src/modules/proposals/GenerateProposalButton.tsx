"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";
import { LinkButton } from "@/shared/ui/LinkButton";

/** One click, nothing retyped — score, band, constraints, recommended build/support tier and price, effective scope, and scope of work phases all come from the assessment's own already-computed report. Lands on the new proposal's detail page for review before sending. */
export function GenerateProposalButton({ assessmentId }: { assessmentId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not generate the proposal.");
        setLoading(false);
        return;
      }
      router.push(`/proposals/${payload.data.id}`);
    } catch {
      setError("Could not generate the proposal — check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <Button type="button" variant="primary" loading={loading} onClick={handleClick}>
        Proposal
      </Button>
      {error ? <p className="text-[11px] text-[var(--red)]">{error}</p> : null}
    </div>
  );
}

export function ViewProposalLink({ proposalId }: { proposalId: string }) {
  return (
    <LinkButton href={`/proposals/${proposalId}`} variant="secondary">
      View proposal →
    </LinkButton>
  );
}
