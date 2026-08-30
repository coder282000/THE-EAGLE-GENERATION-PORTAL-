import React from 'react';

interface WordmarkProps {
  dark?: boolean;
}

export function Wordmark({ dark = false }: WordmarkProps) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
        <path
          d="M13 3 L22 20 L13 15.5 L4 20 Z"
          fill={dark ? "#E29B3D" : "#141B2E"}
        />
      </svg>
      <span
        className={`font-display font-semibold text-[17px] tracking-tight ${
          dark ? "text-white" : "text-ink-900"
        }`}
      >
        Eagle Generation
      </span>
    </div>
  );
}