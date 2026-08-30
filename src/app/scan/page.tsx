import { BrandMark } from "@/shared/ui/BrandMark";
import { createAdminClient } from "@/shared/supabase/admin";
import { getQuestionsForType } from "@/modules/assessments/data";
import { QuickScanWizard } from "@/modules/assessments/QuickScanWizard";
import { PhotoSection } from "@/modules/marketing/PhotoSection";
import { FadeUp } from "@/modules/marketing/animation/FadeUp";
import { StatBand } from "@/modules/marketing/StatBand";

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

      <PhotoSection src="/images/photography/checklist.webp" className="flex flex-1 flex-col justify-center">
        <div className="page-container flex flex-col gap-10 py-10">
          <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 text-center">
            <FadeUp>
              <span className="section-label text-[var(--gold-light)]">Free Quick Scan</span>
            </FadeUp>
            <FadeUp delayMs={60}>
              <h1 className="text-[26px] font-semibold leading-tight text-[var(--cream)] sm:text-[32px]">
                Where does your business actually stand?
              </h1>
            </FadeUp>
            <FadeUp delayMs={120}>
              <p className="text-[13.5px] leading-relaxed text-[var(--muted)]">
                20 questions, four minutes, one honest score. Pick the answer that&apos;s true today — nothing in between.
              </p>
            </FadeUp>
          </div>

          <FadeUp delayMs={180}>
            <div className="mx-auto w-full max-w-2xl">
              <StatBand
                stats={[
                  { value: 10, label: "Categories" },
                  { value: 20, label: "Questions" },
                  { value: 4, label: "Minutes" },
                  { value: 100, label: "Point Scale" },
                ]}
              />
            </div>
          </FadeUp>

          <FadeUp delayMs={220}>
            <div className="mx-auto w-full max-w-xl">
              <QuickScanWizard questions={questions} />
            </div>
          </FadeUp>
        </div>
      </PhotoSection>
    </div>
  );
}
