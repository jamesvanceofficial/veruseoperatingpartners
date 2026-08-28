"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { BUILD_PACKAGE_STATUSES, BUILD_PACKAGE_STATUS_LABELS } from "./labels";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import type { BuildPackage } from "./types";

/**
 * Edit only — org, source assessment, and tier are fixed forever once a
 * package is created (they're what the generated phases/scope items were
 * built from), so this form never touches them. Everything else — price,
 * deposit/balance + paid, dates, status, notes — is editable here.
 */
export function BuildPackageForm({ orgName, buildPackage }: { orgName: string; buildPackage: BuildPackage }) {
  const router = useRouter();
  const [depositPaid, setDepositPaid] = useState(Boolean(buildPackage.deposit_paid_at));
  const [balancePaid, setBalancePaid] = useState(Boolean(buildPackage.balance_paid_at));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      price: String(form.get("price") ?? ""),
      depositAmount: String(form.get("depositAmount") ?? ""),
      depositPaid,
      balanceAmount: String(form.get("balanceAmount") ?? ""),
      balancePaid,
      startDate: String(form.get("startDate") ?? ""),
      targetCompletionDate: String(form.get("targetCompletionDate") ?? ""),
      handoverDate: String(form.get("handoverDate") ?? ""),
      status: String(form.get("status") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };

    try {
      const res = await fetch(`/api/build-packages/${buildPackage.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/build-packages/${buildPackage.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField label="Organization" htmlFor="org_display">
            <Input id="org_display" value={orgName} disabled />
          </FormField>

          <FormField label="Build tier" htmlFor="tier_display">
            <Input id="tier_display" value={BUILD_TIER_INFO[buildPackage.tier].label} disabled />
          </FormField>

          <FormField label="Total price" htmlFor="price">
            <Input id="price" name="price" type="number" min={0} required defaultValue={buildPackage.price ?? ""} />
          </FormField>

          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" required defaultValue={buildPackage.status}>
              {BUILD_PACKAGE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {BUILD_PACKAGE_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Deposit amount" htmlFor="depositAmount">
            <Input id="depositAmount" name="depositAmount" type="number" min={0} defaultValue={buildPackage.deposit_amount ?? ""} />
          </FormField>
          <FormField label="Deposit paid" htmlFor="depositPaidCheckbox">
            <label className="flex items-center gap-2 pt-2 text-[12.5px] text-[var(--cream)]">
              <input
                id="depositPaidCheckbox"
                type="checkbox"
                checked={depositPaid}
                onChange={(e) => setDepositPaid(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--hairline-strong)] bg-[var(--navy)] accent-[var(--gold)]"
              />
              {depositPaid && buildPackage.deposit_paid_at ? `Paid` : "Not yet paid"}
            </label>
          </FormField>

          <FormField label="Balance amount" htmlFor="balanceAmount">
            <Input id="balanceAmount" name="balanceAmount" type="number" min={0} defaultValue={buildPackage.balance_amount ?? ""} />
          </FormField>
          <FormField label="Balance paid" htmlFor="balancePaidCheckbox">
            <label className="flex items-center gap-2 pt-2 text-[12.5px] text-[var(--cream)]">
              <input
                id="balancePaidCheckbox"
                type="checkbox"
                checked={balancePaid}
                onChange={(e) => setBalancePaid(e.target.checked)}
                className="h-4 w-4 rounded border-[var(--hairline-strong)] bg-[var(--navy)] accent-[var(--gold)]"
              />
              {balancePaid && buildPackage.balance_paid_at ? `Paid` : "Not yet paid"}
            </label>
          </FormField>

          <FormField label="Start date" htmlFor="startDate">
            <Input id="startDate" name="startDate" type="date" defaultValue={buildPackage.start_date ?? ""} />
          </FormField>

          <FormField label="Target completion date" htmlFor="targetCompletionDate">
            <Input id="targetCompletionDate" name="targetCompletionDate" type="date" defaultValue={buildPackage.target_completion_date ?? ""} />
          </FormField>

          <FormField label="Handover date" htmlFor="handoverDate" hint="What the 90-day subscription billing counts from, once set.">
            <Input id="handoverDate" name="handoverDate" type="date" defaultValue={buildPackage.handover_date ?? ""} />
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={4} defaultValue={buildPackage.notes ?? ""} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          Save changes
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
