import Link from "next/link";
import { buttonClassName, type ButtonVariant } from "./buttonStyles";

/** A navigation link styled identically to Button — for "New X" / "Edit X" actions that go to a route rather than submit a form. */
export function LinkButton({
  href,
  variant = "secondary",
  className,
  target,
  onClick,
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  target?: string;
  /** For closing a mobile menu, etc. — the link still navigates normally. */
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className={buttonClassName({ variant, className })}
    >
      {children}
    </Link>
  );
}
