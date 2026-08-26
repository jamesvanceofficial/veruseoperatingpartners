// Static content for the client-facing report (Stage 15) — written once,
// reused for every client. Specific and plain-English, never generic
// filler; James can edit any of it directly.

/** One paragraph explaining why the 10 categories are weighted the way they are — shown in "How This Was Measured" so the score has credibility instead of just being a number. */
export const WEIGHTING_RATIONALE =
  "These ten categories are weighted by how directly each one determines whether a company can grow without breaking. Operations, Systems, and People carry the most weight because undocumented process, scattered data, and undefined roles are what force an owner to stay personally involved in everything — that's the single biggest thing standing between a small business and a scalable one. Leadership and Sales carry real but secondary weight: they shape direction and revenue, but can't compensate for missing operational and systems foundations. Finance, Technology, and Marketing matter and are weighted accordingly. Vision and Enterprise Readiness carry the least weight day to day — they describe where the business is headed and what it would be worth to someone else, not whether it can function well today.";

type ScoreMeaning = { weak: string; developing: string; strong: string };

/** "What this score means in practice" — tone-aware (categoryScoreTone: red/yellow/green), one for the Category Breakdown section. */
export const CATEGORY_SCORE_MEANING: Record<string, ScoreMeaning> = {
  Operations: {
    weak: "Day-to-day work runs on memory and improvisation rather than a repeatable process — quality and speed both depend on which person happens to be handling it that day.",
    developing: "Some of the core workflow is documented, but it's inconsistent — the business runs, but not the same way twice, and gaps get patched by whoever's paying attention.",
    strong: "The core workflow is documented and repeatable enough that the business keeps functioning even when a specific person is out — a real foundation to build on.",
  },
  Systems: {
    weak: "Customer, scheduling, and financial information is scattered across spreadsheets, notebooks, and memory — nothing lives in one place, so nothing can be trusted as the full picture.",
    developing: "Some information lives in real systems, but key pieces are still manual — someone is re-entering the same data more than once, and something eventually falls through a crack.",
    strong: "The business runs on connected systems that track customers, jobs, and data in one place — information doesn't have to be re-typed or re-found, it's just there.",
  },
  People: {
    weak: "There's no real hiring process, no written job descriptions, and no structured reviews — who does what, and how well, depends on tribal knowledge that leaves when people do.",
    developing: "Some roles and processes are defined, but hiring, onboarding, and reviews are still inconsistent — new hires ramp up slower than they should, and performance conversations happen unevenly.",
    strong: "Roles, hiring, onboarding, and reviews are documented and consistent — the team runs on a real structure, not on who's been here the longest.",
  },
  Leadership: {
    weak: "There's no written vision, no regular leadership rhythm, and no clear decision-making process — the business runs on instinct, and priorities shift with whoever spoke last.",
    developing: "Leadership meets and makes decisions, but not on a consistent structure — direction exists, but it isn't written down or communicated in a way the team can act on independently.",
    strong: "Leadership operates on a real rhythm — a written vision, regular meetings, and a clear decision process the whole team can see and rely on.",
  },
  Sales: {
    weak: "There's no documented sales process — deals close, or don't, based entirely on one person's instincts, and there's no way to teach, scale, or replace that.",
    developing: "A sales process exists but isn't consistently followed or tracked — leads and pipeline live in someone's head more than in a system.",
    strong: "Sales runs on a documented, repeatable process with pipeline tracked in one place — performance can be coached and scaled, not just hoped for.",
  },
  Finance: {
    weak: "Margins aren't tracked, there's no regular financial review, and pricing decisions get made on gut feel — profitable and unprofitable work look identical until it's too late.",
    developing: "Financials get reviewed, but not on a consistent schedule, and margin visibility is incomplete — decisions are directionally informed but not precise.",
    strong: "Financials are reviewed on a real schedule with clear margin visibility — pricing and spending decisions are made on numbers, not gut feel.",
  },
  Technology: {
    weak: "There's no documented technology inventory, no cybersecurity policy, and no real update process — the business is one lost password or one breach away from a very expensive week.",
    developing: "Core technology is in place but not fully documented or secured — the risk is lower than it could be, but there are real gaps in access control and update discipline.",
    strong: "Technology is documented, access is controlled, and updates happen on a schedule — the business isn't carrying unnecessary security or continuity risk.",
  },
  Marketing: {
    weak: "There's no documented marketing plan and no way to track what's actually producing customers — spend is guesswork, and there's no way to do more of what's working.",
    developing: "Some marketing activity happens consistently, but tracking is incomplete — it's hard to say with confidence which efforts are actually paying off.",
    strong: "Marketing runs on a documented plan with real tracking — the business knows what's producing customers and can invest more in what works.",
  },
  Vision: {
    weak: "There's no written long-term plan — the business goes wherever circumstances push it, rather than somewhere deliberately chosen.",
    developing: "Some long-term thinking exists, but it isn't written down or revisited on a schedule — direction is more implicit than actionable.",
    strong: "A written long-term vision exists and gets revisited regularly — growth decisions are made against a plan, not just in reaction to whatever comes up.",
  },
  "Enterprise Readiness": {
    weak: "The business's value lives almost entirely in the owner's head — hard to sell, hard to scale, and one health scare away from serious trouble.",
    developing: "Some of what makes the business valuable is documented, but a buyer or investor would still find the picture incomplete.",
    strong: "The business could largely run, and be evaluated, without the owner in the room — real, transferable value, not just personal effort.",
  },
};

