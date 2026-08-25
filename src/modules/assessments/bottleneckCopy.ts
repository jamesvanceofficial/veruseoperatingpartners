// What a weakness in each category typically costs a business — plain
// language, specific, not generic filler. Keyed by the exact category
// name (the 10 are locked, see CLAUDE.md). Shown on the quick-scan
// result page next to a client's top 3 bottlenecks.
export const CATEGORY_BOTTLENECK_COPY: Record<string, string> = {
  Operations:
    "Without documented, repeatable processes, quality gets inconsistent and every new hire takes months longer to become productive — mistakes get repeated because nothing was written down the first time.",
  Systems:
    "When customer, scheduling, and financial data live in scattered spreadsheets and someone's memory, things fall through the cracks — every hour spent re-entering the same data twice is an hour not spent serving customers or closing deals.",
  People:
    "Without clear roles, a real hiring process, and regular reviews, performance gets inconsistent and turnover climbs — every departure costs more than it should because nothing about the role was ever written down.",
  Leadership:
    "Without a shared vision and a real decision-making rhythm, the business drifts — priorities shift based on whoever spoke last, and the team spends energy guessing instead of executing.",
  Sales:
    "An undocumented, inconsistent sales process means revenue depends entirely on your best salesperson's instincts — it can't be taught, scaled, or trusted to survive that person leaving.",
  Marketing:
    "Without a documented plan and a way to track what's actually generating customers, marketing spend becomes guesswork — you can't tell what's working, so you can't do more of it on purpose.",
  Finance:
    "Not knowing your margins or reviewing your numbers on a schedule means pricing and spending decisions get made on gut feel — profitable work and unprofitable work look identical until it's too late to fix.",
  Technology:
    "Without a documented inventory, a security policy, and an update process, the business is one lost password or one breach away from a very expensive week — and nobody can say for sure what's actually at risk.",
  Vision:
    "Without a written long-term plan, growth becomes reactive — the business ends up wherever circumstances push it, instead of somewhere you actually chose to go.",
  "Enterprise Readiness":
    "A business this dependent on its owner is hard to sell, hard to scale, and one health scare away from serious trouble — value that lives only in your head is value nobody else can rely on.",
};
