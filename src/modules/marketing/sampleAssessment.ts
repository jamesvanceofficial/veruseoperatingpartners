import type { Band } from "@/modules/assessments/types";

// Stage 19 — a realistic, entirely fictional sample assessment result for
// the marketing site's hero visuals. Same scoring formula as the real
// product (category score / 10 * weight, summed; bottleneck rank = (10 -
// score) * weight, highest first — see assessments/scoring.ts), computed
// here so the displayed score/band/ranking can never be inconsistent with
// the numbers that produce them. Category names/weights match the real
// locked set exactly (assessment_categories).

export type SampleCategory = { categoryId: string; categoryName: string; weight: number; rawScore: number };

const RAW_CATEGORIES: Omit<SampleCategory, "categoryId">[] = [
  { categoryName: "Operations", weight: 20, rawScore: 3.5 },
  { categoryName: "Systems", weight: 15, rawScore: 3.0 },
  { categoryName: "People", weight: 15, rawScore: 4.5 },
  { categoryName: "Leadership", weight: 12, rawScore: 5.5 },
  { categoryName: "Sales", weight: 10, rawScore: 6.0 },
  { categoryName: "Finance", weight: 10, rawScore: 5.0 },
  { categoryName: "Technology", weight: 8, rawScore: 4.5 },
  { categoryName: "Marketing", weight: 5, rawScore: 6.0 },
  { categoryName: "Vision", weight: 3, rawScore: 6.5 },
  { categoryName: "Enterprise Readiness", weight: 2, rawScore: 3.0 },
];

export const SAMPLE_CATEGORIES: SampleCategory[] = RAW_CATEGORIES.map((c) => ({
  ...c,
  categoryId: c.categoryName.toLowerCase().replace(/\s+/g, "-"),
}));

/** category score / 10 * weight, summed — identical formula to computeScores() in assessments/scoring.ts. */
export const SAMPLE_SCORE = Math.round(SAMPLE_CATEGORIES.reduce((sum, c) => sum + (c.rawScore / 10) * c.weight, 0));

export const SAMPLE_BAND_LABEL = "Emerging Operator";
export const SAMPLE_BAND_DESCRIPTION =
  "The business runs, but almost everything still depends on the owner. Real systems exist in pieces, not as a whole operation anyone else could run.";

/** Mirrors the real seeded bands exactly (assessment_bands). */
export const SAMPLE_BANDS: Band[] = [
  { id: "founder-dependent", label: "Founder Dependent", min_score: 0, max_score: 39, description: null, sort_order: 1 },
  { id: "emerging-operator", label: "Emerging Operator", min_score: 40, max_score: 59, description: null, sort_order: 2 },
  { id: "growth-company", label: "Growth Company", min_score: 60, max_score: 79, description: null, sort_order: 3 },
  { id: "system-driven-company", label: "System-Driven Company", min_score: 80, max_score: 89, description: null, sort_order: 4 },
  { id: "enterprise-ready", label: "Enterprise Ready", min_score: 90, max_score: 100, description: null, sort_order: 5 },
];

/** bottleneckRank = (10 - score) * weight, highest impact first — identical formula to the real scoring engine. */
export const SAMPLE_BOTTLENECKS = [...SAMPLE_CATEGORIES]
  .map((c) => ({ ...c, impact: (10 - c.rawScore) * c.weight }))
  .sort((a, b) => b.impact - a.impact)
  .map((c, i) => ({
    categoryId: c.categoryId,
    categoryName: c.categoryName,
    rawScore: c.rawScore,
    bottleneckRank: i + 1,
  }));

export const SAMPLE_QUESTION = {
  category: "Operations",
  text: "How are your core operating processes documented?",
  options: [
    { value: 0, label: "Nothing in place — it lives in someone's head" },
    { value: 1, label: "Ad hoc — a few notes, nothing anyone could actually follow" },
    { value: 2, label: "Documented — written down, but not consistently followed" },
    { value: 3, label: "Documented and running well — followed, current, and used" },
  ],
};
