'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface AuditEntry {
  id: string;
  actor: string;
  /** Short verb phrase, e.g. "approved application" */
  action: string;
  /** Optional target label shown after the action */
  target?: string;
  /** ISO timestamp */
  timestamp: string;
  /** Optional category for colour coding */
  category?: 'status' | 'note' | 'interview' | 'decision' | 'reopen' | 'default';
}

interface AuditTrailProps {
  entries: AuditEntry[];
  /** Show only this many initially — default 5 */
  defaultVisible?: number;
  /** Empty state copy */
  emptyMessage?: string;
  className?: string;
}

const categoryDot: Record<NonNullable<AuditEntry['category']>, string> = {
  status: 'bg-sky-500',
  note: 'bg-ink-400',
  interview: 'bg-dawn-500',
  decision: 'bg-primary',
  reopen: 'bg-clay-500',
  default: 'bg-ink-300',
};

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return 'just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function AuditTrail({
  entries,
  defaultVisible = 5,
  emptyMessage = 'No activity yet.',
  className,
}: AuditTrailProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? entries : entries.slice(0, defaultVisible);
  const hasMore = entries.length > defaultVisible;

  if (entries.length === 0) {
    return (
      <p className={cn('text-sm text-fg-subtle italic', className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      <ol className="relative space-y-3">
        {visible.map((entry, i) => {
          const isLast = i === visible.length - 1;
          const dotClass = categoryDot[entry.category ?? 'default'];

          return (
            <li key={entry.id} className="flex gap-3 min-w-0">
              <div className="relative flex flex-col items-center pt-1.5 shrink-0">
                <span
                  aria-hidden="true"
                  className={cn('w-2 h-2 rounded-full', dotClass)}
                />
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="flex-1 w-px bg-border my-1"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm text-fg leading-snug">
                  <span className="font-medium">{entry.actor}</span>{' '}
                  <span className="text-fg-muted">{entry.action}</span>
                  {entry.target && (
                    <>
                      {' '}
                      <span className="text-fg-subtle">{entry.target}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-fg-subtle mt-0.5">
                  {formatRelative(entry.timestamp)}
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      {hasMore && !showAll && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className={cn(
            'mt-2 text-xs font-medium text-primary hover:underline',
            'focus-visible:outline-none focus-visible:shadow-focus rounded',
          )}
        >
          Show all {entries.length} entries
        </button>
      )}
    </div>
  );
}

AuditTrail.displayName = 'AuditTrail';