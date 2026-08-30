import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-ink-900 text-white hover:bg-ink-800 active:bg-ink-950 disabled:bg-ink-200 disabled:text-ink-400",
  secondary:
    "bg-white text-ink-900 border border-ink-200 hover:border-ink-400 hover:bg-ink-50 disabled:text-ink-300 disabled:border-ink-100",
  ghost: "bg-transparent text-ink-700 hover:bg-ink-100 disabled:text-ink-300",
  danger:
    "bg-clay-600 text-white hover:bg-clay-700 disabled:bg-clay-100 disabled:text-clay-300",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-5 text-[15px]",
  lg: "h-13 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-md font-display font-medium
          transition-colors duration-150 disabled:cursor-not-allowed
          ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
