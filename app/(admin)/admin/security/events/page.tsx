'use client';

import { useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getSecurityEvents,
  getSecurityEventStats,
  resolveSecurityEvent,
  escalateSecurityEvent,
  canViewSecurityEvents,
  canResolveSecurityEvent,
  canEscalateSecurityEvent,
  SECURITY_EVENT_TYPE_LABELS,
  SECURITY_SEVERITY_LABELS,
  type SecurityEvent,
  type SecurityEventType,
  type SecuritySeverity,
} from '@/lib/mock/audit';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { Button } from '@/components/button';

const PAGE_SIZE = 25;

const SEVERITY_OPTIONS: Array<{ value: SecuritySeverity | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All severities' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
  { value: 'INFO', label: 'Info' },
];

const TYPE_OPTIONS: Array<{ value: SecurityEventType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All types' },
  ...(Object.keys(SECURITY_EVENT_TYPE_LABELS) as SecurityEventType[]).map(
    (k) => ({ value: k, label: SECURITY_EVENT_TYPE_LABELS[k] }),
  ),
];

const STATE_OPTIONS: Array<{ value: 'ALL' | 'OPEN' | 'RESOLVED'; label: string }> = [
  { value: 'ALL', label: 'All states' },
  { value: 'OPEN', label: 'Open' },
  { value: 'RESOLVED', label: 'Resolved' },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function severityToBadge(severity: SecuritySeverity): StatusKey {
  switch (severity) {
    case 'CRITICAL':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'MEDIUM':
      return 'medium';
    case 'LOW':
      return 'low';
    case 'INFO':
      return 'inactive';
  }
}

export default function SecurityEventsPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<SecuritySeverity | 'ALL'>('ALL');
  const [type, setType] = useState<SecurityEventType | 'ALL'>('ALL');
  const [state, setState] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState<SecurityEvent | null>(null);

  const items = useMemo(
    () =>
      getSecurityEvents(user, {
        severity,
        type,
        resolved: state === 'ALL' ? 'ALL' : state === 'RESOLVED',
        q: search,
      }),
    [user, severity, type, state, search],
  );

  const stats = useMemo(() => getSecurityEventStats(user), [user]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const canView = canViewSecurityEvents(user);
  const canResolve = canResolveSecurityEvent(user);
  const canEscalate = canEscalateSecurityEvent(user);

  const filtersActive =
    search.trim().length > 0 ||
    severity !== 'ALL' ||
    type !== 'ALL' ||
    state !== 'ALL';

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You don&apos;t have access to security events.
        </h2>
      </div>
    );
  }

  function handleResolve(id: string) {
    resolveSecurityEvent(user, id);
    setDrawer(null);
    setPage((p) => p);
  }

  function handleEscalate(id: string) {
    escalateSecurityEvent(user, id);
    setDrawer(null);
    setPage((p) => p);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Security events</h1>
        <p className="mt-1 text-sm text-ink/60">
          Failed logins, privilege changes and anomalies.
        </p>
      </header>

      <section
        aria-label="Security event statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Open events" value={stats.open} />
        <StatTile
          label="Critical unresolved"
          value={stats.criticalUnresolved}
          tone={stats.criticalUnresolved > 0 ? 'danger' : 'default'}
        />
        <StatTile label="Resolved (24h)" value={stats.resolved24h} />
        <StatTile
          label="Median time to resolve"
          value={
            stats.medianResolveHours != null
              ? `${stats.medianResolveHours}h`
              : '—'
          }
        />
      </section>

      <AdminCard
        title="All events"
        subtitle="Filter by severity, type or state."
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Actor, target or event type"
            />
          </div>
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value as SecuritySeverity | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by severity"
          >
            {SEVERITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as SecurityEventType | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by type"
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={state}
            onChange={(e) => {
              setState(e.target.value as 'ALL' | 'OPEN' | 'RESOLVED');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by state"
          >
            {STATE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {pageItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                filtersActive
                  ? 'No events match these filters.'
                  : 'No security events. That is good news.'
              }
              description={
                filtersActive ? 'Try clearing the filters.' : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Security events</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Time</th>
                    <th scope="col" className="px-4 py-3">Severity</th>
                    <th scope="col" className="px-4 py-3">Type</th>
                    <th scope="col" className="px-4 py-3">Actor</th>
                    <th scope="col" className="px-4 py-3">Target</th>
                    <th scope="col" className="px-4 py-3">State</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((ev) => (
                    <tr
                      key={ev.id}
                      className="border-b border-ink/5 last:border-0 hover:bg-paper/60"
                    >
                      <td className="px-4 py-3 text-xs">
                        {formatDateTime(ev.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={severityToBadge(ev.severity)}>
                          {SECURITY_SEVERITY_LABELS[ev.severity]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {SECURITY_EVENT_TYPE_LABELS[ev.type]}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {ev.actorName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {ev.targetName ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {ev.resolved ? (
                          <span className="text-ink/60">Resolved</span>
                        ) : ev.escalated ? (
                          <span className="text-clay">Escalated</span>
                        ) : (
                          <span className="text-ink">Open</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => setDrawer(ev)}
                            className="text-sky hover:underline"
                          >
                            View
                          </button>
                          {canResolve && !ev.resolved && (
                            <button
                              type="button"
                              onClick={() => handleResolve(ev.id)}
                              className="text-sky hover:underline"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {pageItems.map((ev) => (
                <li key={ev.id} className="p-4">
                  <button
                    type="button"
                    onClick={() => setDrawer(ev)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-ink">
                          {SECURITY_EVENT_TYPE_LABELS[ev.type]}
                        </div>
                        <div className="mt-0.5 text-xs text-ink/60">
                          {formatDateTime(ev.createdAt)}
                        </div>
                      </div>
                      <StatusBadge status={severityToBadge(ev.severity)}>
                        {SECURITY_SEVERITY_LABELS[ev.severity]}
                      </StatusBadge>
                    </div>
                    <div className="mt-1 text-xs text-ink/60">
                      {ev.actorName ?? ev.targetName ?? 'System event'}
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="border-t border-ink/10 px-4 py-3">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={items.length}
                  pageSize={PAGE_SIZE}
                />
              </div>
            )}
          </>
        )}
      </AdminCard>

      {drawer && (
        <SecurityEventDrawer
          event={drawer}
          canResolve={canResolve}
          canEscalate={canEscalate}
          onClose={() => setDrawer(null)}
          onResolve={() => handleResolve(drawer.id)}
          onEscalate={() => handleEscalate(drawer.id)}
        />
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: 'default' | 'danger';
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        tone === 'danger' ? 'border-rose-300' : 'border-ink/10'
      }`}
    >
      <p className="text-sm text-ink/60">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          tone === 'danger' ? 'text-rose-700' : 'text-ink'
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SecurityEventDrawer({
  event,
  canResolve,
  canEscalate,
  onClose,
  onResolve,
  onEscalate,
}: {
  event: SecurityEvent;
  canResolve: boolean;
  canEscalate: boolean;
  onClose: () => void;
  onResolve: () => void;
  onEscalate: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sec-event-title"
      className="fixed inset-0 z-30 flex justify-end bg-ink/40"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 p-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <StatusBadge status={severityToBadge(event.severity)}>
                {SECURITY_SEVERITY_LABELS[event.severity]}
              </StatusBadge>
              <span className="text-xs text-ink/60">
                {SECURITY_EVENT_TYPE_LABELS[event.type]}
              </span>
            </div>
            <p className="mt-2 text-xs text-ink/60">
              {formatDateTime(event.createdAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-ink/50 hover:text-ink"
            aria-label="Close"
          >
            ✕
          </button>
        </header>

        <div className="space-y-4 p-6">
          <dl className="space-y-3 text-sm">
            <Row label="Actor" value={event.actorName ?? '—'} />
            <Row label="Target" value={event.targetName ?? '—'} />
            <Row
              label="State"
              value={
                event.resolved
                  ? `Resolved ${event.resolvedAt ? formatDateTime(event.resolvedAt) : ''}`
                  : event.escalated
                  ? 'Escalated'
                  : 'Open'
              }
            />
            {event.resolutionNote && (
              <Row label="Resolution" value={event.resolutionNote} />
            )}
          </dl>

          <section>
            <h3 className="text-sm font-semibold text-ink">Metadata</h3>
            <ul className="mt-2 space-y-1 rounded-md border border-ink/10 bg-paper p-3">
              {Object.entries(event.metadata).map(([k, v]) => (
                <li key={k} className="font-mono text-xs">
                  <span className="text-ink/50">{k}:</span>{' '}
                  <span className="text-ink">{JSON.stringify(v)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {!event.resolved && (canResolve || canEscalate) && (
          <footer className="mt-auto flex gap-2 border-t border-ink/10 p-6">
            {canEscalate && !event.escalated && (
              <Button
                type="button"
                variant="outline"
                onClick={onEscalate}
              >
                Escalate
              </Button>
            )}
            {canResolve && (
              <Button type="button" variant="primary" onClick={onResolve}>
                Resolve
              </Button>
            )}
          </footer>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </div>
  );
}