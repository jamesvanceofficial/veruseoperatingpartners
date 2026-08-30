// Stage 18 — written honestly, no invented numbers. What was built and
// what changed, not testimonials. quotePlaceholder is a clearly marked
// spot for a real client quote later — never filled with a fabricated one.

export type CaseStudy = {
  slug: string;
  client: string;
  location: string;
  industry: string;
  summary: string;
  situation: string;
  whatWasBuilt: string[];
  whatChanged: string;
  quotePlaceholder: string;
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "rbl-safety",
    client: "RBL Safety",
    location: "Denver, CO",
    industry: "Security Services",
    summary:
      "A security services company running dispatch, scheduling, and payroll by phone call, text, and spreadsheet — moved onto one real platform, with VAs trained to run it day to day.",
    situation:
      "RBL Safety was running dispatch by phone call and text, scheduling by spreadsheet, and payroll by manually reconciling hours after the fact. None of it lived in one place, and none of it could run without the owner personally coordinating it. Every new guard, every schedule change, every payroll cycle went through the same bottleneck: the owner's phone.",
    whatWasBuilt: [
      "A dispatch and scheduling system replacing phone calls and paper/spreadsheet schedules",
      "A payroll process tied to actual shifts worked, not manually reconciled after the fact",
      "Documented processes for dispatch, scheduling, and payroll that a virtual assistant can run without the owner in the loop",
      "VA staffing sourced, trained, and handed over to run the new system day to day",
    ],
    whatChanged:
      "Dispatch and scheduling no longer live in the owner's phone and a patchwork of spreadsheets — they run through one system, on documented processes, operated by VAs rather than requiring the owner's direct involvement in every shift. The processes were documented as part of the build, which is what made handing them to a VA possible in the first place — a system with no documented process behind it isn't something anyone else can run.",
    quotePlaceholder: "[Client quote to be added]",
  },
  {
    slug: "radiant-moments",
    client: "Radiant Moments",
    location: "Local service business",
    industry: "Service",
    summary:
      "A local service business with no real way to generate or close leads — given the website, advertising, lead generation, and sales process it needed to scale past word of mouth.",
    situation:
      "Radiant Moments depended entirely on word of mouth and referrals. There was no website built to actually generate business, no advertising, and no consistent process for following up on the interest that did come in — inquiries came in ad hoc and were handled ad hoc, with no way to know how many were being lost along the way.",
    whatWasBuilt: [
      "A new website built to convert visitors into inquiries, not just describe the business",
      "Paid advertising set up to drive qualified traffic to that website",
      "A lead generation process to capture and follow up on inbound interest instead of losing it",
      "A documented closing process so inquiries convert into booked business consistently",
    ],
    whatChanged:
      "The business went from depending on word of mouth to having a real, repeatable path from a stranger seeing an ad to a closed sale — website, advertising, lead generation, and closing process all working as one system instead of separate, disconnected efforts. The follow-up and closing process is now something a team member can run consistently, not something that only worked when the owner personally handled every inquiry.",
    quotePlaceholder: "[Client quote to be added]",
  },
];
