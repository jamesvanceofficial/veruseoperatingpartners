import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatDate } from "@/shared/format";
import { STAGE_LABELS, STAGE_TONE } from "./labels";
import { SortLink } from "./SortLink";
import type { SortKey } from "./sort";
import type { OpportunityListRow } from "./types";

export function OpportunityListTable({
  rows,
  showOrgColumn = true,
  sortState,
}: {
  rows: OpportunityListRow[];
  showOrgColumn?: boolean;
  /** When provided, headers become sort links; omit for a small unsorted listing (e.g. an org's Opportunities tab). */
  sortState?: { sort: string; dir: string; searchParams: Record<string, string | undefined> };
}) {
  function header(label: string, key: SortKey): React.ReactNode {
    if (!sortState) return label;
    return <SortLink label={label} sortKey={key} currentSort={sortState.sort} currentDir={sortState.dir} searchParams={sortState.searchParams} />;
  }

  const columns: TableColumn<OpportunityListRow>[] = [
    {
      key: "name",
      header: header("Name", "name"),
      render: (row) => (
        <Link href={`/crm-pipeline/${row.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {row.name}
        </Link>
      ),
    },
    ...(showOrgColumn
      ? [
          {
            key: "orgName",
            header: header("Organization", "org"),
            render: (row: OpportunityListRow) => (
              <Link href={`/organizations/${row.org_id}`} className="text-[var(--muted)] hover:text-[var(--cream)]">
                {row.orgName}
              </Link>
            ),
          } as TableColumn<OpportunityListRow>,
        ]
      : []),
    { key: "stage", header: header("Stage", "stage"), render: (row) => <Badge tone={STAGE_TONE[row.stage]}>{STAGE_LABELS[row.stage]}</Badge> },
    { key: "ownerName", header: header("Owner", "owner"), render: (row) => row.ownerName ?? "—" },
    { key: "expected_value", header: header("Value", "value"), align: "right", render: (row) => formatCurrency(row.expected_value) },
    {
      key: "probability",
      header: header("Probability", "probability"),
      align: "right",
      render: (row) => (row.probability !== null ? `${row.probability}%` : "—"),
    },
    {
      key: "next_action",
      header: header("Next Action", "next_action_date"),
      render: (row) => (row.next_action ? `${row.next_action}${row.next_action_date ? ` · ${formatDate(row.next_action_date)}` : ""}` : "—"),
    },
  ];

  return <Table columns={columns} rows={rows} />;
}
