'use client';
import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils"; // assuming a utility for classNames; if not, we can use a simple function

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const hasError = !!error;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-ink-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={id}
          ref={ref}
          className={cn(
            "w-full rounded-md border border-ink-300 px-3 py-2 text-ink-900 placeholder-ink-400",
            "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            hasError && "border-clay-500 focus:ring-clay-500 focus:border-clay-500",
            className
          )}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          {...props}
        />
        {hasError && (
          <p id={`${id}-error`} className="mt-1 text-sm text-clay-600">
            {error}
          </p>
        )}
        {!hasError && hint && (
          <p id={`${id}-hint`} className="mt-1 text-sm text-ink-500">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";