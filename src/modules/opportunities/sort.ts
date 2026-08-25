import type { OpportunityListRow } from "./types";
import { STAGE_LABELS } from "./labels";

export const SORT_KEYS = ["name", "org", "stage", "owner", "value", "probability", "next_action_date"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export function sortOpportunityRows(rows: OpportunityListRow[], sort: string | undefined, dir: string | undefined): OpportunityListRow[] {
  const key = (SORT_KEYS as readonly string[]).includes(sort ?? "") ? (sort as SortKey) : "name";
  const direction = dir === "desc" ? -1 : 1;

  function comparable(row: OpportunityListRow): string | number {
    switch (key) {
      case "org":
        return row.orgName.toLowerCase();
      case "stage":
        return STAGE_LABELS[row.stage];
      case "owner":
        return row.ownerName?.toLowerCase() ?? "";
      case "value":
        return row.expected_value ?? -Infinity;
      case "probability":
        return row.probability ?? -Infinity;
      case "next_action_date":
        return row.next_action_date ?? "9999-99-99";
      case "name":
      default:
        return row.name.toLowerCase();
    }
  }

  return [...rows].sort((a, b) => {
    const av = comparable(a);
    const bv = comparable(b);
    if (av < bv) return -1 * direction;
    if (av > bv) return 1 * direction;
    return 0;
  });
}
