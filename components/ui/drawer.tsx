'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type DrawerSide = 'left' | 'right' | 'bottom';
type DrawerSize = 'sm' | 'md' | 'lg' | 'auto';

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  side?: DrawerSide;
  size?: DrawerSize;
  children: ReactNode;
  footer?: ReactNode;
  /** Optional action slot in the header (e.g. Edit button) */
  headerAction?: ReactNode;
}

const sideClasses: Record<DrawerSide, string> = {
  right: 'inset-y-0 right-0 h-full',
  left: 'inset-y-0 left-0 h-full',
  bottom: 'inset-x-0 bottom-0 w-full',
};

const sizeClasses: Record<DrawerSide, Record<DrawerSize, string>> = {
  right: {
    sm: 'w-full sm:w-[400px]',
    md: 'w-full sm:w-[520px]',
    lg: 'w-full sm:w-[720px]',
    auto: 'w-full sm:w-auto',
  },
  left: {
    sm: 'w-full sm:w-[400px]',
    md: 'w-full sm:w-[520px]',
    lg: 'w-full sm:w-[720px]',
    auto: 'w-full sm:w-auto',
  },
  bottom: {
    sm: 'h-[40vh]',
    md: 'h-[60vh]',
    lg: 'h-[85vh]',
    auto: 'h-auto max-h-[85vh]',
  },
};

export function Drawer({
  open,
  onOpenChange,
  title,
  description,
  side = 'right',
  size = 'md',
  children,
  footer,
  headerAction,
}: DrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus the close button on open as a stable landing point
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-overlay bg-ink-950/50 backdrop-blur-sm',
            'data-[state=open]:animate-[overlay-in_var(--duration-default)_var(--ease-out)]',
            'data-[state=closed]:animate-[overlay-out_180ms_var(--ease-in)]',
            'motion-reduce:animate-none',
          )}
        />
        <Dialog.Content
          data-side={side}
          className={cn(
            'drawer-content',
            'fixed z-modal bg-paper-elevated shadow-xl border border-border',
            'flex flex-col focus:outline-none',
            side === 'bottom'
              ? 'rounded-t-xl border-b-0'
              : side === 'right'
                ? 'rounded-l-xl border-r-0'
                : 'rounded-r-xl border-l-0',
            sideClasses[side],
            sizeClasses[side][size],
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border shrink-0">
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-lg font-semibold text-fg font-display">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="mt-1 text-sm text-fg-muted">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {headerAction}
              <Dialog.Close asChild>
                <button
                  ref={closeRef}
                  type="button"
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
              </Dialog.Close>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 text-fg">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={cn(
                'flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-paper-muted/40 shrink-0',
                side === 'bottom' && 'rounded-b-none',
                side === 'right' && 'rounded-bl-xl',
                side === 'left' && 'rounded-br-xl',
              )}
            >
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

Drawer.displayName = 'Drawer';