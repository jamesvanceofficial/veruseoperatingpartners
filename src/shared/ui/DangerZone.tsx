"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "./cn";

/**
 * The one delete control for a record's detail page — deliberately NOT a
 * styled Button. Plain, muted, text-only until hovered, set off by a
 * hairline + extra top margin so it reads as a separate zone from the
 * page's primary actions, never something a stray click near "Edit" could
 * hit. confirmMessage is built by the caller (it knows what's cascading,
 * with real counts) and shown via window.confirm — no silent deletes.
 */
export function DangerZone({
  itemLabel,
  confirmMessage,
  deleteUrl,
  redirectUrl,
}: {
  itemLabel: string;
  confirmMessage: string;
  deleteUrl: string;
  redirectUrl: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(deleteUrl, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? `Could not delete ${itemLabel}.`);
        setDeleting(false);
        return;
      }
      router.push(redirectUrl);
      router.refresh();
    } catch {
      setError("Could not delete — check your connection.");
      setDeleting(false);
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-2 border-t border-[var(--hairline)] pt-5">
      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className={cn(
          "self-start text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--red)]",
          deleting && "cursor-not-allowed opacity-50"
        )}
      >
        {deleting ? "Deleting…" : `Delete ${itemLabel}`}
      </button>
    </div>
  );
}
