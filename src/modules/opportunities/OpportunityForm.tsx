"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { PIPELINE_STAGES, STAGE_LABELS } from "./labels";
import { PRICING_HINT } from "./pricing";
import type { Opportunity, ContactOption } from "./types";
import type { StaffOption, OrgOption } from "@/modules/organizations/types";

export function OpportunityForm({
  mode,
  opportunity,
  orgOptions,
  lockedOrg,
  initialContactOptions,
  staffOptions,
}: {
  mode: "create" | "edit";
  opportunity?: Opportunity;
  orgOptions: OrgOption[];
  lockedOrg?: { id: string; name: string };
  initialContactOptions: ContactOption[];
  staffOptions: StaffOption[];
}) {
  const router = useRouter();
  const [orgId, setOrgId] = useState(lockedOrg?.id ?? opportunity?.org_id ?? "");
  const [contactOptions, setContactOptions] = useState<ContactOption[]>(initialContactOptions);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOrgChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newOrgId = e.target.value;
    setOrgId(newOrgId);
    if (!newOrgId) {
      setContactOptions([]);
      return;
    }
    setLoadingContacts(true);
    try {
      const res = await fetch(`/api/organizations/${newOrgId}/contacts`);
      const payload = await res.json().catch(() => ({ data: [] }));
      setContactOptions(res.ok ? (payload.data ?? []) : []);
    } catch {
      setContactOptions([]);
    } finally {
      setLoadingContacts(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      org_id: String(form.get("org_id") ?? ""),
      primary_contact_id: String(form.get("primary_contact_id") ?? ""),
      stage: String(form.get("stage") ?? ""),
      owner: String(form.get("owner") ?? ""),
      source: String(form.get("source") ?? ""),
      expected_value: String(form.get("expected_value") ?? ""),
      probability: String(form.get("probability") ?? ""),
      next_action: String(form.get("next_action") ?? ""),
      next_action_date: String(form.get("next_action_date") ?? ""),
      pain_points: String(form.get("pain_points") ?? ""),
      business_goals: String(form.get("business_goals") ?? ""),
      notes: String(form.get("notes") ?? ""),
      lost_reason: String(form.get("lost_reason") ?? ""),
    };

    const url = mode === "create" ? "/api/opportunities" : `/api/opportunities/${opportunity!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      const id = mode === "create" ? payload.data.id : opportunity!.id;
      router.push(`/crm-pipeline/${id}`);
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
          <FormField label="Opportunity name" htmlFor="name">
            <Input id="name" name="name" required defaultValue={opportunity?.name ?? ""} />
          </FormField>

          {lockedOrg ? (
            <FormField label="Organization" htmlFor="org_id_display">
              <Input id="org_id_display" value={lockedOrg.name} disabled />
              <input type="hidden" name="org_id" value={lockedOrg.id} />
            </FormField>
          ) : (
            <FormField label="Organization" htmlFor="org_id">
              <Select id="org_id" name="org_id" required value={orgId} onChange={handleOrgChange}>
                <option value="">Select an organization…</option>
                {orgOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </Select>
            </FormField>
          )}

          <FormField label="Primary contact" htmlFor="primary_contact_id" hint={loadingContacts ? "Loading contacts…" : undefined}>
            <Select key={orgId} id="primary_contact_id" name="primary_contact_id" defaultValue={opportunity?.primary_contact_id ?? ""}>
              <option value="">None</option>
              {contactOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Stage" htmlFor="stage">
            <Select id="stage" name="stage" required defaultValue={opportunity?.stage ?? "lead"}>
              {PIPELINE_STAGES.map((s) => (
                <option key={s} value={s}>
                  {STAGE_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Owner" htmlFor="owner">
            <Select id="owner" name="owner" defaultValue={opportunity?.owner ?? ""}>
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name ?? s.email ?? "Unnamed"}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Source" htmlFor="source">
            <Input id="source" name="source" defaultValue={opportunity?.source ?? ""} />
          </FormField>

          <FormField label="Expected value" htmlFor="expected_value" hint={PRICING_HINT}>
            <Input id="expected_value" name="expected_value" type="number" min={0} defaultValue={opportunity?.expected_value ?? ""} />
          </FormField>

          <FormField label="Probability (%)" htmlFor="probability">
            <Input id="probability" name="probability" type="number" min={0} max={100} defaultValue={opportunity?.probability ?? ""} />
          </FormField>

          <FormField label="Next action" htmlFor="next_action">
            <Input id="next_action" name="next_action" placeholder="e.g. Send proposal" defaultValue={opportunity?.next_action ?? ""} />
          </FormField>

          <FormField label="Next action date" htmlFor="next_action_date">
            <Input id="next_action_date" name="next_action_date" type="date" defaultValue={opportunity?.next_action_date ?? ""} />
          </FormField>

          <FormField label="Lost reason" htmlFor="lost_reason" hint="Only relevant if this opportunity is marked Lost.">
            <Input id="lost_reason" name="lost_reason" defaultValue={opportunity?.lost_reason ?? ""} />
          </FormField>
        </div>

        <FormField label="Pain points" htmlFor="pain_points">
          <Textarea id="pain_points" name="pain_points" rows={3} defaultValue={opportunity?.pain_points ?? ""} />
        </FormField>

        <FormField label="Business goals" htmlFor="business_goals">
          <Textarea id="business_goals" name="business_goals" rows={3} defaultValue={opportunity?.business_goals ?? ""} />
        </FormField>

        <FormField label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={4} defaultValue={opportunity?.notes ?? ""} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          {mode === "create" ? "Create opportunity" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
