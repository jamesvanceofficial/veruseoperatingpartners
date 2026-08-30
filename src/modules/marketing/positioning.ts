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
    title: "The owner is the bottleneck",
    description:
      "Every decision, every exception, every new hire's questions — all of it routes through you. The business can't grow past what you personally can hold in your head.",
  },
  {
    title: "Growth breaks the company",
    description:
      "What worked at half the size doesn't work now. More revenue means more chaos, not more margin, because nothing was built to scale in the first place.",
  },
  {
    title: "Everything runs on memory instead of systems",
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
