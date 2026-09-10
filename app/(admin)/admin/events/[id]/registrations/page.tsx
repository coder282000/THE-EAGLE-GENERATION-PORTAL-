'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getEventById,
  getEventRegistrations,
  getEventStats,
  canCheckIn,
  canExportRegistrations,
  canRequestRefund,
  searchRegistrations,
  requestRefund,
  REGISTRATION_STATUS_LABELS,
  EVENT_STATUS_LABELS,
  getChapterName,
  type AdminRegistration,
  type RegistrationStatus,
} from '@/lib/mock/events';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { Button } from '@/components/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { formatCurrency } from '@/lib/utils';

const PAGE_SIZE = 25;

const STATUS_OPTIONS: Array<{ value: RegistrationStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CHECKED_IN', label: 'Checked in' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REFUNDED', label: 'Refunded' },
  { value: 'NO_SHOW', label: 'No-show' },
];

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function regStatusToBadge(status: RegistrationStatus): StatusKey {
  switch (status) {
    case 'PENDING':
      return 'pending';
    case 'CONFIRMED':
      return 'approved';
    case 'CHECKED_IN':
      return 'active';
    case 'CANCELLED':
      return 'inactive';
    case 'REFUNDED':
      return 'processing';
    case 'NO_SHOW':
      return 'medium';
  }
}