/** "What it typically costs a business of their size" — shown in Your Three Biggest Constraints. */
export const CATEGORY_TYPICAL_COST: Record<string, string> = {
  Operations:
    "Undocumented operations typically cost a business of this size 10-15% of revenue in rework, missed handoffs, and time the owner spends re-explaining things that should already be written down.",
  Systems:
    "Manual, scattered systems typically cost a business this size 5-10 hours a week in duplicate data entry and lost information alone — before counting what falls through the cracks entirely.",
  People:
    "Weak people systems typically show up as turnover 20-30% higher than it needs to be, and every departure costs more than it should — because nothing about the role was ever written down to hand to the next person.",
  Leadership:
    "Weak leadership structure typically costs a growing business months of wasted effort a year — teams executing on outdated or unclear priorities because direction was never actually written down.",
  Sales:
    "An undocumented sales process typically costs a business 15-25% in lost or delayed revenue — leads that go cold, follow-up that doesn't happen, and deals that depend on one person's memory.",
  Finance:
    "Poor financial visibility typically costs a business 3-8 points of margin a year — money left on the table in underpriced work, missed collections, and spending that never gets questioned.",
  Technology:
    "The average small business security incident costs well into six figures once downtime, recovery, and reputational damage are counted — and most start with exactly the kind of gap this category measures.",
  Marketing:
    "Untracked marketing spend typically wastes 20-40% of the budget on efforts that aren't measurably producing customers — money spent without the ability to tell what it bought.",
  Vision:
    "Without a written vision, growth tends to happen by accident rather than by design — opportunities get chased reactively, and the business ends up somewhere nobody actually decided to go.",
  "Enterprise Readiness":
    "Businesses this owner-dependent typically sell for 2-3x less than a comparable business with documented, transferable systems — buyers pay for what will keep running without you.",
};

/** "What fixing it involves" — shown in Your Three Biggest Constraints. */
export const CATEGORY_FIX_INVOLVES: Record<string, string> = {
  Operations:
    "Documenting the core workflows end to end — how work starts, moves, and finishes — then building the checkpoints and checklists that make quality repeatable without you in the room.",
  Systems:
    "Consolidating customer, job, and financial tracking into a small number of connected systems, and automating the handoffs between them so data is entered once.",
  People: "Writing real job descriptions, standing up a repeatable hiring and onboarding process, and putting a regular review cadence in place.",
  Leadership: "Putting a written vision and set of goals in place, establishing a regular leadership meeting cadence, and documenting who actually makes which decisions.",
  Sales:
    "Documenting the sales process from first contact to close, standing up a real pipeline tracking system, and building the follow-up sequences that catch leads before they go cold.",
  Finance: "Standing up a regular financial review rhythm, building real margin visibility by product or service line, and putting a documented pricing process in place.",
  Technology: "Building a documented technology inventory, putting a real cybersecurity and access-control policy in place, and establishing a regular update and patching schedule.",
  Marketing: "Documenting a real marketing plan, standing up tracking that ties spend to actual customers, and building a consistent content and lead-generation cadence.",
  Vision: "Writing a 3-5 year vision for the business, tying annual goals to it, and putting a regular cadence in place to revisit and update it.",
  "Enterprise Readiness":
    "Reducing owner dependency by documenting SOPs for critical functions, building an org structure that doesn't require the owner to make every call, and cleaning up the records a buyer or investor would want to see.",
};

/** What Happens Next — static, since no per-client engagement timeline is tracked yet. */
export const NEXT_STEPS = [
  "Review this report together and confirm the recommended build tier and scope.",
  "Sign the build agreement and kick off the engagement.",
  "VERUS builds the recommended systems, website, and workflows over the build timeline.",
  "Handover — the business goes live on its new systems, and the 90-day stabilization period begins.",
  "After 90 days, the Software, Systems & Support Subscription begins billing at the tier shown in this report, keeping everything running, updated, and supported.",
];

export const VERUS_CONTACT = {
  companyName: "VERUS Operating Company",
  website: "verusoperatingpartners.com",
  cta: "Schedule a call at verusoperatingpartners.com",
};

