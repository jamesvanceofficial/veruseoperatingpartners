// Stage 22 — pricing release control. Findings are always visible; every
// dollar figure on the client-facing report (and the completed-assessment
// view reached via a public share link, which is just as client-facing)
// stays redacted until a staff member explicitly releases pricing for
// that assessment. Shared between ClientReportView and
// BuildRecommendationPanel so both redact the same way.

export const PRICING_HIDDEN_MESSAGE = "Investment reviewed together.";
export const PRICING_HIDDEN_INLINE = "Investment reviewed together";

/**
 * Strips a dollar figure woven into freeform copy — either a parenthetical
 * aside ("(\$35/mo per additional seat)") or a bare amount — when pricing
 * hasn't been released. Returns the text unchanged when revealed, so it's
 * always safe to call.
 */
export function redactPriceMentions(text: string, revealed: boolean): string {
  if (revealed) return text;
  return text
    .replace(/\s*\([^()]*\$[^()]*\)/g, "")
    .replace(/\$[\d,]+(\.\d+)?(\/\w+)?/g, "the reviewed rate")
    .replace(/\s{2,}/g, " ")
    .trim();
}
