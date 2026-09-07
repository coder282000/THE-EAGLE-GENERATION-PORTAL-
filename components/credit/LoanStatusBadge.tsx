interface LoanStatusBadgeProps {
  status: string;
}

export function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  const config: Record<string, { color: string; label: string }> = {
    DRAFT: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
    SUBMITTED: { color: 'bg-blue-100 text-blue-800', label: 'Submitted' },
    UNDER_REVIEW: { color: 'bg-amber-100 text-amber-800', label: 'Under Review' },
    APPROVED: { color: 'bg-emerald-100 text-emerald-800', label: 'Approved' },
    REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    OFFERED: { color: 'bg-purple-100 text-purple-800', label: 'Offer Extended' },
    DISBURSED: { color: 'bg-indigo-100 text-indigo-800', label: 'Disbursed' },
    REPAID: { color: 'bg-green-100 text-green-800', label: 'Repaid' },
    ACTIVE: { color: 'bg-sky-100 text-sky-800', label: 'Active' },
    PAID: { color: 'bg-emerald-100 text-emerald-800', label: 'Paid' },
    DEFAULTED: { color: 'bg-red-100 text-red-800', label: 'Defaulted' },
    RESTRUCTURED: { color: 'bg-orange-100 text-orange-800', label: 'Restructured' },
    PENDING: { color: 'bg-amber-100 text-amber-800', label: 'Pending' },
    ACCEPTED: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
    REJECTED_GUARANTOR: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
    RELEASED: { color: 'bg-gray-100 text-gray-800', label: 'Released' },
    CALLED: { color: 'bg-red-100 text-red-800', label: 'Called' },
  };
  const { color, label } = config[status] || { color: 'bg-gray-100 text-gray-800', label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{label}</span>;
}