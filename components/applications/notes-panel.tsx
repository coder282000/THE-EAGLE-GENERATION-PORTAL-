'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/button';

export interface Note {
  id: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
}

interface NotesPanelProps {
  notes: Note[];
  /** May return a Promise — panel shows loading state until resolved */
  onAddNote: (body: string) => void | Promise<void>;
  /** Disable input when user lacks permission */
  readOnly?: boolean;
  maxLength?: number;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotesPanel({
  notes,
  onAddNote,
  readOnly = false,
  maxLength = 2000,
  placeholder = 'Add an internal note. Not shared with the applicant.',
  emptyMessage = 'No notes yet.',
  className,
}: NotesPanelProps) {
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = draft.trim();
  const canSubmit =
    !readOnly && !submitting && trimmed.length > 0 && trimmed.length <= maxLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAddNote(trimmed);
      setDraft('');
    } catch {
      setError('Could not save the note. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-sm text-fg-subtle italic">{emptyMessage}</p>
      ) : (
        <ol className="space-y-3">
          {notes.map((note) => (
            <li
              key={note.id}
              role="article"
              aria-label={`Note from ${note.authorName} on ${formatTimestamp(note.createdAt)}`}
              className="rounded-lg border border-border bg-paper-muted/40 p-3"
            >
              <div className="flex items-baseline justify-between gap-3 mb-1">
                <span className="text-sm font-medium text-fg">
                  {note.authorName}
                </span>
                <time
                  dateTime={note.createdAt}
                  className="text-xs text-fg-subtle shrink-0"
                >
                  {formatTimestamp(note.createdAt)}
                </time>
              </div>
              <p className="text-sm text-fg whitespace-pre-wrap break-words">
                {note.body}
              </p>
            </li>
          ))}
        </ol>
      )}

      {/* Compose */}
      {!readOnly && (
        <form onSubmit={handleSubmit} className="space-y-2">
          <label htmlFor="note-compose" className="sr-only">
            Add internal note
          </label>
          <textarea
            id="note-compose"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={3}
            disabled={submitting}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'note-error' : 'note-hint'}
            className={cn(
              'w-full rounded-md border bg-paper-elevated px-3 py-2 text-sm',
              'text-fg placeholder:text-fg-subtle',
              'outline-none transition-colors duration-150',
              'border-border focus:border-primary focus:shadow-focus',
              error && 'border-danger focus:border-danger',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          />

          <div className="flex items-center justify-between gap-3">
            {error ? (
              <p id="note-error" role="alert" className="text-xs text-danger">
                {error}
              </p>
            ) : (
              <p id="note-hint" className="text-xs text-fg-subtle">
                {trimmed.length}/{maxLength}
              </p>
            )}
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!canSubmit}
              loading={submitting}
            >
              Add note
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

NotesPanel.displayName = 'NotesPanel';