'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DetailSectionProps {
  title: string;
  /** Optional action button (e.g. Edit) */
  action?: ReactNode;
  /** Field layout — 'stacked' for single column, 'grid' for two-column */
  layout?: 'stacked' | 'grid';
  children: ReactNode;
  className?: string;
}

interface DetailFieldProps {
  label: string;
  value: ReactNode;
  /** Renders "Not provided" in muted style when value is null/undefined */
  empty?: boolean;
  className?: string;
}

export function DetailSection({
  title,
  action,
  layout = 'grid',
  children,
  className,
}: DetailSectionProps) {
  const headingId = `section-${title.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'bg-paper-elevated border border-border rounded-lg',
        'p-6',
        className,
      )}
    >
      <header className="flex items-start justify-between gap-4 mb-4">
        <h2
          id={headingId}
          className="text-sm font-semibold uppercase tracking-wider text-fg-muted"
        >
          {title}
        </h2>
        {action && <div className="shrink-0">{action}</div>}
      </header>

      <div
        className={cn(
          layout === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4'
            : 'space-y-4',
        )}
      >
        {children}
      </div>
    </section>
  );
}

export function DetailField({
  label,
  value,
  empty = false,
  className,
}: DetailFieldProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <dt className="text-xs font-medium text-fg-subtle mb-1">{label}</dt>
      <dd
        className={cn(
          'text-sm break-words',
          empty ? 'text-fg-subtle italic' : 'text-fg',
        )}
      >
        {empty ? 'Not provided' : value}
      </dd>
    </div>
  );
}

DetailSection.displayName = 'DetailSection';
DetailField.displayName = 'DetailField';