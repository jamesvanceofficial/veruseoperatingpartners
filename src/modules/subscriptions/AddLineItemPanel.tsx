"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { LINE_ITEM_TYPES, REVENUE_CATEGORIES } from "./types";
import { getAddOnCatalog, VA_ROLES } from "./addOnCatalog";
import type { SupportTier } from "@/modules/assessments/buildTiers";

type Tab = "catalog" | "va" | "custom";

export function AddLineItemPanel({ subscriptionId, supportTier }: { subscriptionId: string; supportTier: SupportTier | null }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("catalog");
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function post(body: Record<string, unknown>, key: string) {
    setSubmitting(key);
    setError(null);
    try {
      const res = await fetch(`/api/subscriptions/${subscriptionId}/line-items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Could not add that line item.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not add that line item — check your connection.");
    } finally {
      setSubmitting(null);
    }
  }

  async function handleCustomSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await post(
      {
        description: String(form.get("description") ?? ""),
        itemType: String(form.get("itemType") ?? "addon"),
        revenueCategory: String(form.get("revenueCategory") ?? "software"),
        monthlyPrice: String(form.get("monthlyPrice") ?? ""),
        quantity: String(form.get("quantity") ?? "1"),
        startDate: String(form.get("startDate") ?? ""),
        endDate: String(form.get("endDate") ?? ""),
      },
      "custom"
    );
    e.currentTarget.reset();
  }

  const catalog = getAddOnCatalog(supportTier);

  return (
    <Card strong className="flex flex-col gap-4">
      <div className="flex gap-4 border-b border-[var(--hairline)]">
        {(["catalog", "va", "custom"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`pb-2 text-[12px] font-medium ${tab === t ? "border-b-2 border-[var(--gold)] text-[var(--gold-light)]" : "text-[var(--muted)] hover:text-[var(--cream)]"}`}
          >
            {t === "catalog" ? "Add-on Catalog" : t === "va" ? "VA Placement" : "Custom Line Item"}
          </button>
        ))}
      </div>

      {tab === "catalog" ? (
        <div className="flex flex-col gap-2">
          {catalog.map((entry) => (
            <div key={entry.key} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--hairline)] px-3.5 py-2.5">
              <div>
                <p className="text-[12.5px] text-[var(--cream)]">{entry.description}</p>
                <p className="text-[11px] text-[var(--muted)]">
                  {entry.monthlyPrice !== null ? `$${entry.monthlyPrice}${entry.billing === "one_time" ? " one time" : "/mo"}` : "Depends on tier — set one first"} ·{" "}
                  {entry.revenueCategory}
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                loading={submitting === entry.key}
                disabled={entry.monthlyPrice === null}
                onClick={() => post({ catalogKey: entry.key }, entry.key)}
                className="px-3 py-1.5 text-[12px]"
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "va" ? (
        <div className="flex flex-col gap-2">
          <p className="text-[11.5px] text-[var(--muted)]">
            Adds a $1,000 one-time assignment fee (closed immediately, never counted in ongoing MRR) plus an open recurring hourly line — update its quantity each month to
            reflect hours actually logged.
          </p>
          {VA_ROLES.map((role) => (
            <div key={role.name} className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--hairline)] px-3.5 py-2.5">
              <div>
                <p className="text-[12.5px] text-[var(--cream)]">{role.name}</p>
                <p className="text-[11px] text-[var(--muted)]">${role.hourlyRate}/hr</p>
              </div>
              <Button type="button" variant="secondary" loading={submitting === role.name} onClick={() => post({ vaRole: role.name }, role.name)} className="px-3 py-1.5 text-[12px]">
                Add Placement
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      {tab === "custom" ? (
        <form onSubmit={handleCustomSubmit} className="flex flex-col gap-3">
          <FormField label="Description" htmlFor="description">
            <Textarea id="description" name="description" rows={2} required />
          </FormField>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <FormField label="Type" htmlFor="itemType">
              <Select id="itemType" name="itemType" defaultValue="base_plan">
                {LINE_ITEM_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Category" htmlFor="revenueCategory">
              <Select id="revenueCategory" name="revenueCategory" defaultValue="software">
                {REVENUE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Monthly price" htmlFor="monthlyPrice">
              <Input id="monthlyPrice" name="monthlyPrice" type="number" step="0.01" min={0} required />
            </FormField>
            <FormField label="Quantity" htmlFor="quantity">
              <Input id="quantity" name="quantity" type="number" min={0} defaultValue={1} required />
            </FormField>
            <FormField label="Start date" htmlFor="startDate">
              <Input id="startDate" name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            </FormField>
            <FormField label="End date (optional)" htmlFor="endDate">
              <Input id="endDate" name="endDate" type="date" />
            </FormField>
          </div>
          <Button type="submit" variant="primary" loading={submitting === "custom"} className="self-start px-4 py-2 text-[12.5px]">
            Add Line Item
          </Button>
        </form>
      ) : null}

      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}
    </Card>
  );
}
