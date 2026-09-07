// components/input.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dawn-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };

export interface TextInputProps extends InputProps {
  label?: string;
  id?: string;
  leftElement?: React.ReactNode;   // e.g., icon or button on the left
  rightElement?: React.ReactNode;  // e.g., icon or button on the right
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, label, id, leftElement, rightElement, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <div className="relative">
          {leftElement && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {leftElement}
            </div>
          )}
          <Input
            id={id}
            className={cn(
              className,
              leftElement && "pl-10",
              rightElement && "pr-10"
            )}
            ref={ref}
            {...props}
          />
          {rightElement && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {rightElement}
            </div>
          )}
        </div>
      </div>
    );
  }
);
TextInput.displayName = "TextInput";

export { TextInput };