"use client";

import * as React from "react";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className = "", ...props }: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      className={`relative w-full overflow-hidden rounded-full bg-ink-100 ${className}`}
      {...props}
    >
      <div
        className="h-full bg-dawn-500 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
