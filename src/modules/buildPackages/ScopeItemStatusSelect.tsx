"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/shared/ui/FormField";
import { SCOPE_ITEM_STATUSES, SCOPE_ITEM_STATUS_LABELS, type ScopeItemStatus } from "./labels";

export function ScopeItemStatusSelect({
  buildPackageId,
  itemId,
  status,
}: {
  buildPackageId: string;
  itemId: string;
  status: ScopeItemStatus;
}) {
  const router = useRouter();
  const [value, setValue] = useState(status);
  const [saving, setSaving] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ScopeItemStatus;
    const previous = value;
    setValue(next);
    setSaving(true);
    try {
      const res = await fetch(`/api/build-packages/${buildPackageId}/scope-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setValue(previous);
        return;
      }
      router.refresh();
    } catch {
      setValue(previous);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Select value={value} onChange={handleChange} disabled={saving} className="w-auto min-w-[140px] text-[11.5px]">
      {SCOPE_ITEM_STATUSES.map((s) => (
        <option key={s} value={s}>
          {SCOPE_ITEM_STATUS_LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
