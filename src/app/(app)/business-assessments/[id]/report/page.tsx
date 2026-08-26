import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { getAssessmentById, getAssessmentReport, getBands } from "@/modules/assessments/data";
import { ClientReportView } from "@/modules/assessments/ClientReportView";
import { PrintButton } from "@/shared/ui/PrintButton";

/**
 * The client-facing document — distinct from the internal admin screen
 * at /business-assessments/[id]. No overrides, no Save/Delete, nothing
 * an internal user would need. Full Assessment, completed, only; RLS on
 * the request-scoped client already scopes the read to staff-sees-all /
 * client-sees-own-org, so an unauthorized id resolves to null here the
 * same way the internal page already relies on.
 */
export default async function ClientReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const assessment = await getAssessmentById(supabase, id);
  if (!assessment) notFound();
  if (assessment.assessment_type !== "full" || assessment.status !== "completed") notFound();

  const [report, bands, conductedByResult] = await Promise.all([
    getAssessmentReport(supabase, id),
    getBands(supabase),
    assessment.conducted_by ? supabase.from("profiles").select("full_name").eq("id", assessment.conducted_by).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!report) notFound();

  const preparedByName = (conductedByResult.data as { full_name: string | null } | null)?.full_name ?? "James Vance";

  return (
    <div className="flex flex-1 flex-col">
      <div className="no-print sticky top-0 z-10 flex items-center justify-between border-b border-[var(--hairline)] bg-[var(--navy)] px-6 py-3">
        <Link href={`/business-assessments/${id}`} className="text-[11.5px] uppercase tracking-[0.18em] text-[var(--muted)] hover:text-[var(--cream)]">
          ← Back to internal view
        </Link>
        <PrintButton>Download PDF</PrintButton>
      </div>

      <div className="mx-auto w-full max-w-[860px] px-6 py-6">
        <ClientReportView report={report} bands={bands} preparedByName={preparedByName} />
      </div>
    </div>
  );
}
