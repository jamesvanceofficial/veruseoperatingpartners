import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatDateTime } from "@/shared/format";
import { STATUS_LABELS, STATUS_TONE, PRIORITY_LABELS, PRIORITY_TONE } from "./labels";
import { SlaBadge } from "./SlaBadge";
import type { TicketListRow } from "./types";

export function TicketListTable({ rows, showOrgColumn = true }: { rows: TicketListRow[]; showOrgColumn?: boolean }) {
  const columns: TableColumn<TicketListRow>[] = [
    {
      key: "subject",
      header: "Subject",
      render: (t) => (
        <Link href={`/support-tickets/${t.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {t.subject}
        </Link>
      ),
    },
    ...(showOrgColumn ? [{ key: "org", header: "Client", render: (t: TicketListRow) => <span className="text-[var(--muted)]">{t.orgName}</span> } as TableColumn<TicketListRow>] : []),
    { key: "status", header: "Status", render: (t) => <Badge tone={STATUS_TONE[t.status]}>{STATUS_LABELS[t.status]}</Badge> },
    { key: "priority", header: "Priority", render: (t) => <Badge tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABELS[t.priority]}</Badge> },
    { key: "assigned", header: "Assigned", render: (t) => <span className="text-[var(--muted)]">{t.assignedToName ?? "Unassigned"}</span> },
    { key: "opened", header: "Opened", render: (t) => <span className="text-[var(--muted)]">{formatDateTime(t.openedAt)}</span> },
    { key: "sla", header: "Response Due", render: (t) => <SlaBadge responseDueAt={t.responseDueAt} firstRespondedAt={t.firstRespondedAt} /> },
  ];

  return <Table columns={columns} rows={rows} />;
}
