/**
 * Pure matching of a Stripe customer to a COMPASS organization: by email
 * first (against every contact's email), then by company name. A match
 * only counts when it points at exactly ONE organization — anything
 * ambiguous stays unmatched for James to attach by hand. Never creates
 * or guesses an organization.
 */

const LEGAL_SUFFIXES = new Set(["llc", "inc", "co", "corp", "corporation", "company", "ltd", "pllc", "lp", "llp", "plc"]);

export function normalizeCompanyName(name: string | null | undefined): string {
  if (!name) return "";
  const words = name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  while (words.length > 1 && LEGAL_SUFFIXES.has(words[words.length - 1])) words.pop();
  return words.join(" ");
}

export type MatchResult = { orgId: string; method: "email" | "name" } | null;

export function matchCustomerToOrg(
  customer: { email: string | null; name: string | null },
  contacts: { org_id: string; email: string | null }[],
  orgs: { id: string; name: string }[]
): MatchResult {
  const email = customer.email?.trim().toLowerCase();
  if (email) {
    const orgIds = new Set(contacts.filter((c) => c.email?.trim().toLowerCase() === email).map((c) => c.org_id));
    if (orgIds.size === 1) return { orgId: [...orgIds][0], method: "email" };
    if (orgIds.size > 1) return null; // ambiguous — leave for a human
  }

  const name = normalizeCompanyName(customer.name);
  if (name) {
    const hits = orgs.filter((o) => normalizeCompanyName(o.name) === name);
    if (hits.length === 1) return { orgId: hits[0].id, method: "name" };
  }
  return null;
}
