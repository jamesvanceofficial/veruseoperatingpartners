"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";

/** On-demand Stripe sync. Read-only against Stripe — refreshes COMPASS's mirror and re-runs automatic matching. */
export function StripeSyncButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function handleClick() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/sync", { method: "POST" });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({ tone: "error", text: payload.error ?? "Stripe sync failed." });
      } else {
        const d = payload.data;
        setMessage({ tone: "ok", text: `Synced ${d.synced} subscription${d.synced === 1 ? "" : "s"}${d.newlyMatched ? `, ${d.newlyMatched} newly matched` : ""}.` });
        router.refresh();
      }
    } catch {
      setMessage({ tone: "error", text: "Stripe sync failed — check your connection." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="secondary" loading={loading} onClick={handleClick}>
        Sync Stripe Now
      </Button>
      {message ? <p className={`text-[11.5px] ${message.tone === "ok" ? "text-[var(--green)]" : "text-[var(--red)]"}`}>{message.text}</p> : null}
    </div>
  );
}
