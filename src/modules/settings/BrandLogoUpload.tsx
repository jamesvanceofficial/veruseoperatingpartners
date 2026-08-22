"use client";

import { useRef, useState } from "react";
import { Button } from "@/shared/ui/Button";

export function BrandLogoUpload({ initialLogoUrl, canEdit }: { initialLogoUrl: string | null; canEdit: boolean }) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [status, setStatus] = useState<"idle" | "uploading" | "error" | "success">("idle");
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("uploading");
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/settings/brand-logo", { method: "POST", body: formData });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error ?? "Upload failed.");
        setStatus("error");
        return;
      }
      setLogoUrl(body.data.logo_url);
      setStatus("success");
    } catch {
      setError("Upload failed — check your connection and try again.");
      setStatus("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="glass-panel flex flex-col gap-4 p-5">
      <div>
        <h2 className="text-[13.5px] font-semibold text-[var(--cream)]">Brand logo</h2>
        <p className="text-[12px] text-[var(--muted)]">Shown on the login screen and in the app sidebar.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="glass-panel flex h-16 w-16 items-center justify-center overflow-hidden">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Current brand logo" className="h-full w-full object-contain p-2" />
          ) : (
            <span className="text-[10px] text-[var(--muted)]">No logo</span>
          )}
        </div>

        {canEdit ? (
          <div className="flex flex-col gap-1.5">
            <input
              ref={inputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={handleFileChange}
              className="hidden"
              id="brand-logo-input"
            />
            <Button variant="secondary" loading={status === "uploading"} onClick={() => inputRef.current?.click()}>
              Upload new logo
            </Button>
            {status === "success" ? <p className="text-[11.5px] text-[var(--green)]">Logo updated.</p> : null}
            {status === "error" && error ? <p className="text-[11.5px] text-[var(--red)]">{error}</p> : null}
          </div>
        ) : (
          <p className="text-[11.5px] text-[var(--muted)]">Only VERUS admins/staff can change the brand logo.</p>
        )}
      </div>
    </div>
  );
}
