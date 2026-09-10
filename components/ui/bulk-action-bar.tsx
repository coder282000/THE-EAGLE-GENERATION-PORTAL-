'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BulkAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'success';
  /** Show only when predicate returns true */
  visible?: (count: number) => boolean;
  disabled?: boolean;
}

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  actions: BulkAction[];
  /** Singular noun — pluralised with an `s` for counts > 1 */
  itemNoun: string;
  className?: string;
  /** Additional content — e.g. a reason field for reject */
  children?: ReactNode;
}

const actionStyles = {
  default: 'bg-sky-100 text-sky-800 hover:bg-sky-200',
  danger: 'bg-clay-100 text-clay-800 hover:bg-clay-200',
  success: 'bg-green-100 text-green-800 hover:bg-green-200',
};

export function BulkActionBar({
  selectedCount,
  onClear,
  actions,
  itemNoun,
  className,
  children,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  const plural = selectedCount === 1 ? itemNoun : `${itemNoun}s`;
  const visibleActions = actions.filter((a) => !a.visible || a.visible(selectedCount));

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-md bg-paper-muted border border-border p-3',
        className,
      )}
    >
      <span
        aria-live="polite"
        className="text-sm font-medium text-fg tabular-nums"
      >
        {selectedCount} {plural} selected
      </span>

      <div className="flex flex-wrap gap-2">
        {visibleActions.map((action, i) => (
          <button
            key={`${action.label}-${i}`}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:shadow-focus',
              'disabled:opacity-50 disabled:pointer-events-none',
              actionStyles[action.variant ?? 'default'],
            )}
          >
            {action.label}
          </button>
        ))}
      </div>

      {children}

      <button
        type="button"
        onClick={onClear}
        className={cn(
          'ml-auto text-sm text-fg-muted hover:text-fg',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:shadow-focus rounded',
        )}
      >
        Clear
      </button>
    </div>
  );
}

BulkActionBar.displayName = 'BulkActionBar';