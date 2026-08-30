"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { TICKET_PRIORITIES } from "./types";
import { PRIORITY_LABELS } from "./labels";

export function TicketForm({ orgOptions, defaultOrgId }: { orgOptions?: { id: string; name: string }[]; defaultOrgId?: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      orgId: orgOptions ? String(form.get("orgId") ?? "") : undefined,
      subject: String(form.get("subject") ?? ""),
      description: String(form.get("description") ?? ""),
      priority: String(form.get("priority") ?? "medium"),
    };

    try {
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/support-tickets/${payload.data.id}`);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
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

        <FormField label="Subject" htmlFor="subject">
          <Input id="subject" name="subject" required />
        </FormField>

        <FormField label="Priority" htmlFor="priority">
          <Select id="priority" name="priority" defaultValue="medium">
            {TICKET_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {PRIORITY_LABELS[p]}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Description" htmlFor="description">
          <Textarea id="description" name="description" rows={5} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <Button type="submit" variant="primary" loading={submitting} className="self-start px-6 py-3 text-[14px]">
        Submit
      </Button>
    </form>
  );
}
