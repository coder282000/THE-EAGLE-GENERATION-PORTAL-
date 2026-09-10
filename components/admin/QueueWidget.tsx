// components/admin/QueueWidget.tsx
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";
import type { QueueDepth } from "@/components/mock/data";

interface QueueWidgetProps {
  queue: QueueDepth;
}

export function QueueWidget({ queue }: QueueWidgetProps) {
  return (
    <Link
      href={queue.href}
      className="flex items-center justify-between gap-3 p-3 rounded-lg bg-paper hover:bg-sky/5 border border-ink/5 transition-colors focus:outline-none focus:ring-2 focus:ring-sky/50"
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink truncate">{queue.label}</p>
        <p className="text-xs text-ink/50 truncate">{queue.description}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg font-bold text-ink tabular-nums">
          {queue.count}
        </span>
        <StatusBadge status={queue.priority} showDot={false}>
          {queue.priority}
        </StatusBadge>
      </div>
    </Link>
  );
}