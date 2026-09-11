'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getAuditEntries,
  getAuditStats,
  getActorOptions,
  getActionPrefixOptions,
  canExportAudit,
  canViewAuditLog,
  ENTITY_TYPE_LABELS,
  type AuditEntry,
  type EntityType,
} from '@/lib/mock/audit';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/button';

const PAGE_SIZE = 25;

const ENTITY_TYPE_OPTIONS: Array<{ value: EntityType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All entity types' },
  ...(Object.keys(ENTITY_TYPE_LABELS) as EntityType[]).map((k) => ({
    value: k,
    label: ENTITY_TYPE_LABELS[k],
  })),
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AuditLogPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [actorId, setActorId] = useState<string>('ALL');
  const [actionPrefix, setActionPrefix] = useState<string>('ALL');
  const [entityType, setEntityType] = useState<EntityType | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState<AuditEntry | null>(null);

  const actorOptions = useMemo(() => getActorOptions(), []);
  const actionOptions = useMemo(() => getActionPrefixOptions(), []);

  const items = useMemo(
    () =>
      getAuditEntries(user, {
        actorId,
        actionPrefix,
        entityType,
        q: search,
      }),
    [user, actorId, actionPrefix, entityType, search],
  );

  const stats = useMemo(() => getAuditStats(user), [user]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const canExport = canExportAudit(user);
  const canView = canViewAuditLog(user);

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You don&apos;t have access to the audit log.
        </h2>
      </div>
    );
  }

  const filtersActive =
    search.trim().length > 0 ||
    actorId !== 'ALL' ||
    actionPrefix !== 'ALL' ||
    entityType !== 'ALL';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Audit log</h1>
          <p className="mt-1 text-sm text-ink/60">
            An immutable record of privileged actions. Entries cannot be
            edited or deleted.
          </p>
        </div>
        {canExport && (
          <Button
            type="button"
            variant="outline"
            disabled={items.length === 0}
          >
            Export
          </Button>
        )}
      </header>

      <section
        aria-label="Audit statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Entries (24h)" value={stats.entries24h} />
        <StatTile
          label="Distinct actors (24h)"
          value={stats.distinctActors24h}
        />
        <StatTile
          label="Failed actions (24h)"
          value={stats.failedActions24h}
        />
        <StatTile
          label="Change vs prior 24h"
          value={
            stats.changeVsPrior === 0
              ? '0%'
              : `${stats.changeVsPrior > 0 ? '+' : ''}${stats.changeVsPrior}%`
          }
        />
      </section>

      <AdminCard
        title="Entries"
        subtitle="Filter by actor, action, entity type or search text."
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Actor, action or entity label"
            />
          </div>
          <select
            value={actorId}
            onChange={(e) => {
              setActorId(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by actor"
          >
            <option value="ALL">All actors</option>
            {actorOptions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          <select
            value={actionPrefix}
            onChange={(e) => {
              setActionPrefix(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by action prefix"
          >
            <option value="ALL">All actions</option>
            {actionOptions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <select
            value={entityType}
            onChange={(e) => {
              setEntityType(e.target.value as EntityType | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by entity type"
          >
            {ENTITY_TYPE_OPTIONS.map((o) => (
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
                  ? 'No entries match these filters.'
                  : 'No audit entries yet.'
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
                <caption className="sr-only">Audit log entries</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Time</th>
                    <th scope="col" className="px-4 py-3">Actor</th>
                    <th scope="col" className="px-4 py-3">Action</th>
                    <th scope="col" className="px-4 py-3">Entity</th>
                    <th scope="col" className="px-4 py-3">IP</th>
                    <th scope="col" className="px-4 py-3">Result</th>
                    <th scope="col" className="px-4 py-3">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((e) => (
                    <tr
                      key={e.id}
                      className="border-b border-ink/5 last:border-0 hover:bg-paper/60"
                    >
                      <td className="px-4 py-3 text-xs">
                        {formatDateTime(e.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">
                          {e.actorName}
                        </div>
                        <div className="text-xs text-ink/50">
                          {e.actorRole}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs text-ink">
                          {e.action}
                        </code>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div className="text-ink">{e.entityLabel}</div>
                        <div className="text-ink/50">
                          {ENTITY_TYPE_LABELS[e.entityType]}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-ink/70">
                        {e.ipAddress}
                      </td>
                      <td className="px-4 py-3">
                        {e.success ? (
                          <span className="text-xs text-emerald-700">
                            Success
                          </span>
                        ) : (
                          <span className="text-xs text-rose-700">
                            Failed
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setDrawer(e)}
                          className="text-xs text-sky hover:underline"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {pageItems.map((e) => (
                <li key={e.id} className="p-4">
                  <button
                    type="button"
                    onClick={() => setDrawer(e)}
                    className="w-full text-left"
                  >
                    <div className="text-xs text-ink/60">
                      {formatDateTime(e.createdAt)}
                    </div>
                    <div className="mt-1 font-medium text-ink">
                      {e.actorName}
                    </div>
                    <div className="mt-0.5 font-mono text-xs text-ink/70">
                      {e.action}
                    </div>
                    <div className="mt-1 text-xs text-ink/60">
                      {e.entityLabel}
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
        <AuditDrawer entry={drawer} onClose={() => setDrawer(null)} />
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function AuditDrawer({
  entry,
  onClose,
}: {
  entry: AuditEntry;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-detail-title"
      className="fixed inset-0 z-30 flex justify-end bg-ink/40"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 p-6">
          <div className="min-w-0">
            <h2
              id="audit-detail-title"
              className="truncate font-mono text-sm font-semibold text-ink"
            >
              {entry.action}
            </h2>
            <p className="mt-1 text-xs text-ink/60">
              Entry #{entry.id}
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
            <Row label="Time" value={formatDateTime(entry.createdAt)} />
            <Row
              label="Actor"
              value={`${entry.actorName} (${entry.actorRole})`}
            />
            <Row
              label="Entity"
              value={`${ENTITY_TYPE_LABELS[entry.entityType]} · ${entry.entityLabel}`}
            />
            <Row label="IP" value={entry.ipAddress} mono />
            <Row label="User agent" value={entry.userAgent} mono small />
            <Row
              label="Result"
              value={entry.success ? 'Success' : `Failed — ${entry.errorMessage ?? 'unknown'}`}
            />
          </dl>

          <section>
            <h3 className="text-sm font-semibold text-ink">Changes</h3>
            {entry.before || entry.after ? (
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <DiffBlock title="Before" data={entry.before} />
                <DiffBlock title="After" data={entry.after} />
              </div>
            ) : (
              <p className="mt-2 text-xs text-ink/50">
                No before/after values recorded for this action.
              </p>
            )}
          </section>

          <div className="border-t border-ink/10 pt-4">
            <Link
              href={`/admin/audit/entity/${entry.entityType}/${entry.entityId}`}
              className="text-sm text-sky hover:underline"
            >
              View full entity trail →
            </Link>
          </div>
        </div>
      </div>
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

function Row({
  label,
  value,
  mono,
  small,
}: {
  label: string;
  value: string;
  mono?: boolean;
  small?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/60">{label}</dt>
      <dd
        className={`text-right text-ink ${mono ? 'font-mono' : ''} ${
          small ? 'text-xs' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  );
}