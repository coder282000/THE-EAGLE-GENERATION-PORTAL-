'use client';

// SCR-103 — Ticket detail with QR
// Route: /events/tickets/[id]

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card } from '@/components/card';
import { MemberLayout } from '@/components/layout/memberLayout';

interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  city: string;
  startsAt: string;
  ticketNumber: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
  holderName: string;
  issuedAt: string;
}

const MOCK_TICKETS: Ticket[] = [
  {
    id: 'tkt-001',
    eventId: 'ev-001',
    eventTitle: 'Eagle Generation National Conference 2026',
    venue: 'KICC',
    city: 'Nairobi',
    startsAt: '2026-10-15T09:00:00.000Z',
    ticketNumber: 'TEG-2026-CONF-00482',
    status: 'VALID',
    holderName: 'Grace Wanjiru',
    issuedAt: '2026-09-01T10:00:00.000Z',
  },
  {
    id: 'tkt-002',
    eventId: 'ev-002',
    eventTitle: 'Campus Chapter Leaders Summit',
    venue: 'Strathmore University',
    city: 'Nairobi',
    startsAt: '2026-09-24T14:00:00.000Z',
    ticketNumber: 'TEG-2026-SUMMIT-00118',
    status: 'VALID',
    holderName: 'Grace Wanjiru',
    issuedAt: '2026-08-14T12:00:00.000Z',
  },
];

const STATUS_TONE: Record<Ticket['status'], string> = {
  VALID: 'bg-emerald-100 text-emerald-800',
  USED: 'bg-ink/10 text-ink/70',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const ticket = MOCK_TICKETS.find((t) => t.id === params.id);

  if (!ticket) {
    return (
      <MemberLayout>
        <div className="mx-auto max-w-3xl p-6">
          <Card>
            <h1 className="text-lg font-semibold text-ink">Ticket not found</h1>
            <Link href="/events/my-tickets" className="mt-3 inline-block text-sm text-sky hover:underline">
              Back to my tickets
            </Link>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="mx-auto max-w-2xl p-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
          <Link href="/events" className="hover:text-sky">Events</Link>
          <span className="mx-2">/</span>
          <Link href="/events/my-tickets" className="hover:text-sky">My tickets</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{ticket.ticketNumber}</span>
        </nav>

        <header className="mb-6">
          <p className="text-xs uppercase tracking-wide text-ink/60">Ticket</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{ticket.eventTitle}</h1>
          <div className="mt-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${STATUS_TONE[ticket.status]}`}>
              {ticket.status}
            </span>
          </div>
        </header>

        <Card>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Ticket holder</dt>
                  <dd className="mt-1 text-ink">{ticket.holderName}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Ticket number</dt>
                  <dd className="mt-1 font-mono text-xs text-ink">{ticket.ticketNumber}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Venue</dt>
                  <dd className="mt-1 text-ink">
                    {ticket.venue} · {ticket.city}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">When</dt>
                  <dd className="mt-1 text-ink">
                    {new Date(ticket.startsAt).toLocaleString('en-GB', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-ink/60">Issued</dt>
                  <dd className="mt-1 text-xs text-ink/70">
                    {new Date(ticket.issuedAt).toLocaleDateString('en-GB')}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex flex-col items-center justify-center rounded-lg border border-ink/10 bg-paper p-4">
              <div
                className="flex h-40 w-40 items-center justify-center rounded border-2 border-ink/10 bg-white text-center"
                role="img"
                aria-label={`QR code for ticket ${ticket.ticketNumber}`}
              >
                <div className="text-xs text-ink/50">
                  QR code
                  <br />
                  (placeholder)
                  <br />
                  <span className="font-mono">{ticket.ticketNumber}</span>
                </div>
              </div>
              <p className="mt-3 text-center text-xs text-ink/60">
                Present this at the door. Staff will scan it to check you in.
              </p>
            </div>
          </div>
        </Card>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
          >
            Print ticket
          </button>
          <Link
            href="/events/my-tickets"
            className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-sm font-medium text-ink hover:bg-ink/5"
          >
            All my tickets
          </Link>
        </div>

        <p className="mt-4 text-xs text-ink/60">
          Tickets are non-transferable. Bring a photo ID matching the ticket holder name.
        </p>
      </div>
    </MemberLayout>
  );
}