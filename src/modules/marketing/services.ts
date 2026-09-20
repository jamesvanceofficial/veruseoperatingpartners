// Stage 38 — the Services page: the ongoing work VERUS staffs and runs
// inside a built system. Every service NAME that also exists in the client
// report's add-on / VA config (assessments/supportAddOns.ts) is pulled from
// there by reference, never retyped, so this page and the report can't
// drift apart. Prices from that config are deliberately never read here —
// the Services page, like Builds and Systems & Support, shows no price
// list at all.

import { FLAT_FEE_ADD_ONS, VA_ROLES, VA_MINIMUM_HOURS_PER_WEEK } from "@/modules/assessments/supportAddOns";

export type ServiceTiming = "after_build" | "any_time";

export type ServiceArea = {
  slug: string;
  index: string;
  /** Short name — used in the nav-style Home block and as the section heading. */
  title: string;
  /** One-line summary for the Home block and each section's lead. */
  lead: string;
  /** The real detail — what the service actually covers, month to month. */
  includes: string[];
  /** Optional longer explanation rendered under the includes list. */
  detail?: string[];
  /** Names pulled from the client report's add-on / VA config, shown as chips. */
  configNames: string[];
  /** Whether the service depends on a completed build (documented processes) or can start any time. Undefined = not stated. */
  timing?: ServiceTiming;
};

/**
 * Drift guard: resolves an add-on by its exact configured name and throws
 * if it no longer exists. SERVICE_AREAS is built at module load, so a
 * renamed add-on throws the moment the Services page (or the Home block)
 * is rendered — a loud failure, never a chip silently dropped from the
 * page while the client report still shows the renamed one.
 */
function addOnName(name: string): string {
  const match = FLAT_FEE_ADD_ONS.find((a) => a.name === name);
  if (!match) throw new Error(`services.ts: add-on "${name}" is not in FLAT_FEE_ADD_ONS — the config was renamed, update the reference.`);
  return match.name;
}

function vaRoleName(name: string): string {
  const match = VA_ROLES.find((r) => r.name === name);
  if (!match) throw new Error(`services.ts: VA role "${name}" is not in VA_ROLES — the config was renamed, update the reference.`);
  return match.name;
}

export const VA_MIN_HOURS_LABEL = `${VA_MINIMUM_HOURS_PER_WEEK} hours per week minimum`;

export const SERVICE_AREAS: ServiceArea[] = [
  {
    slug: "marketing",
    index: "01",
    title: "Marketing, SEO and Paid Advertising",
    lead: "Managed marketing that runs every month, not a one-off campaign.",
    includes: [
      "Search visibility and local search presence",
      "Google Business Profile and reviews",
      "Paid advertising set up and managed",
      "Social media managed",
      "Landing pages and lead capture wired into the system we built",
      "Reporting on what actually produced customers",
    ],
    configNames: [addOnName("Marketing management"), addOnName("SEO management"), addOnName("Social media management")],
    timing: "any_time",
  },
  {
    slug: "personal-assistants",
    index: "02",
    title: "Personal Assistants",
    lead: "A dedicated assistant for the owner.",
    includes: [
      "Calendar and inbox",
      "Travel and scheduling",
      "Follow-ups",
      "Chasing the things that fall through",
      "Keeping the owner's own day organized, so their time goes to the business instead of admin",
    ],
    configNames: [],
  },
  {
    slug: "administration",
    index: "03",
    title: "Administration",
    lead: "Back-office work run inside the system.",
    includes: [
      "Invoicing and billing",
      "Accounts payable and receivable",
      "Data entry",
      "Document handling",
      "Reporting",
      "The recurring paperwork every business generates and nobody wants to do",
    ],
    configNames: [addOnName("Bookkeeping"), vaRoleName("General admin / office support"), vaRoleName("Bookkeeping / AP-AR")],
    timing: "after_build",
  },
  {
    slug: "virtual-assistance",
    index: "04",
    title: "Virtual Assistance",
    lead: "Trained staff placed into operational roles inside the system we built.",
    includes: ["Dispatch and scheduling", "Customer service and inbound calls", "Sales support", "Bookkeeping", "Technical support"],
    detail: [
      "VERUS sources, screens and trains them on the system and the documented processes, then hands them over to the client's day-to-day management. VERUS trains the system; the client provides the trade knowledge.",
      "Because the processes were documented during the build, that handoff takes days rather than weeks — and works the same way for the next person.",
    ],
    configNames: VA_ROLES.map((r) => r.name),
    timing: "after_build",
  },
];

/** Why these work better through VERUS than hired separately. */
export const WHY_THROUGH_VERUS = {
  eyebrow: "Why Through VERUS",
  title: "Nothing Lives Outside the System",
  summary:
    "The people and the marketing run inside the system we built, against processes we documented, so there is no ramp-up guessing and nothing lives outside the system.",
  points: [
    {
      title: "Inside the System We Built",
      description:
        "Staff and campaigns work in the same platform the business already runs on — the CRM, the schedule, the dashboards. Not a separate tool nobody reconciles.",
    },
    {
      title: "Against Processes We Documented",
      description:
        "The SOPs written during the build are the training material. A new person follows the documented process from day one instead of reconstructing it by asking around.",
    },
    {
      title: "No Ramp-Up Guessing",
      description:
        "Because the system and the process already exist, onboarding is days, not weeks — and it works the same way for the next person, and the one after that.",
    },
  ],
} as const;

/** Stated plainly: which services depend on a completed build, and which don't. */
export const SERVICE_TIMING = [
  {
    label: "After a Completed Build",
    services: "Virtual assistance and administration staffing",
    description:
      "These follow a completed build, since the documented processes are what staff get trained against. There has to be a system and a process to place someone into.",
  },
  {
    label: "Any Time",
    services: "Marketing services",
    description: "Marketing, SEO and paid advertising can start at any time — before, during, or after a build.",
  },
] as const;

export const SERVICES_PRICING_NOTE =
  "Pricing is confirmed on the call or in the assessment — scoped to the roles, hours, and channels the business actually needs, never a flat list.";
