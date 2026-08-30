import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatDateTime } from "@/shared/format";
import { MEETING_TYPE_LABELS, MEETING_TYPE_TONE } from "./labels";
import type { MeetingListRow } from "./types";

export function MeetingListTable({ rows, showOrgColumn = true }: { rows: MeetingListRow[]; showOrgColumn?: boolean }) {
  const columns: TableColumn<MeetingListRow>[] = [
    {
      key: "title",
      header: "Meeting",
      render: (row) => (
        <Link href={`/meetings/${row.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {row.title}
        </Link>
      ),
    },
    ...(showOrgColumn
      ? [
          {
            key: "orgName",
            header: "Organization",
            render: (row: MeetingListRow) =>
              row.org_id ? (
                <Link href={`/organizations/${row.org_id}`} className="text-[var(--muted)] hover:text-[var(--cream)]">
                  {row.orgName}
                </Link>
              ) : (
                <span className="text-[var(--muted)]">Internal</span>
              ),
          } as TableColumn<MeetingListRow>,
        ]
      : []),
    { key: "meeting_type", header: "Type", render: (row) => <Badge tone={MEETING_TYPE_TONE[row.meeting_type]}>{MEETING_TYPE_LABELS[row.meeting_type]}</Badge> },
    { key: "scheduled_at", header: "Date & Time", render: (row) => formatDateTime(row.scheduled_at) },
    { key: "attendeeCount", header: "Attendees", align: "right", render: (row) => row.attendeeCount },
    {
      key: "openActionItemCount",
      header: "Open Action Items",
      align: "right",
      render: (row) => (row.openActionItemCount > 0 ? <Badge tone="yellow">{row.openActionItemCount}</Badge> : "0"),
    },
  ];

  return <Table columns={columns} rows={rows} />;
}
