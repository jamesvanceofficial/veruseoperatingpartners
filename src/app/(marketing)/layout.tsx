import { MarketingHeader } from "@/modules/marketing/MarketingHeader";
import { MarketingFooter } from "@/modules/marketing/MarketingFooter";
import { BrandMark } from "@/shared/ui/BrandMark";

/**
 * Stage 18 — the public VERUS website. Every page here is unauthenticated
 * (see src/proxy.ts's PUBLIC_PATHS) and shares this header/footer. Distinct
 * from /scan and /assessment/[token], which deliberately keep their own
 * minimal, distraction-free chrome for the assessment flow itself.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader brand={<BrandMark size="md" />} />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
