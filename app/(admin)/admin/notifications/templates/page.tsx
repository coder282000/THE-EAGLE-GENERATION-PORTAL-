'use client';

import { useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getTemplates,
  canManageTemplates,
  TEMPLATE_CHANNEL_LABELS,
  type AdminTemplate,
  type TemplateChannel,
} from '@/lib/mock/communications';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';

const CHANNEL_OPTIONS: Array<{ value: TemplateChannel | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All channels' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'PUSH', label: 'Push' },
];

const STATE_OPTIONS: Array<{ value: 'ALL' | 'ACTIVE' | 'DRAFT_PENDING'; label: string }> = [
  { value: 'ALL', label: 'All states' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT_PENDING', label: 'Draft pending' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function channelToBadge(channel: TemplateChannel): StatusKey {
  switch (channel) {
    case 'EMAIL':
      return 'approved';
    case 'SMS':
      return 'processing';
    case 'PUSH':
      return 'medium';
  }
}

export default function TemplatesPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [channel, setChannel] = useState<TemplateChannel | 'ALL'>('ALL');
  const [state, setState] = useState<'ALL' | 'ACTIVE' | 'DRAFT_PENDING'>('ALL');
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const items = useMemo(
    () => getTemplates(user, { channel, state, q: search }),
    [user, channel, state, search],
  );

  const selected = useMemo(
    () => items.find((t) => t.key === selectedKey) ?? items[0] ?? null,
    [items, selectedKey],
  );

  const canManage = canManageTemplates(user);
  const filtersActive =
    search.trim().length > 0 || channel !== 'ALL' || state !== 'ALL';

  if (!canManage) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Templates are administrator-only.
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          Contact a system administrator if you need access.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">
          Notification templates
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Versioned message bodies for transactional and lifecycle notifications.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <AdminCard
          title="Templates"
          subtitle={`${items.length} template${items.length === 1 ? '' : 's'}`}
        >
          <div className="space-y-3 border-b border-ink/10 px-4 py-3">
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Search key or description"
            />
            <div className="flex gap-2">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as TemplateChannel | 'ALL')}
                className="flex-1 rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
                aria-label="Filter by channel"
              >
                {CHANNEL_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <select
                value={state}
                onChange={(e) =>
                  setState(e.target.value as 'ALL' | 'ACTIVE' | 'DRAFT_PENDING')
                }
                className="flex-1 rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
                aria-label="Filter by state"
              >
                {STATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title={
                  filtersActive
                    ? 'No templates match these filters.'
                    : 'No templates yet.'
                }
                description={filtersActive ? 'Try clearing the filters.' : ''}
              />
            </div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {items.map((item) => {
                const isActive = item.key === selected?.key;
                return (
                  <li key={item.key}>
                    <button
                      type="button"
                      onClick={() => setSelectedKey(item.key)}
                      aria-current={isActive ? 'true' : undefined}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        isActive
                          ? 'bg-sky/5 border-l-2 border-sky'
                          : 'hover:bg-paper'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-xs text-ink/70">
                          {item.key}
                        </span>
                        <StatusBadge status={channelToBadge(item.channel)}>
                          {TEMPLATE_CHANNEL_LABELS[item.channel]}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-ink">
                        {item.description}
                      </p>
                      <p className="mt-1 text-xs text-ink/50">
                        v{item.version} · {formatDate(item.updatedAt)}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>

        <div>
          {selected ? (
            <TemplateDetail template={selected} />
          ) : (
            <AdminCard title="Preview">
              <div className="p-8">
                <EmptyState
                  title="Select a template"
                  description="Choose a template on the left to preview it."
                />
              </div>
            </AdminCard>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateDetail({ template }: { template: AdminTemplate }) {
  const sampleValues: Record<string, string> = {
    first_name: 'Grace',
    last_name: 'Njeri',
    member_number: 'TEG-26-KU-0042',
    chapter_name: 'Kenyatta University',
    reference: 'APP-26-100001',
    amount: 'KES 1,500.00',
    event_title: 'Annual Leadership Summit',
    start_time: '09:00',
  };

  const rendered = useMemo(() => {
    return template.body.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      return sampleValues[key] ?? `{{${key}}}`;
    });
  }, [template.body]);

  const renderedSubject = template.subject
    ? template.subject.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        return sampleValues[key] ?? `{{${key}}}`;
      })
    : null;

  return (
    <div className="space-y-6">
      <AdminCard title={template.key} subtitle={template.description}>
        <div className="space-y-4 p-6">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <Row label="Channel" value={TEMPLATE_CHANNEL_LABELS[template.channel]} />
            <Row label="Version" value={`v${template.version}`} />
            <Row label="Status" value={template.active ? 'Active' : 'Draft pending'} />
            <Row label="Last updated" value={formatDate(template.updatedAt)} />
          </dl>

          <div>
            <h3 className="text-sm font-semibold text-ink">Merge fields</h3>
            <ul className="mt-2 flex flex-wrap gap-2">
              {template.mergeFields.map((f) => (
                <li
                  key={f}
                  className="inline-flex items-center rounded-full border border-sky/30 bg-sky/5 px-2.5 py-0.5 font-mono text-xs text-sky"
                  aria-label={`Merge field ${f}, sample value ${sampleValues[f] ?? 'unavailable'}`}
                  title={sampleValues[f] ?? 'No sample'}
                >
                  {`{{${f}}}`}
                </li>
              ))}
              {template.mergeFields.length === 0 && (
                <li className="text-xs text-ink/50">No merge fields.</li>
              )}
            </ul>
          </div>

          {renderedSubject && (
            <div>
              <h3 className="text-sm font-semibold text-ink">Subject</h3>
              <p className="mt-1 text-sm text-ink/80">{renderedSubject}</p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-ink">Preview</h3>
            <p className="mt-1 text-xs text-ink/50">
              Rendered with sample data. Decorative.
            </p>
            <div
              aria-hidden="true"
              className={`mt-2 rounded-md border p-4 text-sm ${
                template.channel === 'SMS'
                  ? 'max-w-sm border-emerald-200 bg-emerald-50'
                  : template.channel === 'PUSH'
                  ? 'max-w-md border-ink/20 bg-white shadow-sm'
                  : 'border-ink/20 bg-white'
              }`}
            >
              {renderedSubject && template.channel === 'EMAIL' && (
                <div className="border-b border-ink/10 pb-2 text-sm font-medium text-ink">
                  {renderedSubject}
                </div>
              )}
              <pre className="whitespace-pre-wrap font-sans text-sm text-ink/80">
                {rendered}
              </pre>
              {template.channel === 'SMS' && rendered.length > 160 && (
                <p className="mt-2 text-xs text-clay">
                  {Math.ceil(rendered.length / 160)} SMS parts
                </p>
              )}
            </div>
            <details className="mt-2 text-xs text-ink/50">
              <summary className="cursor-pointer">Plain text</summary>
              <pre className="mt-2 whitespace-pre-wrap rounded-md border border-ink/10 bg-paper p-3">
                {template.body}
              </pre>
            </details>
          </div>

          <div className="flex gap-2 border-t border-ink/10 pt-4">
            <button
              type="button"
              disabled
              title="Editor coming next"
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink/40"
            >
              Edit
            </button>
            <button
              type="button"
              disabled
              title="Version history coming next"
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink/40"
            >
              Version history
            </button>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}