'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Panel width in px when open. Default 480. */
  width?: number;
  children: ReactNode;
  /** Optional sticky footer with right-aligned actions */
  footer?: ReactNode;
  /** Optional slot between title and close button (e.g. Edit) */
  headerAction?: ReactNode;
  /** When true, the sheet fills its container height. Default true. */
  fullHeight?: boolean;
}

/**
 * Sheet — inline, push-style side panel.
 *
 * Renders as a flex sibling of its container. When open, takes `width` px.
 * When closed, collapses to 0 width with a smooth transition.
 *
 * Not a modal: focus is NOT trapped, Esc closes, no backdrop.
 * For overlay behaviour, use <Drawer> instead.
 *
 * Usage:
 *   <div className="flex h-screen">
 *     <main className="flex-1">…</main>
 *     <Sheet open={open} onClose={close} title="Detail">…</Sheet>
 *   </div>
 */
export function Sheet({
  open,
  onClose,
  title,
  description,
  width = 480,
  children,
  footer,
  headerAction,
  fullHeight = true,
}: SheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc closes the sheet
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus close button when the panel opens
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <aside
      role="complementary"
      aria-label={title}
      aria-hidden={!open}
      style={{ width: open ? width : 0 }}
      className={cn(
        'shrink-0 overflow-hidden border-l border-border',
        'transition-[width] duration-200 ease-in-out',
        'motion-reduce:transition-none',
        fullHeight && 'h-full',
      )}
    >
      <div
        className="h-full flex flex-col bg-paper-elevated"
        style={{ width }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-fg font-display truncate">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-fg-muted truncate">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {headerAction}
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className={cn(
                'inline-flex items-center justify-center h-8 w-8 rounded-md',
                'text-fg-subtle hover:text-fg hover:bg-paper-muted',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:shadow-focus',
              )}
              aria-label="Close panel"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 text-fg">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-paper-muted/40 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </aside>
  );
}

Sheet.displayName = 'Sheet';