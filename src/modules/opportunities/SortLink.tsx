import Link from "next/link";
import type { SortKey } from "./sort";

/** A sortable table-header link — toggles asc/desc on repeat clicks, preserving every other query param. */
export function SortLink({
  label,
  sortKey,
  currentSort,
  currentDir,
  searchParams,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: string;
  currentDir: string;
  searchParams: Record<string, string | undefined>;
}) {
  const active = currentSort === sortKey;
  const nextDir = active && currentDir === "asc" ? "desc" : "asc";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(searchParams)) {
    if (v) params.set(k, v);
  }
  params.set("sort", sortKey);
  params.set("dir", nextDir);

  return (
    <Link href={`?${params.toString()}`} className="inline-flex items-center gap-1 hover:text-[var(--cream)]">
      {label}
      {active ? <span className="text-[var(--gold-light)]">{currentDir === "asc" ? "↑" : "↓"}</span> : null}
    </Link>
  );
}
