'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Debounce in ms — default 300 */
  debounceMs?: number;
  loading?: boolean;
  onClear?: () => void;
  onEscape?: () => void;
  autoFocus?: boolean;
  'aria-label'?: string;
}

export function SearchInput({
  value,
  onValueChange,
  placeholder = 'Search…',
  debounceMs = 300,
  loading = false,
  onClear,
  onEscape,
  autoFocus,
  'aria-label': ariaLabel = 'Search',
}: SearchInputProps) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external -> internal
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const scheduleChange = (next: string) => {
    setLocal(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onValueChange(next), debounceMs);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setLocal('');
    onValueChange('');
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onEscape?.();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border border-border bg-paper-elevated px-3',
        'transition-colors duration-150',
        'focus-within:shadow-focus focus-within:border-primary',
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-fg-subtle"
      >
        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      <input
        type="search"
        value={local}
        onChange={(e) => scheduleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        className={cn(
          'flex-1 min-w-0 bg-transparent py-2 text-sm text-fg outline-none',
          'placeholder:text-fg-subtle',
          '[&::-webkit-search-cancel-button]:appearance-none',
        )}
      />

      {loading ? (
        <span
          aria-hidden="true"
          className="shrink-0 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent text-fg-subtle"
        />
      ) : (
        local.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={cn(
              'shrink-0 inline-flex items-center justify-center h-6 w-6 rounded',
              'text-fg-subtle hover:text-fg hover:bg-paper-muted',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:shadow-focus',
            )}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )
      )}
    </div>
  );
}

SearchInput.displayName = 'SearchInput';