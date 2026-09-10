'use client';

import { useParams, useRouter } from 'next/navigation';
import { EventForm } from '@/components/admin/event-form';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  getEventById,
  getEventTiers,
  canEditEvent,
} from '@/lib/mock/events';

export default function EditEventPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCurrentUser();
  const id = params?.id ?? '';

  const event = id ? getEventById(id, user) : null;

  if (!event) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">Event not found.</h2>
        <p className="mt-2 text-sm text-ink/60">
          It may have been cancelled or removed.
        </p>
        <button
          type="button"
          onClick={() => router.push('/admin/events')}
          className="mt-4 inline-flex items-center rounded-md bg-sky px-4 py-2 text-sm font-medium text-white hover:bg-sky/90"
        >
          Back to events
        </button>
      </div>
    );
  }

  if (!canEditEvent(user, event)) {
    return (
      <div className="rounded-lg border border-ink/10 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">
          You do not have access to this screen.
        </h2>
        <p className="mt-2 text-sm text-ink/60">Contact support.</p>
      </div>
    );
  }

  const tiers = getEventTiers(event.id);

  return <EventForm mode="edit" initialEvent={event} initialTiers={tiers} />;
}