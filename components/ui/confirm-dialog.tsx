'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { Modal } from './modal';
import { Button } from '@/components/button';
import { cn } from '@/lib/utils';

type ConfirmTone = 'default' | 'danger' | 'success';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Short explanation. Can contain <strong> and <code>. */
  description?: ReactNode;
  tone?: ConfirmTone;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Disable confirm button — e.g. reason field empty */
  confirmDisabled?: boolean;
  /** Confirm button shows loading spinner while true */
  loading?: boolean;
  /** May return a Promise — dialog stays in loading state until resolved */
  onConfirm: () => void | Promise<void>;
  /** Optional content between description and footer (e.g. reason textarea) */
  children?: ReactNode;
}

const toneStyles: Record<ConfirmTone, { icon: string; iconBg: string; iconColor: string }> = {
  default: {
    icon: 'i',
    iconBg: 'bg-sky-100',
    iconColor: 'text-sky-700',
  },
  danger: {
    icon: '!',
    iconBg: 'bg-clay-100',
    iconColor: 'text-clay-700',
  },
  success: {
    icon: '✓',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-700',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  tone = 'default',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmDisabled = false,
  loading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const styles = toneStyles[tone];

  // Focus the Cancel button when the dialog opens — safe default
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => cancelRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const confirmVariant =
    tone === 'danger' ? 'destructive' : tone === 'success' ? 'success' : 'primary';

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch {
      // Parent owns error handling (typically a toast).
      // Swallow here so the dialog stays open on failure.
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      // Block Esc + backdrop while an operation is running
      preventClose={loading}
      hideCloseButton={false}
      footer={
        <>
          <Button
            ref={cancelRef}
            variant="outline"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            size="md"
            onClick={handleConfirm}
            disabled={confirmDisabled}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div
          aria-hidden="true"
          className={cn(
            'shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-semibold',
            styles.iconBg,
            styles.iconColor,
          )}
        >
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0 space-y-4">
          {description && (
            <p className="text-sm text-fg-muted leading-relaxed">{description}</p>
          )}
          {children}
        </div>
      </div>
    </Modal>
  );
}

ConfirmDialog.displayName = 'ConfirmDialog';