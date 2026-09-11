'use client';

import { useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getDeliveries,
  getDeliveryStats,
  canRetryDelivery,
  canExportDeliveries,
  canViewDeliveryLog,
  retryBulk,
  retryDelivery,
  DELIVERY_STATUS_LABELS,
  TEMPLATE_CHANNEL_LABELS,
  type AdminDelivery,
  type DeliveryStatus,
  type TemplateChannel,
} from '@/lib/mock/communications';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { Button } from '@/components/button';

const PAGE_SIZE = 25;

const STATUS_OPTIONS: Array<{ value: DeliveryStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'QUEUED', label: 'Queued' },
  { value: 'SENT', label: 'Sent' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'BOUNCED', label: 'Bounced' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'OPTED_OUT', label: 'Opted out' },
];

const CHANNEL_OPTIONS: Array<{ value: TemplateChannel | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All channels' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'PUSH', label: 'Push' },
];

const PROVIDER_OPTIONS = [
  { value: 'ALL', label: 'All providers' },
  { value: 'postmark', label: 'Postmark' },
  { value: 'africastalking', label: "Africa's Talking" },
];

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusToBadge(status: DeliveryStatus): StatusKey {
  switch (status) {
    case 'QUEUED':
      return 'pending';
    case 'SENT':
      return 'processing';
    case 'DELIVERED':
      return 'completed';
    case 'BOUNCED':
      return 'medium';
    case 'FAILED':
      return 'rejected';
    case 'OPTED_OUT':
      return 'inactive';
  }
}

