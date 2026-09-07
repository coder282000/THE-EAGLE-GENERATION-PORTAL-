'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { Select } from '@/components/select';
import { LoanApplicationStepper } from '@/components/credit/LoanApplicationStepper';
import { mockMembers } from '@/components/mock/data';

export default function LoanApplyGuarantorsPage() {
  const router = useRouter();
  const [guarantorIds, setGuarantorIds] = useState<string[]>([]);

  const availableMembers = mockMembers.filter((m) => m.id !== '1'); // exclude self

  const steps = [
    { label: 'Amount & Tenor', state: 'complete' as const },
    { label: 'Affordability', state: 'complete' as const },
    { label: 'Guarantors', state: 'current' as const },
    { label: 'Disclosure', state: 'upcoming' as const },
  ];

  const handleAddGuarantor = (id: string) => {
    if (!guarantorIds.includes(id)) {
      setGuarantorIds([...guarantorIds, id]);
    }
  };

  const handleRemove = (id: string) => {
    setGuarantorIds(guarantorIds.filter((g) => g !== id));
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/credit/apply/disclosure');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-ink mb-6">Loan Application – Guarantors</h1>
      <LoanApplicationStepper steps={steps} currentIndex={2} />
      <Card className="p-6 mt-4">
        <form onSubmit={handleNext} className="space-y-4">
          <Select
            label="Add a Guarantor"
            value=""
            onChange={(e) => handleAddGuarantor(e.target.value)}
            options={[
              { value: '', label: 'Select a member...' },
              ...availableMembers.map((m) => ({ value: m.id, label: `${m.firstName} ${m.lastName}` })),
            ]}
          />
          {guarantorIds.length > 0 && (
            <div>
              <h4 className="font-medium text-ink">Selected Guarantors</h4>
              <ul className="mt-2 space-y-2">
                {guarantorIds.map((id) => {
                  const member = mockMembers.find((m) => m.id === id);
                  return (
                    <li key={id} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                      <span>{member?.firstName} {member?.lastName}</span>
                      <Button variant="outline" size="sm" onClick={() => handleRemove(id)}>Remove</Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <Button variant="primary" type="submit" className="w-full" disabled={guarantorIds.length === 0}>
            Continue to Disclosure
          </Button>
        </form>
      </Card>
    </div>
  );
}