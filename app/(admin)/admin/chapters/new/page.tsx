"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { canCreateChapter } from "@/lib/mock/chapters";
import { ArrowLeft, ShieldAlert } from "lucide-react";

const TYPES: { value: "CAMPUS" | "PROFESSIONAL"; label: string; hint: string }[] = [
  {
    value: "CAMPUS",
    label: "Campus",
    hint: "A university or college chapter (references an Institution).",
  },
  {
    value: "PROFESSIONAL",
    label: "Professional",
    hint: "A regional chapter for working professionals.",
  },
];

export default function NewChapterPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"CAMPUS" | "PROFESSIONAL">("CAMPUS");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("Kenya");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!canCreateChapter()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to create chapters.
          </p>
          <div className="mt-6">
            <Link href="/admin/chapters">
              <Button variant="primary">Back to chapters</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const codeTrim = code.trim().toUpperCase();
    if (!codeTrim) next.code = "Code is required.";
    else if (!/^[A-Z0-9-]{2,12}$/.test(codeTrim)) {
      next.code = "2–12 chars. Uppercase letters, numbers, hyphens only.";
    }
    if (!name.trim()) next.name = "Name is required.";
    if (!region.trim()) next.region = "Region is required.";

    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push(`/admin/chapters/${encodeURIComponent(codeTrim)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/chapters"
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Chapters
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          New chapter
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Create a campus or professional chapter.
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
                id="code"
                label="Code"
                value={code}
                onChange={(v) => setCode(v.toUpperCase())}
                error={errors.code}
                hint="Immutable once created. Used in member numbers (e.g. TEG-26-KU-0042)."
                placeholder="KU"
                required
                mono
                maxLength={12}
              />
              <FormInput
                id="name"
                label="Name"
                value={name}
                onChange={setName}
                error={errors.name}
                placeholder="Kenyatta University"
                required
              />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Type
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {TYPES.map((t) => (
                <label
                  key={t.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 transition-colors ${
                    type === t.value
                      ? "border-sky-500 bg-sky-50"
                      : "border-ink-200 hover:border-ink-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={t.value}
                    checked={type === t.value}
                    onChange={() => setType(t.value)}
                    className="mt-0.5 h-4 w-4 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-ink-900">
                      {t.label}
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      {t.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Location
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <FormInput
                id="region"
                label="Region"
                value={region}
                onChange={setRegion}
                error={errors.region}
                placeholder="Nairobi"
                required
              />
              <FormInput
                id="city"
                label="City"
                value={city}
                onChange={setCity}
                placeholder="Nairobi"
              />
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-ink-700">
                  Country
                </label>
                <select
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-2 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
                >
                  {["Kenya", "Uganda", "Tanzania", "Rwanda", "DR Congo"].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Description
            </h2>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="A short description of the chapter's focus and character."
              className="mt-4 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            <p className="mt-1 text-xs text-ink-400">{description.length}/500</p>
          </section>

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row-reverse">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Creating…" : "Create chapter"}
            </Button>
            <Link href="/admin/chapters">
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
  hint,
  placeholder,
  required,
  mono,
  maxLength,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  required?: boolean;
  mono?: boolean;
  maxLength?: number;
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
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 ${
          error ? "border-red-300" : "border-ink-200"
        } ${mono ? "font-mono" : ""}`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-ink-400">
          {hint}
        </p>
      )}
    </div>
  );
}