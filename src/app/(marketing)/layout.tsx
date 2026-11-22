import { MarketingHeader } from "@/modules/marketing/MarketingHeader";
import { MarketingFooter } from "@/modules/marketing/MarketingFooter";

/**
 * The public VERUS website. Every page here is unauthenticated (see
 * src/proxy.ts's PUBLIC_PATHS) and shares this header/footer. `.mkt`
 * (globals.css) applies the public-site palette/type by redefining the
 * shared design tokens inside this subtree only — the logged-in app never
 * renders inside it, so it keeps its own look.
 */
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mkt flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
