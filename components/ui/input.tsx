'use client';

import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type InputState = 'default' | 'error' | 'success';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  state?: InputState;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  onTrailingClick?: () => void;
  /** Force monospace + tabular-nums — money, IDs, OTP */
  numeric?: boolean;
}

const stateClasses: Record<InputState, string> = {
  default: 'border-border focus:border-primary',
  error: 'border-danger focus:border-danger',
  success: 'border-success focus:border-success',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      state = 'default',
      leadingIcon,
      trailingIcon,
      onTrailingClick,
      numeric,
      className,
      type = 'text',
      ...props
    },
    ref,
  ) => {
    return (
      <div
        className={cn(
          'group flex items-center gap-2 rounded-md border bg-paper-elevated px-3',
          'transition-colors duration-150',
          'focus-within:shadow-focus',
          'has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-paper-muted has-[:disabled]:opacity-60',
          stateClasses[state],
          className,
        )}
      >
        {leadingIcon && (
          <span
            aria-hidden="true"
            className="shrink-0 text-fg-subtle group-focus-within:text-fg-muted"
          >
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          type={type}
          inputMode={numeric ? 'decimal' : undefined}
          className={cn(
            'flex-1 min-w-0 bg-transparent py-2 text-sm text-fg outline-none',
            'placeholder:text-fg-subtle',
            'disabled:cursor-not-allowed',
            numeric && 'font-mono tabular-nums',
          )}
          {...props}
        />
        {trailingIcon && (
          <button
            type="button"
            onClick={onTrailingClick}
            disabled={!onTrailingClick}
            tabIndex={onTrailingClick ? 0 : -1}
            aria-hidden={!onTrailingClick}
            className={cn(
              'shrink-0 text-fg-subtle hover:text-fg-muted',
              'focus-visible:outline-none focus-visible:shadow-focus rounded',
              !onTrailingClick && 'pointer-events-none',
            )}
          >
            {trailingIcon}
          </button>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';