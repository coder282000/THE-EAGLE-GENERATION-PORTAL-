'use client';

// ADM-167 — OTC Analytics
// Route: /admin/otc/analytics

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card } from '@/components/card';
import {
  getOTCAnalytics,
  getOTCOrderCounts,
  getOTCDisputeCounts,
  canViewOTC,
  formatMinor,
} from '@/lib/mock/otc';

const PIE_COLORS = ['#2563EB', '#D97706', '#7C3AED', '#059669', '#DC2626'];

function Kpi({
  label,
  value,
  denominator,
  hint,
}: {
  label: string;
  value: string;
  denominator?: string;
  hint?: string;
}) {
  return (
    <Card>
      <dl>
        <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
        <dd className="mt-1 font-mono text-2xl font-semibold text-ink">{value}</dd>
        {denominator ? (
          <dd className="mt-0.5 text-xs text-ink/60">
            <span className="font-medium">Denominator:</span> {denominator}
          </dd>
        ) : null}
        {hint ? <dd className="mt-1 text-xs text-ink/60">{hint}</dd> : null}
      </dl>
    </Card>
  );
}

export default function OTCAnalyticsPage() {
  const allowed = canViewOTC();
  const analytics = useMemo(() => (allowed ? getOTCAnalytics() : []), [allowed]);
  const orderCounts = useMemo(() => getOTCOrderCounts(), []);
  const disputeCounts = useMemo(() => getOTCDisputeCounts(), []);

  const volumeByPeriod = useMemo(
    () =>
      analytics.map((a) => ({
        period: a.period,
        volume: a.volumeMinor / 100,
        orders: a.orders,
      })),
    [analytics]
  );

  const outcomeSplit = useMemo(
    () => [
      { name: 'Completed', value: orderCounts.completed },
      { name: 'Cancelled', value: orderCounts.cancelled },
      { name: 'Disputed', value: orderCounts.disputed },
      {
        name: 'In flight',
        value: orderCounts.pending + orderCounts.escrowHeld + orderCounts.inFlight,
      },
    ],
    [orderCounts]
  );

  const latest = analytics[0] ?? null;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the OTC desk.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-13 · OTC Desk</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">OTC Analytics</h1>
        <p className="mt-1 text-sm text-ink/70">
          Volume, spread capture, completion rate and dispute rate across the desk. Every rate displays its
          denominator (FR-10.6).
        </p>
      </header>

      <section aria-label="Key performance indicators" className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi
          label="30-day volume"
          value={formatMinor(latest?.volumeMinor ?? 0, 'KES')}
          denominator={`${latest?.orders ?? 0} orders`}
        />
        <Kpi
          label="Completion rate"
          value={
            latest && latest.orders > 0
              ? `${((latest.completedOrders / latest.orders) * 100).toFixed(1)}%`
              : '—'
          }
          denominator={`${latest?.completedOrders ?? 0} of ${latest?.orders ?? 0} orders`}
        />
        <Kpi
          label="Avg spread capture"
          value={`${latest?.avgSpreadBps ?? 0} bps`}
          denominator={`${latest?.orders ?? 0} orders`}
          hint={`${formatMinor(latest?.spreadCaptureMinor ?? 0, 'KES')} captured`}
        />
        <Kpi
          label="Avg time to complete"
          value={latest ? `${latest.avgTimeToCompleteMinutes} min` : '—'}
          denominator={`${latest?.uniqueTraders ?? 0} unique traders`}
        />
      </section>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Volume by period</h2>
          <p className="mt-1 text-xs text-ink/60">Fiat value of traded volume. Axes in KES.</p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeByPeriod} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => Number(v ?? 0).toLocaleString('en-KE')} />
                <Tooltip
                  formatter={(v) => `KES ${Number(v ?? 0).toLocaleString('en-KE')}`}
                  labelStyle={{ fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Volume by period</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Volume (KES)</th>
                <th scope="col">Orders</th>
              </tr>
            </thead>
            <tbody>
              {volumeByPeriod.map((v) => (
                <tr key={v.period}>
                  <td>{v.period}</td>
                  <td>{v.volume.toLocaleString('en-KE')}</td>
                  <td>{v.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Order outcome split</h2>
          <p className="mt-1 text-xs text-ink/60">Every order, categorised by terminal state or in-flight.</p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeSplit}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={false}
                  labelLine={false}
                >
                  {outcomeSplit.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Order outcomes</caption>
            <thead>
              <tr>
                <th scope="col">Outcome</th>
                <th scope="col">Count</th>
              </tr>
            </thead>
            <tbody>
              {outcomeSplit.map((o) => (
                <tr key={o.name}>
                  <td>{o.name}</td>
                  <td>{o.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Orders by period</h2>
          <p className="mt-1 text-xs text-ink/60">Count of orders placed, including cancelled and disputed.</p>
          <div className="mt-4 h-64" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeByPeriod} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="orders" fill="#D97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <table className="sr-only">
            <caption>Orders by period</caption>
            <thead>
              <tr>
                <th scope="col">Period</th>
                <th scope="col">Orders</th>
              </tr>
            </thead>
            <tbody>
              {volumeByPeriod.map((v) => (
                <tr key={v.period}>
                  <td>{v.period}</td>
                  <td>{v.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Dispute rate</h2>
        <dl className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Open disputes</dt>
            <dd className="mt-1 text-xl font-semibold text-clay">{disputeCounts.open}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Investigating</dt>
            <dd className="mt-1 text-xl font-semibold text-sky">{disputeCounts.investigating}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Escalated</dt>
            <dd className="mt-1 text-xl font-semibold text-red-700">{disputeCounts.escalated}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Breached SLA</dt>
            <dd className="mt-1 text-xl font-semibold text-red-700">{disputeCounts.breachedSla}</dd>
          </div>
        </dl>
        {latest ? (
          <p className="mt-3 text-xs text-ink/60">
            Dispute rate is{' '}
            <span className="font-medium text-ink">
              {latest.orders > 0
                ? `${((latest.disputedOrders / latest.orders) * 100).toFixed(1)}%`
                : '—'}
            </span>{' '}
            of {latest.orders} orders in the last 30 days. Target: under 3%.
          </p>
        ) : null}
      </Card>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Reading these numbers</h2>
        <p className="mt-2 text-sm text-ink/70">
          Volume is stated in KES (fiat side), not USDT, because that is what the member sees and what the
          desk reconciles against. Spread capture is the fee income; it moves with volume and with tier mix.
          A rising dispute rate is an early signal of agent quality problems — cross-reference against
          ADM-165 Agent Management before suspending anyone.
        </p>
      </Card>
    </div>
  );
}