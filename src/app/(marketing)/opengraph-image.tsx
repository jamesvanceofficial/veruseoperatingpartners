import { ImageResponse } from "next/og";
import { createAdminClient } from "@/shared/supabase/admin";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Stage 18 — one shared branded OG image for every marketing page (Next's file convention inherits this across the whole (marketing) segment unless a page defines its own). Generated, not a static asset, so it never drifts from the locked palette in globals.css. Stage 27: shows the real uploaded logo above the wordmark when one exists, same app_settings.logo_url every BrandMark render reads. */
export default async function OpengraphImage() {
  const admin = createAdminClient();
  const { data } = await admin.from("app_settings").select("logo_url").eq("id", 1).maybeSingle();
  const logoUrl = data?.logo_url ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0d2238 0%, #071526 55%, #02060d 100%)",
          color: "#f7f5ef",
          fontFamily: "sans-serif",
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" height={56} style={{ objectFit: "contain", marginBottom: 28 }} />
        ) : (
          <div
            style={{
              fontSize: 20,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#f1d27a",
              marginBottom: 28,
            }}
          >
            VERUS Operating Company
          </div>
        )}
        <div
          style={{
            fontSize: 60,
            fontWeight: 600,
            textAlign: "center",
            maxWidth: 920,
            lineHeight: 1.15,
            color: "#f7f5ef",
          }}
        >
          From Founder-Led Chaos to System-Driven Growth.
        </div>
        <div
          style={{
            marginTop: 36,
            width: 120,
            height: 2,
            background: "#d4af37",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
