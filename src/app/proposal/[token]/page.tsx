import { notFound } from "next/navigation";
import { createAdminClient } from "@/shared/supabase/admin";
import { getProposalByToken } from "@/modules/proposals/data";
import { ProposalDocument } from "@/modules/proposals/ProposalDocument";
import { ProposalAcceptDeclineWidget } from "@/modules/proposals/ProposalAcceptDeclineWidget";
import { PrintButton } from "@/shared/ui/PrintButton";

// Public, unauthenticated — same pattern as /assessment/[token]. The
// token, resolved once by getProposalByToken (which already checks
// revoked/expired), is what authorizes this page, not a session. Every
// read goes through the admin client since proposals RLS is staff-only.
// No internal controls anywhere on this page — no edit, no status
// override, no delete.
export default async function PublicProposalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const admin = createAdminClient();

  const proposal = await getProposalByToken(admin, token);
  if (!proposal) notFound();

  let preparedByName: string | null = null;
  if (proposal.prepared_by) {
    const { data } = await admin.from("profiles").select("full_name, email").eq("id", proposal.prepared_by).maybeSingle();
    preparedByName = (data?.full_name as string | undefined) ?? (data?.email as string | undefined) ?? null;
  }

  return (
    <div className="client-report flex flex-1 flex-col">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-[var(--hairline)] bg-[var(--navy)] px-6 py-3">
        <span className="text-[12px] text-[var(--muted)]">Confidential proposal</span>
        <div className="flex items-center gap-4">
          {proposal.status === "sent" ? (
            <a href="#respond" className="text-[12px] text-[var(--gold-light)] hover:underline">
              Jump to Accept / Decline ↓
            </a>
          ) : null}
          <PrintButton>Download PDF</PrintButton>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-6 px-6 py-6">
        <ProposalDocument proposal={proposal} preparedByName={preparedByName} />

        {proposal.status === "sent" ? (
          <div id="respond">
            <ProposalAcceptDeclineWidget token={token} />
          </div>
        ) : proposal.status === "accepted" ? (
          <div className="no-print rounded-[var(--radius-sm)] border border-[var(--hairline)] px-4 py-3 text-center text-[13px] text-[var(--muted)]">
            This proposal has been accepted.
          </div>
        ) : proposal.status === "declined" ? (
          <div className="no-print rounded-[var(--radius-sm)] border border-[var(--hairline)] px-4 py-3 text-center text-[13px] text-[var(--muted)]">
            This proposal has been declined.
          </div>
        ) : null}
      </div>
    </div>
  );
}
