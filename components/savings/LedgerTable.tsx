import { formatCurrency } from '@/lib/utils';

interface LedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  type: 'CREDIT' | 'DEBIT';
  status?: 'PENDING' | 'COMPLETED' | 'FAILED';
}

interface LedgerTableProps {
  entries: LedgerEntry[];
  currency: string;
  title?: string;
}

export function LedgerTable({ entries, currency, title = 'Transaction History' }: LedgerTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No transactions yet.</p>
        <p className="text-sm">Contributions and payouts will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <h4 className="font-medium text-ink mb-2">{title}</h4>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry) => (
            <tr key={entry.id} className="hover:bg-gray-50">
              <td className="px-4 py-2 text-sm text-gray-600">
                {new Date(entry.date).toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-sm text-ink">{entry.description}</td>
              <td className={`px-4 py-2 text-sm font-medium text-right ${
                entry.type === 'CREDIT' ? 'text-emerald-600' : 'text-red-600'
              }`}>
                {entry.type === 'CREDIT' ? '+' : '-'}
                {formatCurrency(Math.abs(entry.amount), entry.currency)}
              </td>
              <td className="px-4 py-2 text-sm text-center">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  entry.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  entry.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {entry.status || 'COMPLETED'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}