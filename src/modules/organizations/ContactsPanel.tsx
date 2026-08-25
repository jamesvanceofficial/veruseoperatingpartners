"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/shared/ui/Card";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { EmptyState } from "@/shared/ui/EmptyState";
import { FormField, Input, Select, Textarea } from "@/shared/ui/FormField";
import { CONTACT_ROLES, CONTACT_ROLE_LABELS, type ContactRole } from "./labels";
import type { Contact } from "./types";

type FormMode = { kind: "none" } | { kind: "add" } | { kind: "edit"; contact: Contact };

export function ContactsPanel({ orgId, contacts, canEdit }: { orgId: string; contacts: Contact[]; canEdit: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>({ kind: "none" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (mode.kind === "none") return;
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = {
      full_name: String(form.get("full_name") ?? ""),
      title: String(form.get("title") ?? ""),
      contact_role: String(form.get("contact_role") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      is_primary: form.get("is_primary") === "on",
      notes: String(form.get("notes") ?? ""),
    };

    const url = mode.kind === "add" ? `/api/organizations/${orgId}/contacts` : `/api/organizations/${orgId}/contacts/${mode.contact.id}`;
    const method = mode.kind === "add" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(payload.error ?? "Something went wrong — try again.");
        setSubmitting(false);
        return;
      }
      setMode({ kind: "none" });
      setSubmitting(false);
      router.refresh();
    } catch {
      setError("Something went wrong — check your connection and try again.");
      setSubmitting(false);
    }
  }

  async function handleDelete(contact: Contact) {
    if (!window.confirm(`Remove ${contact.full_name}?`)) return;
    setDeletingId(contact.id);
    setError(null);
    try {
      const res = await fetch(`/api/organizations/${orgId}/contacts/${contact.id}`, { method: "DELETE" });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        setError(payload.error ?? "Could not remove contact.");
      } else {
        router.refresh();
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-semibold text-[var(--cream)]">Contacts</h2>
        {canEdit && mode.kind === "none" ? (
          <Button variant="primary" onClick={() => setMode({ kind: "add" })}>
            Add contact
          </Button>
        ) : null}
      </div>

      {error ? <p className="text-[12.5px] text-[var(--red)]">{error}</p> : null}

      {mode.kind !== "none" ? (
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Full name" htmlFor="full_name">
                <Input id="full_name" name="full_name" required defaultValue={mode.kind === "edit" ? mode.contact.full_name : ""} />
              </FormField>
              <FormField label="Title" htmlFor="title">
                <Input id="title" name="title" defaultValue={mode.kind === "edit" ? (mode.contact.title ?? "") : ""} />
              </FormField>
              <FormField label="Role" htmlFor="contact_role">
                <Select id="contact_role" name="contact_role" defaultValue={mode.kind === "edit" ? (mode.contact.contact_role ?? "") : ""}>
                  <option value="">Unspecified</option>
                  {CONTACT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {CONTACT_ROLE_LABELS[r]}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Email" htmlFor="email">
                <Input id="email" name="email" type="email" defaultValue={mode.kind === "edit" ? (mode.contact.email ?? "") : ""} />
              </FormField>
              <FormField label="Phone" htmlFor="phone">
                <Input id="phone" name="phone" defaultValue={mode.kind === "edit" ? (mode.contact.phone ?? "") : ""} />
              </FormField>
              <label className="mt-6 flex items-center gap-2 text-[12.5px] text-[var(--cream)]">
                <input
                  type="checkbox"
                  name="is_primary"
                  defaultChecked={mode.kind === "edit" ? mode.contact.is_primary : false}
                  className="h-4 w-4 rounded border-[var(--hairline-strong)] bg-[var(--navy)] accent-[var(--gold)]"
                />
                Primary contact
              </label>
            </div>
            <FormField label="Notes" htmlFor="notes">
              <Textarea id="notes" name="notes" rows={3} defaultValue={mode.kind === "edit" ? (mode.contact.notes ?? "") : ""} />
            </FormField>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="primary" loading={submitting}>
                {mode.kind === "add" ? "Add contact" : "Save changes"}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setMode({ kind: "none" })}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {contacts.length === 0 && mode.kind === "none" ? (
        <EmptyState title="No contacts yet" description="Add the people at this organization — owners, executives, or vendor contacts." />
      ) : (
        <div className="flex flex-col gap-2">
          {contacts.map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium text-[var(--cream)]">{c.full_name}</p>
                  {c.is_primary ? <Badge tone="gold">Primary</Badge> : null}
                  {c.contact_role ? <Badge>{CONTACT_ROLE_LABELS[c.contact_role as ContactRole] ?? c.contact_role}</Badge> : null}
                </div>
                <p className="text-[12px] text-[var(--muted)]">{[c.title, c.email, c.phone].filter(Boolean).join(" · ") || "No contact details on file."}</p>
              </div>
              {canEdit ? (
                <div className="flex items-center gap-2">
                  <Button variant="secondary" onClick={() => setMode({ kind: "edit", contact: c })}>
                    Edit
                  </Button>
                  <Button variant="ghost" onClick={() => handleDelete(c)} loading={deletingId === c.id}>
                    Remove
                  </Button>
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
