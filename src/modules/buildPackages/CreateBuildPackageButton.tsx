"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";
import type { ButtonVariant } from "@/shared/ui/Button";

/** One click, nothing retyped — tier/price/scope/phases all come from the assessment. Lands on the new package's detail page, where deposit/dates/notes get filled in via Edit. */
export function CreateBuildPackageButton({
  assessmentId,
  label = "Create build package",
  variant = "primary",
}: {
  assessmentId: string;
  label?: string;
  variant?: ButtonVariant;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/build-packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessmentId }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not create the build package.");
        setLoading(false);
        return;
      }
      router.push(`/build-packages/${payload.data.id}`);
    } catch {
      setError("Could not create the build package — check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant={variant} loading={loading} onClick={handleClick}>
        {label}
      </Button>
      {error ? <p className="text-[11.5px] text-[var(--red)]">{error}</p> : null}
    </div>
  );
}
