// Stage 21 — flat-fee add-ons and VA staffing, shown on the client report
// under the subscription as "Available add-ons." Attachable to any
// support tier. VA staffing is deliberately its own thing, not a flat-fee
// add-on — it's ongoing staffing, not a fixed monthly service.

export type FlatFeeAddOn = { name: string; priceLabel: string; description: string };

export const FLAT_FEE_ADD_ONS: FlatFeeAddOn[] = [
  {
    name: "Additional user seats",
    priceLabel: "Per-tier rate",
    description: "Seats beyond what the tier includes, billed monthly at that tier's per-seat rate.",
  },
  {
    name: "Client or partner portal",
    priceLabel: "$400/mo",
    description: "Ongoing hosting, access management, and maintenance for a client- or partner-facing login.",
  },
  {
    name: "Marketing management",
    priceLabel: "$2,000/mo",
    description: "Ongoing, hands-on management of marketing campaigns and channels.",
  },
  {
    name: "SEO management",
    priceLabel: "$1,200/mo",
    description: "Ongoing search engine optimization work to improve visibility and rankings.",
  },
  {
    name: "Social media management",
    priceLabel: "$900/mo",
    description: "Ongoing content creation and posting across social media channels.",
  },
  {
    name: "Bookkeeping",
    priceLabel: "$700/mo",
    description: "Ongoing bookkeeping to keep financial records current and accurate.",
  },
  {
    name: "Additional automation builds",
    priceLabel: "$500 each",
    description: "A new automation beyond the tier's included monthly hours, built and delivered as its own deliverable.",
  },
  {
    name: "Additional development hours",
    priceLabel: "$175/hr",
    description: "Extra development time beyond the tier's included hours, billed hourly.",
  },
];

export const VA_ASSIGNMENT_FEE = 1000;
export const VA_ASSIGNMENT_FEE_LABEL = "$1,000 per VA, one time";
export const VA_ASSIGNMENT_FEE_DESCRIPTION =
  "Covers sourcing and screening candidates, interviewing and selection, training the VA on the client's system and documented processes, and one free replacement per role within 30 days if the person isn't capable of the work.";

export const VA_MINIMUM_HOURS_PER_WEEK = 20;

export type VaRole = { name: string; hourlyRate: number };

export const VA_ROLES: VaRole[] = [
  { name: "General admin / office support", hourlyRate: 10 },
  { name: "Dispatch / scheduling", hourlyRate: 11.5 },
  { name: "Customer service / inbound", hourlyRate: 11.5 },
  { name: "Sales support / outbound", hourlyRate: 13 },
  { name: "Marketing / social media", hourlyRate: 14.5 },
  { name: "Bookkeeping / AP-AR", hourlyRate: 14.5 },
  { name: "Technical / specialized", hourlyRate: 17.5 },
];

/** Plain-language terms shown alongside the VA rate card — how the arrangement actually works, stated honestly. */
export const VA_TERMS = [
  "VERUS sources, screens, and trains the VA on the client's system and documented processes, then hands them over to the client's day-to-day management. VERUS does not supervise them.",
  "VERUS trains the system; the client provides the trade and industry knowledge.",
  "Because the processes were documented during the build, that handoff takes days rather than weeks — and works the same way for the next person.",
  "Compare it honestly: a local hire in these roles typically costs $20-30/hr plus payroll taxes, benefits, and equipment.",
  "VA staffing is available after the build is complete, since the documented processes are what the VA is trained against.",
];
