'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  size?: ModalSize;
  /**
   * Prevent Esc + backdrop click from closing the dialog.
   * Use for destructive confirmations where accidental dismissal loses data.
   */
  preventClose?: boolean;
  /** Hide the top-right X button */
  hideCloseButton?: boolean;
  children: ReactNode;
  /** Sticky footer, right-aligned */
  footer?: ReactNode;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-[400px]',
  md: 'max-w-[560px]',
  lg: 'max-w-[720px]',
  xl: 'max-w-[960px]',
  full: 'max-w-[calc(100vw-32px)]',
};

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  preventClose = false,
  hideCloseButton = false,
  children,
  footer,
}: ModalProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && preventClose) return;
    onOpenChange(next);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'modal-overlay',
            'fixed inset-0 z-overlay bg-ink-950/50 backdrop-blur-sm',
          )}
        />
        <Dialog.Content
          onPointerDownOutside={(e) => {
            if (preventClose) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (preventClose) e.preventDefault();
          }}
          className={cn(
            'modal-content',
            'fixed left-1/2 top-1/2 z-modal w-[calc(100vw-32px)]',
            '-translate-x-1/2 -translate-y-1/2',
            'bg-paper-elevated rounded-xl shadow-xl border border-border',
            'flex flex-col max-h-[calc(100vh-64px)]',
            'focus:outline-none',
            sizeClasses[size],
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b border-border">
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
            {!hideCloseButton && (
              <Dialog.Close asChild>
                <button
                  type="button"
                  className={cn(
                    'shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md',
                    'text-fg-subtle hover:text-fg hover:bg-paper-muted',
                    'transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:shadow-focus',
                  )}
                  aria-label="Close dialog"
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
            )}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 text-fg">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-paper-muted/40 rounded-b-xl">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

Modal.displayName = 'Modal';