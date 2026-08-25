"use client";

import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/FormField";
import { formatDate } from "@/shared/format";

export function ShareLinkPanel({
  assessmentId,
  initialToken,
  initialExpiresAt,
  initialActive,
}: {
  assessmentId: string;
  initialToken: string | null;
  initialExpiresAt: string | null;
  initialActive: boolean;
}) {
  const [token, setToken] = useState(initialToken);
  const [expiresAt, setExpiresAt] = useState(initialExpiresAt);
  const [active, setActive] = useState(initialActive);
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const url = token ? `${origin}/assessment/${token}` : null;

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/share-link`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expires_in_days: expiresInDays === "never" ? null : Number(expiresInDays) }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not generate a link.");
        return;
      }
      setToken(payload.data.token);
      setActive(true);
      setExpiresAt(expiresInDays === "never" ? null : new Date(Date.now() + Number(expiresInDays) * 86400000).toISOString());
    } catch {
      setError("Could not generate a link — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/share-link/revoke`, { method: "POST" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not revoke the link.");
        return;
      }
      setActive(false);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Could not copy — copy the link manually.");
    }
  }

  return (
    <Card className="no-print flex flex-col gap-3">
      <p className="section-label">Share Link</p>
      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}

      {active && token ? (
        <>
          <div className="flex items-center gap-2">
            <code className="field-control flex-1 truncate px-3 py-2 text-[12px]">{url ?? `/assessment/${token}`}</code>
            <Button type="button" variant="secondary" onClick={handleCopy}>
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
          <p className="text-[11px] text-[var(--muted)]">{expiresAt ? `Expires ${formatDate(expiresAt)}` : "No expiry"}</p>
          <Button type="button" variant="ghost" loading={loading} onClick={handleRevoke} className="self-start">
            Revoke link
          </Button>
        </>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Select value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)}>
            <option value="7">Expires in 7 days</option>
            <option value="30">Expires in 30 days</option>
            <option value="90">Expires in 90 days</option>
            <option value="never">Never expires</option>
          </Select>
          <Button type="button" variant="primary" loading={loading} onClick={handleGenerate}>
            Generate share link
          </Button>
        </div>
      )}
    </Card>
  );
}
