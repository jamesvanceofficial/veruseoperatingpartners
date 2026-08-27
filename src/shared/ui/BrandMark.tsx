import { createClient as createServerSupabase } from "@/shared/supabase/server";
import { cn } from "./cn";

async function getLogoUrl(): Promise<string | null> {
  try {
    const supabase = await createServerSupabase();
    const { data } = await supabase.from("app_settings").select("logo_url").eq("id", 1).maybeSingle();
    return data?.logo_url ?? null;
  } catch {
    return null;
  }
}

/** "cover" is for a document cover page (the client report) — substantially larger than "lg", which every in-app header already uses. */
export async function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" | "cover" }) {
  const logoUrl = await getLogoUrl();
  const dims = size === "cover" ? "h-20" : size === "lg" ? "h-10" : size === "sm" ? "h-6" : "h-8";

  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt="VERUS" className={cn(dims, "w-auto object-contain")} />;
  }

  return (
    <span
      className={cn(
        "font-semibold tracking-[0.18em] text-[var(--gold-light)]",
        size === "cover" ? "text-[34px]" : size === "lg" ? "text-[20px]" : size === "sm" ? "text-[12px]" : "text-[15px]"
      )}
    >
      VERUS
    </span>
  );
}
