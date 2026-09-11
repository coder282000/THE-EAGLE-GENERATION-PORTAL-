'use client';

// ADM-186 — Transaction Monitoring Rules Configuration
// Route: /admin/compliance/rules

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getMonitoringRules,
  canViewCompliance,
  canManageRules,
  AML_SEVERITY_LABELS,
  formatMinor,
  type MonitoringRule,
  type AMLAlertSeverity,
} from '@/lib/mock/compliance';

const SEVERITY_TONE: Record<AMLAlertSeverity, string> = {
  LOW: 'bg-ink/10 text-ink/70',
  MEDIUM: 'bg-clay/15 text-clay',
  HIGH: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900',
};

interface Draft {
  enabled: boolean;
  severity: AMLAlertSeverity;
  threshold: string;
  windowHours: string;
}

function toDraft(r: MonitoringRule): Draft {
  return {
    enabled: r.enabled,
    severity: r.severity,
    threshold: (r.thresholdMinor / 100).toFixed(2),
    windowHours: String(r.windowHours),
  };
}

export default function RulesPage() {
  const allowed = canViewCompliance();
  const canEdit = canManageRules();

  const rules = useMemo(() => (allowed ? getMonitoringRules() : []), [allowed]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function beginEdit(r: MonitoringRule) {
    setEditingId(r.id);
    setDraft(toDraft(r));
    setReason('');
    setError(null);
    setSavedAt(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft(null);
    setReason('');
    setError(null);
  }

  function validateAndConfirm() {
    if (!draft) return;
    const threshold = parseFloat(draft.threshold);
    const window = parseInt(draft.windowHours, 10);

    if (!Number.isFinite(threshold) || threshold < 0) return setError('Threshold must be a non-negative number.');
    if (!Number.isFinite(window) || window < 0) return setError('Window must be a non-negative whole number.');
    if (reason.trim().length < 20) return setError('Change reason must be at least 20 characters — rule changes are audited.');

    setError(null);
    setSavedAt(new Date().toISOString());
    setEditingId(null);
    setDraft(null);
    setReason('');
  }

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the compliance panel.</p>
        </Card>
      </div>
    );
  }

  const enabledCount = rules.filter((r) => r.enabled).length;

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-15 · Compliance</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Transaction Monitoring Rules</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every rule that raises an AML alert. Thresholds, velocity windows, and severity. Every change is
          audited with a mandatory reason.
        </p>
      </header>

      {savedAt ? (
        <div role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          Rule change recorded at {new Date(savedAt).toLocaleString('en-GB')}. In production this takes
          effect on the next monitoring cycle and writes to the audit trail with before/after.
        </div>
      ) : null}

      {!canEdit ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view rules but not modify them. Compliance Lead or Super Admin only.
        </div>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">
            {rules.length} rules · {enabledCount} enabled
          </h2>
          <p className="text-xs text-ink/60">
            Every rule must have an owner in the control evidence register (ADM-190).
          </p>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {rules.map((r) => {
          const isEditing = editingId === r.id && draft !== null;
          return (
            <Card key={r.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-mono text-sm font-semibold text-ink">{r.code}</h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_TONE[r.severity]}`}>
                      {AML_SEVERITY_LABELS[r.severity]}
                    </span>
                    {r.enabled ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                        Enabled
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink/70">
                        Disabled
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-ink">{r.name}</p>
                  <p className="mt-1 text-xs text-ink/60">
                    Last updated {new Date(r.updatedAt).toLocaleString('en-GB')} by {r.updatedBy}
                  </p>
                </div>
                {!isEditing && canEdit ? (
                  <Button variant="outline" onClick={() => beginEdit(r)}>Edit rule</Button>
                ) : null}
              </div>

              {isEditing && draft ? (
                <div className="mt-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Status</label>
                      <select
                        value={draft.enabled ? 'ON' : 'OFF'}
                        onChange={(e) => setDraft({ ...draft, enabled: e.target.value === 'ON' })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      >
                        <option value="ON">Enabled</option>
                        <option value="OFF">Disabled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Severity</label>
                      <select
                        value={draft.severity}
                        onChange={(e) => setDraft({ ...draft, severity: e.target.value as AMLAlertSeverity })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Threshold (KES)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={draft.threshold}
                        onChange={(e) => setDraft({ ...draft, threshold: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-ink/70">Window (hours)</label>
                      <input
                        type="number"
                        value={draft.windowHours}
                        onChange={(e) => setDraft({ ...draft, windowHours: e.target.value })}
                        className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm font-mono text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-xs font-medium text-ink/70">
                      Change reason (minimum 20 characters, audited)
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                    />
                  </div>

                  {error ? (
                    <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>
                  ) : null}

                  <div className="mt-3 flex gap-2">
                    <Button variant="primary" onClick={validateAndConfirm}>Save rule</Button>
                    <Button variant="outline" onClick={cancelEdit}>Cancel</Button>
                  </div>

                  <p role="note" className="mt-3 text-xs text-clay">
                    Four-eyes is not enforced on rule changes — every save is audited with before/after and
                    reason instead.
                  </p>
                </div>
              ) : (
                <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Threshold</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">
                      {formatMinor(r.thresholdMinor, 'KES')}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Window</dt>
                    <dd className="mt-1 font-mono text-sm text-ink">
                      {r.windowHours} hour{r.windowHours === 1 ? '' : 's'}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-ink/60">Description</dt>
                    <dd className="mt-1 text-sm text-ink">{r.description}</dd>
                  </div>
                </dl>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}