'use client';

import * as ToastPrimitive from '@radix-ui/react-toast';
import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastVariant = 'default' | 'success' | 'danger';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** ms Ã¢â‚¬â€ default 5000 */
  duration?: number;
  action?: { label: string; onClick: () => void };
}

interface ToastRecord extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

const variantStyles: Record<ToastVariant, string> = {
  default: 'border-border bg-paper-elevated',
  success: 'border-success/40 bg-green-50',
  danger: 'border-danger/40 bg-clay-50',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { ...options, id }]);
  }, []);

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}

        {toasts.map((t) => (
          <ToastPrimitive.Root
            key={t.id}
            open
            onOpenChange={(o: boolean) => !o && dismiss(t.id)}
            duration={t.duration ?? 5000}
            className={cn(
              'flex items-start gap-3 rounded-lg border p-4 shadow-lg',
              'data-[state=open]:animate-[content-in_200ms_var(--ease-out)]',
              'data-[state=closed]:animate-[content-out_150ms_var(--ease-in)]',
              'data-[swipe=end]:animate-[content-out_150ms_var(--ease-in)]',
              'motion-reduce:animate-none',
              variantStyles[t.variant ?? 'default'],
            )}
          >
            <div className="flex-1 min-w-0">
              <ToastPrimitive.Title className="text-sm font-medium text-fg">
                {t.title}
              </ToastPrimitive.Title>
              {t.description && (
                <ToastPrimitive.Description className="mt-1 text-xs text-fg-muted">
                  {t.description}
                </ToastPrimitive.Description>
              )}
            </div>

            {t.action && (
              <ToastPrimitive.Action asChild altText={t.action.label}>
                <button
                  type="button"
                  onClick={t.action.onClick}
                  className={cn(
                    'shrink-0 text-xs font-medium text-primary hover:underline',
                    'focus-visible:outline-none focus-visible:shadow-focus rounded',
                  )}
                >
                  {t.action.label}
                </button>
              </ToastPrimitive.Action>
            )}

            <ToastPrimitive.Close
              aria-label="Close notification"
              className={cn(
                'shrink-0 -mt-1 -mr-1 inline-flex items-center justify-center h-6 w-6 rounded',
                'text-fg-subtle hover:text-fg hover:bg-paper-muted',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:shadow-focus',
              )}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        ))}

        <ToastPrimitive.Viewport
          className={cn(
            'fixed bottom-4 right-4 z-toast flex flex-col gap-2',
            'w-[calc(100vw-32px)] max-w-[380px]',
            'list-none m-0 p-0 outline-none',
          )}
        />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}