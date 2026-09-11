"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  getMyCircles,
  getMyContributions,
  getMyPayouts,
  getUpcomingPayoutsForMyCircles,
  getMyMemberNumber,
  formatMoney,
  CIRCLE_TYPE_LABELS,
  CIRCLE_FREQUENCY_LABELS,
  CIRCLE_STATUS_LABELS,
  CONTRIBUTION_STATUS_LABELS,
  PAYOUT_STATUS_LABELS,
  type SavingsCircle,
  type ContributionStatus,
  type PayoutStatus,
  type CircleStatus,
} from "@/lib/mock/savings";

const CIRCLE_STATUS_TONE: Record<CircleStatus, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-clay/15 text-clay",
  COMPLETED: "bg-ink/10 text-ink/70",
  DISSOLVED: "bg-ink/10 text-ink/50",
};

const CONTRIBUTION_STATUS_TONE: Record<ContributionStatus, string> = {
  PAID: "bg-green-100 text-green-800",
  PENDING: "bg-sky/10 text-sky",
  FAILED: "bg-red-100 text-red-800",
  REVERSED: "bg-ink/10 text-ink/70",
  LATE: "bg-clay/15 text-clay",
};

const PAYOUT_STATUS_TONE: Record<PayoutStatus, string> = {
  PENDING: "bg-clay/15 text-clay",
  APPROVED: "bg-sky/10 text-sky",
  REJECTED: "bg-red-100 text-red-800",
  EXECUTED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
};

