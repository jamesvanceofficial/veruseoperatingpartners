import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatDate } from "@/shared/format";
import { ASSESSMENT_TYPE_LABELS, ASSESSMENT_STATUS_LABELS, ASSESSMENT_STATUS_TONE } from "./labels";
import type { AssessmentListRow } from "./types";

export function AssessmentListTable({ rows, showOrgColumn = true }: { rows: AssessmentListRow[]; showOrgColumn?: boolean }) {
  const columns: TableColumn<AssessmentListRow>[] = [
    {
      key: "type",
      header: "Assessment",
      render: (row) => (
        <Link href={`/business-assessments/${row.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {ASSESSMENT_TYPE_LABELS[row.assessment_type]}
        </Link>
      ),
    },
    ...(showOrgColumn
      ? [
          {
            key: "orgName",
            header: "Organization",
            render: (row: AssessmentListRow) => (
              <Link href={`/organizations/${row.org_id}`} className="text-[var(--muted)] hover:text-[var(--cream)]">
                {row.orgName}
              </Link>
            ),
          } as TableColumn<AssessmentListRow>,
        ]
      : []),
    { key: "status", header: "Status", render: (row) => <Badge tone={ASSESSMENT_STATUS_TONE[row.status]}>{ASSESSMENT_STATUS_LABELS[row.status]}</Badge> },
    { key: "score", header: "Score", align: "right", render: (row) => row.enterprise_score ?? "—" },
    // Band only ever shows once completed — a band on an in-progress row
    // implies a read that isn't final yet, which is exactly what's
    // misleading. The Status column already says "In Progress" right
    // next to it, so the score itself stays visible (it's a real,
    // correctly-computed provisional number since the scoring fix).
    { key: "band", header: "Band", render: (row) => (row.status === "completed" ? (row.bandLabel ?? "—") : "—") },
    { key: "created_at", header: "Started", render: (row) => formatDate(row.created_at) },
  ];

  return <Table columns={columns} rows={rows} />;
}
