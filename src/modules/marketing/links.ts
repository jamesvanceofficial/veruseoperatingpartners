/** Public-site link targets, in one plain (non-client) module so both the client header and the server footer/pages can import them as real strings. */
export const BOOK_A_CALL_HREF = "/contact";
export const FREE_SCAN_HREF = "/scan";

/** The top nav carries only the homepage's own sections plus Log in and Book a call. Every other public page stays live and is linked from the footer. */
export const NAV_LINKS = [
  { href: "/#what-we-do", label: "What we do" },
  { href: "/#built", label: "What we've built" },
  { href: "/#how-we-help", label: "How we help" },
  { href: "/#next-steps", label: "Next steps" },
];
