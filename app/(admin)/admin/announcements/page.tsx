'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getAnnouncements,
  getAnnouncementStats,
  canCreateAnnouncement,
  canArchiveAnnouncement,
  ANNOUNCEMENT_STATUS_LABELS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  ANNOUNCEMENT_AUDIENCE_LABELS,
  getChapterName,
  type AdminAnnouncement,
  type AnnouncementAudience,
  type AnnouncementPriority,
  type AnnouncementStatus,
} from '@/lib/mock/communications';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';

const PAGE_SIZE = 25;

const STATUS_OPTIONS: Array<{ value: AnnouncementStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'EXPIRED', label: 'Expired' },
];

const PRIORITY_OPTIONS: Array<{ value: AnnouncementPriority | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const AUDIENCE_OPTIONS: Array<{ value: AnnouncementAudience | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All audiences' },
  { value: 'CHAPTER', label: 'Chapter' },
  { value: 'TIER', label: 'Tier' },
  { value: 'COHORT', label: 'Cohort' },
];

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusToBadge(status: AnnouncementStatus): StatusKey {
  switch (status) {
    case 'DRAFT':
      return 'draft';
    case 'SCHEDULED':
      return 'processing';
    case 'PUBLISHED':
      return 'approved';
    case 'EXPIRED':
      return 'inactive';
  }
}

function priorityToBadge(priority: AnnouncementPriority): StatusKey {
  switch (priority) {
    case 'LOW':
      return 'low';
    case 'MEDIUM':
      return 'medium';
    case 'HIGH':
      return 'high';
  }
}

function audienceLabel(item: AdminAnnouncement): string {
  if (item.audience === 'ALL') return 'All members';
  if (item.audience === 'CHAPTER') {
    return `Chapter · ${getChapterName(item.audienceRef)}`;
  }
  if (item.audience === 'TIER') return `Tier · ${item.audienceRef ?? '—'}`;
  return `Cohort · ${item.audienceRef ?? '—'}`;
}

function readRate(item: AdminAnnouncement): { pct: number | null; read: number; total: number } {
  const read = item.readBy.length;
  const total = item.targetedCount;
  if (total === 0) return { pct: null, read, total };
  return { pct: Math.round((read / total) * 100), read, total };
}

export default function AnnouncementsPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<AnnouncementStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<AnnouncementPriority | 'ALL'>('ALL');
  const [audience, setAudience] = useState<AnnouncementAudience | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const items = useMemo(
    () =>
      getAnnouncements(user, {
        status,
        priority,
        audience,
        q: search,
      }),
    [user, status, priority, audience, search],
  );

  const stats = useMemo(() => getAnnouncementStats(user), [user]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const canCreate = canCreateAnnouncement(user);
  const canArchive = canArchiveAnnouncement(user);
  const filtersActive =
    search.trim().length > 0 ||
    status !== 'ALL' ||
    priority !== 'ALL' ||
    audience !== 'ALL';

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Announcements</h1>
          <p className="mt-1 text-sm text-ink/60">
            Compose, schedule and review messages for members.
          </p>
        </div>
        {canCreate && (
          <Link
            href="/admin/announcements/new"
            className="inline-flex items-center gap-2 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90 focus:outline-none focus:ring-2 focus:ring-sky/50"
          >
            New announcement
          </Link>
        )}
      </header>

      <section
        aria-label="Announcement statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Published this month" value={stats.publishedThisMonth} />
        <StatTile label="Scheduled" value={stats.scheduled} />
        <StatTile label="Drafts" value={stats.drafts} />
        <StatTile
          label="Average read rate"
          value={
            stats.averageReadRate != null
              ? `${stats.averageReadRate}%`
              : '—'
          }
        />
      </section>

      <AdminCard
        title="All announcements"
        subtitle="Filter, sort and open any announcement."
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Search title or body"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as AnnouncementStatus | 'ALL');
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
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as AnnouncementPriority | 'ALL');
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
            value={audience}
            onChange={(e) => {
              setAudience(e.target.value as AnnouncementAudience | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by audience"
          >
            {AUDIENCE_OPTIONS.map((o) => (
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
                  ? 'No announcements match these filters.'
                  : 'No announcements yet'
              }
              description={
                filtersActive
                  ? 'Try clearing the filters.'
                  : 'Compose the first one.'
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">List of announcements</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Title</th>
                    <th scope="col" className="px-4 py-3">Audience</th>
                    <th scope="col" className="px-4 py-3">Priority</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Published</th>
                    <th scope="col" className="px-4 py-3">Read rate</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item) => (
                    <AnnouncementRow
                      key={item.id}
                      item={item}
                      canArchive={canArchive}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {pageItems.map((item) => (
                <li key={item.id} className="p-4">
                  <AnnouncementCardMobile item={item} />
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

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function AnnouncementRow({
  item,
  canArchive,
}: {
  item: AdminAnnouncement;
  canArchive: boolean;
}) {
  const rate = readRate(item);
  const isDraft = item.status === 'DRAFT';
  const editPath = `/admin/announcements/${item.id}/edit`;

  return (
    <tr className="border-b border-ink/5 last:border-0 hover:bg-paper/60">
      <td className="px-4 py-3">
        {isDraft ? (
          <Link href={editPath} className="font-medium text-ink hover:text-sky">
            {item.title}
          </Link>
        ) : (
          <Link
            href={`/admin/announcements/${item.id}`}
            className="font-medium text-ink hover:text-sky"
          >
            {item.title}
          </Link>
        )}
        <div className="mt-0.5 line-clamp-1 text-xs text-ink/50">
          {item.body}
        </div>
      </td>
      <td className="px-4 py-3 text-xs">
        {audienceLabel(item)}
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={priorityToBadge(item.priority)}>
          {ANNOUNCEMENT_PRIORITY_LABELS[item.priority]}
        </StatusBadge>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={statusToBadge(item.status)}>
          {ANNOUNCEMENT_STATUS_LABELS[item.status]}
        </StatusBadge>
      </td>
      <td className="px-4 py-3 text-xs">
        {formatDate(item.publishAt)}
      </td>
      <td className="px-4 py-3 text-xs">
        {rate.pct != null ? (
          <span aria-label={`${rate.pct} percent, ${rate.read} of ${rate.total}`}>
            {rate.pct}%{' '}
            <span className="text-ink/50">
              ({rate.read}/{rate.total})
            </span>
          </span>
        ) : (
          '—'
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-3 text-xs">
          {isDraft && (
            <Link href={editPath} className="text-sky hover:underline">
              Edit
            </Link>
          )}
          <Link
            href={`/admin/announcements/${item.id}`}
            className="text-sky hover:underline"
          >
            View
          </Link>
          {canArchive && (
            <button
              type="button"
              className="text-ink/50 hover:underline"
              title="Archive (not implemented)"
            >
              Archive
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

function AnnouncementCardMobile({ item }: { item: AdminAnnouncement }) {
  const rate = readRate(item);
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-3">
        <Link
          href={`/admin/announcements/${item.id}`}
          className="font-medium text-ink hover:text-sky"
        >
          {item.title}
        </Link>
        <StatusBadge status={statusToBadge(item.status)}>
          {ANNOUNCEMENT_STATUS_LABELS[item.status]}
        </StatusBadge>
      </div>
      <div className="text-xs text-ink/60">{audienceLabel(item)}</div>
      <div className="text-xs text-ink/60">
        {formatDate(item.publishAt)}
        {rate.pct != null && (
          <>
            {' · '}
            {rate.pct}% read ({rate.read}/{rate.total})
          </>
        )}
      </div>
    </div>
  );
}