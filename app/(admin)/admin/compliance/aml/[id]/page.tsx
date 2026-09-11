'use client';

// ADM-183 — Alert Investigation Workspace
// Route: /admin/compliance/aml/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getAMLAlertById,
  getMemberRisk,
  canViewCompliance,
  canWorkCases,
  AML_STATUS_LABELS,
  AML_SEVERITY_LABELS,
  formatMinor,
  type AMLDisposition,
  type AMLAlertSeverity,
} from '@/lib/mock/compliance';

const STATUS_TONE: Record<AMLDisposition, string> = {
  PENDING: 'bg-clay/15 text-clay',
  TRUE_POSITIVE: 'bg-red-100 text-red-800',
  FALSE_POSITIVE: 'bg-ink/10 text-ink/70',
  ESCALATED: 'bg-clay/15 text-clay',
  SAR_FILED: 'bg-sky/15 text-sky',
};

const SEVERITY_TONE: Record<AMLAlertSeverity, string> = {
  LOW: 'bg-ink/10 text-ink/70',
  MEDIUM: 'bg-clay/15 text-clay',
  HIGH: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900',
};

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink/60">{label}</dt>
      <dd className={`mt-1 text-sm text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  );
}

const DISPOSITIONS: { value: AMLDisposition; label: string; help: string }[] = [
  {
    value: 'TRUE_POSITIVE',
    label: 'True positive — file SAR',
    help: 'Activity is confirmed suspicious. This will require a SAR to be drafted.',
  },
  {
    value: 'FALSE_POSITIVE',
    label: 'False positive — dismiss',
    help: 'Activity is consistent with expected behaviour. Reason is retained as a pattern signal.',
  },
  {
    value: 'ESCALATED',
    label: 'Escalate to Compliance Lead',
    help: 'Enhanced due diligence required. Case is queued for the Compliance Lead.',
  },
];

export default function AMLAlertWorkspacePage() {
  const params = useParams<{ id: string }>();
  const alert = useMemo(() => getAMLAlertById(params.id), [params.id]);
  const canWork = canWorkCases();

  const riskProfile = useMemo(() => {
    if (!alert) return null;
    return (
      getMemberRisk().find((r) => r.memberNumber === alert.memberNumber) ?? null
    );
  }, [alert]);

  const [disposition, setDisposition] = useState<AMLDisposition | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!canViewCompliance()) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the compliance panel.</p>
        </Card>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Alert not found</h1>
          <Link href="/admin/compliance/aml" className="mt-3 inline-block text-sm text-sky hover:underline">
            Back to alert queue
          </Link>
        </Card>
      </div>
    );
  }

  const isTerminal =
    alert.status === 'TRUE_POSITIVE' ||
    alert.status === 'FALSE_POSITIVE' ||
    alert.status === 'SAR_FILED';

  function submitDecision(e: React.FormEvent) {
    e.preventDefault();
    if (!disposition) {
      setError('Choose a disposition.');
      return;
    }
    if (reason.trim().length < 20) {
      setError('Reason must be at least 20 characters — this becomes part of the case record.');
      return;
    }
    setError(null);
    setSubmitted(true);
  }

  return (
    <div className="p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/admin/compliance" className="hover:text-sky">Compliance</Link>
        <span className="mx-2">/</span>
        <Link href="/admin/compliance/aml" className="hover:text-sky">AML</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{alert.reference}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · AML Investigation</p>
          <h1 className="mt-1 font-mono text-2xl font-semibold text-ink">{alert.reference}</h1>
          <p className="mt-1 text-sm text-ink/70">
            {alert.memberName} · {alert.memberNumber} · {alert.ruleName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${SEVERITY_TONE[alert.severity]}`}>
            {AML_SEVERITY_LABELS[alert.severity]}
          </span>
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[alert.status]}`}>
            {AML_STATUS_LABELS[alert.status]}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-ink">Alert details</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label="Rule" value={alert.ruleName} />
            <Field label="Rule code" value={alert.ruleCode} mono />
            <Field label="Amount" value={formatMinor(alert.amountMinor, alert.currency)} mono />
            <Field label="Raised" value={new Date(alert.raisedAt).toLocaleString('en-GB')} />
            <Field label="SLA (hours)" value={String(alert.slaHours)} />
            {alert.assignee ? <Field label="Assignee" value={alert.assignee} /> : null}
          </dl>
          <div className="mt-4">
            <dt className="text-xs uppercase tracking-wide text-ink/60">Description</dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">{alert.description}</dd>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-ink">Member 360</h2>
          {riskProfile ? (
            <dl className="mt-4 space-y-3">
              <Field label="Name" value={riskProfile.memberName} />
              <Field label="Member number" value={riskProfile.memberNumber} mono />
              <Field label="Jurisdiction" value={riskProfile.jurisdiction} />
              <Field label="KYC tier" value={String(riskProfile.kycTier)} />
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Risk score</dt>
                <dd className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-lg font-semibold text-ink">
                    {riskProfile.score}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                      riskProfile.band === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : riskProfile.band === 'MEDIUM'
                        ? 'bg-clay/15 text-clay'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {riskProfile.band}
                  </span>
                </dd>
              </div>
              {riskProfile.flags.length > 0 ? (
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Flags</dt>
                  <dd className="mt-1 flex flex-wrap gap-1">
                    {riskProfile.flags.map((f) => (
                      <span
                        key={f}
                        className="rounded-full bg-clay/15 px-2 py-0.5 text-xs font-medium text-clay"
                      >
                        {f}
                      </span>
                    ))}
                  </dd>
                </div>
              ) : null}
              <Link
                href={`/admin/members`}
                className="inline-block text-sm text-sky hover:underline"
              >
                Open full member 360 →
              </Link>
            </dl>
          ) : (
            <p className="mt-3 text-sm text-ink/60">
              No risk profile on file for this member.
            </p>
          )}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Transaction graph</h2>
        <p className="mt-2 text-sm text-ink/70">
          In production this panel displays a graph of the member&apos;s transactions around the alert
          window — inbound sources, outbound destinations, and the counterparties involved. The graph is
          rendered from the append-only ledger, never from a mutable balance.
        </p>
        <div className="mt-4 rounded-lg border border-dashed border-ink/20 bg-paper p-8 text-center text-sm text-ink/50">
          Transaction graph placeholder — 14 transactions in the review window
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Disposition</h2>

        {!canWork ? (
          <p className="mt-2 text-sm text-ink/60">
            Your role can view alerts but not disposition them. Compliance Analyst, Compliance Lead, and
            Super Admin only.
          </p>
        ) : isTerminal && !submitted ? (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            This alert is already dispositioned: {AML_STATUS_LABELS[alert.status]}.
            {alert.reason ? <p className="mt-1 text-emerald-800">Reason: {alert.reason}</p> : null}
            {alert.sarReference ? (
              <p className="mt-1 text-emerald-800">
                Linked SAR:{' '}
                <Link href="/admin/compliance/sars" className="underline">
                  {alert.sarReference}
                </Link>
              </p>
            ) : null}
          </div>
        ) : submitted ? (
          <div role="status" className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
            Disposition recorded: {disposition ? AML_STATUS_LABELS[disposition] : ''}. 
            {disposition === 'TRUE_POSITIVE' ? ' A draft SAR has been queued for the Compliance Lead.' : ''}
            {disposition === 'FALSE_POSITIVE' ? ' The reason will be retained as a pattern signal.' : ''}
            {disposition === 'ESCALATED' ? ' The Compliance Lead has been notified.' : ''}
          </div>
        ) : (
          <form onSubmit={submitDecision} className="mt-3">
            <fieldset>
              <legend className="text-xs font-medium text-ink/70">Disposition</legend>
              <div className="mt-2 space-y-2">
                {DISPOSITIONS.map((opt) => (
                  <label
                    key={opt.value}
                    className={`block cursor-pointer rounded-lg border p-3 ${
                      disposition === opt.value
                        ? 'border-sky bg-sky/5'
                        : 'border-ink/15 bg-paper hover:bg-ink/5'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="disposition"
                        value={opt.value}
                        checked={disposition === opt.value}
                        onChange={() => setDisposition(opt.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className={`text-sm font-medium ${disposition === opt.value ? 'text-sky' : 'text-ink'}`}>
                          {opt.label}
                        </p>
                        <p className="mt-0.5 text-xs text-ink/60">{opt.help}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="mt-4">
              <label htmlFor="aml-reason" className="block text-xs font-medium text-ink/70">
                Reason (minimum 20 characters, audited)
              </label>
              <textarea
                id="aml-reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'aml-error' : undefined}
              />
              {error ? (
                <p id="aml-error" role="alert" className="mt-1 text-xs text-red-700">{error}</p>
              ) : (
                <p className="mt-1 text-xs text-ink/60">{reason.length} / 20 minimum</p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <Button variant="primary" type="submit">Record disposition</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setDisposition(null);
                  setReason('');
                  setError(null);
                }}
              >
                Clear
              </Button>
            </div>
            <p role="note" className="mt-3 text-xs text-clay">
              Dispositions cannot be changed from this screen once recorded. Corrections require a
              separate audited action by the Compliance Lead.
            </p>
          </form>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="text-sm font-semibold text-ink">Timeline</h2>
        <ol className="mt-4 space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-clay" aria-hidden />
            <div>
              <p className="text-ink">Alert raised by {alert.ruleName}</p>
              <p className="text-xs text-ink/60">{new Date(alert.raisedAt).toLocaleString('en-GB')}</p>
            </div>
          </li>
          {alert.assignee ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky" aria-hidden />
              <div>
                <p className="text-ink">Assigned to {alert.assignee}</p>
              </div>
            </li>
          ) : null}
          {alert.decidedAt ? (
            <li className="flex gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-600" aria-hidden />
              <div>
                <p className="text-ink">
                  {AML_STATUS_LABELS[alert.status]} — {alert.reason ?? 'No reason recorded'}
                </p>
                <p className="text-xs text-ink/60">{new Date(alert.decidedAt).toLocaleString('en-GB')}</p>
              </div>
            </li>
          ) : null}
        </ol>
      </Card>
    </div>
  );
}