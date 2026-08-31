"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/shared/ui/FormField";
import { SUBSCRIPTION_STATUSES, type SubscriptionStatus } from "./types";
import { STATUS_LABELS } from "./labels";

export function SubscriptionStatusControl({ subscriptionId, status }: { subscriptionId: string; status: SubscriptionStatus }) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as SubscriptionStatus;
    const previous = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) setValue(previous);
      router.refresh();
    } catch {
      setValue(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onChange={handleChange} disabled={saving} className="w-auto min-w-[140px] text-[11.5px]">
      {SUBSCRIPTION_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
