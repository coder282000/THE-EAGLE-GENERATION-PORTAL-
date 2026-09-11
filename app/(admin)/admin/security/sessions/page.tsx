'use client';

import { useMemo, useState } from 'react';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getActiveSessions,
  getSessionStats,
  revokeSession,
  revokeAllForUser,
  canViewSessions,
  canRevokeSession,
  canRevokeAllForUser,
  type Session,
} from '@/lib/mock/audit';
import { AdminCard } from '@/components/admin/AdminCard';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/admin/EmptyState';
import { Button } from '@/components/button';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

function deviceIcon(device: Session['device']): string {
  switch (device) {
    case 'mobile':
      return '📱';
    case 'tablet':
      return '📱';
    case 'desktop':
      return '💻';
    default:
      return '🖥️';
  }
}

function deviceLabel(device: Session['device']): string {
  switch (device) {
    case 'mobile':
      return 'Mobile';
    case 'tablet':
      return 'Tablet';
    case 'desktop':
      return 'Desktop';
    default:
      return 'Unknown';
  }
}

export default function ActiveSessionsPage() {
  const user = useCurrentUser();
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<
    | { kind: 'one'; session: Session }
    | { kind: 'all'; session: Session }
    | null
  >(null);
  const [version, setVersion] = useState(0);

  const items = useMemo(
    () => getActiveSessions(user, { q: search }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, search, version],
  );

  const stats = useMemo(() => getSessionStats(user), [user, version]);

  const canView = canViewSessions(user);
  const canRevoke = canRevokeSession(user);
  const canRevokeAll = canRevokeAllForUser(user);

  if (!canView) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You don&apos;t have access to active sessions.
        </h2>
      </div>
    );
  }

  function handleConfirm() {
    if (!confirm) return;
    if (confirm.kind === 'one') {
      revokeSession(user, confirm.session.id);
    } else {
      revokeAllForUser(user, confirm.session.userId);
    }
    setConfirm(null);
    setVersion((v) => v + 1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Active sessions</h1>
          <p className="mt-1 text-sm text-ink/60">
            Every authenticated session currently open on the platform.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setVersion((v) => v + 1)}
        >
          Refresh
        </Button>
      </header>

      <section
        aria-label="Session statistics"
        className="grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile label="Total sessions" value={stats.total} />
        <StatTile label="Unique users" value={stats.uniqueUsers} />
        <StatTile label="On mobile" value={stats.mobile} />
        <StatTile
          label="Longest idle"
          value={stats.longestIdleHours != null ? `${stats.longestIdleHours}h` : '—'}
        />
      </section>

      <AdminCard
        title="Sessions"
        subtitle="Revoke a session to sign the user out immediately."
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-ink/10 px-4 py-3">
          <div className="min-w-[220px] flex-1">
            <SearchInput
              value={search}
              onValueChange={setSearch}
              placeholder="Name, email, IP or device"
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title={
                search.trim()
                  ? 'No sessions match these filters.'
                  : 'No active sessions.'
              }
              description={
                search.trim() ? 'Try clearing the filters.' : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <table className="w-full border-collapse text-sm">
                <caption className="sr-only">Active sessions</caption>
                <thead>
                  <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-wide text-ink/60">
                    <th scope="col" className="px-4 py-3">Member</th>
                    <th scope="col" className="px-4 py-3">IP</th>
                    <th scope="col" className="px-4 py-3">Device</th>
                    <th scope="col" className="px-4 py-3">Started</th>
                    <th scope="col" className="px-4 py-3">Last seen</th>
                    <th scope="col" className="px-4 py-3">Expires</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-ink/5 last:border-0 hover:bg-paper/60"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-ink">
                          {s.userName}
                        </div>
                        <div className="text-xs text-ink/50">{s.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {s.ipAddress}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span aria-hidden="true" className="mr-1">
                          {deviceIcon(s.device)}
                        </span>
                        {deviceLabel(s.device)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatDateTime(s.startedAt)}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <time dateTime={s.lastSeenAt} title={formatDateTime(s.lastSeenAt)}>
                          {relativeTime(s.lastSeenAt)}
                        </time>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {formatDateTime(s.expiresAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-3 text-xs">
                          {canRevoke && (
                            <button
                              type="button"
                              onClick={() => setConfirm({ kind: 'one', session: s })}
                              className="text-rose-700 hover:underline"
                            >
                              Revoke
                            </button>
                          )}
                          {canRevokeAll && (
                            <button
                              type="button"
                              onClick={() => setConfirm({ kind: 'all', session: s })}
                              className="text-ink/60 hover:underline"
                            >
                              Revoke all
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <ul className="divide-y divide-ink/10 md:hidden">
              {items.map((s) => (
                <li key={s.id} className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium text-ink">{s.userName}</div>
                      <div className="text-xs text-ink/50">{s.userEmail}</div>
                    </div>
                    <span aria-hidden="true" className="text-lg">
                      {deviceIcon(s.device)}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-ink/70">
                    {s.ipAddress}
                  </div>
                  <div className="text-xs text-ink/60">
                    Last seen{' '}
                    <time dateTime={s.lastSeenAt}>
                      {relativeTime(s.lastSeenAt)}
                    </time>
                  </div>
                  {canRevoke && (
                    <button
                      type="button"
                      onClick={() => setConfirm({ kind: 'one', session: s })}
                      className="text-xs text-rose-700 hover:underline"
                    >
                      Revoke
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </AdminCard>

      {confirm && (
        <ConfirmDialog
          title={
            confirm.kind === 'one'
              ? 'Revoke this session?'
              : `Revoke all sessions for ${confirm.session.userName}?`
          }
          body={
            confirm.kind === 'one'
              ? 'The user will be signed out immediately.'
              : 'Every active session for this member will be terminated.'
          }
          confirmLabel={
            confirm.kind === 'one' ? 'Revoke' : 'Revoke all sessions'
          }
          onConfirm={handleConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4 shadow-sm">
      <p className="text-sm text-ink/60">{label}</p>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function ConfirmDialog({
  title,
  body,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-2 text-sm text-ink/70">{body}</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}