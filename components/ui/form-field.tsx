'use client';

import { ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
  success?: string;
  required?: boolean;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': true | undefined;
    'aria-required': true | undefined;
  }) => ReactNode;
  className?: string;
}

export function FormField({
  id,
  label,
  hint,
  error,
  success,
  required,
  children,
  className,
}: FormFieldProps) {
  const generated = useId();
  const fieldId = id ?? generated;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const successId = success ? `${fieldId}-success` : undefined;

  const describedBy =
    [errorId, successId, hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-fg"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children({
        id: fieldId,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required ? true : undefined,
      })}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      {!error && success && (
        <p id={successId} className="text-xs text-success">
          {success}
        </p>
      )}
      {!error && !success && hint && (
        <p id={hintId} className="text-xs text-fg-subtle">
          {hint}
        </p>
      )}
    </div>
  );
}

FormField.displayName = 'FormField';