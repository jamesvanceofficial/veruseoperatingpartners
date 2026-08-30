import type { SupabaseClient } from "@supabase/supabase-js";

export type ContactInquiryInput = {
  fullName: string;
  email: string;
  phone: string;
  companyName: string;
  website: string;
  industry: string;
  revenueRange: string;
  employeeCount: number | null;
  biggestProblem: string;
  whatTheyWantBuilt: string;
  timeline: string;
};

/**
 * The funnel entry (Stage 18 requirement 6) — every field maps onto an
 * existing table/column, no schema change needed. Same admin-client
 * pattern as submitQuickScan(): this runs from an unauthenticated public
 * page, and every write-RLS policy on these tables is staff-only, so the
 * request-scoped client would have zero access regardless.
 */
export async function submitContactInquiry(admin: SupabaseClient, input: ContactInquiryInput): Promise<{ organizationId: string }> {
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({
      name: input.companyName,
      type: "prospect",
      status: "active",
      industry: input.industry || null,
      website: input.website || null,
      employee_count_estimate: input.employeeCount,
      source: "website",
      notes: input.revenueRange ? `Revenue range (self-reported via Contact form): ${input.revenueRange}` : null,
    })
    .select("id")
    .single();
  if (orgError) throw orgError;

  const { data: contact, error: contactError } = await admin
    .from("contacts")
    .insert({
      org_id: org.id,
      full_name: input.fullName,
      email: input.email || null,
      phone: input.phone || null,
      contact_role: "owner",
      is_primary: true,
    })
    .select("id")
    .single();
  if (contactError) throw contactError;

  const { error: opportunityError } = await admin.from("opportunities").insert({
    org_id: org.id,
    primary_contact_id: contact.id,
    name: `${input.companyName} — Website Inquiry`,
    stage: "lead",
    source: "website",
    pain_points: input.biggestProblem || null,
    business_goals: input.whatTheyWantBuilt || null,
    notes: input.timeline ? `Timeline: ${input.timeline}` : null,
    next_action: "Follow up on website inquiry",
  });
  if (opportunityError) throw opportunityError;

  return { organizationId: org.id as string };
}
