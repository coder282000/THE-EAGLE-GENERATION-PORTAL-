'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getEntityAuditTrail,
  canViewAuditLog,
  ENTITY_TYPE_LABELS,
  type AuditEntry,
  type EntityType,
} from '@/lib/mock/audit';
import { AdminCard } from '@/components/admin/AdminCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';

type FilterKey = 'all' | 'state' | 'note' | 'approval' | 'financial';

const FILTER_LABELS: Record<FilterKey, string> = {
  all: 'All actions',
  state: 'State changes',
  note: 'Notes',
  approval: 'Approvals',
  financial: 'Financial',
};

function categorize(action: string): FilterKey {
  if (action.startsWith('refund') || action.startsWith('transaction') || action.startsWith('payout')) {
    return 'financial';
  }
  if (action.endsWith('.approved') || action.endsWith('.rejected') || action.endsWith('.decided')) {
    return 'approval';
  }
  if (action.endsWith('.noted') || action.endsWith('.commented')) {
    return 'note';
  }
  if (
    action.endsWith('.published') ||
    action.endsWith('.approved') ||
    action.endsWith('.rejected') ||
    action.endsWith('.suspended') ||
    action.endsWith('.reinstated') ||
    action.endsWith('.cancelled') ||
    action.endsWith('.refunded')
  ) {
    return 'state';
  }
  return 'all';
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusFromEntry(entry: AuditEntry | undefined): string | null {
  if (!entry?.after || typeof entry.after !== 'object') return null;
  const status = (entry.after as Record<string, unknown>).status;
  return typeof status === 'string' ? status : null;
}

function statusToBadge(status: string): StatusKey {
  const s = status.toLowerCase();
  if (s.includes('approved') || s.includes('active') || s.includes('published') || s.includes('completed')) return 'approved';
  if (s.includes('rejected') || s.includes('cancelled') || s.includes('revoked')) return 'rejected';
  if (s.includes('pending') || s.includes('review')) return 'pending';
  if (s.includes('draft')) return 'draft';
  if (s.includes('suspended')) return 'suspended';
  return 'processing';
}

export default function EntityAuditTrailPage() {
  const params = useParams<{ type: string; id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const type = params?.type ?? '';
  const id = params?.id ?? '';

  const [filter, setFilter] = useState<FilterKey>('all');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const isValidType =
    type !== '' && Object.keys(ENTITY_TYPE_LABELS).includes(type);

  const entries = useMemo(() => {
    if (!isValidType) return [];
    return getEntityAuditTrail(type as EntityType, id, user);
  }, [type, id, user, isValidType]);

  const canView = canViewAuditLog(user);

  const filteredEntries = useMemo(() => {
    if (filter === 'all') return entries;
    return entries.filter((e) => {
      const cat = categorize(e.action);
      return cat === filter || cat === 'all';
    });
  }, [entries, filter]);

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: entries.length,
      state: 0,
      note: 0,
      approval: 0,
      financial: 0,
    };
    for (const e of entries) {
      const cat = categorize(e.action);
      if (cat !== 'all') counts[cat] += 1;
    }
    return counts;
  }, [entries]);

  function toggleExpanded(entryId: number) {
    const next = new Set(expanded);
    if (next.has(entryId)) next.delete(entryId);
    else next.add(entryId);
    setExpanded(next);
  }

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You don&apos;t have access to this entity&apos;s audit trail.
        </h2>
      </div>
    );
  }

  if (!isValidType) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          That entity type is not supported by the audit trail.
        </h2>
        <button
          type="button"
          onClick={() => router.push('/admin/audit')}
          className="mt-4 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
        >
          Back to audit log
        </button>
      </div>
    );
  }

  const entityType = type as EntityType;
  const entityLabel =
    entries[0]?.entityLabel ?? `${ENTITY_TYPE_LABELS[entityType]} ${id}`;
  const latestStatus = statusFromEntry(entries[0]);
  const firstSeen = entries[entries.length - 1]?.createdAt;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <nav className="text-xs text-ink/50">
            <Link href="/admin/audit" className="hover:text-sky">
              Audit log
            </Link>
            <span className="mx-1">/</span>
            <span>{ENTITY_TYPE_LABELS[entityType]}</span>
            <span className="mx-1">/</span>
            <span className="font-mono">{id}</span>
          </nav>
          <h1 className="mt-1 truncate text-2xl font-semibold text-ink">
            {entityLabel}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Complete history of this {ENTITY_TYPE_LABELS[entityType].toLowerCase()}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {latestStatus && (
            <StatusBadge status={statusToBadge(latestStatus)}>
              {latestStatus.replace(/_/g, ' ').toLowerCase()}
            </StatusBadge>
          )}
        </div>
      </header>

      <AdminCard title="Summary">
        <dl className="grid gap-4 p-6 sm:grid-cols-3">
          <SummaryField label="Type" value={ENTITY_TYPE_LABELS[entityType]} />
          <SummaryField
            label="First seen"
            value={
              firstSeen
                ? new Date(firstSeen).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : '—'
            }
          />
          <SummaryField
            label="Entries"
            value={String(entries.length)}
          />
        </dl>
      </AdminCard>

      <AdminCard
        title="Timeline"
        subtitle={`${filteredEntries.length} ${
          filteredEntries.length === 1 ? 'entry' : 'entries'
        }`}
      >
        <div className="flex flex-wrap gap-2 border-b border-ink/10 px-4 py-3">
          {(Object.keys(FILTER_LABELS) as FilterKey[]).map((key) => {
            const active = filter === key;
            const count = filterCounts[key];
            if (key !== 'all' && count === 0) return null;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={active}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  active
                    ? 'border-sky bg-sky text-white'
                    : 'border-ink/20 bg-white text-ink/70 hover:bg-paper'
                }`}
              >
                {FILTER_LABELS[key]}
                {count > 0 && (
                  <span
                    className={`ml-1.5 ${
                      active ? 'text-white/80' : 'text-ink/40'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No audit entries for this entity."
              description={
                entries.length > 0
                  ? 'Try a different filter.'
                  : 'Entries appear here as actions are taken.'
              }
            />
          </div>
        ) : (
          <ol className="space-y-0 p-4">
            {filteredEntries.map((entry, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === filteredEntries.length - 1;
              const isExpanded = expanded.has(entry.id);
              const cat = categorize(entry.action);
              return (
                <li key={entry.id} className="relative flex gap-4">
                  <div className="relative flex flex-col items-center">
                    <span
                      className={`z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                        cat === 'financial'
                          ? 'bg-clay'
                          : cat === 'approval'
                          ? 'bg-sky'
                          : cat === 'note'
                          ? 'bg-dawn'
                          : 'bg-emerald-500'
                      } ${isFirst ? 'ring-4 ring-sky/15' : ''}`}
                      aria-hidden="true"
                    />
                    {!isLast && (
                      <span
                        className="w-px flex-1 bg-ink/10"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pb-6">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <h3 className="text-sm font-semibold text-ink">
                        {entry.actorName}
                      </h3>
                      <span className="text-xs text-ink/50">
                        {entry.actorRole}
                      </span>
                      <time
                        dateTime={entry.createdAt}
                        className="text-xs text-ink/50"
                        title={new Date(entry.createdAt).toLocaleString('en-GB')}
                      >
                        {relativeTime(entry.createdAt)}
                      </time>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-ink/70">
                      {entry.action}
                    </p>
                    <p className="mt-1 text-sm text-ink/70">
                      {entry.entityLabel}
                    </p>

                    {(entry.before || entry.after) && (
                      <>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() => toggleExpanded(entry.id)}
                          className="mt-2 text-xs text-sky hover:underline"
                        >
                          {isExpanded ? 'Hide changes' : 'Show changes'}
                        </button>
                        {isExpanded && (
                          <div className="mt-2 grid gap-3 md:grid-cols-2">
                            <DiffBlock title="Before" data={entry.before} />
                            <DiffBlock title="After" data={entry.after} />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </AdminCard>
    </div>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}

function DiffBlock({
  title,
  data,
}: {
  title: string;
  data: Record<string, unknown> | undefined;
}) {
  if (!data) {
    return (
      <div className="rounded-md border border-ink/10 bg-paper p-3">
        <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
          {title}
        </p>
        <p className="mt-1 text-xs text-ink/50">—</p>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-ink/10 bg-paper p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
        {title}
      </p>
      <ul className="mt-1 space-y-1">
        {Object.entries(data).map(([k, v]) => (
          <li key={k} className="font-mono text-xs">
            <span className="text-ink/50">{k}:</span>{' '}
            <span className="text-ink">{JSON.stringify(v)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}