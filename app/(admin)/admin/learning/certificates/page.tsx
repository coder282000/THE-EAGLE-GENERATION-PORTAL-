'use client';

// ADM-059 — Certificate Management
// Route: /admin/learning/certificates

import { useMemo, useState } from 'react';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import {
  getCertificates,
  getCertificateCounts,
  canViewLearning,
  canManageCertificates,
  type Certificate,
} from '@/lib/mock/learning';

type Filter = 'ALL' | Certificate['status'];

export default function CertificatesPage() {
  const allowed = canViewLearning();
  const canManage = canManageCertificates();

  const certs = useMemo(() => (allowed ? getCertificates() : []), [allowed]);
  const counts = useMemo(() => getCertificateCounts(), []);

  const [filter, setFilter] = useState<Filter>('ALL');
  const [query, setQuery] = useState('');
  const [revokeOpenId, setRevokeOpenId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [revoked, setRevoked] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    let list = certs;
    if (filter !== 'ALL') list = list.filter((c) => c.status === filter);
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) =>
          c.verificationId.toLowerCase().includes(q) ||
          c.memberName.toLowerCase().includes(q) ||
          c.memberNumber.toLowerCase().includes(q) ||
          c.courseTitle.toLowerCase().includes(q)
      );
    }
    return list;
  }, [certs, filter, query]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the learning panel.</p>
        </Card>
      </div>
    );
  }

  function submitRevoke(id: string) {
    if (revokeReason.trim().length < 20) {
      setError('Revocation reason must be at least 20 characters.');
      return;
    }
    setError(null);
    setRevoked((r) => ({ ...r, [id]: revokeReason }));
    setRevokeOpenId(null);
    setRevokeReason('');
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-05 · Learning</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Certificate Management</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every certificate has a public verification URL at /verify/[id]. Issued certificates are
          immutable; revocation is a separate audited action.
        </p>
      </header>

      <section aria-label="Certificate counts" className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Total issued</dt>
            <dd className="mt-1 text-2xl font-semibold text-ink">{counts.total}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Active</dt>
            <dd className="mt-1 text-2xl font-semibold text-emerald-700">{counts.issued}</dd>
          </dl>
        </Card>
        <Card>
          <dl>
            <dt className="text-xs uppercase tracking-wide text-ink/60">Revoked</dt>
            <dd className={`mt-1 text-2xl font-semibold ${counts.revoked > 0 ? 'text-red-700' : 'text-ink'}`}>
              {counts.revoked}
            </dd>
          </dl>
        </Card>
      </section>

      {!canManage ? (
        <div role="note" className="mt-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view certificates but not revoke them. Admin or Super Admin only.
        </div>
      ) : null}

      {error ? (
        <div role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
          {error}
        </div>
      ) : null}

      <Card className="mt-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="cert-query" className="block text-xs font-medium text-ink/70">Search</label>
            <input
              id="cert-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Verification ID, member, course…"
              className="mt-1 w-72 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            />
          </div>
          <div>
            <label htmlFor="cert-status" className="block text-xs font-medium text-ink/70">Status</label>
            <select
              id="cert-status"
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="mt-1 rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
            >
              <option value="ALL">All statuses</option>
              <option value="ISSUED">Issued</option>
              <option value="REVOKED">Revoked</option>
            </select>
          </div>
          <div className="ml-auto text-xs text-ink/60">
            Showing {filtered.length} of {certs.length}
          </div>
        </div>
      </Card>

      <div className="mt-4 space-y-4">
        {filtered.length === 0 ? (
          <Card>
            <p className="text-center text-sm text-ink/60">No certificates match the current filters.</p>
          </Card>
        ) : (
          filtered.map((c) => {
            const isRevoked = c.status === 'REVOKED' || revoked[c.id];
            return (
              <Card key={c.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-mono text-sm font-semibold text-ink">{c.verificationId}</h2>
                      {isRevoked ? (
                        <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
                          Revoked
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                          Issued
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ink">{c.memberName} · {c.memberNumber}</p>
                    <p className="mt-1 text-xs text-ink/60">{c.courseTitle}</p>
                    <p className="mt-1 text-xs text-ink/60">
                      Issued {new Date(c.issuedAt).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div className="text-right text-xs text-ink/60">
                    <a
                      href={`/verify/${c.verificationId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky hover:underline"
                    >
                      Verify link →
                    </a>
                  </div>
                </div>

                {c.status === 'REVOKED' && c.revocationReason && !revoked[c.id] ? (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                    <p className="text-xs uppercase tracking-wide">Revocation reason</p>
                    <p className="mt-1">{c.revocationReason}</p>
                    {c.revokedAt ? (
                      <p className="mt-1 text-xs text-red-800">
                        Revoked {new Date(c.revokedAt).toLocaleDateString('en-GB')}
                      </p>
                    ) : null}
                  </div>
                ) : null}

                {revoked[c.id] ? (
                  <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                    Marked for revocation in this session. Reason: {revoked[c.id]}
                  </div>
                ) : null}

                {!isRevoked && canManage ? (
                  <div className="mt-4">
                    {revokeOpenId === c.id ? (
                      <div>
                        <label htmlFor={`rv-${c.id}`} className="block text-xs font-medium text-ink/70">
                          Revocation reason (minimum 20 characters, audited)
                        </label>
                        <textarea
                          id={`rv-${c.id}`}
                          rows={3}
                          value={revokeReason}
                          onChange={(e) => setRevokeReason(e.target.value)}
                          className="mt-1 w-full rounded-md border border-ink/15 bg-paper px-3 py-2 text-sm text-ink focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/40"
                        />
                        <div className="mt-3 flex gap-2">
                          <Button variant="destructive" onClick={() => submitRevoke(c.id)}>Confirm revoke</Button>
                          <Button variant="outline" onClick={() => { setRevokeOpenId(null); setRevokeReason(''); }}>
                            Cancel
                          </Button>
                        </div>
                        <p role="note" className="mt-2 text-xs text-clay">
                          Revocation is permanent and audited. Members see the verification URL return
                          &ldquo;revoked&rdquo; within seconds.
                        </p>
                      </div>
                    ) : (
                      <Button variant="outline" onClick={() => { setRevokeOpenId(c.id); setError(null); }}>
                        Revoke certificate
                      </Button>
                    )}
                  </div>
                ) : null}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}