'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { TEMPLATE_CHANNEL_LABELS, type TemplateChannel } from '@/lib/mock/communications';
import { formatCurrency } from '@/lib/utils';

// Segments match the seed campaigns and PNL-03 naming. Real segments come
// from lib/mock/segments.ts; this is a placeholder until the picker is wired.
interface SegmentOption {
  id: string;
  name: string;
  recipientCount: number;
  excludedEmail: number;
  excludedSms: number;
  byChapter: Array<{ code: string; count: number }>;
}

const SEGMENTS: SegmentOption[] = [
  {
    id: 'seg-all',
    name: 'All active members',
    recipientCount: 1137,
    excludedEmail: 42,
    excludedSms: 118,
    byChapter: [
      { code: 'KU', count: 342 },
      { code: 'UON', count: 287 },
      { code: 'NAIROBI_PRO', count: 214 },
      { code: 'STRATH', count: 198 },
      { code: 'KISUMU', count: 96 },
    ],
  },
  {
    id: 'seg-ku-active',
    name: 'KU chapter — active members',
    recipientCount: 62,
    excludedEmail: 0,
    excludedSms: 8,
    byChapter: [{ code: 'KU', count: 62 }],
  },
  {
    id: 'seg-professional',
    name: 'Professional tier',
    recipientCount: 358,
    excludedEmail: 12,
    excludedSms: 47,
    byChapter: [
      { code: 'KU', count: 98 },
      { code: 'UON', count: 112 },
      { code: 'NAIROBI_PRO', count: 88 },
      { code: 'STRATH', count: 60 },
    ],
  },
];

const CHAPTER_NAMES: Record<string, string> = {
  KU: 'Kenyatta University',
  UON: 'University of Nairobi',
  STRATH: 'Strathmore University',
  NAIROBI_PRO: 'Nairobi Professional',
  KISUMU: 'Kisumu Chapter',
};

const SMS_COST_PER_RECIPIENT_MINOR = 100;

interface FormErrors {
  name?: string;
  segment?: string;
  channels?: string;
  subject?: string;
  body?: string;
  scheduledAt?: string;
}

