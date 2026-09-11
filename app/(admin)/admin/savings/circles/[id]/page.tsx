"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/button";
import {
  getCircleById,
  getContributionsByCircle,
  getPayouts,
  getDisputes,
  canViewSavings,
  canActionSavings,
  formatMoney,
  drift,
  CIRCLE_TYPE_LABELS,
  CIRCLE_FREQUENCY_LABELS,
  CIRCLE_STATUS_LABELS,
  CIRCLE_HEALTH_LABELS,
  CONTRIBUTION_METHOD_LABELS,
  CONTRIBUTION_STATUS_LABELS,
  PAYOUT_STATUS_LABELS,
  DISPUTE_STATUS_LABELS,
  type CircleHealth,
} from "@/lib/mock/savings";

type Tab = "overview" | "members" | "contributions" | "payouts" | "ledger" | "disputes";

const HEALTH_TONE: Record<CircleHealth, string> = {
  HEALTHY: "bg-green-100 text-green-800",
  WATCHED: "bg-clay/15 text-clay",
  AT_RISK: "bg-red-100 text-red-800",
};

export default function CircleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tab, setTab] = useState<Tab>("overview");
  const [confirmPause, setConfirmPause] = useState(false);

  const canView = canViewSavings();
  const canAction = canActionSavings();
  const circle = getCircleById(id);

  if (!canView || !circle) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-ink/10 bg-paper p-6 text-sm text-ink/70">
          This circle does not exist or you do not have access.
        </div>
      </div>
    );
  }

  const contributions = getContributionsByCircle(circle.id);
  const circlePayouts = getPayouts().filter((p) => p.circleId === circle.id);
  const circleDisputes = getDisputes().filter((d) => d.circleId === circle.id);

  const totalContributed = contributions
    .filter((c) => c.status === "PAID")
    .reduce((s, c) => s + c.amountMinor, 0);

  const totalPaidOut = circlePayouts
    .filter((p) => p.status === "EXECUTED")
    .reduce((s, p) => s + p.amountMinor, 0);

  const balance = totalContributed - totalPaidOut;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/savings" className="text-sm text-sky hover:underline">
            Back to circles
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-ink">{circle.name}</h1>
          <p className="mt-1 text-sm text-ink/60">
            {CIRCLE_TYPE_LABELS[circle.type]} / {circle.region} / {circle.memberCount} members
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <span className={"rounded-full px-2 py-0.5 text-xs " + HEALTH_TONE[circle.health]}>
              {CIRCLE_HEALTH_LABELS[circle.health]}
            </span>
            <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
              {CIRCLE_STATUS_LABELS[circle.status]}
            </span>
          </div>
          {canAction && (
            <div className="flex gap-2">
              {circle.status === "ACTIVE" ? (
                <Button variant="destructive" onClick={() => setConfirmPause(true)}>
                  Pause circle
                </Button>
              ) : (
                <Button variant="primary" onClick={() => { /* resume */ }}>
                  Resume circle
                </Button>
              )}
              <Button variant="outline" onClick={() => { /* propose payout */ }}>
                Propose payout
              </Button>
            </div>
          )}
        </div>
      </div>

      <div role="tablist" className="flex flex-wrap border-b border-ink/10">
        {(["overview", "members", "contributions", "payouts", "ledger", "disputes"] as Tab[]).map((t) => (
          <TabButton key={t} active={tab === t} onClick={() => setTab(t)} label={t} />
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <Kpi label="Total contributed" value={formatMoney(totalContributed, circle.currency)} />
            <Kpi label="Total paid out" value={formatMoney(totalPaidOut, circle.currency)} />
            <Kpi label="Current balance" value={formatMoney(balance, circle.currency)} />
            <Kpi
              label="Next payout"
              value={circle.nextPayoutAt ? new Date(circle.nextPayoutAt).toLocaleDateString("en-GB") : "—"}
            />
            <Kpi
              label="Arrears"
              value={circle.arrearsCount}
              tone={circle.arrearsCount > 0 ? "clay" : "success"}
            />
          </div>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Circle details</h2>
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <Row k="Contribution amount" v={formatMoney(circle.contributionMinor, circle.currency)} />
              <Row k="Frequency" v={CIRCLE_FREQUENCY_LABELS[circle.frequency]} />
              <Row k="Health score" v={String(circle.healthScore)} />
              <Row k="Open disputes" v={String(circle.disputesOpen)} />
              {circle.leaderName && <Row k="Leader" v={circle.leaderName} />}
              {circle.lastContributionAt && (
                <Row k="Last contribution" v={new Date(circle.lastContributionAt).toLocaleString("en-GB")} />
              )}
            </dl>
          </section>

          <section className="rounded-lg border border-ink/10 bg-paper p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">Recent activity</h2>
            {contributions.length === 0 ? (
              <p className="text-sm text-ink/60">No ledger entries yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {contributions.slice(0, 10).map((c) => (
                  <li key={c.id} className="flex items-center justify-between border-b border-ink/5 pb-1">
                    <span className="text-ink/70">
                      {c.memberNumber} / {CONTRIBUTION_METHOD_LABELS[c.method]}
                    </span>
                    <span className="text-ink">{formatMoney(c.amountMinor, c.currency)}</span>
                    <span className="text-xs text-ink/50">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {tab === "members" && (
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
            Members ({circle.memberCount})
          </h2>
          <p className="text-sm text-ink/60">
            Member roster with contribution status is available on the member 360 view. Roster export is
            available from the toolbar.
          </p>
        </section>
      )}

      {tab === "contributions" && (
        <section className="rounded-lg border border-ink/10 bg-paper">
          {contributions.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">No contributions yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Contributions</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Date</th>
                    <th scope="col" className="px-4 py-2">Member no.</th>
                    <th scope="col" className="px-4 py-2">Amount</th>
                    <th scope="col" className="px-4 py-2">Method</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    <th scope="col" className="px-4 py-2">Ledger pair</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {contributions.map((c) => (
                    <tr key={c.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3 text-ink/70">
                        {new Date(c.createdAt).toLocaleDateString("en-GB")}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{c.memberNumber}</td>
                      <td className="px-4 py-3">{formatMoney(c.amountMinor, c.currency)}</td>
                      <td className="px-4 py-3">{CONTRIBUTION_METHOD_LABELS[c.method]}</td>
                      <td className="px-4 py-3">{CONTRIBUTION_STATUS_LABELS[c.status]}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink/50">{c.ledgerPairId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "payouts" && (
        <section className="rounded-lg border border-ink/10 bg-paper">
          {circlePayouts.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">No payouts yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Payouts</caption>
                <thead className="bg-ink/5 text-left text-xs uppercase tracking-wide text-ink/60">
                  <tr>
                    <th scope="col" className="px-4 py-2">Reference</th>
                    <th scope="col" className="px-4 py-2">Recipient</th>
                    <th scope="col" className="px-4 py-2">Amount</th>
                    <th scope="col" className="px-4 py-2">Proposed by</th>
                    <th scope="col" className="px-4 py-2">Approved by</th>
                    <th scope="col" className="px-4 py-2">Status</th>
                    <th scope="col" className="px-4 py-2">Ledger pair</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink/5">
                  {circlePayouts.map((p) => (
                    <tr key={p.id} className="hover:bg-ink/5">
                      <td className="px-4 py-3 font-medium text-ink">{p.reference}</td>
                      <td className="px-4 py-3 font-mono text-xs">{p.recipientMemberNumber}</td>
                      <td className="px-4 py-3">{formatMoney(p.amountMinor, p.currency)}</td>
                      <td className="px-4 py-3 text-ink/70">{p.initiatedBy}</td>
                      <td className="px-4 py-3 text-ink/70">{p.approvedBy ?? "—"}</td>
                      <td className="px-4 py-3">{PAYOUT_STATUS_LABELS[p.status]}</td>
                      <td className="px-4 py-3 font-mono text-xs text-ink/50">{p.ledgerPairId ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === "ledger" && (
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
              Ledger (append-only)
            </h2>
            <Button variant="outline" onClick={() => { /* verify */ }}>
              Verify ledger
            </Button>
          </div>
          <p className="mb-3 text-xs text-ink/60">
            Every contribution and payout is a double-entry pair. Balances are derived from these
            entries, never stored.
          </p>
          {contributions.length === 0 ? (
            <p className="text-sm text-ink/60">No ledger entries yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {contributions.map((c) => (
                <li key={c.id} className="grid grid-cols-4 gap-2 border-b border-ink/5 pb-2">
                  <span className="text-xs text-ink/50">
                    {new Date(c.createdAt).toLocaleDateString("en-GB")}
                  </span>
                  <span className="text-xs font-mono text-ink/70">{c.ledgerPairId}</span>
                  <span className="text-xs text-ink/70">Debit: circle</span>
                  <span className="text-right">{formatMoney(c.amountMinor, c.currency)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === "disputes" && (
        <section className="rounded-lg border border-ink/10 bg-paper">
          {circleDisputes.length === 0 ? (
            <div className="p-8 text-center text-sm text-ink/60">No disputes.</div>
          ) : (
            <ul className="divide-y divide-ink/5">
              {circleDisputes.map((d) => (
                <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 p-4 hover:bg-ink/5">
                  <div>
                    <div className="font-medium text-ink">{d.reference}</div>
                    <div className="mt-1 text-xs text-ink/60">{d.subject}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-ink/10 px-2 py-0.5 text-xs">
                      {DISPUTE_STATUS_LABELS[d.status]}
                    </span>
                    <Link
                      href="/admin/savings/disputes"
                      className="text-xs text-sky hover:underline"
                    >
                      Open workspace
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {confirmPause && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-paper p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-ink">Pause this circle?</h3>
            <p className="mt-2 text-sm text-ink/70">
              Members will not be able to contribute until it is resumed. A reason is required.
            </p>
            <textarea
              rows={3}
              placeholder="Reason (min 20 characters)"
              className="mt-4 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmPause(false)}>Cancel</Button>
              <Button variant="destructive" onClick={() => setConfirmPause(false)}>Pause circle</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={
        "border-b-2 px-4 py-2 text-sm capitalize " +
        (active ? "border-sky text-sky" : "border-transparent text-ink/60 hover:text-ink")
      }
    >
      {label}
    </button>
  );
}

function Kpi({ label, value, tone = "ink" }: { label: string; value: string | number; tone?: "ink" | "clay" | "danger" | "success" }) {
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