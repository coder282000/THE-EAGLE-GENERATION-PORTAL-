// components/admin/TaskItem.tsx
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import { cn } from "@/lib/utils";
import type { AdminTask } from "@/components/mock/data";

interface TaskItemProps {
  task: AdminTask;
}

const typeIcon: Record<AdminTask["type"], string> = {
  application: "📋",
  refund: "💸",
  moderation: "🛡️",
  kyc: "🪪",
  aml: "🚨",
  payout: "🔄",
  dispute: "⚖️",
};

export function TaskItem({ task }: TaskItemProps) {
  const priorityBorder: Record<AdminTask["priority"], string> = {
    critical: "border-l-rose-500",
    high: "border-l-clay",
    medium: "border-l-amber-400",
    low: "border-l-ink/20",
  };

  return (
    <Link
      href={task.href}
      className={cn(
        "block bg-white border border-ink/10 border-l-4 rounded-lg p-4 transition-all hover:shadow-md hover:border-sky/30 focus:outline-none focus:ring-2 focus:ring-sky/50",
        priorityBorder[task.priority]
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">
            {typeIcon[task.type]}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-ink truncate">
              {task.title}
            </p>
            <p className="text-sm text-ink/60 mt-0.5 line-clamp-2">
              {task.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-ink/50 font-mono">
                {task.entityId}
              </span>
              <span className="text-ink/40" aria-hidden="true">·</span>
              <span className="text-xs text-ink/60 truncate">
                {task.entityLabel}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={task.priority}>{task.priority}</StatusBadge>
          <span className="text-xs text-ink/50 whitespace-nowrap">
            {task.dueIn}
          </span>
        </div>
      </div>
    </Link>
  );
}