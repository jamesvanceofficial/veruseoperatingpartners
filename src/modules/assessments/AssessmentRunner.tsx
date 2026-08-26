"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/ui/cn";
import { Card } from "@/shared/ui/Card";
import { Badge } from "@/shared/ui/Badge";
import { Button } from "@/shared/ui/Button";
import { formatDate } from "@/shared/format";
import { computeScores } from "./scoring";
import { AnswerOptionButton } from "./AnswerOptionButton";
import { NotApplicableToggle } from "./NotApplicableToggle";
import { BusinessProfileForm } from "./BusinessProfileForm";
import type { Category, Question, FinancialProfile, BusinessPresence, Workforce } from "./types";

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
  initialNotApplicable = [],
  carriedForward = {},
  clearCarriedForwardUrl,
  saveUrl,
  completeUrl,
  collectProfile = false,
  profileSaveUrl,
  initialFinancial = null,
  initialPresence = null,
  initialWorkforce = null,
}: {
  categories: Category[];
  questions: Question[];
  initialAnswers: Record<string, number>;
  /** question_ids already marked not applicable — excluded from scoring, but count as "answered" for progress/completion. */
  initialNotApplicable?: string[];
  /** question_id -> the source quick scan's completed_at, for answers still carried forward and untouched. */
  carriedForward?: Record<string, string>;
  clearCarriedForwardUrl?: string;
  saveUrl: string;
  completeUrl: string;
  /** Full Assessment only — shows the financial/presence/workforce step before the questions. */
  collectProfile?: boolean;
  profileSaveUrl?: string;
  initialFinancial?: FinancialProfile | null;
  initialPresence?: BusinessPresence | null;
  initialWorkforce?: Workforce | null;
}) {
  const router = useRouter();
  // Only on a truly fresh session — resuming an assessment that already
  // has progress skips straight to where it left off, and "Edit business
  // profile" in the sidebar is how you get back to it later.
  const [profileStep, setProfileStep] = useState(
    () => collectProfile && Object.keys(initialAnswers).length === 0 && initialNotApplicable.length === 0
  );
  const [answers, setAnswers] = useState<Record<string, number>>(initialAnswers);
  const [notApplicable, setNotApplicable] = useState<Set<string>>(() => new Set(initialNotApplicable));
  const [carriedIds, setCarriedIds] = useState<Set<string>>(() => new Set(Object.keys(carriedForward)));
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [clearing, setClearing] = useState(false);

  const sections = useMemo(() => {
    const categoryIdsInUse = [...new Set(questions.map((q) => q.category_id))];
    return categories.filter((c) => categoryIdsInUse.includes(c.id)).map((c) => ({ category: c, questions: questions.filter((q) => q.category_id === c.id) }));
  }, [categories, questions]);

  const initialNotApplicableSet = useMemo(() => new Set(initialNotApplicable), [initialNotApplicable]);

  // Opens on the first section with a genuinely unanswered question — not
  // always section 0 — so carried-forward (or any other pre-filled)
  // answers, real or not-applicable, don't make the runner look like it's
  // starting from scratch.
  const [sectionIndex, setSectionIndex] = useState(() => {
    const idx = sections.findIndex((s) => s.questions.some((q) => initialAnswers[q.id] === undefined && !initialNotApplicableSet.has(q.id)));
    return idx === -1 ? 0 : idx;
  });

  // Section changes swap the whole question list — from a "Next section"/
  // "Previous section" click or a sidebar category click — and without
  // this, the page stayed at whatever scroll position the previous
  // section left it at, opening mid-way down with the new section's first
  // question off-screen above.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [sectionIndex]);

  const carriedCount = carriedIds.size;
  const carriedDate = carriedCount > 0 ? Object.values(carriedForward)[0] : null;

  const { enterpriseScore } = useMemo(() => {
    // notApplicable is a separate state container, never mixed into
    // answers, so this already excludes it from the live score with no
    // extra filtering needed.
    const weightByCategory = new Map(categories.map((c) => [c.id, c.weight]));
    const scored = Object.entries(answers).map(([questionId, value]) => {
      const q = questions.find((qq) => qq.id === questionId);
      return { categoryId: q?.category_id ?? "", weight: weightByCategory.get(q?.category_id ?? "") ?? 0, value };
    });
    return computeScores(scored);
  }, [answers, categories, questions]);

  const answeredCount = Object.keys(answers).length + notApplicable.size;
  const totalCount = questions.length;
  const complete = answeredCount === totalCount;
  const halfway = totalCount > 0 && answeredCount / totalCount >= 0.5;

  function clearCarried(questionId: string) {
    setCarriedIds((prev) => {
      if (!prev.has(questionId)) return prev;
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  }

  async function handleAnswer(question: Question, value: number) {
    setError(null);
    setSavingId(question.id);
    setAnswers((prev) => ({ ...prev, [question.id]: value }));
    setNotApplicable((prev) => {
      if (!prev.has(question.id)) return prev;
      const next = new Set(prev);
      next.delete(question.id);
      return next;
    });
    clearCarried(question.id);
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

  async function handleNotApplicable(question: Question) {
    setError(null);
    setSavingId(question.id);
    setNotApplicable((prev) => new Set(prev).add(question.id));
    setAnswers((prev) => {
      if (!(question.id in prev)) return prev;
      const next = { ...prev };
      delete next[question.id];
      return next;
    });
    clearCarried(question.id);
    try {
      const res = await fetch(saveUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question_id: question.id, not_applicable: true }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not save that — try again.");
      }
    } catch {
      setError("Could not save that — check your connection.");
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

  async function handleClearCarriedForward() {
    if (!clearCarriedForwardUrl) return;
    setClearing(true);
    setError(null);
    try {
      const res = await fetch(clearCarriedForwardUrl, { method: "POST" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not clear the carried-forward answers.");
        setClearing(false);
        return;
      }
      // A full reload, not router.refresh() — this component's own
      // answers/carriedIds state needs to reset from scratch, not just
      // the server data it was seeded from.
      window.location.reload();
    } catch {
      setError("Could not clear the carried-forward answers — check your connection.");
      setClearing(false);
    }
  }

  if (profileStep && profileSaveUrl) {
    return (
      <BusinessProfileForm
        saveUrl={profileSaveUrl}
        initialFinancial={initialFinancial}
        initialPresence={initialPresence}
        initialWorkforce={initialWorkforce}
        onContinue={() => setProfileStep(false)}
      />
    );
  }

  const activeSection = sections[sectionIndex];

  return (
    <div className="flex flex-col gap-4">
      {carriedCount > 0 ? (
        <Card className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[12.5px] font-medium text-[var(--cream)]">
              {carriedCount} answer{carriedCount === 1 ? "" : "s"} carried forward from the Quick Scan completed {formatDate(carriedDate)}.
            </p>
            <p className="text-[11.5px] text-[var(--muted)]">Marked below — still fully editable.</p>
          </div>
          {clearCarriedForwardUrl ? (
            <Button type="button" variant="ghost" loading={clearing} onClick={handleClearCarriedForward}>
              Clear and start fresh
            </Button>
          ) : null}
        </Card>
      ) : null}

      {/* Mobile-only: the full sidebar below collapses to this one compact
          bar so the questions start near the top of the screen instead of
          below three stacked cards. */}
      <Card className="flex flex-col gap-2 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="section-label">Progress</span>
          <span className="font-tabular text-[13px] font-semibold text-[var(--gold-light)]">{answeredCount > 0 ? `${enterpriseScore} · provisional` : "—"}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--navy)]">
          <div className="h-full rounded-full bg-[var(--gold)] transition-[width] duration-150 ease-out" style={{ width: `${totalCount > 0 ? (answeredCount / totalCount) * 100 : 0}%` }} />
        </div>
        <span className="text-[11px] text-[var(--muted)]">
          {answeredCount} of {totalCount} answered
        </span>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <div className="hidden flex-col gap-4 lg:sticky lg:top-8 lg:flex lg:self-start">
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

          {collectProfile && profileSaveUrl ? (
            <button
              type="button"
              onClick={() => setProfileStep(true)}
              className="self-start text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]"
            >
              Edit business profile
            </button>
          ) : null}

          <Card className="flex flex-col gap-1 p-2">
            {sections.map((s, i) => {
              const sectionAnswered = s.questions.filter((q) => answers[q.id] !== undefined || notApplicable.has(q.id)).length;
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
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13.5px] font-medium text-[var(--cream)]">{q.question_text}</p>
                      {carriedIds.has(q.id) ? <Badge tone="gold">Carried from your scan · {formatDate(carriedForward[q.id])}</Badge> : null}
                    </div>
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
                    <NotApplicableToggle selected={notApplicable.has(q.id)} disabled={savingId === q.id} onSelect={() => handleNotApplicable(q)} />
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={sectionIndex === 0}
                  onClick={() => setSectionIndex((i) => Math.max(0, i - 1))}
                  className="w-full py-3 sm:w-auto"
                >
                  Previous section
                </Button>
                {sectionIndex < sections.length - 1 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setSectionIndex((i) => Math.min(sections.length - 1, i + 1))}
                    className="w-full py-3 sm:w-auto"
                  >
                    Next section
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : null}

          <div className="flex flex-col items-start gap-3">
            <Button type="button" variant="primary" loading={submitting} disabled={!complete} onClick={handleSubmit} className="w-full py-3.5 sm:w-auto">
              Submit assessment
            </Button>
            {!complete ? <span className="text-[11.5px] text-[var(--muted)]">Answer every question to submit.</span> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
