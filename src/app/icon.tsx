import { ImageResponse } from "next/og";
import { createAdminClient } from "@/shared/supabase/admin";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/**
 * Dynamic favicon — reads the same app_settings.logo_url every BrandMark
 * render already reads, so the browser tab icon matches the uploaded brand
 * logo everywhere else in the app. Falls back to a gold "V" monogram when
 * no logo has been uploaded, never a broken image. Uses the admin client
 * (not the cookie-scoped one BrandMark uses) since a favicon request has
 * no guaranteed request/cookie context; app_settings is publicly readable
 * regardless.
 */
export default async function Icon() {
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
          alignItems: "center",
          justifyContent: "center",
          background: "#071526",
          borderRadius: 12,
        }}
      >
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" width={48} height={48} style={{ objectFit: "contain" }} />
        ) : (
          <span style={{ fontSize: 34, fontWeight: 700, color: "#f1d27a", fontFamily: "sans-serif" }}>V</span>
        )}
      </div>
    ),
    { ...size }
  );
}
