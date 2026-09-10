"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  mockSegments,
  FIELD_LABELS,
  OPERATOR_LABELS,
  type Segment,
  type SegmentField,
  type SegmentOperator,
  type SegmentRule,
} from "@/lib/mock/segments";
import { ArrowLeft, Plus, Pencil, Copy, Trash2, Users } from "lucide-react";

const FIELD_OPTIONS = Object.keys(FIELD_LABELS) as SegmentField[];
const OPERATOR_OPTIONS = Object.keys(OPERATOR_LABELS) as SegmentOperator[];

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>(mockSegments);
  const [editing, setEditing] = useState<Segment | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Segment | null>(null);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    await new Promise((r) => setTimeout(r, 350));
    setSegments((prev) => prev.filter((s) => s.id !== confirmDelete.id));
    setBusy(false);
    setConfirmDelete(null);
  };

  const handleDuplicate = (s: Segment) => {
    const copy: Segment = {
      ...s,
      id: `seg-${Date.now().toString(36)}`,
      name: `${s.name} (copy)`,
      createdAt: new Date().toISOString(),
      lastUsedAt: undefined,
    };
    setSegments((prev) => [copy, ...prev]);
  };

  const handleSave = (segment: Segment) => {
    setSegments((prev) => {
      const exists = prev.find((s) => s.id === segment.id);
      if (exists) return prev.map((s) => (s.id === segment.id ? segment : s));
      return [segment, ...prev];
    });
    setEditing(null);
    setCreating(false);
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
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900">
              Segments
            </h1>
            <p className="mt-1 text-sm text-ink-500">
              Saved member cohorts for comms targeting and analytics.
            </p>
          </div>
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            New segment
          </Button>
        </div>
      </div>

      {segments.length === 0 ? (
        <Card className="p-10 text-center">
          <p className="font-display text-lg text-ink-900">No segments yet</p>
          <p className="mt-1 text-sm text-ink-500">
            Create one to target comms and analytics.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {segments.map((s) => (
            <Card key={s.id} className="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900 truncate">{s.name}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{s.description}</p>
                </div>
                <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700">
                  <Users className="h-3 w-3" aria-hidden="true" />
                  {s.estimatedCount}
                </span>
              </div>

              <ul className="mt-4 flex-1 space-y-1.5 text-xs text-ink-600">
                {s.rules.map((r, i) => (
                  <li key={i}>
                    <span className="font-medium text-ink-700">
                      {FIELD_LABELS[r.field]}
                    </span>{" "}
                    {OPERATOR_LABELS[r.operator]}{" "}
                    <span className="font-mono">{r.value}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2 border-t border-ink-50 pt-4">
                <Button variant="outline" onClick={() => setEditing(s)}>
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => handleDuplicate(s)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmDelete(s)}
                  aria-label={`Delete ${s.name}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {(creating || editing) && (
        <SegmentEditor
          segment={editing ?? undefined}
          onSave={handleSave}
          onCancel={() => {
            setCreating(false);
            setEditing(null);
          }}
        />
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title="Delete segment?"
        description={
          confirmDelete
            ? `"${confirmDelete.name}" will be removed. Any comms targeting this segment will need a new audience.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function SegmentEditor({
  segment,
  onSave,
  onCancel,
}: {
  segment?: Segment;
  onSave: (s: Segment) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(segment?.name ?? "");
  const [description, setDescription] = useState(segment?.description ?? "");
  const [rules, setRules] = useState<SegmentRule[]>(
    segment?.rules ?? [{ field: "status", operator: "eq", value: "" }]
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addRule = () =>
    setRules((prev) => [...prev, { field: "status", operator: "eq", value: "" }]);

  const removeRule = (i: number) =>
    setRules((prev) => prev.filter((_, idx) => idx !== i));

  const updateRule = (i: number, patch: Partial<SegmentRule>) =>
    setRules((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required.";
    if (rules.length === 0) next.rules = "At least one rule is required.";
    if (rules.some((r) => !String(r.value).trim())) {
      next.rules = "Every rule needs a value.";
    }
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    const saved: Segment = {
      id: segment?.id ?? `seg-${Date.now().toString(36)}`,
      name: name.trim(),
      description: description.trim(),
      rules,
      createdBy: segment?.createdBy ?? "You",
      createdAt: segment?.createdAt ?? new Date().toISOString(),
      lastUsedAt: segment?.lastUsedAt,
      estimatedCount: segment?.estimatedCount ?? 0,
    };
    onSave(saved);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="segment-editor-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
    >
      <div className="w-full max-w-xl rounded-lg bg-white p-6 shadow-lg">
        <h2
          id="segment-editor-title"
          className="text-lg font-semibold text-ink-900"
        >
          {segment ? "Edit segment" : "New segment"}
        </h2>
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="seg-name"
              className="block text-sm font-medium text-ink-700"
            >
              Name <span className="text-clay-600">*</span>
            </label>
            <input
              id="seg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              aria-invalid={!!errors.name}
              className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="seg-desc"
              className="block text-sm font-medium text-ink-700"
            >
              Description
            </label>
            <input
              id="seg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full rounded-md border border-ink-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-ink-700">
                Rules
              </label>
              <button
                type="button"
                onClick={addRule}
                className="text-sm text-sky-600 hover:underline"
              >
                + Add rule
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {rules.map((r, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Field"
                    value={r.field}
                    onChange={(e) =>
                      updateRule(i, { field: e.target.value as SegmentField })
                    }
                    className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-sky-500"
                  >
                    {FIELD_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {FIELD_LABELS[f]}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Operator"
                    value={r.operator}
                    onChange={(e) =>
                      updateRule(i, {
                        operator: e.target.value as SegmentOperator,
                      })
                    }
                    className="rounded-md border border-ink-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-sky-500"
                  >
                    {OPERATOR_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {OPERATOR_LABELS[o]}
                      </option>
                    ))}
                  </select>
                  <input
                    aria-label="Value"
                    value={r.value}
                    onChange={(e) => updateRule(i, { value: e.target.value })}
                    placeholder="value"
                    className="min-w-0 flex-1 rounded-md border border-ink-200 px-2 py-1.5 text-xs outline-none focus:border-sky-500"
                  />
                  {rules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRule(i)}
                      aria-label="Remove rule"
                      className="text-ink-400 hover:text-clay-600"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {errors.rules && (
              <p className="mt-2 text-xs text-red-600">{errors.rules}</p>
            )}
          </div>

          <div className="flex flex-col gap-2 border-t border-ink-100 pt-5 sm:flex-row-reverse">
            <Button type="submit" variant="primary" fullWidth>
              {segment ? "Save changes" : "Create segment"}
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}