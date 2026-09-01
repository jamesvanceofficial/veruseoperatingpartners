import { NextResponse } from "next/server";
import { createAdminClient } from "@/shared/supabase/admin";
import { submitContactInquiry } from "@/modules/marketing/data";
import { notifyNewLead } from "@/modules/marketing/notify";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  const companyName = typeof body?.companyName === "string" ? body.companyName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!fullName || !companyName) {
    return NextResponse.json({ error: "Name and company name are required." }, { status: 400 });
  }
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }

  const employeeCountRaw = body?.employeeCount;
  const employeeCount =
    employeeCountRaw === undefined || employeeCountRaw === null || employeeCountRaw === "" ? null : Number(employeeCountRaw);

  const input = {
    fullName,
    email,
    phone: typeof body?.phone === "string" ? body.phone.trim() : "",
    companyName,
    website: typeof body?.website === "string" ? body.website.trim() : "",
    industry: typeof body?.industry === "string" ? body.industry.trim() : "",
    revenueRange: typeof body?.revenueRange === "string" ? body.revenueRange.trim() : "",
    employeeCount: Number.isFinite(employeeCount) ? employeeCount : null,
    biggestProblem: typeof body?.biggestProblem === "string" ? body.biggestProblem.trim() : "",
    whatTheyWantBuilt: typeof body?.whatTheyWantBuilt === "string" ? body.whatTheyWantBuilt.trim() : "",
    timeline: typeof body?.timeline === "string" ? body.timeline.trim() : "",
  };

  const admin = createAdminClient();
  try {
    const result = await submitContactInquiry(admin, input);
    const origin = new URL(request.url).origin;
    await notifyNewLead(input, `${origin}/organizations/${result.organizationId}`);
    return NextResponse.json({ data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong submitting the form.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
