'use client';

import { Card } from '@/components/card';
import { LoanStatusBadge } from '@/components/credit/LoanStatusBadge';
import { formatCurrency } from '@/lib/utils';
import { mockGuarantees, mockLoanApplications, mockMembers } from '@/components/mock/data';

export default function MyGuaranteesPage() {
  // Assume current user is Grace (id '1') – she has guarantees as borrower and as guarantor
  const asGuarantor = mockGuarantees.filter((g) => g.guarantorId === '1');
  const asBorrower = mockGuarantees.filter((g) => g.borrowerId === '1');

  const totalExposure = asGuarantor.reduce((sum, g) => sum + g.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">My Guarantees & Exposure</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total Exposure (as Guarantor)</p>
          <p className="text-2xl font-bold">{formatCurrency(totalExposure, 'KES')}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Active Guarantees</p>
          <p className="text-2xl font-bold">{asGuarantor.filter((g) => g.status === 'ACTIVE').length}</p>
        </Card>
      </div>

      <div>
        <h3 className="font-semibold text-ink mb-3">As Guarantor</h3>
        {asGuarantor.length === 0 ? (
          <Card className="p-4 text-gray-500">You are not a guarantor for any loans.</Card>
        ) : (
          asGuarantor.map((g) => {
            const borrower = mockMembers.find((m) => m.id === g.borrowerId);
            return (
              <Card key={g.id} className="p-4 mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Borrower: {borrower?.firstName} {borrower?.lastName}</p>
                    <p className="text-sm text-gray-500">Amount: {formatCurrency(g.amount, 'KES')}</p>
                  </div>
                  <LoanStatusBadge status={g.status} />
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div>
        <h3 className="font-semibold text-ink mb-3">As Borrower</h3>
        {asBorrower.length === 0 ? (
          <Card className="p-4 text-gray-500">You have not requested any guarantors.</Card>
        ) : (
          asBorrower.map((g) => {
            const guarantor = mockMembers.find((m) => m.id === g.guarantorId);
            return (
              <Card key={g.id} className="p-4 mb-3">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">Guarantor: {guarantor?.firstName} {guarantor?.lastName}</p>
                    <p className="text-sm text-gray-500">Amount: {formatCurrency(g.amount, 'KES')}</p>
                  </div>
                  <LoanStatusBadge status={g.status} />
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}