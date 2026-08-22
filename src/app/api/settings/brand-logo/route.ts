import { NextResponse } from "next/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import { createAdminClient } from "@/shared/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/svg+xml", "image/webp"]);

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Your session expired — reload and try again." }, { status: 401 });
  }

  const profileResult = await getMyProfile(user.id);
  if (profileResult.status !== "ok") {
    return NextResponse.json(
      { error: "Your profile hasn't been set up yet — the database migrations may not have been run." },
      { status: 409 }
    );
  }
  if (!isVerusStaff(profileResult.profile.role)) {
    return NextResponse.json({ error: "Only VERUS admins/staff can update the brand logo." }, { status: 403 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use PNG, JPEG, SVG, or WebP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File is too large (5MB max)." }, { status: 400 });
  }

  const admin = createAdminClient();
  const extension = file.name.split(".").pop() || "png";
  const path = `logo-${Date.now()}.${extension}`;

  const { error: uploadError } = await admin.storage.from("brand").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) {
    return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 });
  }

  const { data: publicUrlData } = admin.storage.from("brand").getPublicUrl(path);
  const logoUrl = publicUrlData.publicUrl;

  const { error: updateError } = await admin
    .from("app_settings")
    .update({ logo_url: logoUrl })
    .eq("id", 1);
  if (updateError) {
    return NextResponse.json({ error: `Uploaded, but failed to save the setting: ${updateError.message}` }, { status: 500 });
  }

  const { data: confirmed, error: confirmError } = await admin
    .from("app_settings")
    .select("logo_url")
    .eq("id", 1)
    .single();
  if (confirmError || confirmed?.logo_url !== logoUrl) {
    return NextResponse.json({ error: "Save could not be confirmed — reload and try again." }, { status: 500 });
  }

  return NextResponse.json({ data: { logo_url: logoUrl } });
}
