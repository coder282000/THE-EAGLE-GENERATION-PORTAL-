// components/admin/StatusBadge.tsx
import { cn } from "@/lib/utils";

export type StatusKey =
  | "active"
  | "inactive"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "draft"
  | "completed"
  | "failed"
  | "processing"
  | "critical"
  | "high"
  | "medium"
  | "low";

const statusVariants: Record<StatusKey, string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-ink/10 text-ink/50",
  pending: "bg-clay/20 text-clay",
  approved: "bg-sky/10 text-sky",
  rejected: "bg-rose-100 text-rose-700",
  suspended: "bg-ink/10 text-ink/60",
  draft: "bg-paper text-ink/50",
  completed: "bg-emerald-100 text-emerald-700",
  failed: "bg-rose-100 text-rose-700",
  processing: "bg-amber-100 text-amber-700",
  critical: "bg-rose-100 text-rose-700",
  high: "bg-clay/20 text-clay",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-ink/10 text-ink/60",
};

interface StatusBadgeProps {
  status: StatusKey;
  children: React.ReactNode;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  children,
  showDot = true,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        statusVariants[status]
      )}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current"
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}