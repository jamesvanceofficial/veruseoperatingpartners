"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { ORG_TYPES, ORG_TYPE_LABELS, ORG_STATUSES, ORG_STATUS_LABELS } from "./labels";
import type { Organization, StaffOption, OrgOption } from "./types";

export function OrganizationForm({
  mode,
  organization,
  staffOptions,
  orgOptions,
}: {
  mode: "create" | "edit";
  organization?: Organization;
  staffOptions: StaffOption[];
  orgOptions: OrgOption[];
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      name: String(form.get("name") ?? ""),
      type: String(form.get("type") ?? ""),
      status: String(form.get("status") ?? ""),
      industry: String(form.get("industry") ?? ""),
      website: String(form.get("website") ?? ""),
      phone: String(form.get("phone") ?? ""),
      primary_address: String(form.get("primary_address") ?? ""),
      employee_count_estimate: String(form.get("employee_count_estimate") ?? ""),
      annual_revenue_estimate: String(form.get("annual_revenue_estimate") ?? ""),
      location_count: String(form.get("location_count") ?? ""),
      source: String(form.get("source") ?? ""),
      referred_by_org_id: String(form.get("referred_by_org_id") ?? ""),
      assigned_owner: String(form.get("assigned_owner") ?? ""),
      notes: String(form.get("notes") ?? ""),
    };

    const url = mode === "create" ? "/api/organizations" : `/api/organizations/${organization!.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      const id = mode === "create" ? payload.data.id : organization!.id;
      router.push(`/organizations/${id}`);
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
          <FormField label="Company name" htmlFor="name">
            <Input id="name" name="name" required defaultValue={organization?.name ?? ""} />
          </FormField>
          <FormField label="Industry" htmlFor="industry">
            <Input id="industry" name="industry" defaultValue={organization?.industry ?? ""} />
          </FormField>
          <FormField label="Type" htmlFor="type">
            <Select id="type" name="type" required defaultValue={organization?.type ?? "prospect"}>
              {ORG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ORG_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" required defaultValue={organization?.status ?? "active"}>
              {ORG_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {ORG_STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Website" htmlFor="website">
            <Input id="website" name="website" placeholder="https://" defaultValue={organization?.website ?? ""} />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" defaultValue={organization?.phone ?? ""} />
          </FormField>
          <FormField label="Primary address" htmlFor="primary_address">
            <Input id="primary_address" name="primary_address" defaultValue={organization?.primary_address ?? ""} />
          </FormField>
          <FormField label="Source" htmlFor="source" hint="How this org entered the pipeline.">
            <Input id="source" name="source" defaultValue={organization?.source ?? ""} />
          </FormField>
          <FormField label="Employees (estimate)" htmlFor="employee_count_estimate">
            <Input
              id="employee_count_estimate"
              name="employee_count_estimate"
              type="number"
              min={0}
              defaultValue={organization?.employee_count_estimate ?? ""}
            />
          </FormField>
          <FormField label="Annual revenue (estimate)" htmlFor="annual_revenue_estimate">
            <Input
              id="annual_revenue_estimate"
              name="annual_revenue_estimate"
              type="number"
              min={0}
              defaultValue={organization?.annual_revenue_estimate ?? ""}
            />
          </FormField>
          <FormField label="Locations" htmlFor="location_count" hint="How many physical locations this org operates.">
            <Input id="location_count" name="location_count" type="number" min={0} defaultValue={organization?.location_count ?? ""} />
          </FormField>
          <FormField label="Assigned owner" htmlFor="assigned_owner">
            <Select id="assigned_owner" name="assigned_owner" defaultValue={organization?.assigned_owner ?? ""}>
              <option value="">Unassigned</option>
              {staffOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name ?? s.email ?? "Unnamed"}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Referred by" htmlFor="referred_by_org_id">
            <Select id="referred_by_org_id" name="referred_by_org_id" defaultValue={organization?.referred_by_org_id ?? ""}>
              <option value="">None</option>
              {orgOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={4} defaultValue={organization?.notes ?? ""} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          {mode === "create" ? "Create organization" : "Save changes"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
