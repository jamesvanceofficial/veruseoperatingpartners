"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";

/** One click, nothing retyped — client, effective support tier, and price all come from the build package (and its source assessment). Requires a real handover_date. */
export function CreateSubscriptionButton({ buildPackageId }: { buildPackageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buildPackageId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not create the subscription.");
        setLoading(false);
        return;
      }
      router.push(`/subscriptions/${payload.data.id}`);
    } catch {
      setError("Could not create the subscription — check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button type="button" variant="primary" loading={loading} onClick={handleClick} className="self-start px-5 py-2 text-[13px]">
        Create Subscription
      </Button>
      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}
    </div>
  );
}
