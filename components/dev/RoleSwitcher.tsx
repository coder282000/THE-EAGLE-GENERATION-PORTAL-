// components/dev/RoleSwitcher.tsx
'use client';

import { useState } from 'react';
import { mockUsers } from '@/components/mock/data';
import { useCurrentUser, setCurrentUser } from '@/lib/mock/current-user';
import { cn } from '@/lib/utils';

export function RoleSwitcher() {
  // Never render in production. NODE_ENV is compile-time on Vercel.
  if (process.env.NODE_ENV !== 'development') return null;

  const current = useCurrentUser();
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-[60]">
      {open && (
        <div className="mb-2 ml-auto bg-white border border-ink/10 rounded-lg shadow-xl p-2 min-w-64">
          <p className="text-[10px] uppercase tracking-wider text-ink/40 px-2 pt-1 pb-2">
            Mock user (dev only)
          </p>
          {mockUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => {
                setCurrentUser(u.id);
                setOpen(false);
              }}
              className={cn(
                'w-full text-left px-2 py-2 rounded text-sm transition-colors',
                u.id === current.id
                  ? 'bg-sky/10 text-sky font-medium'
                  : 'text-ink hover:bg-paper'
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-ink text-paper text-xs px-3 py-2 rounded-full shadow-lg hover:bg-ink/90 transition-colors"
        aria-label="Switch mock user"
      >
        <span>🧪</span>
        <span className="max-w-[180px] truncate">{current.label}</span>
        <span
          className={cn(
            'transition-transform',
            open ? 'rotate-180' : 'rotate-0'
          )}
        >
          ▲
        </span>
      </button>
    </div>
  );
}