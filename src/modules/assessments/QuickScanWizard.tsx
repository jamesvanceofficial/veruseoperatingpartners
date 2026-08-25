"use client";

import { useState } from "react";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { FormField, Input, Select } from "@/shared/ui/FormField";
import { cn } from "@/shared/ui/cn";
import { REVENUE_RANGES } from "./labels";
import { QuickScanResult } from "./QuickScanResult";
import type { Question } from "./types";

type Step = "intake" | "questions" | "result";

type Intake = { fullName: string; email: string; phone: string; companyName: string; industry: string; revenueRange: string };

export function QuickScanWizard({ questions }: { questions: Question[] }) {
  const [step, setStep] = useState<Step>("intake");
  const [intake, setIntake] = useState<Intake>({ fullName: "", email: "", phone: "", companyName: "", industry: "", revenueRange: "" });
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ enterpriseScore: number; bandLabel: string | null; topBottleneckCategoryName: string | null } | null>(null);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;

  function handleIntakeSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!intake.fullName.trim() || !intake.companyName.trim() || !intake.email.trim()) return;
    setStep("questions");
  }

  async function handleFinalSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/public/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: intake.fullName,
          email: intake.email,
          phone: intake.phone,
          company_name: intake.companyName,
          industry: intake.industry,
          revenue_range: intake.revenueRange,
          answers: Object.entries(answers).map(([question_id, value]) => ({ question_id, value })),
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      setResult({
        enterpriseScore: payload.data.enterpriseScore,
        bandLabel: payload.data.bandLabel,
        topBottleneckCategoryName: payload.data.topBottleneckCategoryName,
      });
      setStep("result");
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  if (step === "result" && result) {
    return <QuickScanResult score={result.enterpriseScore} bandLabel={result.bandLabel} topBottleneckName={result.topBottleneckCategoryName} />;
  }

  if (step === "intake") {
    return (
      <form onSubmit={handleIntakeSubmit} className="flex flex-col gap-5">
        <Card className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField label="Your name" htmlFor="fullName">
              <Input id="fullName" required value={intake.fullName} onChange={(e) => setIntake({ ...intake, fullName: e.target.value })} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input id="email" type="email" required value={intake.email} onChange={(e) => setIntake({ ...intake, email: e.target.value })} />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <Input id="phone" value={intake.phone} onChange={(e) => setIntake({ ...intake, phone: e.target.value })} />
            </FormField>
            <FormField label="Company name" htmlFor="companyName">
              <Input id="companyName" required value={intake.companyName} onChange={(e) => setIntake({ ...intake, companyName: e.target.value })} />
            </FormField>
            <FormField label="Industry" htmlFor="industry">
              <Input id="industry" value={intake.industry} onChange={(e) => setIntake({ ...intake, industry: e.target.value })} />
            </FormField>
            <FormField label="Annual revenue" htmlFor="revenueRange">
              <Select id="revenueRange" value={intake.revenueRange} onChange={(e) => setIntake({ ...intake, revenueRange: e.target.value })}>
                <option value="">Prefer not to say</option>
                {REVENUE_RANGES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </Card>
        <Button type="submit" variant="primary" className="self-start">
          Start the Quick Scan
        </Button>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--navy)]">
          <div className="h-full rounded-full bg-[var(--gold)] transition-[width] duration-150 ease-out" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
        <span className="text-[11px] text-[var(--muted)]">
          {answeredCount} of {questions.length} answered
        </span>
      </Card>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <Card key={q.id} className="flex flex-col gap-2.5">
            <p className="text-[13.5px] font-medium text-[var(--cream)]">
              {i + 1}. {q.question_text}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {q.answer_options
                .slice()
                .sort((a, b) => a.value - b.value)
                .map((opt) => {
                  const selected = answers[q.id] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.value }))}
                      className={cn(
                        "field-control glow-gold-hover rounded-[var(--radius-sm)] px-3.5 py-2.5 text-left text-[12.5px] transition-colors",
                        selected ? "border-[var(--gold)] bg-[color-mix(in_srgb,var(--gold)_14%,var(--navy))] text-[var(--cream)]" : "text-[var(--muted)]"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
            </div>
          </Card>
        ))}
      </div>

      <Button type="button" variant="primary" loading={submitting} disabled={!allAnswered} onClick={handleFinalSubmit} className="self-start">
        See my score
      </Button>
    </div>
  );
}
