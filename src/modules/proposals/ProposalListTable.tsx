import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatDate } from "@/shared/format";
import { BUILD_TIER_INFO } from "@/modules/assessments/buildTiers";
import { STATUS_LABELS, STATUS_TONE } from "./labels";
import type { ProposalListRow } from "./types";

export function ProposalListTable({ rows }: { rows: ProposalListRow[] }) {
  const columns: TableColumn<ProposalListRow>[] = [
    {
      key: "org",
      header: "Client",
      render: (p) => (
        <Link href={`/proposals/${p.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {p.orgName}
        </Link>
      ),
    },
    { key: "tier", header: "Build Tier", render: (p) => <span className="text-[var(--muted)]">{p.buildTier ? BUILD_TIER_INFO[p.buildTier].label : "—"}</span> },
    { key: "price", header: "Price", align: "right", render: (p) => <span className="font-tabular font-semibold text-[var(--gold-light)]">{formatCurrency(p.buildPrice)}</span> },
    { key: "status", header: "Status", render: (p) => <Badge tone={STATUS_TONE[p.status]}>{STATUS_LABELS[p.status]}</Badge> },
    { key: "date", header: "Date", render: (p) => <span className="text-[var(--muted)]">{formatDate(p.proposalDate)}</span> },
    { key: "sent", header: "Sent", render: (p) => <span className="text-[var(--muted)]">{p.sentAt ? formatDate(p.sentAt) : "—"}</span> },
  ];

  return <Table columns={columns} rows={rows} />;
}
