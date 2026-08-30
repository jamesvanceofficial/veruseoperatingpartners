import { Resend } from "resend";

/**
 * Support-ticket email notifications — same Resend infrastructure and env
 * vars (RESEND_API_KEY/LEAD_NOTIFICATION_FROM/LEAD_NOTIFICATION_TO) as
 * marketing/notify.ts's notifyNewLead(). Never blocks or fails the ticket
 * save: both functions log and swallow any error, exactly like the
 * existing lead-notification convention.
 */
export async function notifyNewSupportTicket(input: { orgName: string; subject: string; priority: string; description: string | null; ticketUrl: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  const to = process.env.LEAD_NOTIFICATION_TO;
  if (!apiKey || !from || !to) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      subject: `New support ticket: ${input.orgName} — ${input.subject}`,
      text: [
        `A new support ticket was submitted.`,
        ``,
        `Organization: ${input.orgName}`,
        `Priority: ${input.priority}`,
        `Subject: ${input.subject}`,
        ``,
        input.description || "(no description)",
        ``,
        `View it: ${input.ticketUrl}`,
      ].join("\n"),
    });
  } catch (err) {
    console.error("notifyNewSupportTicket: failed to send via Resend", err);
  }
}

export async function notifyClientOfReply(input: { clientEmail: string; orgName: string; subject: string; replyBody: string; ticketUrl: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_NOTIFICATION_FROM;
  if (!apiKey || !from || !input.clientEmail) return;

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to: input.clientEmail,
      subject: `New reply on your support ticket: ${input.subject}`,
      text: [`There's a new reply on your support ticket for ${input.orgName}.`, ``, input.replyBody, ``, `View it: ${input.ticketUrl}`].join("\n"),
    });
  } catch (err) {
    console.error("notifyClientOfReply: failed to send via Resend", err);
  }
}
