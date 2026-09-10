"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import { TextInput } from "@/components/input";
import {
  mockRemittanceRecipients,
  type RemittanceRecipient,
} from "@/components/mock/data";
import { AlertCircle, Plus, Trash2, Pencil, Send } from "lucide-react";

const RELATIONSHIP_LABEL: Record<RemittanceRecipient["relationship"], string> = {
  SELF: "Self",
  FAMILY: "Family",
  FRIEND: "Friend",
  BUSINESS: "Business",
  OTHER: "Other",
};

export default function SavedRecipientsPage() {
  const router = useRouter();
  const [recipients, setRecipients] = useState<RemittanceRecipient[]>(() =>
    mockRemittanceRecipients.filter((r) => r.isSaved)
  );
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] =
    useState<RemittanceRecipient | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipients;
    return recipients.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        (r.email?.toLowerCase().includes(q) ?? false) ||
        r.country.toLowerCase().includes(q) ||
        (r.mobileNetwork?.toLowerCase().includes(q) ?? false) ||
        (r.bankName?.toLowerCase().includes(q) ?? false)
    );
  }, [recipients, query]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    // Simulated API — replace with real delete in backend phase
    await new Promise((r) => setTimeout(r, 350));
    setRecipients((prev) => prev.filter((r) => r.id !== confirmDelete.id));
    setBusy(false);
    setConfirmDelete(null);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="text-sm text-ink-400">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/remit" className="hover:text-ink-600">
              Send money
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-ink-600">
            Saved recipients
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">Saved recipients</h1>
          <p className="mt-1 text-sm text-ink-400">
            Reuse recipient details to speed up future transfers.
          </p>
        </div>
        <Link href="/remit/recipient">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Add recipient
          </Button>
        </Link>
      </div>

      {/* Search */}
      <TextInput
        id="recipient-search"
        label="Search"
        placeholder="Name, phone, email, country or network"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-white"
      />

      {/* List */}
      {filtered.length === 0 ? (
        <Card className="p-10 text-center bg-paper">
          <p className="text-lg font-medium text-ink">
            {query ? "No recipients match your search" : "No saved recipients yet"}
          </p>
          <p className="mt-2 text-sm text-ink-400">
            {query
              ? "Try a different search term or clear the field."
              : "Add a recipient to save their details for next time."}
          </p>
          {!query && (
            <Link href="/remit/recipient" className="inline-block mt-6">
              <Button variant="primary">Add your first recipient</Button>
            </Link>
          )}
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {filtered.map((r) => (
            <li key={r.id}>
              <Card className="p-5 h-full flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink truncate">{r.name}</p>
                    <p className="mt-0.5 text-xs text-ink-400 truncate">
                      {r.mobileNetwork ?? r.bankName ?? "—"} · {r.country}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-sky-50 text-sky-700 px-2.5 py-0.5 text-[11px] font-medium">
                    {RELATIONSHIP_LABEL[r.relationship]}
                  </span>
                </div>

                <dl className="mt-4 space-y-1.5 text-sm flex-1">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-400">Phone</dt>
                    <dd className="font-mono text-ink text-right truncate">
                      {r.phone}
                    </dd>
                  </div>
                  {r.email && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-400">Email</dt>
                      <dd className="text-ink text-right truncate">{r.email}</dd>
                    </div>
                  )}
                  {r.bankName && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-400">Bank</dt>
                      <dd className="text-ink text-right truncate">
                        {r.bankName}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-400">Currency</dt>
                    <dd className="text-ink text-right">{r.currency}</dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button
                    variant="primary"
                    onClick={() =>
                      router.push(`/remit/recipient?recipient=${r.id}`)
                    }
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/remit/recipient?id=${r.id}`)}
                    aria-label={`Edit ${r.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setConfirmDelete(r)}
                    aria-label={`Remove ${r.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 id="delete-title" className="text-lg font-semibold text-ink">
                  Remove recipient?
                </h2>
                <p className="mt-2 text-sm text-ink-600">
                  <strong>{confirmDelete.name}</strong> will be removed from your
                  saved list. Past transfers to this recipient are not affected.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleDelete}
                disabled={busy}
              >
                {busy ? "Removing…" : "Remove"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setConfirmDelete(null)}
                disabled={busy}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}