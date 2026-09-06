import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-lg border border-ink-100 bg-white ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
