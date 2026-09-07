import { Repayment } from '@/components/mock/data';
import { formatCurrency } from '@/lib/utils';
import { LoanStatusBadge } from '@/components/credit/LoanStatusBadge';

interface RepaymentScheduleProps {
  repayments: Repayment[];
  currency?: string;
}

export default function RepaymentSchedule({ repayments, currency = 'KES' }: RepaymentScheduleProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-medium text-gray-500">Due Date</th>
            <th className="px-4 py-2 text-right font-medium text-gray-500">Amount</th>
            <th className="px-4 py-2 text-right font-medium text-gray-500">Paid</th>
            <th className="px-4 py-2 text-center font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {repayments.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 text-gray-700">{new Date(r.dueDate).toLocaleDateString()}</td>
              <td className="px-4 py-2 text-right font-medium">{formatCurrency(r.amount, currency)}</td>
              <td className="px-4 py-2 text-right">{r.paidAmount ? formatCurrency(r.paidAmount, currency) : '-'}</td>
              <td className="px-4 py-2 text-center">
                <LoanStatusBadge status={r.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}