// ===========================================================
// Scope of Work (Stage 17) — per-category content for the build phase
// generated from THIS client's own bottleneck order (see scopeOfWork.ts).
// ===========================================================

/** Phase name for a category's build phase — e.g. "Operations Build". */
export const CATEGORY_PHASE_NAME: Record<string, string> = {
  Operations: "Operations Build",
  Systems: "Systems Build",
  People: "People Systems Build",
  Leadership: "Leadership Systems Build",
  Sales: "Sales Systems Build",
  Finance: "Finance Systems Build",
  Technology: "Technology & Security Build",
  Marketing: "Marketing Systems Build",
  Vision: "Vision & Strategy Build",
  "Enterprise Readiness": "Enterprise Readiness Build",
};

/** "What we build" — 3-6 concrete deliverables specific to the category. */
export const CATEGORY_BUILD_DELIVERABLES: Record<string, string[]> = {
  Operations: [
    "Workflow mapping across core operations",
    "Documented, step-by-step core processes",
    "Quality checkpoints built into the workflow",
    "The system those processes run inside",
  ],
  Systems: [
    "Centralized customer and job tracking system",
    "Connected data flow between core tools — no duplicate entry",
    "Automated alerts for what needs attention",
    "Documented backup and data-recovery process",
    "Single system of record for financials",
  ],
  People: ["Written job descriptions for every role", "A repeatable hiring pipeline", "A structured onboarding track for new hires", "A regular performance review cadence"],
  Leadership: [
    "Written vision and core values",
    "A regular leadership meeting cadence with a standing agenda",
    "A documented decision-making process",
    "A leadership scorecard to track what matters",
    "A communication process for company updates",
  ],
  Sales: [
    "Documented sales process, first contact to close",
    "Pipeline tracked in one system",
    "Standard pricing and proposal templates",
    "Lead follow-up sequences",
    "A sales-to-fulfillment handoff process",
  ],
  Finance: [
    "Monthly P&L review rhythm",
    "Margin visibility by product or service line",
    "Documented invoicing and collections process",
    "A working budget tracked against actuals",
    "A documented pricing process",
  ],
  Technology: [
    "Documented technology and software inventory",
    "Cybersecurity and access-control policy",
    "Employee access provisioning and deprovisioning process",
    "Update and patching schedule",
    "Data backup and disaster-recovery plan",
  ],
  Marketing: [
    "Documented marketing plan",
    "Lead-source tracking tied to actual customers",
    "Consistent brand applied across channels",
    "A content and posting calendar",
    "A follow-up sequence for leads who aren't ready to buy",
  ],
  Vision: [
    "A written 3-5 year vision",
    "Annual goals tied to that vision",
    "A plan for what the business looks like without the owner day to day",
    "A regular cadence to revisit and update the plan",
  ],
  "Enterprise Readiness": [
    "Documented SOPs for critical functions",
    "An org structure that doesn't route every decision through the owner",
    "Clean, organized records a buyer or investor could review",
    "A documented plan to reduce owner dependency",
  ],
};

/** "What you get at the end of this phase" — the tangible artifact. */
export const CATEGORY_PHASE_ARTIFACT: Record<string, string> = {
  Operations: "A documented, repeatable operating system your team can run without you re-explaining it.",
  Systems: "One connected system of record — no more scattered spreadsheets.",
  People: "A real hiring, onboarding, and review system anyone on your team could run.",
  Leadership: "A leadership rhythm and a written vision the whole team can see.",
  Sales: "A sales process that can be taught, tracked, and scaled beyond one person.",
  Finance: "Real margin visibility and a financial review you can trust.",
  Technology: "A documented, secured technology environment.",
  Marketing: "A marketing system that shows what's actually producing customers.",
  Vision: "A written long-term plan the business is actually building toward.",
  "Enterprise Readiness": "A business that's easier to sell, scale, and step away from.",
};

/** "What we need from you" — their side, so the timeline is honest about dependencies. */
export const CATEGORY_PHASE_DEPENDENCY: Record<string, string> = {
  Operations: "Time with your team to map how work actually happens today, and a decision-maker to approve the final process.",
  Systems: "Access to your current tools and data, and a point of contact who knows where everything lives today.",
  People: "Copies of any existing job descriptions or policies, and time with whoever currently handles hiring.",
  Leadership: "Time with your leadership team for working sessions, and honesty about how decisions actually get made today.",
  Sales: "Access to your current pipeline or CRM (or lack of one), and time with whoever's closing deals today.",
  Finance: "Access to your financial records and your bookkeeper or accountant's cooperation.",
  Technology: "A list of the tools and logins currently in use, and access to set up policies and permissions.",
  Marketing: "Access to your current marketing accounts and brand assets, and a decision-maker on messaging.",
  Vision: "Time with ownership and leadership for a strategic planning session.",
  "Enterprise Readiness": "Access to existing records and documentation, and honesty about what currently depends on you personally.",
};
