"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";

/** Attach a synced Stripe subscription to an existing organization by hand. Never creates an organization. */
export function AttachOrgControl({
  stripeSubscriptionRowId,
  orgs,
  currentOrgId,
  label = "Attach",
}: {
  stripeSubscriptionRowId: string;
  orgs: { id: string; name: string }[];
  currentOrgId?: string | null;
  label?: string;
}) {
  const router = useRouter();
  const [orgId, setOrgId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAttach() {
    if (!orgId) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/stripe/subscriptions/${stripeSubscriptionRowId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) setError(payload.error ?? "Could not attach.");
      else {
        setOrgId("");
        router.refresh();
      }
    } catch {
      setError("Could not attach — check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Select value={orgId} onChange={(e) => setOrgId(e.target.value)} disabled={saving} className="w-auto min-w-[200px] text-[11.5px]">
          <option value="">Choose organization…</option>
          {orgs
            .filter((o) => o.id !== currentOrgId)
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
        </Select>
        <Button type="button" variant="secondary" loading={saving} disabled={!orgId} onClick={handleAttach}>
          {label}
        </Button>
      </div>
      {error ? <p className="text-[11.5px] text-[var(--red)]">{error}</p> : null}
    </div>
  );
}
