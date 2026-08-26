"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { Select } from "@/shared/ui/FormField";
import { formatDate } from "@/shared/format";
import { BUILD_TIERS, BUILD_TIER_INFO, SUPPORT_TIERS, SUPPORT_TIER_INFO, SUPPORT_SUBSCRIPTION_NAME, type BuildTier, type SupportTier } from "./buildTiers";

function ScopeList({ title, items, tone }: { title: string; items: string[]; tone: "green" | "red" }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="section-label">{title}</p>
      <ul className="flex flex-col gap-1">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[var(--muted)]">
            <span className={tone === "green" ? "text-[var(--green)]" : "text-[var(--red)]"}>{tone === "green" ? "✓" : "✕"}</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Full-assessment-only (never rendered for a quick scan — see
 * AssessmentReportView, which is itself never used for quick_scan). Shows
 * the recommended build + support tier with reasoning and scope, and, for
 * staff, a control to override either one — recorded with who/when.
 */
export function BuildRecommendationPanel({
  assessmentId,
  recommendedBuildTier,
  buildReasoning,
  recommendedSupportTier,
  supportReasoning,
  buildTierOverride,
  buildTierOverrideByName,
  buildTierOverrideAt,
  supportTierOverride,
  supportTierOverrideByName,
  supportTierOverrideAt,
  canEdit,
}: {
  assessmentId: string;
  recommendedBuildTier: BuildTier | null;
  buildReasoning: string | null;
  recommendedSupportTier: SupportTier | null;
  supportReasoning: string | null;
  buildTierOverride: BuildTier | null;
  buildTierOverrideByName: string | null;
  buildTierOverrideAt: string | null;
  supportTierOverride: SupportTier | null;
  supportTierOverrideByName: string | null;
  supportTierOverrideAt: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [buildSelect, setBuildSelect] = useState<BuildTier | "">(buildTierOverride ?? recommendedBuildTier ?? "");
  const [supportSelect, setSupportSelect] = useState<SupportTier | "">(supportTierOverride ?? recommendedSupportTier ?? "");
  const [saving, setSaving] = useState<"build" | "support" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!recommendedBuildTier || !recommendedSupportTier) {
    return null;
  }

  const effectiveBuildTier = buildTierOverride ?? recommendedBuildTier;
  const effectiveSupportTier = supportTierOverride ?? recommendedSupportTier;
  const buildInfo = BUILD_TIER_INFO[effectiveBuildTier];
  const supportInfo = SUPPORT_TIER_INFO[effectiveSupportTier];

  async function saveOverride(kind: "build" | "support", value: string) {
    setSaving(kind);
    setError(null);
    const recommended = kind === "build" ? recommendedBuildTier : recommendedSupportTier;
    const overrideValue = value === recommended ? null : value;
    const body = kind === "build" ? { build_tier_override: overrideValue } : { support_tier_override: overrideValue };
    try {
      const res = await fetch(`/api/assessments/${assessmentId}/build-recommendation/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not save the override.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not save the override — check your connection.");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card strong className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label">Build Recommendation</p>
            <p className="mt-1 text-[19px] font-semibold text-[var(--gold-light)]">
              {buildInfo.label} <span className="text-[15px] font-normal text-[var(--cream)]">· {buildInfo.priceLabel}</span>
            </p>
          </div>
          {buildTierOverride ? <Badge tone="yellow">Overridden</Badge> : <Badge tone="gold">Recommended</Badge>}
        </div>

        {buildTierOverride ? (
          <p className="text-[11.5px] text-[var(--muted)]">
            Recommended: {BUILD_TIER_INFO[recommendedBuildTier].label} ({BUILD_TIER_INFO[recommendedBuildTier].priceLabel}) — overridden to{" "}
            {BUILD_TIER_INFO[buildTierOverride].label}
            {buildTierOverrideByName ? ` by ${buildTierOverrideByName}` : ""}
            {buildTierOverrideAt ? ` on ${formatDate(buildTierOverrideAt)}` : ""}.
          </p>
        ) : null}

        <p className="text-[13px] leading-relaxed text-[var(--cream)]">{buildReasoning}</p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ScopeList title="Included in scope" items={buildInfo.included} tone="green" />
          <ScopeList title="Explicitly excluded" items={buildInfo.excluded} tone="red" />
        </div>

        {canEdit ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-4">
            <span className="text-[11.5px] text-[var(--muted)]">Override tier:</span>
            <Select value={buildSelect} onChange={(e) => setBuildSelect(e.target.value as BuildTier)}>
              {BUILD_TIERS.map((t) => (
                <option key={t} value={t}>
                  {BUILD_TIER_INFO[t].label}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              variant="secondary"
              loading={saving === "build"}
              disabled={!buildSelect}
              onClick={() => buildSelect && saveOverride("build", buildSelect)}
            >
              Save
            </Button>
          </div>
        ) : null}
      </Card>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label">{SUPPORT_SUBSCRIPTION_NAME}</p>
            <p className="mt-1 text-[17px] font-semibold text-[var(--gold-light)]">
              {supportInfo.label} <span className="text-[13px] font-normal text-[var(--cream)]">· {supportInfo.priceLabel}</span>
            </p>
          </div>
          {supportTierOverride ? <Badge tone="yellow">Overridden</Badge> : <Badge tone="gold">Recommended</Badge>}
        </div>

        {supportTierOverride ? (
          <p className="text-[11.5px] text-[var(--muted)]">
            Recommended: {SUPPORT_TIER_INFO[recommendedSupportTier].label} ({SUPPORT_TIER_INFO[recommendedSupportTier].priceLabel}) — overridden to{" "}
            {SUPPORT_TIER_INFO[supportTierOverride].label}
            {supportTierOverrideByName ? ` by ${supportTierOverrideByName}` : ""}
            {supportTierOverrideAt ? ` on ${formatDate(supportTierOverrideAt)}` : ""}.
          </p>
        ) : null}

        <p className="text-[13px] leading-relaxed text-[var(--cream)]">{supportReasoning}</p>

        {canEdit ? (
          <div className="flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-4">
            <span className="text-[11.5px] text-[var(--muted)]">Override tier:</span>
            <Select value={supportSelect} onChange={(e) => setSupportSelect(e.target.value as SupportTier)}>
              {SUPPORT_TIERS.map((t) => (
                <option key={t} value={t}>
                  {SUPPORT_TIER_INFO[t].label}
                </option>
              ))}
            </Select>
            <Button
              type="button"
              variant="secondary"
              loading={saving === "support"}
              disabled={!supportSelect}
              onClick={() => supportSelect && saveOverride("support", supportSelect)}
            >
              Save
            </Button>
          </div>
        ) : null}
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}
    </div>
  );
}
