'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { formatCurrency } from '@/lib/utils';
import { mockLoanProducts, mockKYCSubmissions, mockCircles } from '@/components/mock/data';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const product = mockLoanProducts.find((p) => p.id === id);

  // Mock current user
  const userKyc = mockKYCSubmissions.find((k) => k.userId === '1');
  const userKycLevel = userKyc?.status === 'approved' ? (userKyc.tier === 'enhanced' ? 2 : 1) : 0;
  const userTier = 'PROFESSIONAL';
  const userSavingsBalance = mockCircles
    .filter((c) => c.memberIds.includes('1'))
    .reduce((sum, c) => sum + c.totalBalance, 0);

  if (!product) {
    return <div className="text-center py-12 text-gray-500">Product not found.</div>;
  }

  const criteria = product.eligibilityCriteria;
  const isEligible =
    userKycLevel >= criteria.minKycLevel &&
    (!criteria.minMemberTier || userTier === criteria.minMemberTier) &&
    (!criteria.minSavingsBalance || userSavingsBalance >= criteria.minSavingsBalance);

  const eligibilityChecks = [
    { label: `KYC Level ${criteria.minKycLevel} required`, passed: userKycLevel >= criteria.minKycLevel },
    { label: `Member tier: ${criteria.minMemberTier || 'Any'}`, passed: !criteria.minMemberTier || userTier === criteria.minMemberTier },
    { label: `Minimum savings balance: ${criteria.minSavingsBalance ? formatCurrency(criteria.minSavingsBalance, 'KES') : 'None'}`, passed: !criteria.minSavingsBalance || userSavingsBalance >= criteria.minSavingsBalance },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/credit" className="hover:text-sky-600">← Back to Products</Link>
      </div>

      <h1 className="text-2xl font-bold text-ink">{product.name}</h1>
      <p className="text-gray-600">{product.description}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3">
          <p className="text-sm text-gray-500">Amount Range</p>
          <p className="font-bold">{formatCurrency(product.minAmount, 'KES')} – {formatCurrency(product.maxAmount, 'KES')}</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-gray-500">Tenor</p>
          <p className="font-bold">{product.minTenor} – {product.maxTenor} months</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-gray-500">Interest Rate</p>
          <p className="font-bold">{product.interestRate}% p.a.</p>
        </Card>
        <Card className="p-3">
          <p className="text-sm text-gray-500">Service Fee</p>
          <p className="font-bold">{formatCurrency(product.serviceFee, 'KES')}</p>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-ink mb-3">Eligibility Check</h3>
        <ul className="space-y-2">
          {eligibilityChecks.map((check, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              {check.passed ? '✅' : '❌'}
              <span className={check.passed ? 'text-emerald-700' : 'text-red-600'}>
                {check.label}
              </span>
            </li>
          ))}
        </ul>
        {isEligible ? (
          <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm">
            You are eligible for this loan product.
          </div>
        ) : (
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg text-sm">
            You are not currently eligible. Please meet the requirements above.
          </div>
        )}
      </Card>

      <div className="flex gap-3">
        <Link href="/credit/apply">
          <Button variant="primary" disabled={!isEligible || product.status !== 'ACTIVE'}>
            Apply Now
          </Button>
        </Link>
        <Button variant="outline" onClick={() => router.back()}>Back</Button>
      </div>
    </div>
  );
}