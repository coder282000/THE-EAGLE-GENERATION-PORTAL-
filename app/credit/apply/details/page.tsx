'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { TextInput } from '@/components/input';
import { Textarea } from '@/components/textarea';
import { LoanApplicationStepper } from '@/components/credit/LoanApplicationStepper';

export default function LoanApplyDetailsPage() {
  const router = useRouter();
  const [purpose, setPurpose] = useState('');
  const [affordability, setAffordability] = useState('');

  const steps = [
    { label: 'Amount & Tenor', state: 'complete' as const },
    { label: 'Affordability', state: 'current' as const },
    { label: 'Guarantors', state: 'upcoming' as const },
    { label: 'Disclosure', state: 'upcoming' as const },
  ];

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/credit/apply/guarantors');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Loan Application – Affordability</h1>
      <LoanApplicationStepper steps={steps} currentIndex={1} />
      <Card className="p-6 mt-4">
        <form onSubmit={handleNext} className="space-y-4">
          <TextInput
            id="loan-purpose"
            label="Purpose of Loan"
            required
            value={purpose}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPurpose(e.target.value)
            }
          />
          <Textarea
            id="affordability-notes"
            label="Affordability Notes (income, expenses, etc.)"
            rows={4}
            value={affordability}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setAffordability(e.target.value)
            }
          />
          <Button
            variant="primary"
            type="submit"
            className="w-full"
          >
            Continue to Guarantors
          </Button>
        </form>
      </Card>
    </div>
  );
}