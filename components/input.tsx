import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, forwardRef, ReactNode } from "react";

interface FieldWrapProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrap({ label, htmlFor, error, hint, required, children }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="font-body text-sm font-medium text-ink-800">
        {label}
        {required && <span className="ml-0.5 text-clay-600">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-clay-600">{error}</p>}
    </div>
  );
}

// ─── Input (simple, unlabeled) ────────────────────────────────

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`h-10 w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm
        text-ink-900 placeholder:text-ink-400 outline-none transition-colors
        focus:border-sky-500
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

// ─── TextInput ───────────────────────────────────────────────

interface TextInputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    Omit<FieldWrapProps, "children" | "htmlFor"> {
  id: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  ({ id, label, error, hint, required, className = "", ...props }, ref) => (
    <FieldWrap label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <input
        ref={ref}
        id={id}
        className={`h-11 w-full rounded-md border bg-white px-3.5 text-[15px] text-ink-900
          placeholder:text-ink-300 outline-none transition-colors
          ${error ? "border-clay-400 focus:border-clay-500" : "border-ink-200 focus:border-sky-500"}
          ${className}`}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrap>
  )
);
TextInput.displayName = "TextInput";

// ─── SelectInput ─────────────────────────────────────────────

interface SelectInputProps
  extends SelectHTMLAttributes<HTMLSelectElement>,
    Omit<FieldWrapProps, "children" | "htmlFor"> {
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ id, label, error, hint, required, options, placeholder, className = "", ...props }, ref) => (
    <FieldWrap label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <select
        ref={ref}
        id={id}
        className={`h-11 w-full rounded-md border bg-white px-3.5 text-[15px] text-ink-900
          placeholder:text-ink-300 outline-none transition-colors appearance-none
          ${error ? "border-clay-400 focus:border-clay-500" : "border-ink-200 focus:border-sky-500"}
          ${className}`}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
);
SelectInput.displayName = "SelectInput";

// ─── TextareaInput ───────────────────────────────────────────

interface TextareaInputProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    Omit<FieldWrapProps, "children" | "htmlFor"> {
  id: string;
}

export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  ({ id, label, error, hint, required, className = "", rows = 4, ...props }, ref) => (
    <FieldWrap label={label} htmlFor={id} error={error} hint={hint} required={required}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        className={`w-full rounded-md border bg-white px-3.5 py-3 text-[15px] text-ink-900
          placeholder:text-ink-300 outline-none transition-colors resize-y
          ${error ? "border-clay-400 focus:border-clay-500" : "border-ink-200 focus:border-sky-500"}
          ${className}`}
        aria-invalid={!!error}
        {...props}
      />
    </FieldWrap>
  )
);
TextareaInput.displayName = "TextareaInput";
