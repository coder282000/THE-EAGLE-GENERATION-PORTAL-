'use client';

import { useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getCannedResponses,
  saveCannedResponse,
  deleteCannedResponse,
  canManageCannedResponses,
  TICKET_CATEGORY_LABELS,
  type CannedResponse,
  type TicketCategory,
} from '@/lib/mock/support';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/button';

const CATEGORY_OPTIONS: Array<{ value: TicketCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All categories' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'VERIFICATION', label: 'Verification' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'OTHER', label: 'Other' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

interface FormState {
  id?: string;
  title: string;
  category: TicketCategory;
  body: string;
  tagsText: string;
}

function emptyForm(): FormState {
  return {
    title: '',
    category: 'ACCOUNT',
    body: '',
    tagsText: '',
  };
}

export default function CannedResponsesPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<TicketCategory | 'ALL'>('ALL');
  const [version, setVersion] = useState(0);
  const [editing, setEditing] = useState<FormState | null>(null);
  const [deleting, setDeleting] = useState<CannedResponse | null>(null);
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    body?: string;
  }>({});

  const items = useMemo(
    () => getCannedResponses(user, { category, q: search }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, category, search, version],
  );

  const canManage = canManageCannedResponses(user);

  if (!canManage) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Canned responses are administrator-only.
        </h2>
      </div>
    );
  }

  function openCreate() {
    setFormErrors({});
    setEditing(emptyForm());
  }

  function openEdit(r: CannedResponse) {
    setFormErrors({});
    setEditing({
      id: r.id,
      title: r.title,
      category: r.category,
      body: r.body,
      tagsText: r.tags.join(', '),
    });
  }

  function validate(form: FormState) {
    const e: { title?: string; body?: string } = {};
    if (!form.title.trim() || form.title.trim().length < 3) {
      e.title = 'Give this response a title.';
    }
    if (!form.body.trim() || form.body.trim().length < 10) {
      e.body = 'The body must be at least 10 characters.';
    }
    return e;
  }

  function handleSave() {
    if (!editing) return;
    const e = validate(editing);
    setFormErrors(e);
    if (Object.keys(e).length > 0) return;

    const tags = editing.tagsText
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 10);

    saveCannedResponse(user, {
      id: editing.id,
      title: editing.title.trim(),
      category: editing.category,
      body: editing.body.trim(),
      tags,
    });
    setEditing(null);
    setVersion((v) => v + 1);
  }

  function handleDelete() {
    if (!deleting) return;
    deleteCannedResponse(deleting.id);
    setDeleting(null);
    setVersion((v) => v + 1);
  }

  const filtersActive = search.trim().length > 0 || category !== 'ALL';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Canned responses</h1>
          <p className="mt-1 text-sm text-ink/60">
            Pre-written replies for common cases.
          </p>
        </div>
        <Button type="button" variant="primary" onClick={openCreate}>
          New response
        </Button>
      </header>

      <AdminCard
        title="Library"
        subtitle={`${items.length} ${
          items.length === 1 ? 'response' : 'responses'
        }`}
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search title, body or tag"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TicketCategory | 'ALL')}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by category"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                filtersActive
                  ? 'No responses match these filters.'
                  : 'No canned responses yet.'
              }
              description={
                filtersActive
                  ? 'Try clearing the filters.'
                  : 'Create the first one.'
              }
            />
          </div>
        ) : (
          <ul className="divide-y divide-ink/10">
            {items.map((r) => (
              <li key={r.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-ink">
                        {r.title}
                      </h3>
                      <span className="rounded-full bg-sky/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sky">
                        {TICKET_CATEGORY_LABELS[r.category]}
                      </span>
                      <span className="text-xs text-ink/40">
                        {r.usageCount} uses
                      </span>
                    </div>
                    <p
                      className="mt-1 line-clamp-3 text-sm text-ink/70"
                      title={r.body}
                    >
                      {r.body}
                    </p>
                    {r.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {r.tags.map((t) => (
                          <span
                            key={t}
                            className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/50"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="mt-2 text-xs text-ink/40">
                      Updated {formatDate(r.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1 text-xs">
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="text-sky hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(r)}
                      className="text-rose-700 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>

      {editing && (
        <FormModal
          form={editing}
          errors={formErrors}
          onChange={(patch) => setEditing({ ...editing, ...patch })}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete this canned response?"
          body={`"${deleting.title}" will be removed from the library. This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function FormModal({
  form,
  errors,
  onChange,
  onSave,
  onClose,
}: {
  form: FormState;
  errors: { title?: string; body?: string };
  onChange: (patch: Partial<FormState>) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="canned-form-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="canned-form-title" className="text-lg font-semibold text-ink">
          {form.id ? 'Edit response' : 'New response'}
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink">
              Title
              <span className="ml-0.5 text-rose-600">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onChange({ title: e.target.value })}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            />
            {errors.title && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {errors.title}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) =>
                onChange({ category: e.target.value as TicketCategory })
              }
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            >
              {CATEGORY_OPTIONS.filter((o) => o.value !== 'ALL').map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              Body
              <span className="ml-0.5 text-rose-600">*</span>
            </label>
            <textarea
              value={form.body}
              onChange={(e) => onChange({ body: e.target.value })}
              rows={6}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            />
            {errors.body && (
              <p role="alert" className="mt-1 text-xs text-rose-600">
                {errors.body}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">
              Tags
            </label>
            <input
              type="text"
              value={form.tagsText}
              onChange={(e) => onChange({ tagsText: e.target.value })}
              placeholder="Comma-separated (e.g. password, login)"
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={onSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink/70">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}