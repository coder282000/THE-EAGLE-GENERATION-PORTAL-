'use client';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive'
  | 'success'
  | 'clay'
  | 'danger'; // deprecated alias for destructive

type Size = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Render as a child element (e.g. Next.js Link) */
  asChild?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-primary-fg hover:bg-primary-hover active:translate-y-px disabled:bg-ink-200 disabled:text-ink-400',
  secondary:
    'bg-white text-ink-900 border border-ink-200 hover:border-ink-400 hover:bg-ink-50 disabled:text-ink-300 disabled:border-ink-100',
  outline:
    'bg-transparent text-ink-900 border border-ink-300 hover:bg-ink-50 hover:border-ink-400 disabled:text-ink-300 disabled:border-ink-100',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 disabled:text-ink-300',
  destructive:
    'bg-danger text-white hover:bg-clay-700 active:translate-y-px disabled:bg-clay-100 disabled:text-clay-300',
  danger:
    'bg-danger text-white hover:bg-clay-700 active:translate-y-px disabled:bg-clay-100 disabled:text-clay-300',
  success:
    'bg-success text-white hover:opacity-90 active:translate-y-px disabled:opacity-50',
  clay:
    'bg-clay-500 text-white hover:bg-clay-600 active:translate-y-px disabled:bg-clay-100 disabled:text-clay-300',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-6 text-base gap-2',
  icon: 'h-11 w-11 p-0',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth,
      loading,
      leadingIcon,
      trailingIcon,
      asChild,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-display font-medium',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:shadow-focus',
          'disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          />
        )}
        {!loading && leadingIcon}
        {children}
        {trailingIcon}
      </Comp>
    );
  },
);
Button.displayName = 'Button';