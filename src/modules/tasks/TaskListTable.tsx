import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { cn } from "@/shared/ui/cn";
import { formatDate } from "@/shared/format";
import { TASK_STATUS_LABELS, TASK_STATUS_TONE, PRIORITY_LABELS, PRIORITY_TONE } from "./labels";
import type { TaskListRow } from "./types";

function isOverdue(row: TaskListRow): boolean {
  if (!row.due_date || row.status === "complete" || row.status === "cancelled") return false;
  return row.due_date < new Date().toISOString().slice(0, 10);
}

export function TaskListTable({ rows, showOrgColumn = true }: { rows: TaskListRow[]; showOrgColumn?: boolean }) {
  const columns: TableColumn<TaskListRow>[] = [
    {
      key: "title",
      header: "Task",
      render: (row) => (
        <Link href={`/tasks/${row.id}/edit`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {row.title}
        </Link>
      ),
    },
    ...(showOrgColumn
      ? [
          {
            key: "orgName",
            header: "Organization",
            render: (row: TaskListRow) =>
              row.org_id ? (
                <Link href={`/organizations/${row.org_id}`} className="text-[var(--muted)] hover:text-[var(--cream)]">
                  {row.orgName}
                </Link>
              ) : (
                <span className="text-[var(--muted)]">Internal</span>
              ),
          } as TableColumn<TaskListRow>,
        ]
      : []),
    {
      key: "projectName",
      header: "Project",
      render: (row) => (row.project_id ? <Link href={`/projects/${row.project_id}`} className="text-[var(--muted)] hover:text-[var(--cream)]">{row.projectName}</Link> : "—"),
    },
    { key: "assigneeName", header: "Assignee", render: (row) => row.assigneeName ?? "Unassigned" },
    { key: "status", header: "Status", render: (row) => <Badge tone={TASK_STATUS_TONE[row.status]}>{TASK_STATUS_LABELS[row.status]}</Badge> },
    { key: "priority", header: "Priority", render: (row) => <Badge tone={PRIORITY_TONE[row.priority]}>{PRIORITY_LABELS[row.priority]}</Badge> },
    {
      key: "due_date",
      header: "Due",
      render: (row) => <span className={cn(isOverdue(row) && "font-semibold text-[var(--red)]")}>{formatDate(row.due_date)}</span>,
    },
  ];

  return <Table columns={columns} rows={rows} />;
}
