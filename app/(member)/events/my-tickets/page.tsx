'use client';

// SCR-102 — My tickets
// Route: /events/my-tickets

import Link from 'next/link';
import { MemberLayout } from '@/components/layout/memberLayout';
import { Card } from '@/components/card';

interface Ticket {
  id: string;
  eventId: string;
  eventTitle: string;
  venue: string;
  city: string;
  startsAt: string;
  ticketNumber: string;
  status: 'VALID' | 'USED' | 'CANCELLED';
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
  },
];

const STATUS_TONE: Record<Ticket['status'], string> = {
  VALID: 'bg-emerald-100 text-emerald-800',
  USED: 'bg-ink/10 text-ink/70',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function MyTicketsPage() {
  return (
    <MemberLayout>
      <div className="mx-auto max-w-3xl p-6">
      <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
        <Link href="/events" className="hover:text-sky">Events</Link>
        <span className="mx-2">/</span>
        <span className="text-ink">My tickets</span>
      </nav>

      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/60">Events</p>
        <h1 className="mt-1 text-2xl font-semibold text-ink">My tickets</h1>
        <p className="mt-1 text-sm text-ink/70">
          Every ticket you hold. Bring the QR to the door.
        </p>
      </header>

      {MOCK_TICKETS.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-ink/60">
            You don&apos;t have any tickets yet. Browse events to register.
          </p>
          <div className="mt-3 text-center">
            <Link href="/events" className="text-sm text-sky hover:underline">
              Browse events →
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {MOCK_TICKETS.map((t) => (
            <Card key={t.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-semibold text-ink">{t.eventTitle}</h2>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[t.status]}`}>
                      {t.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-ink/70">
                    {t.venue} · {t.city}
                  </p>
                  <p className="mt-1 text-xs text-ink/60">
                    {new Date(t.startsAt).toLocaleString('en-GB', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="mt-2 font-mono text-xs text-ink/60">{t.ticketNumber}</p>
                </div>
                <Link
                  href={`/events/tickets/${t.id}`}
                  className="rounded-md border border-ink/20 bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:bg-ink/5"
                >
                  Open ticket
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
    </MemberLayout>
  );
}
