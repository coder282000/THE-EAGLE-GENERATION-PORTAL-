'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getEvents,
  EVENT_STATUS_LABELS,
  EVENT_TYPE_LABELS,
  canCreateEvent,
  type AdminEvent,
  type EventStatus,
  type EventType,
} from '@/lib/mock/events';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';

const PAGE_SIZE = 25;

const STATUS_OPTIONS: Array<{ value: EventStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'SOLD_OUT', label: 'Sold out' },
  { value: 'ONGOING', label: 'Ongoing' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const TYPE_OPTIONS: Array<{ value: EventType | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All types' },
  { value: 'CONFERENCE', label: 'Conference' },
  { value: 'WEBINAR', label: 'Webinar' },
  { value: 'MEETUP', label: 'Meetup' },
  { value: 'TRAINING', label: 'Training' },
  { value: 'FUNDRAISER', label: 'Fundraiser' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Maps the domain EventStatus to the generic StatusKey used by StatusBadge.
 * StatusBadge's palette is a smaller set than the domain vocabulary, so
 * this keeps the domain enum intact while reusing the shared badge.
 */
function eventStatusToBadgeKey(status: EventStatus): StatusKey {
  switch (status) {
    case 'DRAFT':
      return 'draft';
    case 'PUBLISHED':
      return 'approved';
    case 'SOLD_OUT':
      return 'high';
    case 'ONGOING':
      return 'processing';
    case 'COMPLETED':
      return 'completed';
    case 'CANCELLED':
      return 'rejected';
  }
}

export default function AdminEventsPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | 'ALL'>('ALL');
  const [type, setType] = useState<EventType | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const allEvents = useMemo(
    () => getEvents(user, { status, type, q: search }),
    [user, status, type, search],
  );

  const totalPages = Math.max(1, Math.ceil(allEvents.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageEvents = allEvents.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const stats = useMemo(() => {
    const scoped = getEvents(user);
    const now = Date.now();
    return {
      total: scoped.length,
      upcoming: scoped.filter(
        (e) =>
          e.status === 'PUBLISHED' && new Date(e.startsAt).getTime() >= now,
      ).length,
      published: scoped.filter((e) => e.status === 'PUBLISHED').length,
      draft: scoped.filter((e) => e.status === 'DRAFT').length,
    };
  }, [user]);

  const canCreate = canCreateEvent(user);
  const filtersActive =
    search.trim().length > 0 || status !== 'ALL' || type !== 'ALL';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Events</h1>
          <p className="mt-1 text-sm text-ink/60">
            Create, publish and run events across chapters.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin/events/new"
            className="inline-flex items-center gap-2 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90 focus:outline-none focus:ring-2 focus:ring-sky/50"
          >
            Create event
          </Link>
        )}
      </header>

      <section
        aria-label="Event statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Total events" value={stats.total} />
        <StatTile label="Upcoming" value={stats.upcoming} />
        <StatTile label="Published" value={stats.published} />
        <StatTile label="Drafts" value={stats.draft} />
      </section>

      <AdminCard
        title="All events"
        subtitle="Filter, sort and open any event."
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search title, slug or venue"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as EventStatus | 'ALL');
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
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as EventType | 'ALL');
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
        </div>

        {pageEvents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={filtersActive ? 'No events match these filters.' : 'No events yet'}
              description={
                filtersActive
                  ? 'Try clearing the filters.'
                  : 'Events you create will appear here.'
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">List of events</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Event</th>
                    <th scope="col" className="px-4 py-3">Type</th>
                    <th scope="col" className="px-4 py-3">Chapter</th>
                    <th scope="col" className="px-4 py-3">Starts</th>
                    <th scope="col" className="px-4 py-3">Capacity</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageEvents.map((e) => (
                    <EventRow key={e.id} event={e} />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {pageEvents.map((e) => (
                <li key={e.id} className="p-4">
                  <EventCardMobile event={e} />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="border-t border-ink/10 px-4 py-3">
                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  totalItems={allEvents.length}
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

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function EventRow({ event }: { event: AdminEvent }) {
  const startsIn = new Date(event.startsAt).getTime() - Date.now();
  return (
    <tr className="border-b border-ink/5 last:border-0 hover:bg-paper/60">
      <td className="px-4 py-3">
        <Link
          href={`/admin/events/${event.id}/registrations`}
          className="font-medium text-ink hover:text-sky"
        >
          {event.title}
        </Link>
        <div className="text-xs text-ink/50">/{event.slug}</div>
      </td>
      <td className="px-4 py-3">{EVENT_TYPE_LABELS[event.type]}</td>
      <td className="px-4 py-3">{event.chapterCode ?? 'Org-wide'}</td>
      <td className="px-4 py-3">
        <div>{formatDate(event.startsAt)}</div>
        {startsIn > 0 && (
          <div className="text-xs text-ink/50">
            in {Math.ceil(startsIn / (1000 * 60 * 60 * 24))} days
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        {event.capacity == null ? (
          <span className="text-ink/50">Unlimited</span>
        ) : (
          <span>{event.capacity}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={eventStatusToBadgeKey(event.status)}>
          {EVENT_STATUS_LABELS[event.status]}
        </StatusBadge>
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-3 text-sm">
          <Link
            href={`/admin/events/${event.id}/registrations`}
            className="text-sky hover:underline"
          >
            Registrations
          </Link>
          <Link
            href={`/admin/events/${event.id}/check-in`}
            className="text-sky hover:underline"
          >
            Check-in
          </Link>
          <Link
            href={`/admin/events/${event.id}/edit`}
            className="text-sky hover:underline"
          >
            Edit
          </Link>
        </div>
      </td>
    </tr>
  );
}

function EventCardMobile({ event }: { event: AdminEvent }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/admin/events/${event.id}/registrations`}
          className="font-medium text-ink hover:text-sky"
        >
          {event.title}
        </Link>
        <StatusBadge status={eventStatusToBadgeKey(event.status)}>
          {EVENT_STATUS_LABELS[event.status]}
        </StatusBadge>
      </div>
      <div className="text-xs text-ink/60">
        {EVENT_TYPE_LABELS[event.type]} · {event.chapterCode ?? 'Org-wide'}
      </div>
      <div className="text-xs text-ink/60">
        {formatDate(event.startsAt)} ·{' '}
        {event.capacity == null ? 'Unlimited' : `${event.capacity} capacity`}
      </div>
      <div className="flex gap-3 pt-1 text-xs">
        <Link
          href={`/admin/events/${event.id}/registrations`}
          className="text-sky hover:underline"
        >
          Registrations
        </Link>
        <Link
          href={`/admin/events/${event.id}/check-in`}
          className="text-sky hover:underline"
        >
          Check-in
        </Link>
        <Link
          href={`/admin/events/${event.id}/edit`}
          className="text-sky hover:underline"
        >
          Edit
        </Link>
      </div>
    </div>
  );
}