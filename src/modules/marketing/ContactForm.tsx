"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { INDUSTRY_OPTIONS, REVENUE_RANGE_OPTIONS, TIMELINE_OPTIONS } from "./formOptions";

export function ContactForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      companyName: String(form.get("companyName") ?? ""),
      website: String(form.get("website") ?? ""),
      industry: String(form.get("industry") ?? ""),
      revenueRange: String(form.get("revenueRange") ?? ""),
      employeeCount: String(form.get("employeeCount") ?? ""),
      biggestProblem: String(form.get("biggestProblem") ?? ""),
      whatTheyWantBuilt: String(form.get("whatTheyWantBuilt") ?? ""),
      timeline: String(form.get("timeline") ?? ""),
    };

    try {
      const res = await fetch("/api/public/contact", {
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
      router.push("/contact/thank-you");
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Card strong className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Full name" htmlFor="fullName">
            <Input id="fullName" name="fullName" required />
          </FormField>
          <FormField label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" required />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input id="phone" name="phone" type="tel" />
          </FormField>
          <FormField label="Company name" htmlFor="companyName">
            <Input id="companyName" name="companyName" required />
          </FormField>
          <FormField label="Website" htmlFor="website">
            <Input id="website" name="website" placeholder="https://" />
          </FormField>
          <FormField label="Industry" htmlFor="industry">
            <Select id="industry" name="industry" defaultValue="">
              <option value="">Select…</option>
              {INDUSTRY_OPTIONS.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Annual revenue range" htmlFor="revenueRange">
            <Select id="revenueRange" name="revenueRange" defaultValue="">
              <option value="">Select…</option>
              {REVENUE_RANGE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Employee count" htmlFor="employeeCount">
            <Input id="employeeCount" name="employeeCount" type="number" min={0} />
          </FormField>
          <FormField label="Timeline" htmlFor="timeline">
            <Select id="timeline" name="timeline" defaultValue="">
              <option value="">Select…</option>
              {TIMELINE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="What's your biggest business problem right now?" htmlFor="biggestProblem">
          <Textarea id="biggestProblem" name="biggestProblem" rows={3} />
        </FormField>

        <FormField label="What do you want built?" htmlFor="whatTheyWantBuilt">
          <Textarea id="whatTheyWantBuilt" name="whatTheyWantBuilt" rows={3} />
        </FormField>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <Button type="submit" variant="primary" loading={submitting} className="self-start px-6 py-3 text-[14px]">
        Submit
      </Button>
    </form>
  );
}
