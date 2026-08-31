"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { SUBSCRIPTION_STATUSES } from "./types";
import { STATUS_LABELS } from "./labels";
import { SUPPORT_TIERS, SUPPORT_TIER_INFO } from "@/modules/assessments/buildTiers";
import type { Subscription } from "./types";

export function SubscriptionForm({ subscription, orgOptions, defaultOrgId }: { subscription?: Subscription; orgOptions?: { id: string; name: string }[]; defaultOrgId?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(subscription);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      orgId: orgOptions ? String(form.get("orgId") ?? "") : undefined,
      planName: String(form.get("planName") ?? ""),
      supportTier: String(form.get("supportTier") ?? "") || null,
      status: String(form.get("status") ?? "active"),
      seats: String(form.get("seats") ?? ""),
      startDate: String(form.get("startDate") ?? ""),
      renewalDate: String(form.get("renewalDate") ?? ""),
      firstBillingDate: String(form.get("firstBillingDate") ?? ""),
      billingNotes: String(form.get("billingNotes") ?? ""),
    };

    try {
      const url = isEdit ? `/api/subscriptions/${subscription!.id}` : "/api/subscriptions";
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      const id = isEdit ? subscription!.id : payload.data.id;
      router.push(`/subscriptions/${id}`);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card strong className="flex flex-col gap-4">
        {orgOptions ? (
          <FormField label="Client" htmlFor="orgId">
            <Select id="orgId" name="orgId" required defaultValue={defaultOrgId ?? ""}>
              <option value="" disabled>
                Select a client…
              </option>
              {orgOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </FormField>
        ) : null}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Plan name" htmlFor="planName">
            <Input id="planName" name="planName" required defaultValue={subscription?.plan_name} />
          </FormField>
          <FormField label="Support tier" htmlFor="supportTier">
            <Select id="supportTier" name="supportTier" defaultValue={subscription?.support_tier ?? ""}>
              <option value="">No tier</option>
              {SUPPORT_TIERS.map((t) => (
                <option key={t} value={t}>
                  {SUPPORT_TIER_INFO[t].label}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={subscription?.status ?? "active"}>
              {SUBSCRIPTION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Seats" htmlFor="seats">
            <Input id="seats" name="seats" type="number" min={0} defaultValue={subscription?.seats ?? undefined} />
          </FormField>
          <FormField label="Start date" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" required defaultValue={subscription?.start_date ?? new Date().toISOString().slice(0, 10)} />
          </FormField>
          <FormField label="Renewal date" htmlFor="renewalDate">
            <Input id="renewalDate" name="renewalDate" type="date" defaultValue={subscription?.renewal_date ?? undefined} />
          </FormField>
          <FormField label="First billing date" htmlFor="firstBillingDate">
            <Input id="firstBillingDate" name="firstBillingDate" type="date" defaultValue={subscription?.first_billing_date ?? undefined} />
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="billingNotes">
          <Textarea id="billingNotes" name="billingNotes" rows={3} defaultValue={subscription?.billing_notes ?? undefined} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <Button type="submit" variant="primary" loading={submitting} className="self-start px-6 py-3 text-[14px]">
        {isEdit ? "Save Changes" : "Create Subscription"}
      </Button>
    </form>
  );
}
