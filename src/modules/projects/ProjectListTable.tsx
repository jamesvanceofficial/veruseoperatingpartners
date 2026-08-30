import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatDate } from "@/shared/format";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_TONE, PRIORITY_LABELS, PRIORITY_TONE } from "./labels";
import type { ProjectListRow } from "./types";

export function ProjectListTable({ rows, showOrgColumn = true }: { rows: ProjectListRow[]; showOrgColumn?: boolean }) {
  const columns: TableColumn<ProjectListRow>[] = [
    {
      key: "name",
      header: "Project",
      render: (row) => (
        <Link href={`/projects/${row.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {row.name}
        </Link>
      ),
    },
    ...(showOrgColumn
      ? [
          {
            key: "orgName",
            header: "Organization",
            render: (row: ProjectListRow) => (
              <Link href={`/organizations/${row.org_id}`} className="text-[var(--muted)] hover:text-[var(--cream)]">
                {row.orgName}
              </Link>
            ),
          } as TableColumn<ProjectListRow>,
        ]
      : []),
    { key: "status", header: "Status", render: (row) => <Badge tone={PROJECT_STATUS_TONE[row.status]}>{PROJECT_STATUS_LABELS[row.status]}</Badge> },
    { key: "priority", header: "Priority", render: (row) => <Badge tone={PRIORITY_TONE[row.priority]}>{PRIORITY_LABELS[row.priority]}</Badge> },
    { key: "ownerName", header: "Owner", render: (row) => row.ownerName ?? "Unassigned" },
    { key: "due_date", header: "Due", render: (row) => formatDate(row.due_date) },
    { key: "completionPct", header: "Progress", align: "right", render: (row) => `${row.completionPct}%` },
  ];

  return <Table columns={columns} rows={rows} />;
}