export default function SavingsOverviewPage() {
  const memberNumber = getMyMemberNumber();
  const myCircles = useMemo(() => getMyCircles(), []);
  const myContributions = useMemo(() => getMyContributions(), []);
  const myPayouts = useMemo(() => getMyPayouts(), []);
  const upcomingPayouts = useMemo(() => getUpcomingPayoutsForMyCircles(), []);

  const totalContributions = myContributions
    .filter((c) => c.status === "PAID")
    .reduce((s, c) => s + c.amountMinor, 0);

  const totalReceived = myPayouts
    .filter((p) => p.status === "EXECUTED")
    .reduce((s, p) => s + p.amountMinor, 0);

  const activeCircles = myCircles.filter((c) => c.status === "ACTIVE").length;
  const pendingContributions = myContributions.filter(
    (c) => c.status === "PENDING" || c.status === "LATE"
  );

  const recentContributions = myContributions.slice(0, 5);
  const nextPayout = upcomingPayouts[0];

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Savings</h1>
          <p className="mt-1 text-sm text-ink/60">
            Your circles, contributions, and upcoming payouts.
            {memberNumber && (
              <span className="ml-1 font-mono text-xs text-ink/50">
                ({memberNumber})
              </span>
            )}
          </p>
        </div>
        <Link
          href="/savings/circles/new"
          className="rounded-md border border-sky bg-sky px-3 py-1.5 text-xs text-white hover:bg-sky/90"
        >
          Create circle
        </Link>
      </header>

      {myCircles.length === 0 && (
        <div className="rounded-lg border border-clay/40 bg-clay/5 p-4 text-sm text-ink">
          You are not a member of any savings circle yet. Browse circles to join one, or create your own.
        </div>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Your contributions" value={formatMoney(totalContributions, "KES")} />
        <Kpi label="Received from payouts" value={formatMoney(totalReceived, "KES")} tone="success" />
        <Kpi
          label="Active circles"
          value={activeCircles}
          tone={activeCircles > 0 ? "success" : "ink"}
        />
        <Kpi
          label="Pending contributions"
          value={pendingContributions.length}
          tone={pendingContributions.length > 0 ? "clay" : "ink"}
        />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/60">
          Your circles ({myCircles.length})
        </h2>
        {myCircles.length === 0 ? (
          <div className="rounded-lg border border-ink/10 bg-paper p-8 text-center">
            <p className="text-sm text-ink/70">
              You are not a member of any savings circle yet.
            </p>
            <Link
              href="/savings/circles"
              className="mt-4 inline-block rounded-md border border-sky bg-sky px-3 py-1.5 text-xs text-white hover:bg-sky/90"
            >
              Browse circles
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {myCircles.map((circle: SavingsCircle) => (
              <Link
                key={circle.id}
                href={`/savings/circles/${circle.id}`}
                className="rounded-lg border border-ink/10 bg-paper p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink">{circle.name}</h3>
                    <p className="mt-0.5 text-xs text-ink/50">
                      {CIRCLE_TYPE_LABELS[circle.type]} / {circle.region}
                    </p>
                  </div>
                  <span
                    className={
                      "rounded-full px-2 py-0.5 text-xs " +
                      CIRCLE_STATUS_TONE[circle.status]
                    }
                  >
                    {CIRCLE_STATUS_LABELS[circle.status]}
                  </span>
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/50">Contribution</dt>
                    <dd className="mt-0.5 text-ink">
                      {formatMoney(circle.contributionMinor, circle.currency)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/50">Frequency</dt>
                    <dd className="mt-0.5 text-ink">
                      {CIRCLE_FREQUENCY_LABELS[circle.frequency]}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/50">Members</dt>
                    <dd className="mt-0.5 text-ink">{circle.memberCount}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/50">Next payout</dt>
                    <dd className="mt-0.5 text-ink">
                      {circle.nextPayoutAt
                        ? new Date(circle.nextPayoutAt).toLocaleDateString("en-GB")
                        : "—"}
                    </dd>
                  </div>
                </dl>

                {circle.arrearsCount > 0 && (
                  <p className="mt-3 text-xs text-clay">
                    {circle.arrearsCount} member{circle.arrearsCount === 1 ? "" : "s"} in arrears
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
              Your recent contributions
            </h2>
            <Link href="/savings/statements" className="text-xs text-sky hover:underline">
              View all
            </Link>
          </div>
          {recentContributions.length === 0 ? (
            <p className="text-sm text-ink/60">You have not made any contributions yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {recentContributions.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between border-b border-ink/5 pb-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-ink">{c.circleName}</div>
                    <div className="text-xs text-ink/50">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-ink">{formatMoney(c.amountMinor, c.currency)}</span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs " +
                        CONTRIBUTION_STATUS_TONE[c.status]
                      }
                    >
                      {CONTRIBUTION_STATUS_LABELS[c.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-lg border border-ink/10 bg-paper p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
              Upcoming payouts in your circles
            </h2>
            <Link href="/savings/statements" className="text-xs text-sky hover:underline">
              View all
            </Link>
          </div>
          {upcomingPayouts.length === 0 ? (
            <p className="text-sm text-ink/60">No pending payouts in your circles.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {upcomingPayouts.slice(0, 5).map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between border-b border-ink/5 pb-2"
                >
                  <div className="min-w-0">
                    <div className="truncate text-ink">{p.circleName}</div>
                    <div className="font-mono text-xs text-ink/50">
                      To {p.recipientMemberNumber}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-ink">{formatMoney(p.amountMinor, p.currency)}</span>
                    <span
                      className={
                        "rounded-full px-2 py-0.5 text-xs " + PAYOUT_STATUS_TONE[p.status]
                      }
                    >
                      {PAYOUT_STATUS_LABELS[p.status]}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {nextPayout && (
        <section className="rounded-lg border border-sky/30 bg-sky/5 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/60">
            Next payout in your circles
          </h2>
          <p className="mt-2 text-sm text-ink/80">
            {formatMoney(nextPayout.amountMinor, nextPayout.currency)} to{" "}
            <span className="font-mono text-xs">{nextPayout.recipientMemberNumber}</span> in{" "}
            {nextPayout.circleName}. Proposed{" "}
            {new Date(nextPayout.createdAt).toLocaleDateString("en-GB")}.
          </p>
          <p className="mt-1 text-xs text-ink/50">
            Payouts require two-person approval before execution.
          </p>
        </section>
      )}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <QuickAction href="/savings/statements" title="Statements" />
        <QuickAction href="/savings/circles" title="Browse circles" />
        <QuickAction href="/savings/circles/new" title="Create circle" />
        <QuickAction href="/profile/verification" title="KYC status" />
      </section>
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

function QuickAction({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-ink/10 bg-paper p-4 text-center transition-shadow hover:shadow-md"
    >
      <p className="text-sm font-medium text-ink">{title}</p>
    </Link>
  );
}