export default function EventRegistrationsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const eventId = params?.id ?? '';

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<RegistrationStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [refundTarget, setRefundTarget] = useState<AdminRegistration | null>(
    null,
  );

  const event = eventId ? getEventById(eventId, user) : null;

  const allRegs = useMemo(
    () => (event ? getEventRegistrations(event.id, user, { status, q: search }) : []),
    [event, user, status, search],
  );

  const stats = useMemo(
    () => (event ? getEventStats(event.id) : null),
    [event],
  );

  const totalPages = Math.max(1, Math.ceil(allRegs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRegs = allRegs.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  if (!event) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">Event not found.</h2>
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="mt-4 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
        >
          Back to events
        </button>
      </div>
    );
  }

  const canCheck = canCheckIn(user, event);
  const canExport = canExportRegistrations(user);
  const canRefund = canRequestRefund(user);
  const filtersActive = search.trim().length > 0 || status !== 'ALL';
  const capacityPct =
    event.capacity != null && stats
      ? Math.min(100, Math.round((stats.registered / event.capacity) * 100))
      : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="text-xs text-ink/50">
            <Link href="/admin/events" className="hover:text-sky">
              Events
            </Link>
            <span className="mx-1">/</span>
            <span>{event.title}</span>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {event.title}
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            {new Date(event.startsAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}{' '}
            · {event.chapterCode ? getChapterName(event.chapterCode) : 'Organisation-wide'}
          </p>
        </div>
        <div className="flex gap-2">
          {canCheck && (
            <Link
              href={`/admin/events/${event.id}/check-in`}
              className="inline-flex items-center rounded-md border border-ink/20 bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-paper"
            >
              Open check-in
            </Link>
          )}
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="inline-flex items-center rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
          >
            Edit event
          </Link>
        </div>
      </header>

      <section
        aria-label="Registration statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Registered" value={stats?.registered ?? 0} />
        <StatTile label="Checked in" value={stats?.checkedIn ?? 0} />
        <StatTile label="Cancelled" value={stats?.cancelled ?? 0} />
        <StatTile
          label="Revenue"
          value={
            stats
              ? formatCurrency(stats.revenueMinor, stats.currency)
              : '—'
          }
        />
      </section>

      {capacityPct != null && (
        <div className="rounded-lg border border-ink/10 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink/60">
              {stats?.registered} of {event.capacity} sold
            </span>
            <span className="font-medium text-ink">{capacityPct}% full</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={capacityPct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${stats?.registered} of ${event.capacity} tickets sold, ${capacityPct} percent`}
            className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10"
          >
            <div
              className={
                capacityPct >= 100
                  ? 'h-full bg-rose-500'
                  : capacityPct >= 70
                  ? 'h-full bg-clay'
                  : 'h-full bg-sky'
              }
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        </div>
      )}

      <AdminCard title="Registrations" subtitle="Attendee register for this event.">
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Name, email or reference"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as RegistrationStatus | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by status"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {canExport && (
            <button
              type="button"
              disabled={allRegs.length === 0}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50"
            >
              Export
            </button>
          )}
        </div>

        {pageRegs.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                filtersActive
                  ? 'No registrations match these filters.'
                  : 'No one has registered yet.'
              }
              description={
                filtersActive
                  ? 'Try clearing the filters.'
                  : 'Share the event page to start selling tickets.'
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Event registrations</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Attendee</th>
                    <th scope="col" className="px-4 py-3">Tier</th>
                    <th scope="col" className="px-4 py-3">Chapter</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Registered</th>
                    <th scope="col" className="px-4 py-3">Checked in</th>
                    <th scope="col" className="px-4 py-3">Amount</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRegs.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-ink/5 last:border-0 hover:bg-paper/60"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">{r.memberName}</div>
                        <div className="text-xs text-ink/50">{r.reference}</div>
                      </td>
                      <td className="px-4 py-3">{r.tierName}</td>
                      <td className="px-4 py-3">{r.memberChapterCode}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={regStatusToBadge(r.status)}>
                          {REGISTRATION_STATUS_LABELS[r.status]}
                        </StatusBadge>
                      </td>
                      <td className="px-4 py-3">{formatDateTime(r.registeredAt)}</td>
                      <td className="px-4 py-3">
                        {formatDateTime(r.checkedInAt)}
                      </td>
                      <td className="px-4 py-3">
                        {r.amountMinor > 0
                          ? formatCurrency(r.amountMinor, r.currency)
                          : 'Free'}
                      </td>
                      <td className="px-4 py-3">
                        {canRefund &&
                          (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN') && (
                            <button
                              type="button"
                              onClick={() => setRefundTarget(r)}
                              className="text-xs text-sky hover:underline"
                            >
                              Request refund
                            </button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {pageRegs.map((r) => (
                <li key={r.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-ink">
                        {r.memberName}
                      </div>
                      <div className="text-xs text-ink/50">{r.reference}</div>
                    </div>
                    <StatusBadge status={regStatusToBadge(r.status)}>
                      {REGISTRATION_STATUS_LABELS[r.status]}
                    </StatusBadge>
                  </div>
                  <div className="text-xs text-ink/60">
                    {r.tierName} · {r.memberChapterCode}
                  </div>
                  <div className="text-xs text-ink/60">
                    Registered {formatDateTime(r.registeredAt)}
                  </div>
                  {canRefund &&
                    (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN') && (
                      <button
                        type="button"
                        onClick={() => setRefundTarget(r)}
                        className="text-xs text-sky hover:underline"
                      >
                        Request refund
                      </button>
                    )}
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="border-t border-ink/10 px-4 py-3">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={allRegs.length}
                  pageSize={PAGE_SIZE}
                />
              </div>
            )}
          </>
        )}
      </AdminCard>

      {refundTarget && (
        <RefundDialog
          registration={refundTarget}
          onClose={() => setRefundTarget(null)}
          onSubmitted={() => {
            requestRefund(refundTarget.id, 'Member requested');
            setRefundTarget(null);
          }}
        />
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

function RefundDialog({
  registration,
  onClose,
  onSubmitted,
}: {
  registration: AdminRegistration;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState('Member requested');
  const [note, setNote] = useState('');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="refund-title"
      className="fixed inset-0 z-30 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-lg bg-white p-6 shadow-xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="refund-title"
          className="text-lg font-semibold text-ink"
        >
          Request a refund?
        </h2>
        <p className="mt-2 text-sm text-ink/60">
          This creates a request for approval. Another officer must approve it
          before money moves.
        </p>

        <div className="mt-4 space-y-3">
          <div className="text-sm">
            <span className="text-ink/60">Attendee: </span>
            <span className="font-medium text-ink">
              {registration.memberName}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-ink/60">Amount: </span>
            <span className="font-medium text-ink">
              {formatCurrency(registration.amountMinor, registration.currency)}
            </span>
          </div>

          <FormField label="Reason" required>
            {(field) => (
              <select
                {...field}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
              >
                <option>Member requested</option>
                <option>Event cancelled</option>
                <option>Duplicate purchase</option>
                <option>Other</option>
              </select>
            )}
          </FormField>

          <FormField label="Note (optional)">
            {(field) => (
              <textarea
                {...field}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
              />
            )}
          </FormField>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={onSubmitted}>
            Request refund
          </Button>
        </div>
      </div>
    </div>
  );
}

void searchRegistrations;
void EVENT_STATUS_LABELS;
void Input;