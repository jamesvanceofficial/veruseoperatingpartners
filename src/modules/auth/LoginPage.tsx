"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/shared/supabase/client";
import { FormField, Input } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        return;
      }
      router.push(searchParams.get("next") || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong signing in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-strong fade-scale-in flex w-full max-w-sm flex-col gap-4 p-7">
      <div>
        <h1 className="text-[15px] font-semibold text-[var(--cream)]">Sign in to COMPASS</h1>
        <p className="text-[12px] text-[var(--muted)]">VERUS Operating Company</p>
      </div>

      <FormField label="Email" htmlFor="email">
        <Input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormField>
      <FormField label="Password" htmlFor="password">
        <Input
          id="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>

      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}

      <Button type="submit" variant="primary" loading={loading} className="mt-1 w-full py-2.5">
        Sign in
      </Button>

      <a href="/reset-password" className="text-center text-[11.5px] text-[var(--muted)] transition-colors hover:text-[var(--gold-light)]">
        Forgot your password?
      </a>
    </form>
  );
}

export function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
