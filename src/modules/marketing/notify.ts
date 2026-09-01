import { Resend } from "resend";
import type { ContactInquiryInput } from "./data";

/**
 * Stage 18 requirement 6's "notify me" — email via Resend. Never blocks
 * or fails the form submission: the lead is already saved to the CRM by
 * the time this runs (that's the durable outcome), so a missing API key
 * or a Resend outage should never lose or error out a real lead. Degrades
 * silently (no email sent) if RESEND_API_KEY/LEAD_NOTIFICATION_FROM/
 * LEAD_NOTIFICATION_TO aren't set yet — same "app works without every
 * optional integration configured" convention as everywhere else.
 */
export async function notifyNewLead(input: ContactInquiryInput, orgUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  const to = process.env.LEAD_NOTIFICATION_TO;
  if (!apiKey || !from || !to) return;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `New website inquiry: ${input.companyName}`,
      text: [
        `New lead from the VERUS website contact form.`,
        ``,
        `Name: ${input.fullName}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || "—"}`,
        `Company: ${input.companyName}`,
        `Website: ${input.website || "—"}`,
        `Industry: ${input.industry || "—"}`,
        `Revenue range: ${input.revenueRange || "—"}`,
        `Employee count: ${input.employeeCount ?? "—"}`,
        `Timeline: ${input.timeline || "—"}`,
        ``,
        `Biggest business problem:`,
        input.biggestProblem || "—",
        ``,
        `What they want built:`,
        input.whatTheyWantBuilt || "—",
        ``,
        `View in COMPASS: ${orgUrl}`,
      ].join("\n"),
    });
    if (error) console.error("notifyNewLead: Resend rejected the send", error);
  } catch (err) {
    // Logged, not thrown — see the doc comment above.
    console.error("notifyNewLead: failed to send via Resend", err);
  }
}
