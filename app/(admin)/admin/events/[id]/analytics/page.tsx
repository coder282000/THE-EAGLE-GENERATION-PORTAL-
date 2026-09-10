'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getEventById,
  getEventRegistrations,
  getEventStats,
  getEventTiers,
  canExportEventAnalytics,
  canViewEventRevenue,
  getChapterName,
  EVENT_STATUS_LABELS,
  type AdminEvent,
  type AdminRegistration,
} from '@/lib/mock/events';
import { AdminCard } from '@/components/admin/AdminCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';

// Recharts is client-only and heavy. Next.js code-splits per route, so this
// module and its dependencies only load when someone visits this page.
// They do not enter the shared bundle.
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type RangeKey = 'lifetime' | '30d' | '7d';

const RANGES: Array<{ key: RangeKey; label: string }> = [
  { key: 'lifetime', label: 'Full event lifetime' },
  { key: '30d', label: 'Last 30 days' },
  { key: '7d', label: 'Last 7 days' },
];

function eventStatusToBadge(status: AdminEvent['status']): StatusKey {
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

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export default function EventAnalyticsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const eventId = params?.id ?? '';

  const event = eventId ? getEventById(eventId, user) : null;
  const [range, setRange] = useState<RangeKey>('lifetime');

  const regs = useMemo(
    () => (event ? getEventRegistrations(event.id, user) : []),
    [event, user],
  );
  const tiers = useMemo(
    () => (event ? getEventTiers(event.id) : []),
    [event],
  );
  const stats = useMemo(
    () => (event ? getEventStats(event.id) : null),
    [event],
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

  const canSeeRevenue = canViewEventRevenue(user);
  const canExport = canExportEventAnalytics(user);

  const totalConfirmed = regs.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN',
  ).length;
  const checkedIn = regs.filter((r) => r.status === 'CHECKED_IN').length;
  const noShows = regs.filter((r) => r.status === 'NO_SHOW').length;
  const refunded = regs.filter((r) => r.status === 'REFUNDED').length;

  const capacityPct = event.capacity
    ? Math.round((totalConfirmed / event.capacity) * 100)
    : null;
  const attendanceRate =
    totalConfirmed > 0 ? Math.round((checkedIn / totalConfirmed) * 100) : null;
  const noShowRate =
    totalConfirmed > 0 ? Math.round((noShows / totalConfirmed) * 100) : null;
  const refundRate =
    totalConfirmed > 0 ? Math.round((refunded / totalConfirmed) * 100) : null;

  // Sales over time (bucketed by day)
  const salesSeries = useMemo(
    () => buildSalesSeries(regs, range),
    [regs, range],
  );

  // Funnel
  const funnel = [
    { label: 'Registered', value: regs.length, pct: 100 },
    {
      label: 'Confirmed',
      value: totalConfirmed,
      pct: regs.length > 0 ? Math.round((totalConfirmed / regs.length) * 100) : 0,
    },
    {
      label: 'Checked in',
      value: checkedIn,
      pct:
        totalConfirmed > 0 ? Math.round((checkedIn / totalConfirmed) * 100) : 0,
    },
  ];

  // Tier performance
  const tierSeries = tiers.map((t) => ({
    name: t.name,
    sold: t.sold,
    remaining:
      t.quantity != null ? Math.max(0, t.quantity - t.sold) : 0,
  }));

  // Chapter breakdown
  const chapterMap = new Map<
    string,
    { registered: number; checkedIn: number }
  >();
  for (const r of regs) {
    const code = r.memberChapterCode;
    const entry = chapterMap.get(code) ?? { registered: 0, checkedIn: 0 };
    entry.registered += 1;
    if (r.status === 'CHECKED_IN') entry.checkedIn += 1;
    chapterMap.set(code, entry);
  }
  const chapterRows = Array.from(chapterMap.entries()).map(
    ([code, { registered, checkedIn: ci }]) => ({
      code,
      name: getChapterName(code),
      registered,
      checkedIn: ci,
      rate: registered > 0 ? Math.round((ci / registered) * 100) : 0,
    }),
  );
  const isOrgWide = event.chapterCode == null;

  // Insights
  const insights = buildInsights({
    regs,
    tiers,
    attendanceRate,
    noShowRate,
    refundRate,
    capacityPct,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="text-xs text-ink/50">
            <Link href="/admin/events" className="hover:text-sky">
              Events
            </Link>
            <span className="mx-1">/</span>
            <Link
              href={`/admin/events/${event.id}/registrations`}
              className="hover:text-sky"
            >
              {event.title}
            </Link>
            <span className="mx-1">/</span>
            <span>Analytics</span>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {event.title}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-ink/60">
            <span>{formatDateShort(event.startsAt)}</span>
            <span>·</span>
            <span>
              {event.chapterCode ? getChapterName(event.chapterCode) : 'Organisation-wide'}
            </span>
            <StatusBadge status={eventStatusToBadge(event.status)}>
              {EVENT_STATUS_LABELS[event.status]}
            </StatusBadge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as RangeKey)}
            aria-label="Date range"
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
          >
            {RANGES.map((r) => (
              <option key={r.key} value={r.key}>
                {r.label}
              </option>
            ))}
          </select>
          {canExport && (
            <Button
              type="button"
              variant="outline"
              disabled={regs.length === 0}
            >
              Export
            </Button>
          )}
        </div>
      </header>

      {regs.length === 0 ? (
        <AdminCard title="Analytics">
          <div className="p-8">
            <EmptyState
              title="No data yet"
              description="Once people register, analytics will appear here."
            />
          </div>
        </AdminCard>
      ) : (
        <>
          <section
            aria-label="Key metrics"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
          >
            <KpiCard
              label="Tickets sold"
              value={String(totalConfirmed)}
              denominator={
                event.capacity != null ? `${event.capacity} capacity` : undefined
              }
              secondary={
                capacityPct != null ? `${capacityPct}% of capacity` : undefined
              }
            />
            <KpiCard
              label="Checked in"
              value={String(checkedIn)}
              denominator={`${totalConfirmed} confirmed`}
              secondary={
                attendanceRate != null
                  ? `${attendanceRate}% attendance rate`
                  : undefined
              }
            />
            <KpiCard
              label="No-shows"
              value={String(noShows)}
              denominator={`${totalConfirmed} confirmed`}
              secondary={
                noShowRate != null ? `${noShowRate}% no-show rate` : undefined
              }
            />
            <KpiCard
              label="Revenue"
              value={
                canSeeRevenue && stats
                  ? formatCurrency(stats.revenueMinor, stats.currency)
                  : 'Restricted'
              }
            />
            <KpiCard
              label="Refunded"
              value={String(refunded)}
              denominator={`${totalConfirmed} sold`}
              secondary={
                refundRate != null ? `${refundRate}% refund rate` : undefined
              }
            />
            <KpiCard
              label="Average ticket"
              value={
                canSeeRevenue && totalConfirmed > 0 && stats
                  ? formatCurrency(
                      Math.round(stats.revenueMinor / totalConfirmed),
                      stats.currency,
                    )
                  : '—'
              }
            />
          </section>

          <AdminCard title="Sales over time">
            <div className="p-4" style={{ height: 280 }}>
              {salesSeries.length < 2 ? (
                <EmptyState
                  title="Not enough data to plot."
                  description="At least two days of activity are needed."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#141B2E1A" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="sold"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </AdminCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard title="Attendance funnel">
              <ul className="space-y-3 p-4">
                {funnel.map((stage, i) => (
                  <li key={stage.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-ink">
                        {stage.label}
                      </span>
                      <span className="text-ink/60">
                        {stage.value}
                        {i > 0 && (
                          <span className="ml-2 text-xs">
                            {stage.pct}% of previous
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink/10">
                      <div
                        className="h-full bg-sky"
                        style={{ width: `${stage.pct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </AdminCard>

            <AdminCard title="Tier performance">
              <div className="p-4" style={{ height: 240 }}>
                {tierSeries.length === 0 ? (
                  <EmptyState
                    title="No tiers configured."
                    description="Add at least one tier in the event editor."
                  />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tierSeries}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#141B2E1A"
                      />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="sold" stackId="a" fill="#2563EB" />
                      <Bar
                        dataKey="remaining"
                        stackId="a"
                        fill="#2563EB33"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminCard>
          </div>

          {isOrgWide && chapterRows.length > 0 && (
            <AdminCard title="Chapter breakdown">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">
                    Registrations and attendance by chapter
                  </caption>
                  <thead>
                    <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                      <th scope="col" className="px-4 py-3">Chapter</th>
                      <th scope="col" className="px-4 py-3">Registered</th>
                      <th scope="col" className="px-4 py-3">Checked in</th>
                      <th scope="col" className="px-4 py-3">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {chapterRows
                      .sort((a, b) => b.registered - a.registered)
                      .map((row) => (
                        <tr
                          key={row.code}
                          className="border-b border-ink/5 last:border-0"
                        >
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/events/${event.id}/registrations?chapterCode=${row.code}`}
                              className="text-ink hover:text-sky"
                            >
                              {row.name}
                            </Link>
                          </td>
                          <td className="px-4 py-3">{row.registered}</td>
                          <td className="px-4 py-3">{row.checkedIn}</td>
                          <td className="px-4 py-3">{row.rate}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          )}

          {insights.length > 0 && (
            <AdminCard title="Insights">
              <ul className="space-y-2 p-4">
                {insights.map((text, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-ink/10 bg-paper px-3 py-2 text-sm text-ink/80"
                  >
                    {text}
                  </li>
                ))}
              </ul>
            </AdminCard>
          )}
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  denominator,
  secondary,
}: {
  label: string;
  value: string;
  denominator?: string;
  secondary?: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">
        {value}
        {denominator && (
          <span className="ml-1 text-sm font-normal text-ink/50">
            / {denominator}
          </span>
        )}
      </p>
      {secondary && (
        <p className="mt-1 text-xs text-ink/60">{secondary}</p>
      )}
    </div>
  );
}

interface SalesPoint {
  date: string;
  sold: number;
}

function buildSalesSeries(
  regs: AdminRegistration[],
  range: RangeKey,
): SalesPoint[] {
  const paid = regs.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN',
  );
  if (paid.length === 0) return [];

  const now = Date.now();
  const cutoff =
    range === '7d'
      ? now - 7 * 24 * 60 * 60 * 1000
      : range === '30d'
      ? now - 30 * 24 * 60 * 60 * 1000
      : 0;

  const filtered = paid.filter(
    (r) => new Date(r.registeredAt).getTime() >= cutoff,
  );
  if (filtered.length === 0) return [];

  const bucket = new Map<string, number>();
  for (const r of filtered) {
    const d = new Date(r.registeredAt);
    const key = d.toISOString().slice(0, 10);
    bucket.set(key, (bucket.get(key) ?? 0) + 1);
  }

  const dates = Array.from(bucket.keys()).sort();
  let running = 0;
  return dates.map((date) => {
    running += bucket.get(date) ?? 0;
    return {
      date: new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      }),
      sold: running,
    };
  });
}

function buildInsights({
  regs,
  tiers,
  attendanceRate,
  noShowRate,
  refundRate,
  capacityPct,
}: {
  regs: AdminRegistration[];
  tiers: ReturnType<typeof getEventTiers>;
  attendanceRate: number | null;
  noShowRate: number | null;
  refundRate: number | null;
  capacityPct: number | null;
}): string[] {
  const out: string[] = [];
  const totalConfirmed = regs.filter(
    (r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN',
  ).length;

  if (attendanceRate != null && totalConfirmed > 0) {
    const checkedIn = regs.filter((r) => r.status === 'CHECKED_IN').length;
    out.push(
      `Attendance rate was ${attendanceRate}% (${checkedIn} of ${totalConfirmed} confirmed).`,
    );
  }
  if (noShowRate != null && noShowRate > 0 && totalConfirmed > 0) {
    const noShows = regs.filter((r) => r.status === 'NO_SHOW').length;
    out.push(
      `${noShows} no-shows (${noShowRate}% of ${totalConfirmed} confirmed).`,
    );
  }
  if (refundRate != null && refundRate > 0 && totalConfirmed > 0) {
    const refunded = regs.filter((r) => r.status === 'REFUNDED').length;
    out.push(
      `${refunded} registrations were refunded (${refundRate}% of ${totalConfirmed} sold).`,
    );
  }
  if (capacityPct != null && capacityPct >= 70) {
    out.push(`${capacityPct}% of capacity was filled.`);
  }
  if (tiers.length > 1) {
    const sorted = [...tiers].sort((a, b) => b.sold - a.sold);
    const top = sorted[0];
    const second = sorted[1];
    if (second.sold > 0) {
      out.push(
        `${top.name} outsold ${second.name} by ${top.sold - second.sold} tickets (${top.sold} vs ${second.sold}).`,
      );
    }
  }
  return out;
}