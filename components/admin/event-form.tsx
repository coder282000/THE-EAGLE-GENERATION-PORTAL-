'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import {
  type AdminEvent,
  type AdminTicketTier,
  type EventType,
  EVENT_TYPE_LABELS,
  publishEvent,
  saveEventDraft,
  updateEvent,
} from '@/lib/mock/events';

interface TierDraft {
  id: string;
  name: string;
  priceText: string;
  quantityText: string;
}

interface EventFormProps {
  mode: 'create' | 'edit';
  initialEvent?: AdminEvent;
  initialTiers?: AdminTicketTier[];
}

interface FormErrors {
  title?: string;
  slug?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string;
  venueName?: string;
  onlineUrl?: string;
  tier?: string;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function parseMinor(text: string): number {
  const cleaned = text.replace(/[^0-9.]/g, '');
  if (!cleaned) return 0;
  const value = Number(cleaned);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

function minorToText(minor: number): string {
  if (!minor) return '';
  return (minor / 100).toFixed(2);
}

function newTier(): TierDraft {
  return {
    id: `tier-${Math.random().toString(36).slice(2, 10)}`,
    name: 'Standard',
    priceText: '',
    quantityText: '',
  };
}

export function EventForm({
  mode,
  initialEvent,
  initialTiers = [],
}: EventFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialEvent?.title ?? '');
  const [slug, setSlug] = useState(initialEvent?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  const [description, setDescription] = useState(
    initialEvent?.description ?? '',
  );
  const [type, setType] = useState<EventType>(
    initialEvent?.type ?? 'MEETUP',
  );
  const [venueMode, setVenueMode] = useState<'venue' | 'online'>(
    initialEvent?.onlineUrl ? 'online' : 'venue',
  );
  const [venueName, setVenueName] = useState(initialEvent?.venueName ?? '');
  const [venueAddress, setVenueAddress] = useState(
    initialEvent?.venueAddress ?? '',
  );
  const [onlineUrl, setOnlineUrl] = useState(initialEvent?.onlineUrl ?? '');
  const [startsAt, setStartsAt] = useState(
    initialEvent?.startsAt?.slice(0, 16) ?? '',
  );
  const [endsAt, setEndsAt] = useState(
    initialEvent?.endsAt?.slice(0, 16) ?? '',
  );
  const [capacity, setCapacity] = useState(
    initialEvent?.capacity != null ? String(initialEvent.capacity) : '',
  );
  const [isPaid, setIsPaid] = useState(
    initialTiers.some((t) => t.priceMinor > 0),
  );
  const [tiers, setTiers] = useState<TierDraft[]>(
    initialTiers.length > 0
      ? initialTiers.map((t) => ({
          id: t.id,
          name: t.name,
          priceText: minorToText(t.priceMinor),
          quantityText: t.quantity != null ? String(t.quantity) : '',
        }))
      : [newTier()],
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const effectiveSlug = slugTouched ? slug : slugify(title);

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const addTier = () => setTiers((prev) => [...prev, newTier()]);

  const removeTier = (id: string) => {
    setTiers((prev) => prev.filter((t) => t.id !== id));
  };

  const updateTier = (id: string, patch: Partial<TierDraft>) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  };

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim() || title.trim().length < 3)
      e.title = 'Give the event a title (at least 3 characters).';
    if (!effectiveSlug || effectiveSlug.length < 3)
      e.slug = 'A slug is required.';
    if (!description.trim() || description.trim().length < 20)
      e.description = 'Add a short description (at least 20 characters).';
    if (!startsAt) e.startsAt = 'Choose a start date and time.';
    if (!endsAt) e.endsAt = 'Choose an end date and time.';
    if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt))
      e.endsAt = 'The end date must be after the start date.';
    if (venueMode === 'venue' && !venueName.trim())
      e.venueName = 'Add the venue name.';
    if (venueMode === 'online') {
      if (!onlineUrl.trim() || !/^https:\/\//.test(onlineUrl))
        e.onlineUrl = 'Add the meeting link (https only).';
    }
    if (isPaid) {
      const invalid = tiers.some(
        (t) => !t.name.trim() || t.priceText.trim() === '',
      );
      if (invalid || tiers.length === 0)
        e.tier = 'Each tier needs a name and a price.';
    }
    return e;
  }

  const buildPayload = (): Partial<AdminEvent> => ({
    id: initialEvent?.id,
    title: title.trim(),
    slug: effectiveSlug,
    description: description.trim(),
    type,
    venueName: venueMode === 'venue' ? venueName.trim() : null,
    venueAddress: venueMode === 'venue' ? venueAddress.trim() : null,
    onlineUrl: venueMode === 'online' ? onlineUrl.trim() : null,
    startsAt: new Date(startsAt).toISOString(),
    endsAt: new Date(endsAt).toISOString(),
    capacity: capacity.trim() ? Number(capacity) : null,
  });

  const onSaveDraft = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    saveEventDraft(buildPayload());
    setSubmitting(false);
    router.push('/admin/events');
  };

  const onSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    if (mode === 'create') {
      publishEvent(buildPayload());
    } else if (initialEvent) {
      updateEvent(initialEvent.id, buildPayload());
    }
    setSubmitting(false);
    router.push('/admin/events');
  };

  const headingText = mode === 'create' ? 'Create event' : 'Edit event';

  const canSubmit = useMemo(
    () => !submitting && title.trim().length >= 3,
    [submitting, title],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit();
      }}
      className="mx-auto max-w-3xl space-y-6 pb-24"
    >
      <header>
        <h1 className="text-2xl font-semibold text-ink">{headingText}</h1>
        <p className="mt-1 text-sm text-ink/60">
          Fill in the details members will see.
        </p>
      </header>

      <Section title="Basics">
        <FormField label="Title" required error={errors.title}>
          {(field) => (
            <Input
              {...field}
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Founders Gala 2026"
            />
          )}
        </FormField>

        <FormField
          label="Slug"
          required
          error={errors.slug}
          hint="Used in the member-facing URL and in QR codes."
        >
          {(field) => (
            <Input
              {...field}
              value={effectiveSlug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugTouched(true);
              }}
              placeholder="founders-gala-2026"
            />
          )}
        </FormField>

        <FormField label="Description" required error={errors.description}>
          {(field) => (
            <textarea
              {...field}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
              placeholder="A few sentences describing the event."
            />
          )}
        </FormField>

        <FormField label="Type" required>
          {(field) => (
            <select
              {...field}
              value={type}
              onChange={(e) => setType(e.target.value as EventType)}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
            >
              {(Object.keys(EVENT_TYPE_LABELS) as EventType[]).map((k) => (
                <option key={k} value={k}>
                  {EVENT_TYPE_LABELS[k]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </Section>

      <Section title="Where and when">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-fg">Format</legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="venueMode"
                value="venue"
                checked={venueMode === 'venue'}
                onChange={() => setVenueMode('venue')}
              />
              Physical venue
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="venueMode"
                value="online"
                checked={venueMode === 'online'}
                onChange={() => setVenueMode('online')}
              />
              Online
            </label>
          </div>
        </fieldset>

        {venueMode === 'venue' && (
          <>
            <FormField label="Venue name" required error={errors.venueName}>
              {(field) => (
                <Input
                  {...field}
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="KICC"
                />
              )}
            </FormField>
            <FormField label="Venue address">
              {(field) => (
                <Input
                  {...field}
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="Harambee Avenue, Nairobi"
                />
              )}
            </FormField>
          </>
        )}

        {venueMode === 'online' && (
          <FormField label="Meeting link" required error={errors.onlineUrl}>
            {(field) => (
              <Input
                {...field}
                type="url"
                value={onlineUrl}
                onChange={(e) => setOnlineUrl(e.target.value)}
                placeholder="https://meet.example.org/..."
              />
            )}
          </FormField>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Starts at" required error={errors.startsAt}>
            {(field) => (
              <Input
                {...field}
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            )}
          </FormField>
          <FormField label="Ends at" required error={errors.endsAt}>
            {(field) => (
              <Input
                {...field}
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            )}
          </FormField>
        </div>
      </Section>

      <Section title="Capacity">
        <FormField label="Capacity" hint="Leave blank for unlimited.">
          {(field) => (
            <Input
              {...field}
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="200"
            />
          )}
        </FormField>
      </Section>

      <Section title="Ticket tiers">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
          />
          This is a paid event
        </label>

        {isPaid && (
          <div className="space-y-3">
            {errors.tier && (
              <p className="text-sm text-danger" role="alert">
                {errors.tier}
              </p>
            )}
            {tiers.map((t, i) => (
              <div
                key={t.id}
                className="rounded-md border border-ink/10 bg-white p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-ink/60">
                    Tier {i + 1}
                  </span>
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTier(t.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <FormField label="Name">
                    {(field) => (
                      <Input
                        {...field}
                        value={t.name}
                        onChange={(e) =>
                          updateTier(t.id, { name: e.target.value })
                        }
                        placeholder="Standard"
                      />
                    )}
                  </FormField>
                  <FormField label="Price (KES)">
                    {(field) => (
                      <Input
                        {...field}
                        numeric
                        value={t.priceText}
                        onChange={(e) =>
                          updateTier(t.id, { priceText: e.target.value })
                        }
                        placeholder="2500.00"
                      />
                    )}
                  </FormField>
                  <FormField label="Quantity">
                    {(field) => (
                      <Input
                        {...field}
                        type="number"
                        min={1}
                        value={t.quantityText}
                        onChange={(e) =>
                          updateTier(t.id, { quantityText: e.target.value })
                        }
                        placeholder="Unlimited"
                      />
                    )}
                  </FormField>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addTier}
              className="text-sm text-sky hover:underline"
            >
              + Add tier
            </button>
          </div>
        )}
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink/10 bg-white/95 px-6 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/events')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => void onSaveDraft()}
            disabled={submitting}
          >
            Save draft
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!canSubmit}
          >
            {mode === 'create' ? 'Publish' : 'Save changes'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {children}
    </section>
  );
}