import { NextResponse } from "next/server";
import { getSessionUser, getMyProfile } from "@/shared/session";
import { isVerusStaff } from "@/shared/roles";
import type { Profile } from "@/shared/roles";

/**
 * The standing pattern for every mutation route: get session → look up
 * profiles.role → reject before doing anything with the admin client. See
 * /api/settings/brand-logo/route.ts, the original example this factors out.
 */
export async function requireStaff(): Promise<{ ok: true; userId: string } | { ok: false; response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Your session expired — reload and try again." }, { status: 401 }) };
  }

  const profileResult = await getMyProfile(user.id);
  if (profileResult.status !== "ok") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Your profile hasn't been set up yet — the database migrations may not have been run." },
        { status: 409 }
      ),
    };
  }

  if (!isVerusStaff(profileResult.profile.role)) {
    return { ok: false, response: NextResponse.json({ error: "Only VERUS admins/staff can do this." }, { status: 403 }) };
  }

  return { ok: true, userId: user.id };
}

/**
 * For routes any authenticated user (staff or client) may hit — support
 * tickets are the first case: a client submits/replies to their own
 * org's ticket, staff does the same for any org. RLS still does the real
 * org-scoping on every write; this just confirms there's a real session
 * and profile before touching the admin client, and hands back the
 * profile so the route can tell which case it's in.
 */
export async function requireSession(): Promise<{ ok: true; userId: string; profile: Profile } | { ok: false; response: NextResponse }> {
  const user = await getSessionUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: "Your session expired — reload and try again." }, { status: 401 }) };
  }

  const profileResult = await getMyProfile(user.id);
  if (profileResult.status !== "ok") {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Your profile hasn't been set up yet — the database migrations may not have been run." },
        { status: 409 }
      ),
    };
  }

  return { ok: true, userId: user.id, profile: profileResult.profile };
}
