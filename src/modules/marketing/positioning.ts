// Stage 18 — locked positioning language for the public site. Held here,
// word for word, so it's never retyped slightly differently across What
// We Do / About / Home. Do not rephrase — reproduce exactly.

export const POSITIONING = {
  notConsulting:
    "VERUS is not a consulting or coaching firm. We do not run your meetings or hold your people accountable.",
  approach:
    "We diagnose, we build alongside the client worst bottleneck first, and we stay embedded running it.",
  systemsAndProcesses: "Systems and processes, always both.",
  whoWeServe:
    "We serve founder-led businesses roughly $1M-$25M in revenue. Industry agnostic — trades, construction, real estate, service, industrial, capital management.",
  delivery: "Delivered remotely, nationwide.",
} as const;

export const HOW_IT_WORKS_STEPS = [
  {
    step: "01",
    title: "Free Scan",
    description: "A short, no-cost diagnostic that flags where your business is likely bottlenecked — done in minutes, at /scan.",
  },
  {
    step: "02",
    title: "Full Assessment",
    description: "A $2,500 deep diagnostic across ten categories of the business, ranked by what's actually costing you the most.",
  },
  {
    step: "03",
    title: "Build",
    description: "We build the systems and processes to fix your worst bottleneck first — websites, software, SOPs, dashboards, automations, documentation.",
  },
  {
    step: "04",
    title: "Ongoing Support",
    description: "We stay embedded, running what we built, so it keeps working after the build is done.",
  },
] as const;

export const PROBLEM_BLOCKS = [
  {
    title: "The Owner Is the Bottleneck",
    description:
      "Every decision, every exception, every new hire's questions — all of it routes through you. The business can't grow past what you personally can hold in your head.",
  },
  {
    title: "Growth Breaks the Company",
    description:
      "What worked at half the size doesn't work now. More revenue means more chaos, not more margin, because nothing was built to scale in the first place.",
  },
  {
    title: "Everything Runs on Memory Instead of Systems",
    description:
      "Pricing, process, who-does-what — it all lives in someone's head, not in a system anyone else can run. When that person is out, things stop.",
  },
] as const;

export const WHAT_VERUS_BUILDS = [
  "Websites",
  "Software",
  "SOPs",
  "Dashboards",
  "Automations",
  "Documentation",
] as const;

export const WHO_THIS_IS_FOR = [
  "Founder-led businesses roughly $1M-$25M in revenue",
  "Owners who are the bottleneck and know it",
  "Businesses ready to build real systems, not just talk about them",
  "Any industry — trades, construction, real estate, service, industrial, capital management",
] as const;

export const WHO_THIS_IS_NOT_FOR = [
  "Pre-revenue startups still finding product-market fit",
  "Businesses looking for a consultant to advise from the sidelines",
  "Anyone who wants meetings run and people held accountable by someone else",
  "Businesses not willing to let VERUS actually build and run the system, not just recommend one",
] as const;

export const FAQ_ITEMS = [
  {
    question: "What does it cost?",
    answer:
      "The Full Business Assessment is $2,500. Build packages range from Foundation to Enterprise, scoped and priced from your own assessment results — never a generic price list. Ongoing support is a monthly subscription bundled with every build.",
  },
  {
    question: "How long does a build take?",
    answer:
      "Foundation builds run 4-6 weeks, Growth 6-9 weeks, Enterprise 10-14 weeks — the exact timeline comes from your assessment's scope of work, phased by your own ranked bottlenecks.",
  },
  {
    question: "Do you work with my industry?",
    answer:
      "We're industry agnostic — trades, construction, real estate, service, industrial, capital management. The diagnostic and build approach is the same regardless of industry; what gets built is specific to your business.",
  },
  {
    question: "Do I own what you build?",
    answer: "Yes. The systems, software, and documentation built for your business are yours.",
  },
  {
    question: "What happens after handover?",
    answer:
      "The build price covers a 90-day stabilization period. After that, an ongoing Software, Systems & Support subscription keeps everything running, current, and used — you're never handed a system and left on your own.",
  },
  {
    question: "What if I already have software?",
    answer:
      "The assessment accounts for what you already have. Sometimes the right build connects and fixes what exists rather than replacing it — the point is fixing the actual bottleneck, not selling a rebuild you don't need.",
  },
] as const;
