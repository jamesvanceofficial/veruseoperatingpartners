import { BrandMark } from "@/shared/ui/BrandMark";
import { createAdminClient } from "@/shared/supabase/admin";
import { getQuestionsForType } from "@/modules/assessments/data";
import { QuickScanWizard } from "@/modules/assessments/QuickScanWizard";

// Public, unauthenticated — reads go through the admin client since RLS
// on assessment_questions/categories is scoped `to authenticated` only.
export default async function ScanPage() {
  const admin = createAdminClient();
  const questions = await getQuestionsForType(admin, "quick_scan");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <BrandMark size="md" />
        <a href="/login" className="text-[12.5px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]">
          Client / Team Login
        </a>
      </header>

      <main className="page-container flex flex-1 flex-col gap-6 pb-16">
        <div>
          <span className="section-label">Free Quick Scan</span>
          <h1 className="mt-1 text-[22px] font-semibold text-[var(--cream)]">Where does your business actually stand?</h1>
          <p className="max-w-xl text-[13px] text-[var(--muted)]">
            20 questions, four minutes, one honest score. Pick the answer that&apos;s true today — nothing in between.
          </p>
        </div>

        <QuickScanWizard questions={questions} />
      </main>
    </div>
  );
}
