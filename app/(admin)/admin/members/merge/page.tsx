"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { SearchInput } from "@/components/ui/search-input";
import {
  getMembers,
  getChapterName,
  canMergeMembers,
  MEMBER_TIER_LABELS,
  MEMBER_STATUS_LABELS,
  type Member,
} from "@/lib/mock/members";
import { ArrowLeft, ShieldAlert, ArrowRight } from "lucide-react";

type Step = "select" | "resolve" | "confirm";

const COMPARABLE_FIELDS: { key: keyof Member; label: string }[] = [
  { key: "memberNumber", label: "Member number" },
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "tier", label: "Tier" },
  { key: "chapter", label: "Chapter" },
  { key: "status", label: "Status" },
  { key: "joinedAt", label: "Joined" },
];

export default function MergeMembersPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("select");
  const [primaryId, setPrimaryId] = useState<string>("");
  const [secondaryId, setSecondaryId] = useState<string>("");
  const [resolutions, setResolutions] = useState<Record<string, "A" | "B">>({});
  const [confirmInput, setConfirmInput] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const allMembers = useMemo(() => getMembers({}), []);

  if (!canMergeMembers()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            Only Super Admins can merge member records.
          </p>
          <div className="mt-6">
            <Link href="/admin/members">
              <Button variant="primary">Back to members</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const primary = allMembers.find((m) => m.id === primaryId) ?? null;
  const secondary = allMembers.find((m) => m.id === secondaryId) ?? null;

  const handleResolve = () => {
    if (!primary || !secondary) return;
    setStep("confirm");
  };

  const handleMerge = async () => {
    if (!primary) return;
    const next: Record<string, string> = {};
    if (confirmInput.trim() !== primary.memberNumber) {
      next.confirm = `Type the primary member number to confirm: ${primary.memberNumber}`;
    }
    if (reason.trim().length < 10) {
      next.reason = "Reason must be at least 10 characters.";
    }
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setBusy(true);
    await new Promise((r) => setTimeout(r, 900));
    setBusy(false);
    // eslint-disable-next-line no-alert
    alert("Merge complete (mock — API not wired).");
    router.push(`/admin/members/${primary.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Members
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          Merge members
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Resolve duplicates by merging two records. History from both is preserved.
        </p>
      </div>

      {/* Step indicator */}
      <nav aria-label="Merge steps" className="flex items-center gap-2 text-sm">
        <StepDot active={step === "select"} done={step !== "select"} label="1. Select" />
        <ArrowRight className="h-4 w-4 text-ink-300" aria-hidden="true" />
        <StepDot active={step === "resolve"} done={step === "confirm"} label="2. Resolve fields" />
        <ArrowRight className="h-4 w-4 text-ink-300" aria-hidden="true" />
        <StepDot active={step === "confirm"} done={false} label="3. Confirm" />
      </nav>

      {/* Step 1 — Select */}
      {step === "select" && (
        <div className="grid gap-6 md:grid-cols-2">
          <SelectCard
            title="Primary member"
            hint="Kept. Receives all history from the secondary."
            selectedId={primaryId}
            onSelect={setPrimaryId}
            members={allMembers.filter((m) => m.id !== secondaryId)}
          />
          <SelectCard
            title="Secondary member"
            hint="Marked MERGED. All relationships reattached to primary."
            selectedId={secondaryId}
            onSelect={setSecondaryId}
            members={allMembers.filter((m) => m.id !== primaryId)}
          />
          <div className="md:col-span-2 flex justify-end">
            <Button
              variant="primary"
              disabled={!primaryId || !secondaryId}
              onClick={() => setStep("resolve")}
            >
              Continue to field resolution
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Resolve */}
      {step === "resolve" && primary && secondary && (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-100 bg-ink-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Field</th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">
                  Primary ({primary.firstName})
                </th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">
                  Secondary ({secondary.firstName})
                </th>
                <th className="px-4 py-3 text-left font-medium text-ink-500">Keep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-50">
              {COMPARABLE_FIELDS.map(({ key, label }) => {
                const a = String(primary[key]);
                const b = String(secondary[key]);
                const same = a === b;
                return (
                  <tr key={String(key)}>
                    <td className="px-4 py-3 font-medium text-ink-700">{label}</td>
                    <td className="px-4 py-3 text-ink-900">{display(a, key)}</td>
                    <td className="px-4 py-3 text-ink-900">{display(b, key)}</td>
                    <td className="px-4 py-3">
                      {same ? (
                        <span className="text-xs text-ink-400">same</span>
                      ) : (
                        <select
                          aria-label={`Choose value for ${label}`}
                          value={resolutions[String(key)] ?? "A"}
                          onChange={(e) =>
                            setResolutions((prev) => ({
                              ...prev,
                              [String(key)]: e.target.value as "A" | "B",
                            }))
                          }
                          className="rounded-md border border-ink-200 bg-white px-2 py-1 text-xs outline-none focus:border-sky-500"
                        >
                          <option value="A">Primary</option>
                          <option value="B">Secondary</option>
                        </select>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex justify-between border-t border-ink-100 p-4">
            <Button variant="outline" onClick={() => setStep("select")}>
              Back
            </Button>
            <Button variant="primary" onClick={handleResolve}>
              Continue to confirmation
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — Confirm */}
      {step === "confirm" && primary && secondary && (
        <Card className="p-6">
          <div className="rounded-md border border-clay-200 bg-clay-50 p-4">
            <p className="text-sm font-medium text-clay-800">
              This action is irreversible.
            </p>
            <p className="mt-1 text-sm text-clay-700">
              <strong>
                {secondary.firstName} {secondary.lastName}
              </strong>{" "}
              will be marked MERGED and their history reattached to{" "}
              <strong>
                {primary.firstName} {primary.lastName}
              </strong>
              .
            </p>
          </div>

          <div className="mt-6">
            <label htmlFor="reason" className="block text-sm font-medium text-ink-700">
              Reason <span className="text-clay-600">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="e.g. Duplicate registration from the 2025 intake."
              aria-invalid={!!errors.reason}
              className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            {errors.reason && (
              <p className="mt-1 text-xs text-red-600">{errors.reason}</p>
            )}
          </div>

          <div className="mt-6">
            <label htmlFor="confirm" className="block text-sm font-medium text-ink-700">
              Type the primary member number to confirm:{" "}
              <span className="font-mono">{primary.memberNumber}</span>
            </label>
            <input
              id="confirm"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={primary.memberNumber}
              aria-invalid={!!errors.confirm}
              className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 font-mono text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            {errors.confirm && (
              <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
            <Button variant="destructive" onClick={handleMerge} disabled={busy}>
              {busy ? "Merging…" : "Confirm merge"}
            </Button>
            <Button variant="outline" onClick={() => setStep("resolve")} disabled={busy}>
              Back
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function StepDot({
  active,
  done,
  label,
}: {
  active: boolean;
  done: boolean;
  label: string;
}) {
  return (
    <span
      aria-current={active ? "step" : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-sky-100 text-sky-800"
          : done
          ? "bg-green-50 text-green-700"
          : "bg-ink-50 text-ink-500"
      }`}
    >
      {label}
    </span>
  );
}

