"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/shared/supabase/client";
import { FormField, Input } from "@/shared/ui/FormField";
import { Button } from "@/shared/ui/Button";

export function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong updating your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel-strong fade-scale-in flex w-full max-w-sm flex-col gap-4 p-7">
      <div>
        <h1 className="text-[15px] font-semibold text-[var(--cream)]">Set a new password</h1>
      </div>

      <FormField label="New password" htmlFor="password">
        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </FormField>
      <FormField label="Confirm password" htmlFor="confirm">
        <Input id="confirm" type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </FormField>

      {error ? <p className="text-[12px] text-[var(--red)]">{error}</p> : null}

      <Button type="submit" variant="primary" loading={loading} className="mt-1 w-full py-2.5">
        Set password &amp; continue
      </Button>
    </form>
  );
}
