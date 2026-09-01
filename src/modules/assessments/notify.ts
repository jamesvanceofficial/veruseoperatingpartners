import { Resend } from "resend";

/**
 * Quick Scan completion email — same Resend infrastructure and env vars
 * (RESEND_API_KEY/LEAD_NOTIFICATION_FROM/LEAD_NOTIFICATION_TO) as
 * marketing/notify.ts's notifyNewLead() and support/notify.ts. Never
 * blocks or fails the scan submission: the assessment is already saved
 * by the time this runs, so a missing key or a Resend outage degrades to
 * "no email sent," never a lost scan or a 500 to the visitor.
 */
export async function notifyQuickScanCompleted(input: {
  companyName: string;
  fullName: string;
  email: string;
  phone: string;
  enterpriseScore: number;
  bandLabel: string | null;
  topBottleneckCategory: string | null;
  assessmentUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  const to = process.env.LEAD_NOTIFICATION_TO;
  if (!apiKey || !from || !to) return;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: `New Quick Scan: ${input.companyName} — ${input.enterpriseScore}/100`,
      text: [
        `A visitor completed the free Quick Scan on the VERUS website.`,
        ``,
        `Name: ${input.fullName}`,
        `Email: ${input.email}`,
        `Phone: ${input.phone || "—"}`,
        `Company: ${input.companyName}`,
        ``,
        `Enterprise score: ${input.enterpriseScore}/100`,
        `Band: ${input.bandLabel ?? "—"}`,
        `Top bottleneck: ${input.topBottleneckCategory ?? "—"}`,
        ``,
        `View in COMPASS: ${input.assessmentUrl}`,
      ].join("\n"),
    });
    if (error) console.error("notifyQuickScanCompleted: Resend rejected the send", error);
  } catch (err) {
    console.error("notifyQuickScanCompleted: failed to send via Resend", err);
  }
}
