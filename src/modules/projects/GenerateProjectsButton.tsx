"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";

/** One click, nothing retyped — each phase becomes a project, each scope item becomes a task, phase week ranges carry across as real dates where the build package has a start_date. */
export function GenerateProjectsButton({ buildPackageId }: { buildPackageId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/build-packages/${buildPackageId}/generate-projects`, { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not generate projects.");
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not generate projects — check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="primary" loading={loading} onClick={handleClick}>
        Generate Projects
      </Button>
      {error ? <p className="text-[11.5px] text-[var(--red)]">{error}</p> : null}
    </div>
  );
}
