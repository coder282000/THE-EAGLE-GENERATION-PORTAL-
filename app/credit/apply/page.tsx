'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Select } from '@/components/select'; // corrected import
import { LoanApplicationStepper } from '@/components/credit/LoanApplicationStepper';
import { mockLoanProducts } from '@/components/mock/data';
import { formatCurrency } from '@/lib/utils';

export default function LoanApplyAmountPage() {
  const router = useRouter();
  const [productId, setProductId] = useState(mockLoanProducts[0]?.id || '');
  const [amount, setAmount] = useState('');
  const [tenor, setTenor] = useState('');

  const selectedProduct = mockLoanProducts.find((p) => p.id === productId);

  const steps = [
    { label: 'Amount & Tenor', state: 'current' as const },
    { label: 'Affordability', state: 'upcoming' as const },
    { label: 'Guarantors', state: 'upcoming' as const },
    { label: 'Disclosure', state: 'upcoming' as const },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    // Store in session/localStorage in real app
    router.push('/credit/apply/details');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Apply for a Loan</h1>
      <LoanApplicationStepper steps={steps} currentIndex={0} />
      <Card className="p-6 mt-4">
        <form onSubmit={handleNext} className="space-y-4">
          <Select
            id="loan-product"
            label="Select Product"
            value={productId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setProductId(e.target.value)
            }
            options={mockLoanProducts
              .filter((p) => p.status === 'ACTIVE')
              .map((p) => ({ value: p.id, label: p.name }))}
            required
          />
          {selectedProduct && (
            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p>Range: {formatCurrency(selectedProduct.minAmount, 'KES')} – {formatCurrency(selectedProduct.maxAmount, 'KES')}</p>
              <p>Tenor: {selectedProduct.minTenor} – {selectedProduct.maxTenor} months</p>
            </div>
          )}
          <TextInput
            id="loan-amount"
            label="Amount (KES)"
            type="number"
            required
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setAmount(e.target.value)
            }
            min={selectedProduct?.minAmount}
            max={selectedProduct?.maxAmount}
          />
          <TextInput
            id="loan-tenor"
            label="Tenor (months)"
            type="number"
            required
            value={tenor}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTenor(e.target.value)
            }
            min={selectedProduct?.minTenor}
            max={selectedProduct?.maxTenor}
          />
          <Button variant="primary" type="submit" className="w-full">
            Continue to Affordability
          </Button>
        </form>
      </Card>
    </div>
  );
}