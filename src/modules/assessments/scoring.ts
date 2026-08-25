// The one scoring engine both assessment types share (Stage 7 rule #1 —
// "same scoring engine for both"). Pure functions, no DB access, so the
// exact same math runs whether it's fed 2 answers/category (Quick Scan)
// or 12 (Full Assessment) — the formulas are answered-count-relative, not
// fixed to a bank size, which is what makes that possible.
//
//   category score  = sum(answers) / (questions answered × 3) × 10
//   enterprise score = sum of (category score / 10 × weight) for every
//                      category with at least one answer, DIVIDED BY the
//                      sum of THOSE categories' weights, × 100
//   bottleneck rank  = (10 − category score) × weight, highest first
//
// A category with zero answers is excluded entirely — never counted as a
// zero. The division by answered-weight (not the full 100) is what makes
// the in-progress score meaningful instead of just "how much of the whole
// 100-point budget have you touched so far": with only Vision (weight 3)
// answered and a perfect 10/10 in it, the old un-normalized formula gave
// enterpriseScore = 3 (reads as a near-failing score); this gives 100
// (correct — the one thing measured so far is perfect). Once every
// category has at least one answer, answered-weight always equals 100 (the
// locked category weights sum to exactly that), so this collapses to
// literally the same number the old un-normalized formula produced — the
// final, complete-assessment score is mathematically unchanged.

export type ScoredAnswer = { categoryId: string; weight: number; value: number };

export type CategoryComputed = {
  categoryId: string;
  rawScore: number;
  weightedScore: number;
  weight: number;
  answeredCount: number;
  bottleneckRank: number;
};

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function computeScores(answers: ScoredAnswer[]): { enterpriseScore: number; categories: CategoryComputed[] } {
  const buckets = new Map<string, { sum: number; count: number; weight: number }>();
  for (const a of answers) {
    const bucket = buckets.get(a.categoryId) ?? { sum: 0, count: 0, weight: a.weight };
    bucket.sum += a.value;
    bucket.count += 1;
    buckets.set(a.categoryId, bucket);
  }

  const categories: CategoryComputed[] = [];
  let weightedSum = 0;
  let answeredWeight = 0;

  for (const [categoryId, { sum, count, weight }] of buckets) {
    const rawScore = count > 0 ? (sum / (count * 3)) * 10 : 0;
    const weightedScore = (rawScore / 10) * weight;
    weightedSum += weightedScore;
    answeredWeight += weight;
    categories.push({
      categoryId,
      rawScore: round1(rawScore),
      weightedScore: round1(weightedScore),
      weight,
      answeredCount: count,
      bottleneckRank: 0, // assigned below
    });
  }

  const enterpriseScoreRaw = answeredWeight > 0 ? (weightedSum / answeredWeight) * 100 : 0;

  // Highest (10 − score) × weight = biggest weighted gap = rank 1.
  const byBottleneck = [...categories].sort((a, b) => (10 - a.rawScore) * a.weight < (10 - b.rawScore) * b.weight ? 1 : -1);
  byBottleneck.forEach((c, i) => {
    c.bottleneckRank = i + 1;
  });

  return { enterpriseScore: Math.round(enterpriseScoreRaw), categories };
}

export function findBandId(bands: { id: string; min_score: number; max_score: number }[], score: number): string | null {
  const band = bands.find((b) => score >= b.min_score && score <= b.max_score);
  return band?.id ?? null;
}
