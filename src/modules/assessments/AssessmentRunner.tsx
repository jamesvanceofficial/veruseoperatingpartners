"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/ui/cn";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { computeScores } from "./scoring";
import { AnswerOptionButton } from "./AnswerOptionButton";
import type { Category, Question } from "./types";

/**
 * Shared by both the staff-authenticated runner (/business-assessments/[id])
 * and the public share-link runner (/assessment/[token]) — only saveUrl/
 * completeUrl differ. The live score is computed client-side with the same
 * pure scoring.ts the server uses (categories with zero answers are
 * excluded entirely, never counted as zero — see scoring.ts), so it
 * updates instantly with no round trip; the server save is still the
 * source of truth once persisted.
 *
 * This component only ever renders while the assessment is NOT complete
 * (the parent page swaps to the report view once it is), so the band is
 * never shown here — a band implies "this is the read," and nothing here
 * is final. The score itself is always labeled provisional for the same
 * reason.
 */
export function AssessmentRunner({
  categories,
  questions,
  initialAnswers,
  saveUrl,
  completeUrl,
}: {
  categories: Category[];
  questions: Question[];
  initialAnswers: Record<string, number>;
  saveUrl: string;
  completeUrl: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const sections = useMemo(() => {
    const categoryIdsInUse = [...new Set(questions.map((q) => q.category_id))];
    return categories.filter((c) => categoryIdsInUse.includes(c.id)).map((c) => ({ category: c, questions: questions.filter((q) => q.category_id === c.id) }));
  }, [categories, questions]);

  const { enterpriseScore } = useMemo(() => {
    const weightByCategory = new Map(categories.map((c) => [c.id, c.weight]));
    const scored = Object.entries(answers).map(([questionId, value]) => {
      const q = questions.find((qq) => qq.id === questionId);
      return { categoryId: q?.category_id ?? "", weight: weightByCategory.get(q?.category_id ?? "") ?? 0, value };
    });
    return computeScores(scored);
  }, [answers, categories, questions]);

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const complete = answeredCount === totalCount;
  const halfway = totalCount > 0 && answeredCount / totalCount >= 0.5;

  async function handleAnswer(question: Question, value: number) {
    setError(null);
    setSavingId(question.id);
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    try {
      const res = await fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: question.id, value }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not save that answer — try again.");
      }
    } catch {
      setError("Could not save that answer — check your connection.");
    } finally {
      setSavingId(null);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(completeUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not submit the assessment.");
        setSubmitting(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not submit the assessment — check your connection.");
      setSubmitting(false);
    }
  }

  const activeSection = sections[sectionIndex];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <div className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start">
        <Card className="flex flex-col gap-1.5">
          <span className="section-label">Provisional Score</span>
          <span className="font-tabular text-[28px] font-semibold leading-none text-[var(--gold-light)]">{answeredCount > 0 ? enterpriseScore : "—"}</span>
          <span className="text-[11px] text-[var(--muted)]">
            {answeredCount === 0
              ? "Answer a few questions to see a provisional score"
              : halfway
                ? "Provisional — the band appears once the assessment is complete"
                : "Too early to be meaningful yet — keep going"}
          </span>
        </Card>

        <Card className="flex flex-col gap-2">
          <span className="section-label">Progress</span>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--navy)]">
            <div className="h-full rounded-full bg-[var(--gold)] transition-[width] duration-150 ease-out" style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }} />
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            {answeredCount} of {totalCount} answered
          </span>
        </Card>

        <Card className="flex flex-col gap-1 p-2">
          {sections.map((s, i) => {
            const sectionAnswered = s.questions.filter((q) => answers[q.id] !== undefined).length;
            const done = sectionAnswered === s.questions.length;
            return (
              <button
                key={s.category.id}
                type="button"
                onClick={() => setSectionIndex(i)}
                className={cn(
                  "row-hover-lift flex items-center justify-between gap-2 rounded-[var(--radius-sm)] px-2.5 py-2 text-left text-[12px] transition-colors",
                  i === sectionIndex ? "text-[var(--gold-light)]" : "text-[var(--muted)]"
                )}
              >
                <span>{s.category.name}</span>
                <span className={cn("font-tabular text-[10.5px]", done && "text-[var(--green)]")}>
                  {sectionAnswered}/{s.questions.length}
                </span>
              </button>
            );
          })}
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

        {activeSection ? (
          <Card className="flex flex-col gap-6">
            <div>
              <span className="section-label">
                Section {sectionIndex + 1} of {sections.length}
              </span>
              <h2 className="mt-1 text-[17px] font-semibold text-[var(--cream)]">{activeSection.category.name}</h2>
            </div>

            <div className="flex flex-col gap-6">
              {activeSection.questions.map((q) => (
                <div key={q.id} className="flex flex-col gap-2.5">
                  <p className="text-[13.5px] font-medium text-[var(--cream)]">{q.question_text}</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {q.answer_options
                      .slice()
                      .sort((a, b) => a.value - b.value)
                      .map((opt) => (
                        <AnswerOptionButton
                          key={opt.value}
                          option={opt}
                          selected={answers[q.id] === opt.value}
                          disabled={savingId === q.id}
                          onSelect={() => handleAnswer(q, opt.value)}
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between gap-3">
              <Button type="button" variant="ghost" disabled={sectionIndex === 0} onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}>
                Previous section
              </Button>
              {sectionIndex < sections.length - 1 ? (
                <Button type="button" variant="secondary" onClick={() => setSectionIndex((i) => Math.min(sections.length - 1, i + 1))}>
                  Next section
                </Button>
              ) : null}
            </div>
          </Card>
        ) : null}

        <div className="flex items-center gap-3">
          <Button type="button" variant="primary" loading={submitting} disabled={!complete} onClick={handleSubmit}>
            Submit assessment
          </Button>
          {!complete ? <span className="text-[11.5px] text-[var(--muted)]">Answer every question to submit.</span> : null}
        </div>
      </div>
    </div>
  );
}