export function CampaignForm() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [channels, setChannels] = useState<TemplateChannel[]>(['EMAIL']);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendMode, setSendMode] = useState<'now' | 'later'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const segment = useMemo(
    () => SEGMENTS.find((s) => s.id === segmentId) ?? null,
    [segmentId],
  );

  const emailRecipients = useMemo(() => {
    if (!segment || !channels.includes('EMAIL')) return 0;
    return Math.max(0, segment.recipientCount - segment.excludedEmail);
  }, [segment, channels]);

  const smsRecipients = useMemo(() => {
    if (!segment || !channels.includes('SMS')) return 0;
    return Math.max(0, segment.recipientCount - segment.excludedSms);
  }, [segment, channels]);

  const estimatedCostMinor = useMemo(
    () => smsRecipients * SMS_COST_PER_RECIPIENT_MINOR,
    [smsRecipients],
  );

  const totalRecipients = emailRecipients + smsRecipients;

  function toggleChannel(ch: TemplateChannel) {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch],
    );
  }

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!name.trim() || name.trim().length < 3) e.name = 'Give this campaign a name.';
    if (!segmentId) e.segment = 'Choose a segment.';
    if (channels.length === 0) e.channels = 'Choose at least one channel.';
    if (channels.includes('EMAIL') && !subject.trim()) {
      e.subject = 'Add a subject line for email.';
    }
    if (!body.trim() || body.trim().length < 10) e.body = 'Write the message.';
    if (sendMode === 'later') {
      if (!scheduledAt) e.scheduledAt = 'Choose a send time.';
      else if (new Date(scheduledAt).getTime() <= Date.now()) {
        e.scheduledAt = 'The send time must be in the future.';
      }
    }
    return e;
  }

  async function handleSaveDraft() {
    const e = validate();
    // Drafts may be incomplete; only name is required.
    if (!name.trim() || name.trim().length < 3) {
      setErrors({ name: 'Give this campaign a name.' });
      return;
    }
    setErrors(e);
    setSubmitting(true);
    setSubmitting(false);
    router.push('/admin/notifications/campaigns');
  }

  async function handleSend() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    setSubmitting(true);
    setSubmitting(false);
    router.push('/admin/notifications/campaigns');
  }

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        void handleSend();
      }}
      className="space-y-6 pb-28"
    >
      <header>
        <h1 className="text-2xl font-semibold text-ink">New campaign</h1>
        <p className="mt-1 text-sm text-ink/60">
          Bulk messages to a saved segment.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,320px)]">
        {/* Left column — audience */}
        <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Audience</h2>
          <FormField label="Campaign name" required error={errors.name}>
            {(field) => (
              <Input
                {...field}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summit early-bird blast"
              />
            )}
          </FormField>

          <FormField label="Segment" required error={errors.segment}>
            {(field) => (
              <select
                {...field}
                value={segmentId ?? ''}
                onChange={(e) => setSegmentId(e.target.value || null)}
                className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
              >
                <option value="">Choose a segment</option>
                {SEGMENTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {segment && (
            <div className="space-y-3 rounded-md border border-ink/10 bg-paper p-3">
              <div className="text-sm">
                <span className="font-medium text-ink">
                  {segment.recipientCount.toLocaleString()} members
                </span>
                <span className="ml-2 text-ink/60">in this segment</span>
              </div>
              {segment.byChapter.length > 0 && (
                <ul className="space-y-1 text-xs text-ink/70">
                  {segment.byChapter.map((c) => (
                    <li key={c.code} className="flex justify-between">
                      <span>{CHAPTER_NAMES[c.code] ?? c.code}</span>
                      <span>{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className="space-y-1 border-t border-ink/10 pt-2 text-xs text-ink/60">
                {channels.includes('EMAIL') && segment.excludedEmail > 0 && (
                  <p>
                    {segment.excludedEmail} excluded from email (opted out)
                  </p>
                )}
                {channels.includes('SMS') && segment.excludedSms > 0 && (
                  <p>
                    {segment.excludedSms} excluded from SMS (opted out)
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Middle column — message */}
        <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ink">Message</h2>

          <FormField label="Channels" required error={errors.channels}>
            {() => (
              <div className="flex gap-3">
                {(['EMAIL', 'SMS'] as TemplateChannel[]).map((ch) => (
                  <label
                    key={ch}
                    className="flex items-center gap-2 rounded-md border border-ink/20 bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={channels.includes(ch)}
                      onChange={() => toggleChannel(ch)}
                    />
                    {TEMPLATE_CHANNEL_LABELS[ch]}
                  </label>
                ))}
              </div>
            )}
          </FormField>

          {channels.includes('EMAIL') && (
            <FormField label="Subject" required error={errors.subject}>
              {(field) => (
                <Input
                  {...field}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Early-bird pricing ends in two weeks"
                />
              )}
            </FormField>
          )}

          <FormField label="Message" required error={errors.body}>
            {(field) => (
              <textarea
                {...field}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={10}
                className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
                placeholder={'Hi {{first_name}},\n\nWrite the message here.'}
              />
            )}
          </FormField>

          <p className="text-xs text-ink/50">
            Use {'{{first_name}}'}, {'{{chapter_name}}'} and other merge fields.
          </p>
        </section>

        {/* Right column — delivery summary */}
        <aside className="space-y-4 lg:col-span-2 xl:col-span-1">
          <section
            aria-label="Send summary"
            className="space-y-4 rounded-lg border border-ink/10 bg-white p-6 shadow-sm xl:sticky xl:top-6"
          >
            <h2 className="text-base font-semibold text-ink">Send summary</h2>

            <dl className="space-y-2 text-sm">
              <Row label="Segment" value={segment?.name ?? 'Not selected'} />
              {channels.includes('EMAIL') && (
                <Row
                  label="Email recipients"
                  value={emailRecipients.toLocaleString()}
                />
              )}
              {channels.includes('SMS') && (
                <Row
                  label="SMS recipients"
                  value={smsRecipients.toLocaleString()}
                />
              )}
              <Row
                label="Estimated cost"
                value={
                  estimatedCostMinor > 0
                    ? formatCurrency(estimatedCostMinor, 'KES')
                    : 'Free'
                }
              />
              <Row
                label="Send time"
                value={
                  sendMode === 'now'
                    ? 'Now'
                    : scheduledAt
                    ? new Date(scheduledAt).toLocaleString('en-GB')
                    : 'Not set'
                }
              />
            </dl>

            <div className="space-y-2 border-t border-ink/10 pt-4">
              <fieldset className="space-y-2">
                <legend className="text-xs font-medium uppercase tracking-wide text-ink/50">
                  When
                </legend>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="sendMode"
                    value="now"
                    checked={sendMode === 'now'}
                    onChange={() => setSendMode('now')}
                  />
                  Send now
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="sendMode"
                    value="later"
                    checked={sendMode === 'later'}
                    onChange={() => setSendMode('later')}
                  />
                  Schedule
                </label>
              </fieldset>

              {sendMode === 'later' && (
                <FormField label="Send at" required error={errors.scheduledAt}>
                  {(field) => (
                    <Input
                      {...field}
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  )}
                </FormField>
              )}
            </div>

            {totalRecipients === 0 && segment && (
              <p className="rounded-md border border-clay/30 bg-clay/5 px-3 py-2 text-xs text-clay">
                {segment.recipientCount > 0
                  ? 'All members in this segment have opted out of the selected channels.'
                  : 'This segment has no members.'}
              </p>
            )}
          </section>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink/10 bg-white/95 px-6 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-5xl items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/notifications/campaigns')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => void handleSaveDraft()}
          >
            Save draft
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || totalRecipients === 0}
          >
            {sendMode === 'now' ? 'Send now' : 'Schedule'}
          </Button>
        </div>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="text-ink/60">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}