'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/admin/EmptyState';
import {
  TICKET_CATEGORY_LABELS,
  type CannedResponse,
  type TicketCategory,
} from '@/lib/mock/support';

interface CannedResponsePickerProps {
  responses: CannedResponse[];
  onInsert: (body: string) => void;
  onClose: () => void;
}

export function CannedResponsePicker({
  responses,
  onInsert,
  onClose,
}: CannedResponsePickerProps) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return responses;
    return responses.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }, [responses, query]);

  const grouped = useMemo(() => {
    const map = new Map<TicketCategory, CannedResponse[]>();
    for (const r of filtered) {
      const list = map.get(r.category) ?? [];
      list.push(r);
      map.set(r.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  const flat = useMemo(
    () => grouped.flatMap(([, list]) => list),
    [grouped],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flat.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        const target = flat[activeIndex];
        if (target) {
          e.preventDefault();
          onInsert(target.body);
          onClose();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [flat, activeIndex, onInsert, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="canned-picker-title"
      className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 p-4 pt-20"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-ink/10 p-4">
          <h2
            id="canned-picker-title"
            className="text-base font-semibold text-ink"
          >
            Insert canned response
          </h2>
          <p className="mt-0.5 text-xs text-ink/50">
            Arrow keys to navigate, Enter to insert, Esc to close.
          </p>
          <div className="mt-3">
            <SearchInput
              value={query}
              onValueChange={setQuery}
              placeholder="Search title, body or tag"
              autoFocus
            />
          </div>
        </header>

        <div className="max-h-[60vh] overflow-y-auto">
          {flat.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No canned responses match."
                description="Try a different term, or create one in the library."
              />
            </div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {grouped.map(([category, list]) => (
                <li key={category}>
                  <div className="bg-paper px-4 py-2 text-xs font-medium uppercase tracking-wide text-ink/50">
                    {TICKET_CATEGORY_LABELS[category]}
                  </div>
                  <ul>
                    {list.map((r) => {
                      const idx = flat.indexOf(r);
                      const active = idx === activeIndex;
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            onMouseEnter={() => setActiveIndex(idx)}
                            onClick={() => {
                              onInsert(r.body);
                              onClose();
                            }}
                            className={`w-full px-4 py-3 text-left transition-colors ${
                              active ? 'bg-sky/5' : 'hover:bg-paper'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-sm font-medium text-ink">
                                {r.title}
                              </span>
                              <span className="shrink-0 text-xs text-ink/40">
                                {r.usageCount} uses
                              </span>
                            </div>
                            <p className="mt-1 line-clamp-2 text-xs text-ink/60">
                              {r.body}
                            </p>
                            {r.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {r.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] text-ink/50"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-ink/10 p-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-ink/20 bg-white px-3 py-1.5 text-sm text-ink hover:bg-paper"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}