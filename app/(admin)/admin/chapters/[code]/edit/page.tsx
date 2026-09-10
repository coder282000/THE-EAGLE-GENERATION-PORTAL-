"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { getChapterByCode, canEditChapter } from "@/lib/mock/chapters";
import { ArrowLeft, ShieldAlert } from "lucide-react";

const TYPES: { value: "CAMPUS" | "PROFESSIONAL"; label: string }[] = [
  { value: "CAMPUS", label: "Campus" },
  { value: "PROFESSIONAL", label: "Professional" },
];

export default function EditChapterPage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = params.code ? decodeURIComponent(params.code) : null;
  const chapter = code ? getChapterByCode(code) : null;

  const [name, setName] = useState(chapter?.name ?? "");
  const [type, setType] = useState<"CAMPUS" | "PROFESSIONAL">(
    chapter?.type ?? "CAMPUS"
  );
  const [location, setLocation] = useState(chapter?.location ?? "");
  const [description, setDescription] = useState(chapter?.description ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  if (!chapter) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <h1 className="font-display text-xl text-ink-900">Chapter not found</h1>
          <p className="mt-2 text-sm text-ink-500">
            The chapter does not exist, or you do not have permission to view it.
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

  if (!canEditChapter()) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <Card className="p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-clay-50">
            <ShieldAlert className="h-6 w-6 text-clay-600" aria-hidden="true" />
          </div>
          <h1 className="mt-4 font-display text-xl text-ink-900">Permission denied</h1>
          <p className="mt-2 text-sm text-ink-500">
            You do not have permission to edit chapters.
          </p>
          <div className="mt-6">
            <Link href={`/admin/chapters/${encodeURIComponent(chapter.code)}`}>
              <Button variant="primary">Back to chapter</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (!location.trim()) next.location = "Location is required.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    router.push(`/admin/chapters/${encodeURIComponent(chapter.code)}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/chapters/${encodeURIComponent(chapter.code)}`}
          className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to chapter
        </Link>
        <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink-900">
          Edit chapter
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {chapter.name} · <span className="font-mono">{chapter.code}</span>
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Identity
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-ink-700">
                  Code
                </label>
                <input
                  type="text"
                  value={chapter.code}
                  disabled
                  aria-describedby="code-hint"
                  className="mt-2 w-full cursor-not-allowed rounded-md border border-ink-200 bg-ink-50 px-3 py-2 font-mono text-sm text-ink-500"
                />
                <p id="code-hint" className="mt-1 text-xs text-ink-400">
                  Immutable. Embedded in member numbers.
                </p>
              </div>
              <FormInput
                id="name"
                label="Name"
                value={name}
                onChange={setName}
                error={errors.name}
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
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-3 transition-colors ${
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
                    className="h-4 w-4 text-sky-600 focus:ring-sky-500"
                  />
                  <span className="text-sm font-medium text-ink-900">
                    {t.label}
                  </span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-muted">
              Location
            </h2>
            <div className="mt-4">
              <FormInput
                id="location"
                label="Region / Location"
                value={location}
                onChange={setLocation}
                error={errors.location}
                placeholder="Nairobi"
                required
              />
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
              className="mt-4 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            <p className="mt-1 text-xs text-ink-400">{description.length}/500</p>
          </section>

          <div className="rounded-md border border-sky-200 bg-sky-50 p-3 text-xs text-sky-800">
            Every field change is recorded in the audit log with before / after values.
          </div>

          <div className="flex flex-col gap-3 border-t border-ink-100 pt-5 sm:flex-row-reverse">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Saving…" : "Save changes"}
            </Button>
            <Link href={`/admin/chapters/${encodeURIComponent(chapter.code)}`}>
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
  error,
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
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
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2 w-full rounded-md border bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 ${
          error ? "border-red-300" : "border-ink-200"
        }`}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}