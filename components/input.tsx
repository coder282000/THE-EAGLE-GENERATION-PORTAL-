"use client";

import { InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      id,
      label,
      error,
      leftElement,
      rightElement,
      className = "",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-ink-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftElement && (
            <div className="absolute left-3 flex items-center pointer-events-none text-ink-400">
              {leftElement}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              "w-full h-11 rounded-md border border-ink-200 bg-white px-3 text-ink-900",
              "placeholder:text-ink-300",
              "focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500",
              "disabled:bg-ink-50 disabled:text-ink-300 disabled:cursor-not-allowed",
              leftElement && "pl-9",
              rightElement && "pr-12",
              error && "border-clay-500 focus:ring-clay-500 focus:border-clay-500",
              className
            )}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center">
              {rightElement}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-clay-600">{error}</p>
        )}
      </div>
    );
  }
);
TextInput.displayName = "TextInput";

export default TextInput;