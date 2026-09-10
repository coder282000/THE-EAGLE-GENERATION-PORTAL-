"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import {
  getMemberById,
  getChapterOptions,
  canEditMember,
  MEMBER_TIER_LABELS,
  type Member,
} from "@/lib/mock/members";
import { ArrowLeft, ShieldAlert } from "lucide-react";

const PILLARS: Member["pillarInterest"][number][] = [
  "Marketplace",
  "Governance",
  "Technology",
];

export default function EditMemberPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const member = params.id ? getMemberById(params.id) : null;

  const [firstName, setFirstName] = useState(member?.firstName ?? "");
  const [lastName, setLastName] = useState(member?.lastName ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [tier, setTier] = useState<Member["tier"]>(member?.tier ?? "Nestling");
  const [chapter, setChapter] = useState(member?.chapter ?? "");
  const [pillars, setPillars] = useState<Member["pillarInterest"]>(
    member?.pillarInterest ?? []
  );
  const [bio, setBio] = useState(member?.bio ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const chapters = getChapterOptions();

  if (!member) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Member not found</h1>
          <p className="mt-2 text-sm text-ink-500">
            The member does not exist, or you do not have permission to view it.
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

  if (!canEditMember()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">
            Permission denied
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to edit member records.
          </p>
          <div className="mt-6">
            <Link href={`/admin/members/${member.id}`}>
              <Button variant="primary">Back to member</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const togglePillar = (p: Member["pillarInterest"][number]) => {
    setPillars((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Enter a valid email.";
    if (pillars.length === 0) next.pillars = "Select at least one pillar.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    // Mock: PATCH /api/v1/admin/members/:id
    router.push(`/admin/members/${member.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/members/${member.id}`}
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to member
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          Edit member
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {member.firstName} {member.lastName} ·{" "}
          <span className="font-mono">{member.memberNumber}</span>
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Identity
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <FormInput
                id="firstName"
                label="First name"
                value={firstName}
                onChange={setFirstName}
                error={errors.firstName}
                required
              />
              <FormInput
                id="lastName"
                label="Last name"
                value={lastName}
                onChange={setLastName}
                error={errors.lastName}
                required
              />
              <FormInput
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                required
              />
              <FormInput
                id="phone"
                label="Phone"
                type="tel"
                value={phone}
                onChange={setPhone}
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Chapter and tier
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="chapter"
                  className="block text-sm font-medium text-ink-700"
                >
                  Chapter
                </label>
                <select
                  id="chapter"
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                >
                  {chapters.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="tier"
                  className="block text-sm font-medium text-ink-700"
                >
                  Tier
                </label>
                <select
                  id="tier"
                  value={tier}
                  onChange={(e) => setTier(e.target.value as Member["tier"])}
                  className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                >
                  {(Object.keys(MEMBER_TIER_LABELS) as Member["tier"][]).map(
                    (t) => (
                      <option key={t} value={t}>
                        {MEMBER_TIER_LABELS[t]}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Pillars
            </h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {PILLARS.map((p) => (
                <label
                  key={p}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors ${
                    pillars.includes(p)
                      ? "border-sky-500 bg-sky-50 text-sky-800"
                      : "border-ink-200 text-ink-700 hover:border-ink-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={pillars.includes(p)}
                    onChange={() => togglePillar(p)}
                    className="h-4 w-4 rounded border-ink-200 text-sky-600 focus:ring-sky-500"
                  />
                  {p}
                </label>
              ))}
            </div>
            {errors.pillars && (
              <p className="mt-2 text-xs text-red-600">{errors.pillars}</p>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Bio
            </h2>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={2000}
              className="mt-4 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            <p className="mt-1 text-xs text-ink-400">{bio.length}/2000</p>
          </section>

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row-reverse">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
            <Link href={`/admin/members/${member.id}`}>
              <Button type="button" variant="outline" fullWidth>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}

function FormInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  error,
  required = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-clay-600"> *</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}