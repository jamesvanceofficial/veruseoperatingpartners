"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select } from "@/shared/ui/FormField";
import { ASSESSMENT_TYPES, ASSESSMENT_TYPE_LABELS } from "./labels";
import type { OrgOption } from "@/modules/organizations/types";

export function NewAssessmentForm({ orgOptions, lockedOrg }: { orgOptions: OrgOption[]; lockedOrg?: { id: string; name: string } }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      org_id: lockedOrg ? lockedOrg.id : String(form.get("org_id") ?? ""),
      assessment_type: String(form.get("assessment_type") ?? ""),
    };

    try {
      const res = await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/business-assessments/${payload.data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card className="flex flex-col gap-4">
        {lockedOrg ? (
          <FormField label="Organization" htmlFor="org_id_display">
            <Input id="org_id_display" value={lockedOrg.name} disabled readOnly />
          </FormField>
        ) : (
          <FormField label="Organization" htmlFor="org_id">
            <Select id="org_id" name="org_id" required defaultValue="">
              <option value="" disabled>
                Select an organization…
              </option>
              {orgOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        <FormField label="Assessment type" htmlFor="assessment_type">
          <Select id="assessment_type" name="assessment_type" required defaultValue="full">
            {ASSESSMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {ASSESSMENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" variant="primary" loading={submitting}>
          Start assessment
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
