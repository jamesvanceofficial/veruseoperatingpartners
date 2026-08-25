// The one scoring engine both assessment types share (Stage 7 rule #1 —
// "same scoring engine for both"). Pure functions, no DB access, so the
// exact same math runs whether it's fed 2 answers/category (Quick Scan)
// or 12 (Full Assessment) — the formulas are answered-count-relative, not
// fixed to a bank size, which is what makes that possible.
//
//   category score  = sum(answers) / (questions answered × 3) × 10
//   enterprise score = sum over categories of (category score / 10 × weight)
//   bottleneck rank  = (10 − category score) × weight, highest first

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
  let enterpriseScoreRaw = 0;

  for (const [categoryId, { sum, count, weight }] of buckets) {
    const rawScore = count > 0 ? (sum / (count * 3)) * 10 : 0;
    const weightedScore = (rawScore / 10) * weight;
    enterpriseScoreRaw += weightedScore;
    categories.push({
      categoryId,
      rawScore: round1(rawScore),
      weightedScore: round1(weightedScore),
      weight,
      answeredCount: count,
      bottleneckRank: 0, // assigned below
    });
  }

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
