'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getTicketById,
  getTicketMessages,
  addTicketMessage,
  assignTicket,
  resolveTicket,
  closeTicket,
  reopenTicket,
  canReplyToTicket,
  canAssignTicket,
  canResolveTicket,
  canCloseTicket,
  canReopenTicket,
  TICKET_STATUS_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_CATEGORY_LABELS,
  type TicketMessage,
} from '@/lib/mock/support';
import { AdminCard } from '@/components/admin/AdminCard';
import { EmptyState } from '@/components/admin/EmptyState';
import { StatusBadge, type StatusKey } from '@/components/admin/StatusBadge';
import { Button } from '@/components/button';
import { CannedResponsePicker } from '@/components/support/canned-response-picker';
import { getCannedResponses } from '@/lib/mock/support';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function priorityToBadge(priority: string): StatusKey {
  switch (priority) {
    case 'URGENT':
      return 'critical';
    case 'HIGH':
      return 'high';
    case 'NORMAL':
      return 'medium';
    case 'LOW':
      return 'low';
    default:
      return 'inactive';
  }
}

function statusToBadge(status: string): StatusKey {
  switch (status) {
    case 'NEW':
      return 'pending';
    case 'OPEN':
      return 'approved';
    case 'PENDING_MEMBER':
      return 'processing';
    case 'RESOLVED':
      return 'completed';
    case 'CLOSED':
      return 'inactive';
    default:
      return 'inactive';
  }
}

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const id = params?.id ?? '';

  const [version, setVersion] = useState(0);
  const [replyBody, setReplyBody] = useState('');
  const [isNote, setIsNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const cannedResponses = useMemo(() => getCannedResponses(user), [user]);

  const ticket = useMemo(
    () => (id ? getTicketById(user, id) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, id, version],
  );

  const messages = useMemo(
    () => (ticket ? getTicketMessages(user, ticket.id) : []),
    [user, ticket],
  );

  const canReply = canReplyToTicket(user);
  const canAssign = canAssignTicket(user);
  const canResolve = canResolveTicket(user);
  const canClose = canCloseTicket(user);
  const canReopen = canReopenTicket(user);

  if (!ticket) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          Ticket not found.
        </h2>
        <button
          type="button"
          onClick={() => router.push('/admin/support')}
          className="mt-4 rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
        >
          Back to queue
        </button>
      </div>
    );
  }

  async function handleSend() {
    if (!ticket || !replyBody.trim()) return;
    setSending(true);
    addTicketMessage(user, ticket.id, replyBody.trim(), isNote);
    setReplyBody('');
    setIsNote(false);
    setSending(false);
    setVersion((v) => v + 1);
  }

  function handleAssignToMe() {
    if (!ticket) return;
    assignTicket(user, ticket.id, user.id, user.name);
    setVersion((v) => v + 1);
  }

  function handleResolve() {
    if (!ticket) return;
    resolveTicket(user, ticket.id);
    setVersion((v) => v + 1);
  }

  function handleClose() {
    if (!ticket) return;
    closeTicket(user, ticket.id);
    setVersion((v) => v + 1);
  }

  function handleReopen() {
    if (!ticket) return;
    reopenTicket(user, ticket.id);
    setVersion((v) => v + 1);
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <nav className="text-xs text-ink/50">
            <Link href="/admin/support" className="hover:text-sky">
              Support
            </Link>
            <span className="mx-1">/</span>
            <span className="font-mono">{ticket.reference}</span>
          </nav>
          <h1 className="mt-1 text-2xl font-semibold text-ink">
            {ticket.subject}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={statusToBadge(ticket.status)}>
              {TICKET_STATUS_LABELS[ticket.status]}
            </StatusBadge>
            <StatusBadge status={priorityToBadge(ticket.priority)}>
              {TICKET_PRIORITY_LABELS[ticket.priority]}
            </StatusBadge>
            <span className="text-xs text-ink/50">
              {TICKET_CATEGORY_LABELS[ticket.category]}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canAssign && !ticket.assignedTo && (
            <Button type="button" variant="outline" onClick={handleAssignToMe}>
              Assign to me
            </Button>
          )}
          {canResolve &&
            ticket.status !== 'RESOLVED' &&
            ticket.status !== 'CLOSED' && (
              <Button type="button" variant="primary" onClick={handleResolve}>
                Resolve
              </Button>
            )}
          {canClose && ticket.status === 'RESOLVED' && (
            <Button type="button" variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
          {canReopen &&
            (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (
              <Button type="button" variant="outline" onClick={handleReopen}>
                Reopen
              </Button>
            )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        <div className="space-y-6">
          <AdminCard title="Conversation">
            {messages.length === 0 ? (
              <div className="p-8">
                <EmptyState
                  title="No messages yet."
                  description="Replies appear here."
                />
              </div>
            ) : (
              <ol className="space-y-4 p-6">
                {messages.map((m) => (
                  <MessageRow key={m.id} message={m} />
                ))}
              </ol>
            )}
          </AdminCard>

          {canReply && ticket.status !== 'CLOSED' && (
            <AdminCard title="Reply">
              <div className="space-y-3 p-6">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  rows={5}
                  placeholder={
                    isNote ? 'Write an internal note…' : 'Write a reply…'
                  }
                  className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setPickerOpen(true)}
                      className="text-xs text-sky hover:underline"
                    >
                      Insert canned response
                    </button>
                    <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={isNote}
                      onChange={(e) => setIsNote(e.target.checked)}
                    />
                    Internal note
                    <span className="text-xs text-ink/50">
                      (visible to agents only)
                    </span>
                  </label>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={sending || !replyBody.trim()}
                    onClick={() => void handleSend()}
                  >
                    {isNote ? 'Add note' : 'Send reply'}
                  </Button>
                </div>
              </div>
            </AdminCard>
          )}
        </div>

        <aside className="space-y-4">
          <AdminCard title="Member">
            <dl className="space-y-2 p-6 text-sm">
              <Row label="Name" value={ticket.memberName} />
              <Row label="Email" value={ticket.memberEmail} />
              <Row
                label="Chapter"
                value={ticket.memberChapterCode ?? '—'}
              />
              <div className="pt-2">
                <Link
                  href={`/admin/members/${ticket.memberId}`}
                  className="text-xs text-sky hover:underline"
                >
                  View member →
                </Link>
              </div>
            </dl>
          </AdminCard>

          <AdminCard title="Ticket">
            <dl className="space-y-2 p-6 text-sm">
              <Row label="Reference" value={ticket.reference} mono />
              <Row
                label="Assignee"
                value={ticket.assignedToName ?? 'Unassigned'}
              />
              <Row
                label="Created"
                value={formatDateTime(ticket.createdAt)}
              />
              <Row
                label="First response"
                value={
                  ticket.firstResponseAt
                    ? formatDateTime(ticket.firstResponseAt)
                    : '—'
                }
              />
              <Row
                label="Resolved"
                value={
                  ticket.resolvedAt ? formatDateTime(ticket.resolvedAt) : '—'
                }
              />
            </dl>
          </AdminCard>

          {ticket.linkedEntityLabel && (
            <AdminCard title="Linked">
              <div className="space-y-2 p-6 text-sm">
                <p className="text-ink">{ticket.linkedEntityLabel}</p>
                <p className="font-mono text-xs text-ink/50">
                  {ticket.linkedEntityType} · {ticket.linkedEntityId}
                </p>
              </div>
            </AdminCard>
          )}
        </aside>
      </div>

      {pickerOpen && (
        <CannedResponsePicker
          responses={cannedResponses}
          onInsert={(body) => {
            setReplyBody((prev) => (prev ? `${prev}\n\n${body}` : body));
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

function MessageRow({ message }: { message: TicketMessage }) {
  const isAgent = message.authorType === 'AGENT';
  const isNote = message.isInternalNote;

  return (
    <li
      className={`flex gap-3 ${isAgent ? 'flex-row-reverse' : ''}`}
      aria-label={isNote ? 'Internal note' : undefined}
    >
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
          isNote
            ? 'bg-clay/20 text-clay'
            : isAgent
            ? 'bg-sky/15 text-sky'
            : 'bg-ink/10 text-ink/70'
        }`}
        aria-hidden="true"
      >
        {message.authorName
          .split(' ')
          .map((p) => p[0])
          .join('')
          .slice(0, 2)
          .toUpperCase()}
      </div>
      <div
        className={`min-w-0 flex-1 rounded-lg border p-3 ${
          isNote
            ? 'border-clay/30 bg-clay/5'
            : isAgent
            ? 'border-sky/20 bg-sky/5'
            : 'border-ink/10 bg-white'
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-ink">
              {message.authorName}
            </span>
            {isNote && (
              <span className="rounded-full bg-clay/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-clay">
                Internal
              </span>
            )}
          </div>
          <time
            dateTime={message.createdAt}
            className="text-xs text-ink/50"
          >
            {formatDateTime(message.createdAt)}
          </time>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm text-ink/80">
          {message.body}
        </p>
      </div>
    </li>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/60">{label}</dt>
      <dd
        className={`text-right text-ink ${mono ? 'font-mono text-xs' : ''}`}
      >
        {value}
      </dd>
    </div>
  );
}