/** The six platforms on the homepage's "What we've built" rows — copy as supplied, word for word. */
export type Platform = {
  slug: string;
  name: string;
  status: string;
  image: string;
  alt: string;
  why: string;
  built: string;
  does: string;
};

export const PLATFORMS: Platform[] = [
  {
    slug: "w2d-leadflow",
    name: "W2D LeadFlow",
    status: "Live",
    image: "/images/platforms/w2d-leadflow.jpg",
    alt: "W2D LeadFlow command center showing the sales pipeline, the job schedule and open tickets on one screen",
    why: "Work was scheduled in one place, done in another and billed from memory at month end. Rates changed by time of day, travel and equipment, so invoices were only as good as whoever remembered the rules.",
    built:
      "One command center — leads through to dispatch, multi-day jobs, field check-in, work orders signed on site, a contractor roster with insurance and tax docs, payouts, and invoicing that applies the rate card itself.",
    does: "Pipeline, schedule and open tickets on one screen. Every job carries its own cost and profit as it happens.",
  },
  {
    slug: "rbl-safety",
    name: "RBL Safety",
    status: "Live · 106 users",
    image: "/images/platforms/rbl-safety.jpg",
    alt: "RBL Safety operations platform showing officer scheduling and the dispatch desk",
    why: "Shifts get assigned, covered, swapped and cancelled all day. Each change has to land twice — what the officer is paid, what the client is billed. When those drift apart, the company bleeds where nobody can see.",
    built: "AI auto-dispatch, officer scheduling, a dispatch desk their assistants run, payroll, client billing off the same approved shift, fleet tracking and a client portal.",
    does: "106 people work in it daily. Pay and billing come from one record, so they can't disagree. Started at 75 users and bills monthly on headcount.",
  },
  {
    slug: "etrax",
    name: "etrax",
    status: "Live",
    image: "/images/platforms/etrax.jpg",
    alt: "etrax commerce operating system dashboard with marketplace pricing, purchase orders and the overnight agent brief",
    why: "Thousands of small decisions a day across marketplaces — what to buy, what to reprice, what went out of stock, what you were quietly charged. Nobody can watch it all, and the misses are the expensive ones.",
    built:
      "A commerce operating system with an AI agent that works overnight: scanning, watchlists, pricing, purchase orders, receiving, inbound, customer orders, fee reconciliation and claims.",
    does: "The owner wakes to a written brief and a short list of decisions waiting on a yes. Nothing moves money until somebody approves it.",
  },
  {
    slug: "verus-trading",
    name: "VERUS Trading",
    status: "Live",
    image: "/images/platforms/verus-trading.jpg",
    alt: "VERUS Trading scanner and analyzer screen with a graded track record of every call",
    why: "Claims are easy to make and almost impossible to check. The only question worth answering is whether a method pays across hundreds of attempts, not whether it worked once.",
    built: "A scanner, an analyzer, backtesting, defined setups and strategies, and a track record that grades every call the system makes.",
    does: "Every call is scored and kept, win or lose. Performance becomes a record instead of a story.",
  },
  {
    slug: "verus-trading-bot",
    name: "VERUS Trading Bot",
    status: "Live · paying subscribers",
    image: "/images/platforms/verus-bot-site.jpg",
    alt: "VERUS Trading Bot product website with pricing and sign-up",
    why: "Software is only a business when a stranger can buy it and run it without the founder in the room.",
    built: "A product site, pricing, checkout, licensing, member accounts, signed agreements, a referral program and a members' community.",
    does: "It sells and renews without a phone call. Subscribers pay monthly whether or not anyone worked that day.",
  },
  {
    slug: "radiant-moments",
    name: "Radiant Moments",
    status: "Live",
    image: "/images/platforms/radiant-moments.jpg",
    alt: "Radiant Moments website with its booking funnel and quote request form",
    why: "A local service business with no real presence grows only as fast as the owner can talk to people.",
    built: "Brand, website, booking funnel, quote requests, a CRM behind it and paid advertising pointed at all of it.",
    does: "Customers find it, price it and request a date without a phone call ever happening.",
  },
];
