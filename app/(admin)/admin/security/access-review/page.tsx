'use client';

import { useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getAccessReviews,
  getAccessReviewStats,
  getRoleOptions,
  certifyAccess,
  flagForRevocation,
  revokeAccess,
  canViewAccessReview,
  canCertifyAccess,
  canFlagAccess,
  canRevokeAccess,
  ACCESS_REVIEW_STATUS_LABELS,
  type AccessReviewEntry,
  type AccessReviewStatus,
} from '@/lib/mock/audit';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { Button } from '@/components/button';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function statusToBadge(status: AccessReviewStatus): StatusKey {
  switch (status) {
    case 'ACTIVE':
      return 'active';
    case 'PENDING_REVIEW':
      return 'pending';
    case 'CERTIFIED':
      return 'approved';
    case 'REVOKE_PENDING':
      return 'medium';
    case 'REVOKED':
      return 'inactive';
  }
}

function isStale(entry: AccessReviewEntry): boolean {
  if (entry.reviewStatus === 'REVOKED') return false;
  if (entry.lastUsedAt == null) return true;
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
  return new Date(entry.lastUsedAt).getTime() < cutoff;
}

export default function AccessReviewPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string>('ALL');
  const [status, setStatus] = useState<AccessReviewStatus | 'ALL'>('ALL');
  const [staleOnly, setStaleOnly] = useState(false);
  const [version, setVersion] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = useMemo(() => getRoleOptions(), []);

  const items = useMemo(
    () => getAccessReviews(user, { role, status, staleOnly, q: search }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, role, status, staleOnly, search, version],
  );

  const stats = useMemo(
    () => getAccessReviewStats(user),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, version],
  );

  const canView = canViewAccessReview(user);
  const canCertify = canCertifyAccess(user);
  const canFlag = canFlagAccess(user);
  const canRevoke = canRevokeAccess(user);

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Access review is administrator-only.
        </h2>
      </div>
    );
  }

  function handleCertify(id: string) {
    setError(null);
    certifyAccess(user, id);
    setVersion((v) => v + 1);
  }

  function handleFlag(id: string) {
    setError(null);
    flagForRevocation(user, id);
    setVersion((v) => v + 1);
  }

  function handleRevoke(id: string) {
    setError(null);
    const ok = revokeAccess(user, id);
    if (!ok) {
      setError('At least one SUPER_ADMIN must remain active.');
      return;
    }
    setVersion((v) => v + 1);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Access review</h1>
        <p className="mt-1 text-sm text-ink/60">
          Recertify who holds which role. Next review: end of quarter.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800"
        >
          {error}
        </div>
      )}

      <section
        aria-label="Access review statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Total role grants" value={stats.total} />
        <StatTile
          label="Stale (90+ days)"
          value={stats.stale}
          tone={stats.stale > 0 ? 'warn' : 'default'}
        />
        <StatTile label="Pending review" value={stats.pending} />
        <StatTile
          label="Revoked this quarter"
          value={stats.revokedThisQuarter}
        />
      </section>

      <AdminCard
        title="Role grants"
        subtitle="Review each grant and certify, flag, or revoke."
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Member, email or role"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by role"
          >
            <option value="ALL">All roles</option>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as AccessReviewStatus | 'ALL')
            }
            className="rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            aria-label="Filter by status"
          >
            <option value="ALL">All states</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_REVIEW">Pending review</option>
            <option value="CERTIFIED">Certified</option>
            <option value="REVOKE_PENDING">Revoke pending</option>
            <option value="REVOKED">Revoked</option>
          </select>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={staleOnly}
              onChange={(e) => setStaleOnly(e.target.checked)}
            />
            Stale only
          </label>
        </div>

        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                search || role !== 'ALL' || status !== 'ALL' || staleOnly
                  ? 'No grants match these filters.'
                  : 'No role grants recorded.'
              }
              description={
                search || role !== 'ALL' || status !== 'ALL' || staleOnly
                  ? 'Try clearing the filters.'
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">
                  Role grants under access review
                </caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Member</th>
                    <th scope="col" className="px-4 py-3">Role</th>
                    <th scope="col" className="px-4 py-3">Granted</th>
                    <th scope="col" className="px-4 py-3">Last used</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((e) => {
                    const stale = isStale(e);
                    return (
                      <tr
                        key={e.id}
                        className="border-b border-ink/5 last:border-0 hover:bg-paper/60"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-ink">
                            {e.userName}
                          </div>
                          <div className="text-xs text-ink/50">
                            {e.userEmail}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="rounded bg-paper px-1.5 py-0.5 font-mono text-xs">
                            {e.role}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {formatDate(e.grantedAt)}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {e.lastUsedAt ? (
                            <>
                              {formatDate(e.lastUsedAt)}
                              {stale && (
                                <span className="ml-2 rounded-full bg-clay/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-clay">
                                  Stale
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="rounded-full bg-clay/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-clay">
                              Never used
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={statusToBadge(e.reviewStatus)}>
                            {ACCESS_REVIEW_STATUS_LABELS[e.reviewStatus]}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2 text-xs">
                            {canCertify && e.reviewStatus !== 'REVOKED' && (
                              <button
                                type="button"
                                onClick={() => handleCertify(e.id)}
                                className="text-sky hover:underline"
                              >
                                Certify
                              </button>
                            )}
                            {canFlag &&
                              e.reviewStatus !== 'REVOKED' &&
                              e.reviewStatus !== 'REVOKE_PENDING' && (
                                <button
                                  type="button"
                                  onClick={() => handleFlag(e.id)}
                                  className="text-clay hover:underline"
                                >
                                  Flag
                                </button>
                              )}
                            {canRevoke && e.reviewStatus !== 'REVOKED' && (
                              <button
                                type="button"
                                onClick={() => handleRevoke(e.id)}
                                className="text-rose-700 hover:underline"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {items.map((e) => (
                <li key={e.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-ink">{e.userName}</div>
                      <div className="text-xs text-ink/50">{e.userEmail}</div>
                    </div>
                    <StatusBadge status={statusToBadge(e.reviewStatus)}>
                      {ACCESS_REVIEW_STATUS_LABELS[e.reviewStatus]}
                    </StatusBadge>
                  </div>
                  <div className="font-mono text-xs text-ink/70">{e.role}</div>
                  <div className="text-xs text-ink/60">
                    Granted {formatDate(e.grantedAt)} · Last used{' '}
                    {formatDate(e.lastUsedAt)}
                  </div>
                  <div className="flex gap-3 text-xs">
                    {canCertify && e.reviewStatus !== 'REVOKED' && (
                      <button
                        type="button"
                        onClick={() => handleCertify(e.id)}
                        className="text-sky hover:underline"
                      >
                        Certify
                      </button>
                    )}
                    {canFlag &&
                      e.reviewStatus !== 'REVOKED' &&
                      e.reviewStatus !== 'REVOKE_PENDING' && (
                        <button
                          type="button"
                          onClick={() => handleFlag(e.id)}
                          className="text-clay hover:underline"
                        >
                          Flag
                        </button>
                      )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminCard>
    </div>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: 'default' | 'warn';
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        tone === 'warn' ? 'border-clay/40' : 'border-ink/10'
      }`}
    >
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}