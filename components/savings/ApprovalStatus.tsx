interface ApprovalStatusProps {
  status: string;
  initiatedBy?: string;
  approvedBy?: string;
  scheduledDate?: string;
}

export default function ApprovalStatus({
  status,
  initiatedBy,
  approvedBy,
  scheduledDate,
}: ApprovalStatusProps) {
  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    PENDING: { label: 'Pending Approval', color: 'bg-amber-100 text-amber-800', icon: '⏳' },
    APPROVED: { label: 'Approved', color: 'bg-blue-100 text-blue-800', icon: '✅' },
    REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: '❌' },
    EXECUTED: { label: 'Executed', color: 'bg-emerald-100 text-emerald-800', icon: '✔️' },
    FAILED: { label: 'Failed', color: 'bg-red-100 text-red-800', icon: '❌' },
    REVERSED: { label: 'Reversed', color: 'bg-gray-100 text-gray-800', icon: '↩️' },
  };

  const config = statusConfig[status] || {
    label: status,
    color: 'bg-gray-100 text-gray-800',
    icon: '•',
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className={`px-2 py-1 rounded-full ${config.color}`}>
        {config.icon} {config.label}
      </span>
      {initiatedBy && (
        <span className="text-gray-500 text-xs">Initiated by: {initiatedBy}</span>
      )}
      {approvedBy && status === 'APPROVED' && (
        <span className="text-gray-500 text-xs">Approved by: {approvedBy}</span>
      )}
      {scheduledDate && (
        <span className="text-gray-500 text-xs">
          Scheduled: {new Date(scheduledDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}