function SelectCard({
  title,
  hint,
  selectedId,
  onSelect,
  members,
}: {
  title: string;
  hint: string;
  selectedId: string;
  onSelect: (id: string) => void;
  members: Member[];
}) {
  const [search, setSearch] = useState("");
  const filtered = members.filter((m) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      m.firstName.toLowerCase().includes(q) ||
      m.lastName.toLowerCase().includes(q) ||
      m.memberNumber.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q)
    );
  });
  return (
    <Card className="p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
        {title}
      </h2>
      <p className="mt-1 text-xs text-ink-500">{hint}</p>
      <div className="mt-3">
        <SearchInput
          value={search}
          onValueChange={setSearch}
          placeholder="Search members…"
          aria-label={`Search ${title}`}
        />
      </div>
      <ul className="mt-3 max-h-64 overflow-y-auto divide-y divide-ink-50">
        {filtered.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onSelect(m.id)}
              aria-pressed={selectedId === m.id}
              className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                selectedId === m.id
                  ? "bg-sky-50 ring-2 ring-sky-500"
                  : "hover:bg-ink-50"
              }`}
            >
              <p className="text-sm font-medium text-ink-900">
                {m.firstName} {m.lastName}
              </p>
              <p className="text-xs text-ink-500">
                <span className="font-mono">{m.memberNumber}</span> ·{" "}
                {getChapterName(m.chapter)} · {MEMBER_STATUS_LABELS[m.status]}
              </p>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="py-6 text-center text-sm text-ink-400">No matches.</li>
        )}
      </ul>
    </Card>
  );
}

function display(value: string, key: keyof Member): string {
  if (key === "tier") return MEMBER_TIER_LABELS[value as Member["tier"]] ?? value;
  if (key === "status") return MEMBER_STATUS_LABELS[value as Member["status"]] ?? value;
  if (key === "chapter") return getChapterName(value);
  if (key === "joinedAt") {
    return new Date(value).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return value;
}