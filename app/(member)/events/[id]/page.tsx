'use client';

// SCR-101 — Event Detail and Registration
// Route: /events/[id]

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/button';
import { Card } from '@/components/card';
import { MemberLayout } from '@/components/layout/memberLayout';

interface MockEvent {
  id: string;
  title: string;
  summary: string;
  venue: string;
  city: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  registered: number;
  priceKES: number;
  type: string;
  host: string;
  agenda: { time: string; item: string }[];
}

const MOCK_EVENTS: MockEvent[] = [
  {
    id: 'ev-001',
    title: 'Eagle Generation National Conference 2026',
    summary:
      'Two days of teaching, worship and workshops for the national movement. Marketplace, Governance and Technology tracks run in parallel.',
    venue: 'KICC',
    city: 'Nairobi',
    startsAt: '2026-10-15T09:00:00.000Z',
    endsAt: '2026-10-16T17:00:00.000Z',
    capacity: 800,
    registered: 612,
    priceKES: 2500,
    type: 'CONFERENCE',
    host: 'Eagle Generation National',
    agenda: [
      { time: '08:30', item: 'Doors open, coffee and registration' },
      { time: '09:00', item: 'Opening worship and keynote' },
      { time: '10:30', item: 'Morning plenary: Marketplace as mission' },
      { time: '12:00', item: 'Lunch' },
      { time: '13:30', item: 'Afternoon workshop tracks' },
      { time: '16:00', item: 'Panels and Q&A' },
      { time: '17:00', item: 'Close' },
    ],
  },
  {
    id: 'ev-002',
    title: 'Campus Chapter Leaders Summit',
    summary:
      'For every chapter leader across the country. Policy, safeguarding, tooling and the new Portal walkthrough.',
    venue: 'Strathmore University',
    city: 'Nairobi',
    startsAt: '2026-09-24T14:00:00.000Z',
    endsAt: '2026-09-24T18:00:00.000Z',
    capacity: 120,
    registered: 118,
    priceKES: 0,
    type: 'SUMMIT',
    host: 'Eagle Generation Chapters',
    agenda: [
      { time: '14:00', item: 'Welcome and state of the movement' },
      { time: '14:30', item: 'Safeguarding essentials (G-2)' },
      { time: '15:30', item: 'Portal walkthrough: chapter tooling' },
      { time: '16:30', item: 'Breakout sessions by region' },
      { time: '17:30', item: 'Close and prayer' },
    ],
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const event = useMemo(() => MOCK_EVENTS.find((e) => e.id === params.id), [params.id]);
  const [registering, setRegistering] = useState(false);
  const [registered, setRegistered] = useState(false);

  if (!event) {
    return (
      <MemberLayout>
        <div className="mx-auto max-w-3xl p-6">
          <Card>
            <h1 className="text-lg font-semibold text-ink">Event not found</h1>
            <p className="mt-2 text-sm text-ink/70">This event is no longer available.</p>
            <Link href="/events" className="mt-3 inline-block text-sm text-sky hover:underline">
              Back to events
            </Link>
          </Card>
        </div>
      </MemberLayout>
    );
  }

  const isFull = event.registered >= event.capacity;
  const pct = Math.min(100, (event.registered / event.capacity) * 100);

  function register() {
    setRegistering(true);
    setTimeout(() => {
      setRegistering(false);
      setRegistered(true);
    }, 800);
  }

  return (
    <MemberLayout>
      <div className="mx-auto max-w-4xl p-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-xs text-ink/60">
          <Link href="/events" className="hover:text-sky">Events</Link>
          <span className="mx-2">/</span>
          <span className="text-ink">{event.title}</span>
        </nav>

        <header className="mb-6">
          <p className="text-xs uppercase tracking-wide text-ink/60">{event.type}</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">{event.title}</h1>
          <p className="mt-2 text-sm text-ink/70">{event.summary}</p>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <h2 className="text-sm font-semibold text-ink">Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">When</dt>
                <dd className="mt-1 text-sm text-ink">
                  {formatDate(event.startsAt)} — {formatDate(event.endsAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Where</dt>
                <dd className="mt-1 text-sm text-ink">
                  {event.venue} · {event.city}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Host</dt>
                <dd className="mt-1 text-sm text-ink">{event.host}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-ink/60">Price</dt>
                <dd className="mt-1 text-sm text-ink">
                  {event.priceKES === 0 ? 'Free' : `KES ${event.priceKES.toLocaleString('en-KE')}`}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-ink">Agenda</h3>
              <ol className="mt-3 space-y-2 text-sm">
                {event.agenda.map((a) => (
                  <li key={a.time} className="flex gap-3">
                    <span className="w-14 shrink-0 font-mono text-xs text-ink/60">{a.time}</span>
                    <span className="text-ink">{a.item}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <Card>
            <h2 className="text-sm font-semibold text-ink">Registration</h2>
            <div className="mt-3">
              <div className="flex justify-between text-xs text-ink/60">
                <span>{event.registered} registered</span>
                <span>{event.capacity} capacity</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/5">
                <div
                  className={`h-full ${isFull ? 'bg-clay' : 'bg-sky'}`}
                  style={{ width: `${pct}%` }}
                  aria-hidden
                />
              </div>
            </div>

            {registered ? (
              <div role="status" className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                You&apos;re registered. Find your ticket under{' '}
                <Link href="/events/my-tickets" className="underline">
                  My tickets
                </Link>
                .
              </div>
            ) : isFull ? (
              <div role="note" className="mt-4 rounded-lg border border-clay/30 bg-clay/5 p-3 text-sm text-ink">
                This event is full. You can join the waitlist.
              </div>
            ) : (
              <div className="mt-4">
                <Button variant="primary" onClick={register} disabled={registering}>
                  {registering ? 'Registering…' : 'Register'}
                </Button>
              </div>
            )}

            <p className="mt-3 text-xs text-ink/60">
              Registration includes a QR ticket. Bring it to the door.
            </p>
          </Card>
        </div>
      </div>
    </MemberLayout>
  );
}