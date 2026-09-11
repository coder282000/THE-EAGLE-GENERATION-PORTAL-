'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getTickets,
  getTicketStats,
  assignTicket,
  resolveTicket,
  canViewSupport,
  canAssignTicket,
  canResolveTicket,
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_CATEGORY_LABELS,
  type SupportTicket,
  type TicketStatus,
  type TicketPriority,
  type TicketCategory,
} from '@/lib/mock/support';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { Button } from '@/components/button';

const PAGE_SIZE = 25;

const STATUS_TABS: Array<{ value: TicketStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'NEW', label: 'New' },
  { value: 'OPEN', label: 'Open' },
  { value: 'PENDING_MEMBER', label: 'Pending member' },
  { value: 'RESOLVED', label: 'Resolved' },
];

const PRIORITY_OPTIONS: Array<{ value: TicketPriority | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All priorities' },
  { value: 'URGENT', label: 'Urgent' },
  { value: 'HIGH', label: 'High' },
  { value: 'NORMAL', label: 'Normal' },
  { value: 'LOW', label: 'Low' },
];

const CATEGORY_OPTIONS: Array<{ value: TicketCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All categories' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'BILLING', label: 'Billing' },
  { value: 'VERIFICATION', label: 'Verification' },
  { value: 'TECHNICAL', label: 'Technical' },
  { value: 'OTHER', label: 'Other' },
];

function formatAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function priorityToBadge(priority: TicketPriority): StatusKey {
  switch (priority) {
    case 'URGENT':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'NORMAL':
      return 'medium';
    case 'LOW':
      return 'low';
  }
}

function statusToBadge(status: TicketStatus): StatusKey {
  switch (status) {
    case 'NEW':
      return 'pending';
    case 'OPEN':
      return 'approved';
    case 'PENDING_MEMBER':
      return 'processing';
    case 'RESOLVED':
      return 'completed';
    case 'CLOSED':
      return 'inactive';
  }
}

export default function SupportQueuePage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<TicketPriority | 'ALL'>('ALL');
  const [category, setCategory] = useState<TicketCategory | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<
    'ALL' | 'ME' | 'UNASSIGNED'
  >('ALL');
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);

  const items = useMemo(
    () =>
      getTickets(user, {
        status,
        priority,
        category,
        assignee: assigneeFilter,
        q: search,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, status, priority, category, assigneeFilter, search, version],
  );

  const stats = useMemo(
    () => getTicketStats(user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, version],
  );

  const canView = canViewSupport(user);
  const canAssign = canAssignTicket(user);
  const canResolve = canResolveTicket(user);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const filtersActive =
    search.trim().length > 0 ||
    status !== 'ALL' ||
    priority !== 'ALL' ||
    category !== 'ALL' ||
    assigneeFilter !== 'ALL';

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You don&apos;t have access to support.
        </h2>
      </div>
    );
  }

  function handleAssignToMe(t: SupportTicket) {
    assignTicket(user, t.id, user.id, user.name);
    setVersion((v) => v + 1);
  }

  function handleResolve(t: SupportTicket) {
    resolveTicket(user, t.id);
    setVersion((v) => v + 1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Support</h1>
          <p className="mt-1 text-sm text-ink/60">
            Member help requests.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/support/canned"
            className="inline-flex items-center rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            Canned responses
          </Link>
          <Link
            href="/admin/support/analytics"
            className="inline-flex items-center rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
          >
            Analytics
          </Link>
        </div>
      </header>

      <section
        aria-label="Support statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="New" value={stats.newCount} tone={stats.newCount > 0 ? 'info' : 'default'} />
        <StatTile label="Unassigned" value={stats.unassigned} />
        <StatTile label="Assigned to me" value={stats.assignedToMe} />
        <StatTile
          label="Oldest open"
          value={
            stats.oldestOpenHours != null
              ? `${stats.oldestOpenHours}h`
              : '—'
          }
        />
      </section>

      <AdminCard
        title="Tickets"
        subtitle="Filter by status, priority or category."
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-ink/10 px-4 pt-3">
          {STATUS_TABS.map((tab) => {
            const active = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                aria-pressed={active}
                className={`border-b-2 px-3 pb-2 text-sm transition-colors ${
                  active
                    ? 'border-sky text-sky'
                    : 'border-transparent text-ink/60 hover:text-ink'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Reference, subject or member"
            />
          </div>
          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as TicketPriority | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by priority"
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as TicketCategory | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by category"
          >
            {CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => {
              setAssigneeFilter(e.target.value as 'ALL' | 'ME' | 'UNASSIGNED');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by assignee"
          >
            <option value="ALL">All assignees</option>
            <option value="ME">Assigned to me</option>
            <option value="UNASSIGNED">Unassigned</option>
          </select>
        </div>

        {pageItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                filtersActive
                  ? 'No tickets match these filters.'
                  : 'No tickets yet. Quiet day.'
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
                <caption className="sr-only">Support tickets</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Reference</th>
                    <th scope="col" className="px-4 py-3">Subject</th>
                    <th scope="col" className="px-4 py-3">Member</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Priority</th>
                    <th scope="col" className="px-4 py-3">Assignee</th>
                    <th scope="col" className="px-4 py-3">Age</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((t) => (
                    <tr
                      key={t.id}
                      className={`border-b border-ink/5 last:border-0 hover:bg-paper/60 ${
                        t.priority === 'URGENT'
                          ? 'border-l-2 border-l-rose-500'
                          : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className="font-mono text-xs text-sky hover:underline"
                        >
                          {t.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/support/${t.id}`}
                          className="font-medium text-ink hover:text-sky"
                        >
                          {t.subject}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {t.memberName}
                        <div className="text-ink/50">{t.memberEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {TICKET_CATEGORY_LABELS[t.category]}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={priorityToBadge(t.priority)}>
                          {TICKET_PRIORITY_LABELS[t.priority]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {t.assignedToName ?? (
                          <span className="text-ink/50">Unassigned</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <time dateTime={t.createdAt}>{formatAge(t.createdAt)}</time>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={statusToBadge(t.status)}>
                          {TICKET_STATUS_LABELS[t.status]}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {pageItems.map((t) => (
                <li key={t.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/admin/support/${t.id}`}
                      className="font-medium text-ink hover:text-sky"
                    >
                      {t.subject}
                    </Link>
                    <StatusBadge status={priorityToBadge(t.priority)}>
                      {TICKET_PRIORITY_LABELS[t.priority]}
                    </StatusBadge>
                  </div>
                  <div className="font-mono text-xs text-ink/60">
                    {t.reference}
                  </div>
                  <div className="text-xs text-ink/60">
                    {t.memberName} · {formatAge(t.createdAt)} old
                  </div>
                  <div className="flex gap-3 pt-1 text-xs">
                    {canAssign && !t.assignedTo && (
                      <button
                        type="button"
                        onClick={() => handleAssignToMe(t)}
                        className="text-sky hover:underline"
                      >
                        Assign to me
                      </button>
                    )}
                    {canResolve &&
                      t.status !== 'RESOLVED' &&
                      t.status !== 'CLOSED' && (
                        <button
                          type="button"
                          onClick={() => handleResolve(t)}
                          className="text-emerald-700 hover:underline"
                        >
                          Resolve
                        </button>
                      )}
                  </div>
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
  tone?: 'default' | 'info';
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        tone === 'info' ? 'border-sky/30' : 'border-ink/10'
      }`}
    >
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}