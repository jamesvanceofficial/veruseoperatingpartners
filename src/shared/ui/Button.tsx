"use client";

import { buttonClassName, type ButtonVariant } from "./buttonStyles";

export type { ButtonVariant };

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ variant = "secondary", loading, className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button className={buttonClassName({ variant, disabled: disabled || loading, className })} disabled={disabled || loading} {...rest}>
      {loading ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </button>
  );
}
