'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getSupportAnalytics,
  canViewSupportAnalytics,
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  type TicketCategory,
  type TicketPriority,
} from '@/lib/mock/support';
import { AdminCard } from '@/components/admin/AdminCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/button';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type RangeKey = '7d' | '30d' | '90d' | 'q';

const RANGES: Array<{ key: RangeKey; label: string; days: number }> = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
  { key: 'q', label: 'This quarter', days: 90 },
];

function priorityColor(p: TicketPriority): string {
  switch (p) {
    case 'URGENT':
      return '#B8493D';
    case 'HIGH':
      return '#D97706';
    case 'NORMAL':
      return '#4A6FA5';
    case 'LOW':
      return '#141B2E33';
  }
}

export default function SupportAnalyticsPage() {
  const user = useCurrentUser();
  const [range, setRange] = useState<RangeKey>('30d');

  const canView = canViewSupportAnalytics(user);

  const rangeDays = useMemo(
    () => RANGES.find((r) => r.key === range)?.days ?? 30,
    [range],
  );

  const data = useMemo(
    () => getSupportAnalytics(user, rangeDays),
    [user, rangeDays],
  );

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Support analytics is administrator-only.
        </h2>
      </div>
    );
  }

  const hasData = data.created > 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <nav className="text-xs text-ink/50">
            <Link href="/admin/support" className="hover:text-sky">
              Support
            </Link>
            <span className="mx-1">/</span>
            <span>Analytics</span>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            Support analytics
          </h1>
          <p className="mt-1 text-sm text-ink/60">
            Volume, response times and common issues.
          </p>
        </div>
        <div className="flex gap-2">
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
          <Button
            type="button"
            variant="outline"
            disabled={!hasData}
          >
            Export report
          </Button>
        </div>
      </header>

      {!hasData ? (
        <AdminCard title="Analytics">
          <div className="p-8">
            <EmptyState
              title="No tickets in this range."
              description="Try a longer range, or wait for tickets to come in."
            />
          </div>
        </AdminCard>
      ) : (
        <>
          <section
            aria-label="Key metrics"
            className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6"
          >
            <KpiTile label="Tickets created" value={String(data.created)} />
            <KpiTile label="Tickets resolved" value={String(data.resolved)} />
            <KpiTile
              label="Median first response"
              value={
                data.medianFirstResponseHours != null
                  ? `${data.medianFirstResponseHours}h`
                  : '—'
              }
              denominator={
                data.medianFirstResponseHours != null
                  ? `over ${data.created} tickets`
                  : undefined
              }
            />
            <KpiTile
              label="Median resolve"
              value={
                data.medianResolveHours != null
                  ? `${data.medianResolveHours}h`
                  : '—'
              }
              denominator={
                data.medianResolveHours != null
                  ? `over ${data.resolved} tickets`
                  : undefined
              }
            />
            <KpiTile label="Backlog" value={String(data.backlog)} />
            <KpiTile
              label="Reopened"
              value={String(data.reopened)}
              denominator={
                data.created > 0
                  ? `${Math.round((data.reopened / data.created) * 100)}% of created`
                  : undefined
              }
            />
          </section>

          <AdminCard title="Volume over time">
            <div className="p-4" style={{ height: 280 }}>
              {data.volumeSeries.length < 2 ? (
                <EmptyState
                  title="Not enough data to plot."
                  description="At least two days of activity are needed."
                />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.volumeSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#141B2E1A" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="created"
                      stroke="#2563EB"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name="Created"
                    />
                    <Line
                      type="monotone"
                      dataKey="resolved"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={{ r: 2 }}
                      name="Resolved"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </AdminCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <AdminCard title="Category breakdown">
              <div className="p-4" style={{ height: 260 }}>
                {data.categoryBreakdown.length === 0 ? (
                  <EmptyState title="No tickets in this range." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.categoryBreakdown.map((c) => ({
                        name: TICKET_CATEGORY_LABELS[c.category as TicketCategory],
                        count: c.count,
                      }))}
                      layout="vertical"
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#141B2E1A"
                      />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                        width={100}
                      />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563EB" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminCard>

            <AdminCard title="Priority mix">
              <div className="p-4" style={{ height: 260 }}>
                {data.priorityMix.length === 0 ? (
                  <EmptyState title="No tickets in this range." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.priorityMix.map((p) => ({
                        name: TICKET_PRIORITY_LABELS[p.priority as TicketPriority],
                        count: p.count,
                        fill: priorityColor(p.priority as TicketPriority),
                      }))}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#141B2E1A"
                      />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563EB" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </AdminCard>
          </div>

          {data.topIssues.length > 0 && (
            <AdminCard title="Top issues">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <caption className="sr-only">Most frequent ticket subjects</caption>
                  <thead>
                    <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                      <th scope="col" className="px-4 py-3">Subject</th>
                      <th scope="col" className="px-4 py-3">Tickets</th>
                      <th scope="col" className="px-4 py-3">Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topIssues.map((issue, i) => (
                      <tr
                        key={`${issue.subject}-${i}`}
                        className="border-b border-ink/5 last:border-0"
                      >
                        <td className="px-4 py-3 text-ink">
                          {issue.subject}
                        </td>
                        <td className="px-4 py-3">{issue.count}</td>
                        <td className="px-4 py-3 text-xs text-ink/60">
                          {data.created > 0
                            ? `${Math.round((issue.count / data.created) * 100)}%`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminCard>
          )}
        </>
      )}
    </div>
  );
}

function KpiTile({
  label,
  value,
  denominator,
}: {
  label: string;
  value: string;
  denominator?: string;
}) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-1 text-xl font-bold text-ink">{value}</p>
      {denominator && (
        <p className="mt-0.5 text-xs text-ink/50">{denominator}</p>
      )}
    </div>
  );
}