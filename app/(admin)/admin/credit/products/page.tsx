'use client';

// ADM-123 — Loan Product Configuration
// Route: /admin/credit/products

import { useMemo } from 'react';
import { Card } from '@/components/card';
import {
  getProducts,
  canViewCredit,
  canDecideCredit,
  PRODUCT_TYPE_LABELS,
  formatMinor,
  bpsToPct,
} from '@/lib/mock/credit';

export default function ProductsPage() {
  const allowed = canViewCredit();
  const canEdit = canDecideCredit();
  const products = useMemo(() => (allowed ? getProducts() : []), [allowed]);

  if (!allowed) {
    return (
      <div className="mx-auto max-w-3xl p-6">
        <Card>
          <h1 className="text-lg font-semibold text-ink">Permission denied</h1>
          <p className="mt-2 text-sm text-ink/70">You do not have access to the credit panel.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">PNL-10 · Credit</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Loan Product Configuration</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every product defines its own interest rate, tenor range, fees, and eligibility rules. The Total
          Cost of Credit disclosure shown to members is generated from this configuration.
        </p>
      </header>

      {!canEdit ? (
        <div role="note" className="mb-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
          Your role can view products but not modify them. Credit Manager or Super Admin only.
        </div>
      ) : null}

      <div className="space-y-4">
        {products.map((p) => (
          <Card key={p.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-mono text-sm font-semibold text-ink">{p.code}</h2>
                  <span className="inline-flex rounded-full bg-sky/15 px-2 py-0.5 text-xs font-medium text-sky">
                    {PRODUCT_TYPE_LABELS[p.type]}
                  </span>
                  {p.enabled ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-ink/10 px-2 py-0.5 text-xs font-medium text-ink/70">
                      Disabled
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink">{p.name}</p>
                <p className="mt-1 text-xs text-ink/60">
                  Last updated {new Date(p.updatedAt).toLocaleString('en-GB')} by {p.updatedBy}
                </p>
              </div>
              {canEdit ? (
                <button
                  type="button"
                  className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
                >
                  Edit product
                </button>
              ) : null}
            </div>

            <dl className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Amount range</dt>
                <dd className="mt-1 font-mono text-xs text-ink">
                  {formatMinor(p.minAmountMinor, 'KES')} — {formatMinor(p.maxAmountMinor, 'KES')}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Tenor</dt>
                <dd className="mt-1 font-mono text-sm text-ink">
                  {p.minTenorMonths}–{p.maxTenorMonths} months
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Interest</dt>
                <dd className="mt-1 font-mono text-sm text-ink">
                  {bpsToPct(p.interestRateBps)} {p.interestBasis === 'REDUCING' ? 'reducing' : 'flat'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Processing fee</dt>
                <dd className="mt-1 font-mono text-sm text-ink">{bpsToPct(p.processingFeeBps)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Insurance fee</dt>
                <dd className="mt-1 font-mono text-sm text-ink">{bpsToPct(p.insuranceFeeBps)}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Min KYC tier</dt>
                <dd className="mt-1 text-sm text-ink">{p.eligibilityMinKycTier === 2 ? 'Full' : 'Basic'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Min savings history</dt>
                <dd className="mt-1 text-sm text-ink">
                  {p.eligibilityMinSavingsMonths} month{p.eligibilityMinSavingsMonths === 1 ? '' : 's'}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Guarantors required</dt>
                <dd className="mt-1 text-sm text-ink">{p.requiresGuarantors ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h2 className="text-sm font-semibold text-ink">Why configuration drives disclosure</h2>
        <p className="mt-2 text-sm text-ink/70">
          The member-facing Total Cost of Credit (SCR-155) is generated from these values, never typed by
          hand. If the interest basis or fee percentage changes here, the disclosure to every new applicant
          changes with it. This is how the platform ensures the member sees the true cost before accepting
          an offer.
        </p>
      </Card>
    </div>
  );
}