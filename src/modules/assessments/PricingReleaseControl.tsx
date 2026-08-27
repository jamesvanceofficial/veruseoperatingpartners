"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { formatDate } from "@/shared/format";

/**
 * Staff-only control on the internal assessment view. Presenting findings
 * and revealing price are two separate moments — this is the switch
 * between them. Only affects the client-facing report
 * (/business-assessments/[id]/report) and the public share link; the
 * internal view (this page, BuildRecommendationPanel with canEdit) always
 * shows full pricing regardless of this state.
 */
export function PricingReleaseControl({
  assessmentId,
  released,
  releasedAt,
  releasedByName,
}: {
  assessmentId: string;
  released: boolean;
  releasedAt: string | null;
  releasedByName: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/pricing-release`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ released: !released }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not update pricing release.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not update pricing release — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="no-print flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="section-label">Pricing Release</p>
        {released ? <Badge tone="green">Released to client</Badge> : <Badge tone="neutral">Hidden from client</Badge>}
      </div>
      {released && releasedAt ? (
        <p className="text-[11.5px] text-[var(--muted)]">
          Released{releasedByName ? ` by ${releasedByName}` : ""} on {formatDate(releasedAt)}.
        </p>
      ) : (
        <p className="text-[11.5px] text-[var(--muted)]">
          The client report and share link show every diagnostic section — score, categories, constraints, scope of work — with all dollar
          figures hidden until you release pricing.
        </p>
      )}
      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}
      <Button type="button" variant={released ? "secondary" : "primary"} loading={loading} onClick={toggle} className="self-start">
        {released ? "Hide pricing from client" : "Release pricing to client"}
      </Button>
    </Card>
  );
}
