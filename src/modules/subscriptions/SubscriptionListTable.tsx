import Link from "next/link";
import { Table, type TableColumn } from "@/shared/ui/Table";
import { Badge } from "@/shared/ui/Badge";
import { formatCurrency, formatDate } from "@/shared/format";
import { SUPPORT_TIER_INFO } from "@/modules/assessments/buildTiers";
import { STATUS_LABELS, STATUS_TONE } from "./labels";
import type { SubscriptionListRow } from "./types";

export function SubscriptionListTable({ rows, showOrgColumn = true }: { rows: SubscriptionListRow[]; showOrgColumn?: boolean }) {
  const columns: TableColumn<SubscriptionListRow>[] = [
    {
      key: "plan",
      header: "Plan",
      render: (s) => (
        <Link href={`/subscriptions/${s.id}`} className="font-medium text-[var(--cream)] hover:text-[var(--gold-light)]">
          {s.planName}
        </Link>
      ),
    },
    ...(showOrgColumn ? [{ key: "org", header: "Client", render: (s: SubscriptionListRow) => <span className="text-[var(--muted)]">{s.orgName}</span> } as TableColumn<SubscriptionListRow>] : []),
    { key: "tier", header: "Tier", render: (s) => <span className="text-[var(--muted)]">{s.supportTier ? SUPPORT_TIER_INFO[s.supportTier].label : "—"}</span> },
    { key: "status", header: "Status", render: (s) => <Badge tone={STATUS_TONE[s.status]}>{STATUS_LABELS[s.status]}</Badge> },
    { key: "seats", header: "Seats", align: "right", render: (s) => <span className="font-tabular">{s.seats ?? "—"}</span> },
    { key: "renewal", header: "Renewal", render: (s) => <span className="text-[var(--muted)]">{s.renewalDate ? formatDate(s.renewalDate) : "—"}</span> },
    { key: "mrr", header: "MRR", align: "right", render: (s) => <span className="font-tabular font-semibold text-[var(--gold-light)]">{formatCurrency(s.mrr)}</span> },
  ];

  return <Table columns={columns} rows={rows} />;
}
