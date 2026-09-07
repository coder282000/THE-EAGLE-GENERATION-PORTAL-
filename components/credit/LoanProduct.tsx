import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { PillarTag } from '@/components/pillarTag';
import { formatCurrency } from '@/lib/utils';
import { LoanProduct } from '@/components/mock/data';

interface LoanProductCardProps {
  product: LoanProduct;
  userKycLevel?: number;
  userTier?: string;
  userSavingsBalance?: number;
}

export function LoanProductCard({ product, userKycLevel = 0, userTier = 'STUDENT', userSavingsBalance = 0 }: LoanProductCardProps) {
  const isEligible = () => {
    const criteria = product.eligibilityCriteria;
    if (userKycLevel < criteria.minKycLevel) return false;
    if (criteria.minMemberTier && userTier !== criteria.minMemberTier) return false;
    if (criteria.minSavingsBalance && userSavingsBalance < criteria.minSavingsBalance) return false;
    return true;
  };

  const eligible = isEligible();

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-ink">{product.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{product.description}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${product.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
          {product.status}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-gray-500">Amount</span>
          <p className="font-medium">{formatCurrency(product.minAmount, 'KES')} – {formatCurrency(product.maxAmount, 'KES')}</p>
        </div>
        <div>
          <span className="text-gray-500">Tenor</span>
          <p className="font-medium">{product.minTenor} – {product.maxTenor} months</p>
        </div>
        <div>
          <span className="text-gray-500">Interest Rate</span>
          <p className="font-medium">{product.interestRate}% p.a.</p>
        </div>
        <div>
          <span className="text-gray-500">Service Fee</span>
          <p className="font-medium">{formatCurrency(product.serviceFee, 'KES')}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        {eligible ? (
          <span className="text-xs text-emerald-600 font-medium">✅ You are eligible</span>
        ) : (
          <span className="text-xs text-amber-600 font-medium">⚠️ Not eligible – check KYC or requirements</span>
        )}
        <Link href={`/credit/products/${product.id}`}>
          <Button variant="primary" size="sm" disabled={!eligible || product.status !== 'ACTIVE'}>
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  );
}