export default function DeliveriesPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<DeliveryStatus | 'ALL'>('ALL');
  const [channel, setChannel] = useState<TemplateChannel | 'ALL'>('ALL');
  const [provider, setProvider] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState<AdminDelivery | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const items = useMemo(
    () =>
      getDeliveries(user, {
        status,
        channel,
        provider,
        q: search,
        days: 30,
      }),
    [user, status, channel, provider, search],
  );

  const stats = useMemo(() => getDeliveryStats(user), [user]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const canRetry = canRetryDelivery(user);
  const canExport = canExportDeliveries(user);
  const canView = canViewDeliveryLog(user);
  const filtersActive =
    search.trim().length > 0 ||
    status !== 'ALL' ||
    channel !== 'ALL' ||
    provider !== 'ALL';

  const eligibleForRetry = useMemo(
    () =>
      pageItems.filter(
        (d) => d.status !== 'DELIVERED' && d.status !== 'OPTED_OUT',
      ),
    [pageItems],
  );

  const allSelectedOnPage =
    pageItems.length > 0 && pageItems.every((d) => selected.has(d.id));
  const someSelectedOnPage = pageItems.some((d) => selected.has(d.id));

  function toggleAll() {
    if (allSelectedOnPage) {
      const next = new Set(selected);
      pageItems.forEach((d) => next.delete(d.id));
      setSelected(next);
    } else {
      const next = new Set(selected);
      pageItems.forEach((d) => next.add(d.id));
      setSelected(next);
    }
  }

  function toggleOne(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  function handleBulkRetry() {
    const ids = Array.from(selected);
    const result = retryBulk(ids);
    if (result.retried > 0) {
      setSelected(new Set());
      // Force re-read on next render
      setPage((p) => p);
    }
  }

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You don&apos;t have access to the delivery log.
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Delivery log</h1>
          <p className="mt-1 text-sm text-ink/60">
            Every message we attempted to send, and how it went.
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
        aria-label="Delivery statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Sent today" value={stats.sentToday} />
        <StatTile
          label="Delivered today"
          value={stats.deliveredToday}
          denominator={stats.sentToday > 0 ? stats.sentToday : undefined}
        />
        <StatTile
          label="Failed today"
          value={stats.failedToday}
          denominator={stats.sentToday > 0 ? stats.sentToday : undefined}
        />
        <StatTile
          label="Bounced today"
          value={stats.bouncedToday}
          denominator={stats.sentToday > 0 ? stats.sentToday : undefined}
        />
      </section>

      <AdminCard
        title="Deliveries"
        subtitle="Last 30 days by default. Filter to narrow."
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={(v) => {
                setSearch(v);
                setPage(1);
              }}
              placeholder="Name, email, phone or provider ref"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as DeliveryStatus | 'ALL');
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
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value as TemplateChannel | 'ALL');
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by channel"
          >
            {CHANNEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <select
            value={provider}
            onChange={(e) => {
              setProvider(e.target.value);
              setPage(1);
            }}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by provider"
          >
            {PROVIDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {selected.size > 0 && canRetry && (
          <div
            role="region"
            aria-live="polite"
            className="flex items-center justify-between gap-3 border-b border-sky/20 bg-sky/5 px-4 py-2"
          >
            <span className="text-sm text-ink">
              {selected.size} selected
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setSelected(new Set())}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleBulkRetry}
              >
                Retry selected
              </Button>
            </div>
          </div>
        )}

        {pageItems.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                filtersActive
                  ? 'No deliveries match these filters.'
                  : 'No messages sent yet.'
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
                <caption className="sr-only">Delivery attempts</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    {canRetry && (
                      <th scope="col" className="w-8 px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label="Select all on page"
                          checked={allSelectedOnPage}
                          ref={(el) => {
                            if (el)
                              el.indeterminate =
                                someSelectedOnPage && !allSelectedOnPage;
                          }}
                          onChange={toggleAll}
                        />
                      </th>
                    )}
                    <th scope="col" className="px-4 py-3">Recipient</th>
                    <th scope="col" className="px-4 py-3">Channel</th>
                    <th scope="col" className="px-4 py-3">Source</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Provider</th>
                    <th scope="col" className="px-4 py-3">Attempts</th>
                    <th scope="col" className="px-4 py-3">Last attempt</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((d) => {
                    const selectedHere = selected.has(d.id);
                    return (
                      <tr
                        key={d.id}
                        className="cursor-pointer border-b border-ink/5 last:border-0 hover:bg-paper/60"
                        onClick={() => setDrawer(d)}
                      >
                        {canRetry && (
                          <td
                            className="px-4 py-3"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              aria-label={`Select ${d.recipientName}`}
                              checked={selectedHere}
                              onChange={() => toggleOne(d.id)}
                            />
                          </td>
                        )}
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink">
                            {d.recipientName}
                          </div>
                          <div className="text-xs text-ink/50">
                            {d.channel === 'EMAIL'
                              ? d.recipientEmail
                              : d.recipientPhone}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {TEMPLATE_CHANNEL_LABELS[d.channel]}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {d.campaignId
                            ? 'Campaign'
                            : d.announcementId
                            ? 'Announcement'
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={statusToBadge(d.status)}>
                            {DELIVERY_STATUS_LABELS[d.status]}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-xs">{d.provider}</td>
                        <td className="px-4 py-3 text-xs">{d.attempts}</td>
                        <td className="px-4 py-3 text-xs">
                          {formatDateTime(d.lastAttemptAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {pageItems.map((d) => (
                <li key={d.id} className="p-4">
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => setDrawer(d)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-ink">
                          {d.recipientName}
                        </div>
                        <div className="text-xs text-ink/50">
                          {d.channel === 'EMAIL'
                            ? d.recipientEmail
                            : d.recipientPhone}
                        </div>
                      </div>
                      <StatusBadge status={statusToBadge(d.status)}>
                        {DELIVERY_STATUS_LABELS[d.status]}
                      </StatusBadge>
                    </div>
                    <div className="mt-2 text-xs text-ink/60">
                      {TEMPLATE_CHANNEL_LABELS[d.channel]} · {d.provider}
                    </div>
                    <div className="text-xs text-ink/60">
                      Last attempt {formatDateTime(d.lastAttemptAt)}
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
        <DeliveryDrawer
          delivery={drawer}
          canRetry={canRetry}
          onClose={() => setDrawer(null)}
          onRetried={() => {
            retryDelivery(drawer.id);
            setDrawer(null);
          }}
        />
      )}

      {eligibleForRetry.length === 0 && selected.size > 0 && (
        <p className="text-xs text-ink/50">
          None of the selected deliveries are eligible for retry.
        </p>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  denominator,
}: {
  label: string;
  value: number;
  denominator?: number;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">
        {value}
        {denominator != null && denominator > 0 && (
          <span className="ml-2 text-sm font-normal text-ink/50">
            of {denominator}
          </span>
        )}
      </p>
    </div>
  );
}

function DeliveryDrawer({
  delivery,
  canRetry,
  onClose,
  onRetried,
}: {
  delivery: AdminDelivery;
  canRetry: boolean;
  onClose: () => void;
  onRetried: () => void;
}) {
  const eligible =
    delivery.status !== 'DELIVERED' && delivery.status !== 'OPTED_OUT';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delivery-title"
      className="fixed inset-0 z-30 flex justify-end bg-ink/40"
      onClick={onClose}
    >
      <div
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-ink/10 p-6">
          <div className="min-w-0">
            <h2
              id="delivery-title"
              className="truncate text-lg font-semibold text-ink"
            >
              {delivery.recipientName}
            </h2>
            <p className="mt-0.5 truncate text-sm text-ink/60">
              {delivery.channel === 'EMAIL'
                ? delivery.recipientEmail
                : delivery.recipientPhone}
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
          <div className="flex items-center gap-2">
            <StatusBadge status={statusToBadge(delivery.status)}>
              {DELIVERY_STATUS_LABELS[delivery.status]}
            </StatusBadge>
            <span className="text-xs text-ink/60">
              {TEMPLATE_CHANNEL_LABELS[delivery.channel]} · {delivery.provider}
            </span>
          </div>

          <dl className="space-y-2 text-sm">
            <Row label="Provider ref" value={delivery.providerRef ?? '—'} />
            <Row label="Error code" value={delivery.errorCode ?? '—'} />
            <Row label="Attempts" value={String(delivery.attempts)} />
            <Row
              label="Last attempt"
              value={formatDateTime(delivery.lastAttemptAt)}
            />
            <Row
              label="Created"
              value={formatDateTime(delivery.createdAt)}
            />
          </dl>

          {delivery.campaignId && (
            <div className="rounded-md border border-ink/10 bg-paper px-3 py-2 text-xs text-ink/70">
              From campaign{' '}
              <span className="font-mono text-ink">{delivery.campaignId}</span>
            </div>
          )}
          {delivery.announcementId && (
            <div className="rounded-md border border-ink/10 bg-paper px-3 py-2 text-xs text-ink/70">
              From announcement{' '}
              <span className="font-mono text-ink">
                {delivery.announcementId}
              </span>
            </div>
          )}
        </div>

        {canRetry && (
          <footer className="mt-auto border-t border-ink/10 p-6">
            {!eligible && (
              <p className="mb-2 text-xs text-ink/60">
                {delivery.status === 'DELIVERED'
                  ? 'This message has already been delivered.'
                  : 'This member has opted out.'}
              </p>
            )}
            <Button
              type="button"
              variant="primary"
              fullWidth
              disabled={!eligible}
              onClick={onRetried}
            >
              Retry
            </Button>
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
      <dd className="break-all text-right font-mono text-xs text-ink">
        {value}
      </dd>
    </div>
  );
}