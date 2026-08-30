export const TICKET_STATUSES = ["new", "open", "waiting_on_client", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const TICKET_PRIORITIES = ["low", "medium", "high", "urgent"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export type SupportTicket = {
  id: string;
  org_id: string;
  subscription_id: string | null;
  subject: string;
  description: string | null;
  priority: TicketPriority;
  status: TicketStatus;
  opened_by: string | null;
  assigned_to: string | null;
  opened_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  response_due_at: string | null;
  first_responded_at: string | null;
  updated_at: string;
};

export type TicketReply = {
  id: string;
  ticket_id: string;
  author: string | null;
  authorName: string | null;
  body: string;
  is_internal: boolean;
  created_at: string;
};

export type TicketListRow = {
  id: string;
  orgId: string;
  orgName: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  assignedTo: string | null;
  assignedToName: string | null;
  openedAt: string;
  responseDueAt: string | null;
  firstRespondedAt: string | null;
};

export type TicketDetail = {
  ticket: SupportTicket;
  orgName: string;
  subscriptionPlanName: string | null;
  openedByName: string | null;
  assignedToName: string | null;
  replies: TicketReply[];
};
