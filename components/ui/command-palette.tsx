'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { Command } from 'cmdk';
import { ReactNode, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CommandPaletteItem {
  id: string;
  label: string;
  group?: string;
  icon?: ReactNode;
  keywords?: string[];
  disabled?: boolean;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  placeholder?: string;
  emptyMessage?: string;
  /** Global keyboard shortcut — default ⌘K / Ctrl+K */
  shortcut?: string;
  /** Render recent items at top (from localStorage) */
  showRecent?: boolean;
}

const GROUP_ORDER = ['Recent', 'Actions', 'Navigate', 'Search'];

export function CommandPalette({
  open,
  onOpenChange,
  items,
  placeholder = 'Search or jump to…',
  emptyMessage = 'No results found.',
  shortcut = 'k',
  showRecent = true,
}: CommandPaletteProps) {
  // Global keyboard shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === shortcut) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange, shortcut]);

  // Group items
  const grouped = items.reduce<Record<string, CommandPaletteItem[]>>((acc, item) => {
    const g = item.group ?? 'Actions';
    if (!acc[g]) acc[g] = [];
    acc[g].push(item);
    return acc;
  }, {});

  // Order groups deterministically
  const groupKeys = Object.keys(grouped).sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a);
    const ib = GROUP_ORDER.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-overlay bg-ink-950/50 backdrop-blur-sm',
            'data-[state=open]:animate-[overlay-in_var(--duration-default)_var(--ease-out)]',
            'data-[state=closed]:animate-[overlay-out_150ms_var(--ease-in)]',
            'motion-reduce:animate-none',
          )}
        />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-[15vh] z-modal',
            'w-[calc(100vw-32px)] max-w-[560px] -translate-x-1/2',
            'bg-paper-elevated rounded-xl shadow-xl border border-border',
            'overflow-hidden focus:outline-none',
            'data-[state=open]:animate-[content-in_200ms_var(--ease-out)]',
            'data-[state=closed]:animate-[content-out_150ms_var(--ease-in)]',
            'motion-reduce:animate-none',
          )}
        >
          {/* Visually hidden title + description for screen readers */}
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search or jump to a page, action, or record.
          </Dialog.Description>

          <Command
            label="Command palette"
            className="flex flex-col"
            loop
          >
            <div className="flex items-center gap-3 px-4 border-b border-border">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
                className="text-fg-subtle shrink-0"
              >
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <Command.Input
                placeholder={placeholder}
                className={cn(
                  'flex-1 bg-transparent py-4 text-sm text-fg',
                  'placeholder:text-fg-subtle outline-none',
                )}
              />
              <kbd
                aria-hidden="true"
                className={cn(
                  'hidden sm:inline-flex items-center gap-0.5 rounded border border-border',
                  'bg-paper-muted px-1.5 py-0.5 text-[10px] font-mono text-fg-muted',
                )}
              >
                ESC
              </kbd>
            </div>

            <Command.List className="max-h-[420px] overflow-y-auto p-2">
              <Command.Empty className="py-10 text-center text-sm text-fg-muted">
                {emptyMessage}
              </Command.Empty>

              {groupKeys.map((group) => (
                <Command.Group
                  key={group}
                  heading={
                    <span className="block px-2 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
                      {group}
                    </span>
                  }
                >
                  {grouped[group].map((item) => (
                    <Command.Item
                      key={item.id}
                      value={`${item.label} ${(item.keywords ?? []).join(' ')}`}
                      keywords={item.keywords}
                      disabled={item.disabled}
                      onSelect={() => {
                        onOpenChange(false);
                        item.onSelect();
                      }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                        'text-fg cursor-pointer',
                        'data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-900',
                        'data-[disabled=true]:opacity-50 data-[disabled=true]:cursor-not-allowed',
                      )}
                    >
                      {item.icon && (
                        <span className="shrink-0 text-fg-subtle" aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      <span className="flex-1 truncate">{item.label}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

CommandPalette.displayName = 'CommandPalette';