/** One tone scale for every 0-10 category score in the app — the report view and the quick-scan result both color bars/badges from this, so "weak" always means the same color everywhere. */
export function categoryScoreTone(score: number): "green" | "yellow" | "red" {
  if (score >= 7) return "green";
  if (score >= 4) return "yellow";
  return "red";
}
