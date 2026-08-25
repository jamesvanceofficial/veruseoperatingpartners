import Link from "next/link";
import { buttonClassName, type ButtonVariant } from "./Button";

/** A navigation link styled identically to Button — for "New X" / "Edit X" actions that go to a route rather than submit a form. */
export function LinkButton({
  href,
  variant = "secondary",
  className,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClassName({ variant, className })}>
      {children}
    </Link>
  );
}
