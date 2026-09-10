'use client';

import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  totalItems?: number;
  /** Show first/last buttons — default true */
  showEdges?: boolean;
}

function getPageWindow(current: number, total: number, size = 5): (number | '…')[] {
  if (total <= size) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [];
  const left = Math.max(1, current - 1);
  const right = Math.min(total, current + 1);
  if (left > 1) pages.push(1);
  if (left > 2) pages.push('…');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < total - 1) pages.push('…');
  if (right < total) pages.push(total);
  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  totalItems,
  showEdges = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageWindow(currentPage, totalPages);

  const first = totalItems !== undefined && pageSize
    ? (currentPage - 1) * pageSize + 1
    : undefined;
  const last = totalItems !== undefined && pageSize
    ? Math.min(currentPage * pageSize, totalItems)
    : undefined;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-3 px-4 py-3 border-t border-border"
    >
      {/* Range summary — hidden on mobile */}
      {first !== undefined && last !== undefined && totalItems !== undefined ? (
        <p className="hidden sm:block text-xs text-fg-muted tabular-nums">
          Showing {first}–{last} of {totalItems}
        </p>
      ) : (
        <span className="hidden sm:block" />
      )}

      <div className="flex items-center gap-1 mx-auto sm:mx-0">
        {showEdges && (
          <PageButton
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First page"
          >
            «
          </PageButton>
        )}
        <PageButton
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹
        </PageButton>

        {/* Numbered — hidden on xs, replaced by "n of m" */}
        <span className="hidden sm:flex items-center gap-1">
          {pages.map((p, i) =>
            p === '…' ? (
              <span
                key={`gap-${i}`}
                aria-hidden="true"
                className="px-2 text-sm text-fg-subtle"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === currentPage ? 'page' : undefined}
                className={cn(
                  'min-w-8 h-8 px-2 rounded-md text-sm tabular-nums transition-colors',
                  'focus-visible:outline-none focus-visible:shadow-focus',
                  p === currentPage
                    ? 'bg-primary text-primary-fg'
                    : 'text-fg-muted hover:bg-paper-muted',
                )}
              >
                {p}
              </button>
            ),
          )}
        </span>

        {/* xs fallback */}
        <span className="sm:hidden text-sm text-fg-muted tabular-nums px-2">
          {currentPage} / {totalPages}
        </span>

        <PageButton
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ›
        </PageButton>
        {showEdges && (
          <PageButton
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last page"
          >
            »
          </PageButton>
        )}
      </div>
    </nav>
  );
}

interface PageButtonProps {
  onClick: () => void;
  disabled?: boolean;
  'aria-label': string;
  children: React.ReactNode;
}

function PageButton({ onClick, disabled, 'aria-label': ariaLabel, children }: PageButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'inline-flex items-center justify-center min-w-8 h-8 rounded-md text-sm',
        'text-fg-muted hover:bg-paper-muted',
        'transition-colors',
        'focus-visible:outline-none focus-visible:shadow-focus',
        'disabled:opacity-40 disabled:pointer-events-none',
      )}
    >
      {children}
    </button>
  );
}

Pagination.displayName = 'Pagination';