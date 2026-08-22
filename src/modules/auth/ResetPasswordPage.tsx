"use client";

import { useState } from "react";
import { createClient } from "@/shared/supabase/client";
import { FormField, Input } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";

export function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/update-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong sending the reset email.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="glass-panel-strong fade-scale-in w-full max-w-sm p-7 text-center">
        <h1 className="text-[15px] font-semibold text-[var(--cream)]">Check your email</h1>
        <p className="mt-2 text-[12.5px] text-[var(--muted)]">
          If an account exists for {email}, a password reset link is on its way.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-strong fade-scale-in flex w-full max-w-sm flex-col gap-4 p-7">
      <div>
        <h1 className="text-[15px] font-semibold text-[var(--cream)]">Reset your password</h1>
        <p className="text-[12px] text-[var(--muted)]">We&apos;ll email you a link to set a new one.</p>
      </div>

      <FormField label="Email" htmlFor="email">
        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>

      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}

      <Button type="submit" variant="primary" loading={loading} className="mt-1 w-full py-2.5">
        Send reset link
      </Button>

      <a href="/login" className="text-center text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]">
        Back to sign in
      </a>
    </form>
  );
}
