'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/card';
import { Button } from '@/components/button';
import { LoanStatusBadge } from '@/components/credit/LoanStatusBadge';
import RepaymentSchedule from '@/components/credit/RepaymentSchedule'; // Changed to default import
import { formatCurrency } from '@/lib/utils';
import { mockLoans } from '@/components/mock/data';

export default function LoanDetailPage() {
  const { id } = useParams();
  const loan = mockLoans.find((l) => l.id === id);

  if (!loan) {
    return <div className="text-center py-12 text-gray-500">Loan not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/credit/my-loans" className="hover:text-sky-600">← Back to My Loans</Link>
      </div>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-ink">Loan #{loan.id.slice(0, 8)}</h1>
          <div className="flex items-center gap-2 mt-1">
            <LoanStatusBadge status={loan.status} />
            <span className="text-sm text-gray-500">Disbursed {new Date(loan.disbursedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/credit/my-loans/${loan.id}/repay`}>
            <Button variant="primary" size="sm">Make Repayment</Button>
          </Link>
          <Link href={`/credit/my-loans/${loan.id}/settle`}>
            <Button variant="outline" size="sm">Settle Early</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-3"><p className="text-sm text-gray-500">Principal</p><p className="font-bold">{formatCurrency(loan.principal, 'KES')}</p></Card>
        <Card className="p-3"><p className="text-sm text-gray-500">Interest Rate</p><p className="font-bold">{loan.interestRate}%</p></Card>
        <Card className="p-3"><p className="text-sm text-gray-500">Total Cost</p><p className="font-bold">{formatCurrency(loan.totalCost, 'KES')}</p></Card>
        <Card className="p-3"><p className="text-sm text-gray-500">Outstanding</p><p className="font-bold">{formatCurrency(loan.outstandingBalance, 'KES')}</p></Card>
      </div>

      <Card className="p-4">
        <h3 className="font-semibold text-ink mb-3">Repayment Schedule</h3>
        <RepaymentSchedule repayments={loan.repayments} currency="KES" />
      </Card>

      {loan.status === 'DEFAULTED' && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-800 font-medium">⚠️ This loan is in arrears.</p>
          <p className="text-sm text-red-700 mt-1">Please contact support or request a restructure.</p>
          <Link href={`/credit/my-loans/${loan.id}/arrears`}>
            <Button variant="primary" size="sm" className="mt-2">Request Restructure</Button>
          </Link>
        </Card>
      )}
    </div>
  );
}