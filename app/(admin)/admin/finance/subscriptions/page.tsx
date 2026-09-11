"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/button";
import {
  getSubscriptions,
  canViewCommerce,
  canActionCommerce,
  formatMoney,
  SUBSCRIPTION_STATUS_LABELS,
  type Subscription,
  type SubscriptionStatus,
} from "@/lib/mock/commerce";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const LineChart = dynamic(() => import("recharts").then((m) => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then((m) => m.Line), { ssr: false });
const XAxis = dynamic(() => import("recharts").then((m) => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then((m) => m.YAxis), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then((m) => m.Tooltip), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then((m) => m.CartesianGrid), { ssr: false });

const STATUS_TONE: Record<SubscriptionStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-clay/15 text-clay",
  DUNNING: "bg-red-100 text-red-800",
  CANCELLED: "bg-ink/10 text-ink/70",
  EXPIRED: "bg-ink/10 text-ink/50",
};

type ActionKey = null | "pause" | "resume" | "cancel" | "retry";

export default function SubscriptionsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<ActionKey>(null);

  const canView = canViewCommerce();
  const canAct = canActionCommerce();
  const all = useMemo(() => getSubscriptions(), []);

  const filtered = useMemo(() => {
    let r = all;
    if (statusFilter !== "all") r = r.filter((s) => s.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      r = r.filter(
        (s) =>
          s.memberNumber.toLowerCase().includes(q) ||
          s.planName.toLowerCase().includes(q)
      );
    }
    return r;
  }, [all, search, statusFilter]);

  if (!canView) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          You do not have permission to view subscriptions.
        </div>
      </div>
    );
  }

  const active = all.filter((s) => s.status === "ACTIVE");
  const mrr = active
    .filter((s) => s.frequency === "MONTHLY")
    .reduce((sum, s) => sum + s.amountMinor, 0);
  const dunning = all.filter((s) => s.status === "DUNNING").length;
  const cancelled = all.filter((s) => s.status === "CANCELLED").length;

  const activeSeries = [
    { date: "Apr", value: 2 },
    { date: "May", value: 3 },
    { date: "Jun", value: 3 },
    { date: "Jul", value: 4 },
    { date: "Aug", value: 5 },
    { date: "Sep", value: active.length },
  ];

  const mrrSeries = [
    { date: "Apr", value: 500000 },
    { date: "May", value: 750000 },
    { date: "Jun", value: 750000 },
    { date: "Jul", value: 1000000 },
    { date: "Aug", value: 1250000 },
    { date: "Sep", value: mrr },
  ];

  const selected = selectedId ? all.find((s) => s.id === selectedId) ?? null : null;

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Subscriptions</h1>
        <p className="mt-1 text-sm text-ink/60">
          Recurring membership revenue and subscriber status.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi label="Active" value={active.length} tone="success" />
        <Kpi label="MRR" value={formatMoney(mrr, "KES")} />
        <Kpi label="New this month" value={0} />
        <Kpi
          label="Churn (month)"
          value={`${active.length > 0 ? Math.round((cancelled / (active.length + cancelled)) * 100) : 0}%`}
          tone={cancelled > 0 ? "clay" : "ink"}
        />
        <Kpi label="In dunning" value={dunning} tone={dunning > 0 ? "danger" : "ink"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Active subscriptions
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            MRR (KES)
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mrrSeries.map((p) => ({ date: p.date, value: Math.round(p.value / 100) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={12} />
                <YAxis stroke="#6B7280" fontSize={12} />
                <Tooltip formatter={(v) => `KES ${Number(v ?? 0).toLocaleString("en-KE")}`} />
                <Line type="monotone" dataKey="value" stroke="#7C3AED" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-ink/10 bg-paper">
          <div className="flex flex-wrap gap-3 border-b border-ink/10 p-4">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search member no. or plan"
              className="flex-1 min-w-[200px] rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Search subscriptions"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {Object.entries(SUBSCRIPTION_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">
              No subscriptions match your filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Subscriptions</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Member no.</th>
                    <th scope="col" className="px-4 py-2">Plan</th>
                    <th scope="col" className="px-4 py-2">Amount</th>
                    <th scope="col" className="px-4 py-2">Freq</th>
                    <th scope="col" className="px-4 py-2">Next charge</th>
                    <th scope="col" className="px-4 py-2">Last</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {filtered.map((s: Subscription) => (
                    <tr
                      key={s.id}
                      onClick={() => { setSelectedId(s.id); setAction(null); }}
                      className={
                        "cursor-pointer hover:bg-ink/5 " +
                        (selectedId === s.id ? "bg-sky/5" : "")
                      }
                    >
                      <td className="px-4 py-3 font-mono text-xs">{s.memberNumber}</td>
                      <td className="px-4 py-3">{s.planName}</td>
                      <td className="px-4 py-3">{formatMoney(s.amountMinor, s.currency)}</td>
                      <td className="px-4 py-3 text-ink/70">{s.frequency}</td>
                      <td className="px-4 py-3 text-ink/70">
                        {s.nextChargeAt
                          ? new Date(s.nextChargeAt).toLocaleDateString("en-GB")
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-ink/70">
                        {s.lastChargeStatus ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[s.status]}>
                          {SUBSCRIPTION_STATUS_LABELS[s.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div>
          {!selected ? (
            <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/60">
              Select a subscription to view details.
            </div>
          ) : (
            <section className="rounded-lg border border-ink/10 bg-paper p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-xs text-ink/50">
                    {selected.memberNumber}
                  </div>
                  <h2 className="mt-1 text-base font-semibold text-ink">
                    {selected.planName}
                  </h2>
                </div>
                <span className={"rounded-full px-2 py-0.5 text-xs " + STATUS_TONE[selected.status]}>
                  {SUBSCRIPTION_STATUS_LABELS[selected.status]}
                </span>
              </div>

              <dl className="mt-4 grid gap-3 text-sm">
                <Row k="Amount" v={formatMoney(selected.amountMinor, selected.currency)} />
                <Row k="Frequency" v={selected.frequency} />
                <Row k="Started" v={new Date(selected.startedAt).toLocaleDateString("en-GB")} />
                {selected.nextChargeAt && (
                  <Row k="Next charge" v={new Date(selected.nextChargeAt).toLocaleDateString("en-GB")} />
                )}
                {selected.lastChargedAt && (
                  <Row
                    k="Last charged"
                    v={`${new Date(selected.lastChargedAt).toLocaleDateString("en-GB")} (${selected.lastChargeStatus})`}
                  />
                )}
                {selected.dunningAttempts > 0 && (
                  <Row k="Dunning attempts" v={String(selected.dunningAttempts)} />
                )}
                {selected.pausedUntil && (
                  <Row k="Paused until" v={new Date(selected.pausedUntil).toLocaleDateString("en-GB")} />
                )}
                {selected.cancellationReason && (
                  <Row k="Cancellation reason" v={selected.cancellationReason} />
                )}
              </dl>

              {canAct && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selected.status === "ACTIVE" && (
                    <Button variant="outline" onClick={() => setAction("pause")}>
                      Pause
                    </Button>
                  )}
                  {selected.status === "PAUSED" && (
                    <Button variant="outline" onClick={() => setAction("resume")}>
                      Resume
                    </Button>
                  )}
                  {selected.status === "DUNNING" && (
                    <Button variant="primary" onClick={() => setAction("retry")}>
                      Retry charge
                    </Button>
                  )}
                  {selected.status !== "CANCELLED" && selected.status !== "EXPIRED" && (
                    <Button variant="destructive" onClick={() => setAction("cancel")}>
                      Cancel
                    </Button>
                  )}
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {action && selected && (
        <ActionDialog
          action={action}
          subscription={selected}
          onClose={() => setAction(null)}
        />
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  tone = "ink",
}: {
  label: string;
  value: string | number;
  tone?: "ink" | "clay" | "danger" | "success";
}) {
  const tones: Record<string, string> = {
    ink: "text-ink",
    clay: "text-clay",
    danger: "text-red-600",
    success: "text-green-700",
  };
  return (
    <div className="rounded-lg border border-ink/10 bg-paper p-4">
      <div className="text-xs uppercase tracking-wide text-ink/50">{label}</div>
      <div className={"mt-1 text-lg font-semibold " + tones[tone]}>{value}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-ink/60">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

function ActionDialog({
  action,
  subscription,
  onClose,
}: {
  action: Exclude<ActionKey, null>;
  subscription: Subscription;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const [pauseDays, setPauseDays] = useState(30);
  const [typed, setTyped] = useState("");

  const titles: Record<Exclude<ActionKey, null>, string> = {
    pause: `Pause ${subscription.memberNumber}?`,
    resume: `Resume ${subscription.memberNumber}?`,
    cancel: `Cancel ${subscription.memberNumber}?`,
    retry: `Retry charge for ${subscription.memberNumber}?`,
  };

  const descriptions: Record<Exclude<ActionKey, null>, string> = {
    pause: "No charge will be attempted during the pause. The member is notified.",
    resume: "Charges will resume at the next cycle.",
    cancel: "The member will not be charged again. Existing charges are not refunded automatically. Type the member number to confirm.",
    retry: "This will attempt the charge again through the PSP. It is audited.",
  };

  const needReason = action === "cancel" && reason.trim().length < 20;
  const needTyped = action === "cancel" && typed.trim() !== subscription.memberNumber;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
      <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-ink">{titles[action]}</h3>
        <p className="mt-2 text-sm text-ink/70">{descriptions[action]}</p>

        {action === "pause" && (
          <div className="mt-4">
            <label className="block text-xs uppercase tracking-wide text-ink/60">
              Pause duration (days)
            </label>
            <input
              type="number"
              min={1}
              max={365}
              value={pauseDays}
              onChange={(e) => setPauseDays(Number(e.target.value) || 30)}
              className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
          </div>
        )}

        {action === "cancel" && (
          <>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-ink/60">
                Reason (min 20 chars)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs uppercase tracking-wide text-ink/60">
                Type {subscription.memberNumber} to confirm
              </label>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm font-mono"
              />
            </div>
          </>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant={action === "cancel" ? "destructive" : "primary"}
            disabled={needReason || needTyped}
            onClick={onClose}
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}