'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { useCurrentUser } from '@/lib/mock/current-user';
import {
  ANNOUNCEMENT_AUDIENCE_LABELS,
  ANNOUNCEMENT_PRIORITY_LABELS,
  createAnnouncement,
  previewAudience,
  updateAnnouncement,
  saveAnnouncementDraft,
  type AdminAnnouncement,
  type AnnouncementAudience,
  type AnnouncementPriority,
} from '@/lib/mock/communications';

const CHAPTER_OPTIONS = [
  { value: 'KU', label: 'Kenyatta University' },
  { value: 'UON', label: 'University of Nairobi' },
  { value: 'STRATH', label: 'Strathmore University' },
  { value: 'NAIROBI_PRO', label: 'Nairobi Professional' },
  { value: 'KISUMU', label: 'Kisumu Chapter' },
];

const TIER_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'PROFESSIONAL', label: 'Professional' },
  { value: 'ASSOCIATE', label: 'Associate' },
];

interface AnnouncementFormProps {
  mode: 'create' | 'edit';
  initial?: AdminAnnouncement;
}

interface FormErrors {
  title?: string;
  body?: string;
  audienceRef?: string;
  publishAt?: string;
  expiresAt?: string;
}

export function AnnouncementForm({ mode, initial }: AnnouncementFormProps) {
  const router = useRouter();
  const user = useCurrentUser();

  const isChapterLeader = user.role === 'CHAPTER_LEADER';

  const [title, setTitle] = useState(initial?.title ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [audience, setAudience] = useState<AnnouncementAudience>(
    isChapterLeader ? 'CHAPTER' : initial?.audience ?? 'ALL',
  );
  const [audienceRef, setAudienceRef] = useState<string | null>(
    isChapterLeader ? user.chapterCode ?? null : initial?.audienceRef ?? null,
  );
  const [priority, setPriority] = useState<AnnouncementPriority>(
    initial?.priority ?? 'MEDIUM',
  );
  const [scheduledMode, setScheduledMode] = useState<'now' | 'later'>(
    initial?.publishAt && new Date(initial.publishAt).getTime() > Date.now()
      ? 'later'
      : 'now',
  );
  const [publishAt, setPublishAt] = useState(
    initial?.publishAt?.slice(0, 16) ?? '',
  );
  const [expiresAt, setExpiresAt] = useState(
    initial?.expiresAt?.slice(0, 16) ?? '',
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const audiencePreview = useMemo(
    () => previewAudience(audience, audienceRef, user),
    [audience, audienceRef, user],
  );

  function validate(): FormErrors {
    const e: FormErrors = {};
    if (!title.trim() || title.trim().length < 3) {
      e.title = 'Give the announcement a title.';
    }
    if (!body.trim() || body.trim().length < 10) {
      e.body = 'Write at least a sentence or two.';
    }
    if (audience !== 'ALL' && !audienceRef) {
      e.audienceRef = 'Choose a chapter, tier or cohort.';
    }
    if (scheduledMode === 'later') {
      if (!publishAt) {
        e.publishAt = 'Choose a publish time.';
      } else if (new Date(publishAt).getTime() <= Date.now()) {
        e.publishAt = 'The publish time must be in the future.';
      }
    }
    if (expiresAt) {
      const expiryTime = new Date(expiresAt).getTime();
      const publishTime =
        scheduledMode === 'later' && publishAt
          ? new Date(publishAt).getTime()
          : Date.now();
      if (expiryTime <= publishTime) {
        e.expiresAt = 'Expiry must be after publish.';
      }
    }
    return e;
  }

  function buildPayload(status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED') {
    const publishIso =
      status === 'PUBLISHED'
        ? new Date().toISOString()
        : status === 'SCHEDULED' && publishAt
        ? new Date(publishAt).toISOString()
        : null;
    return {
      title: title.trim(),
      body: body.trim(),
      audience,
      audienceRef: audience === 'ALL' ? null : audienceRef,
      priority,
      status,
      publishAt: publishIso,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };
  }

  async function handleSaveDraft() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    if (mode === 'create') {
      createAnnouncement(user, {
        ...buildPayload('DRAFT'),
        status: 'DRAFT',
      });
    } else if (initial) {
      saveAnnouncementDraft({ id: initial.id, ...buildPayload('DRAFT') });
    }
    setSubmitting(false);
    router.push('/admin/announcements');
  }

  async function handlePublish() {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    const status = scheduledMode === 'later' ? 'SCHEDULED' : 'PUBLISHED';
    if (mode === 'create') {
      createAnnouncement(user, buildPayload(status));
    } else if (initial) {
      updateAnnouncement(initial.id, buildPayload(status));
    }
    setSubmitting(false);
    router.push('/admin/announcements');
  }

  const headingText = mode === 'create' ? 'New announcement' : 'Edit announcement';
  const primaryLabel = mode === 'create' ? 'Publish' : 'Save changes';

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handlePublish();
      }}
      className="mx-auto max-w-3xl space-y-6 pb-28"
    >
      <header>
        <h1 className="text-2xl font-semibold text-ink">{headingText}</h1>
        <p className="mt-1 text-sm text-ink/60">
          Compose a message for members.
        </p>
      </header>

      <Section title="Message">
        <FormField label="Title" required error={errors.title}>
          {(field) => (
            <Input
              {...field}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Annual Leadership Summit — registration open"
            />
          )}
        </FormField>
        <FormField label="Body" required error={errors.body}>
          {(field) => (
            <textarea
              {...field}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
              placeholder="Write the announcement."
            />
          )}
        </FormField>
      </Section>

      <Section title="Audience">
        {isChapterLeader && (
          <p className="rounded-md border border-clay/30 bg-clay/5 px-3 py-2 text-xs text-clay">
            As a chapter leader, your announcements are scoped to your
            chapter.
          </p>
        )}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-fg">Who receives this</legend>
          <div className="flex flex-wrap gap-3">
            {(
              Object.keys(ANNOUNCEMENT_AUDIENCE_LABELS) as AnnouncementAudience[]
            ).map((k) => (
              <label key={k} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="audience"
                  value={k}
                  checked={audience === k}
                  disabled={isChapterLeader && k !== 'CHAPTER'}
                  onChange={() => {
                    setAudience(k);
                    if (k === 'ALL') setAudienceRef(null);
                    else if (k !== 'CHAPTER') setAudienceRef(null);
                    else if (isChapterLeader) setAudienceRef(user.chapterCode ?? null);
                  }}
                />
                {ANNOUNCEMENT_AUDIENCE_LABELS[k]}
              </label>
            ))}
          </div>
        </fieldset>

        {audience === 'CHAPTER' && (
          <FormField label="Chapter" required error={errors.audienceRef}>
            {(field) => (
              <select
                {...field}
                value={audienceRef ?? ''}
                onChange={(e) => setAudienceRef(e.target.value || null)}
                disabled={isChapterLeader}
                className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50 disabled:bg-paper-muted"
              >
                <option value="">Choose a chapter</option>
                {CHAPTER_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}

        {audience === 'TIER' && (
          <FormField label="Tier" required error={errors.audienceRef}>
            {(field) => (
              <select
                {...field}
                value={audienceRef ?? ''}
                onChange={(e) => setAudienceRef(e.target.value || null)}
                className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky/50"
              >
                <option value="">Choose a tier</option>
                {TIER_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            )}
          </FormField>
        )}

        {audience === 'COHORT' && (
          <FormField label="Cohort" required error={errors.audienceRef}>
            {(field) => (
              <select
                {...field}
                disabled
                className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm disabled:bg-paper-muted"
              >
                <option>Cohort targeting coming in R3</option>
              </select>
            )}
          </FormField>
        )}

        <div
          aria-live="polite"
          className="rounded-md border border-ink/10 bg-paper px-3 py-2 text-sm text-ink/70"
        >
          {audiencePreview.total > 0
            ? `Sending to ${audiencePreview.total.toLocaleString()} members.`
            : 'No members match this audience.'}
        </div>
      </Section>

      <Section title="Priority">
        <fieldset className="space-y-3">
          <legend className="text-sm font-medium text-fg">
            How urgent is this
          </legend>
          {(['LOW', 'MEDIUM', 'HIGH'] as AnnouncementPriority[]).map((p) => (
            <label
              key={p}
              className="flex items-start gap-3 rounded-md border border-ink/10 bg-white p-3 text-sm"
            >
              <input
                type="radio"
                name="priority"
                value={p}
                checked={priority === p}
                onChange={() => setPriority(p)}
                className="mt-1"
              />
              <span>
                <span className="font-medium text-ink">
                  {ANNOUNCEMENT_PRIORITY_LABELS[p]}
                </span>
                <span className="ml-2 text-ink/60">
                  {p === 'LOW' && 'Appears in the announcements inbox.'}
                  {p === 'MEDIUM' && 'Inbox and email.'}
                  {p === 'HIGH' &&
                    'Inbox, email, and member dashboard until read.'}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      </Section>

      <Section title="Schedule">
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium text-fg">When</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="scheduleMode"
              value="now"
              checked={scheduledMode === 'now'}
              onChange={() => setScheduledMode('now')}
            />
            Publish now
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="scheduleMode"
              value="later"
              checked={scheduledMode === 'later'}
              onChange={() => setScheduledMode('later')}
            />
            Schedule for later
          </label>
        </fieldset>

        {scheduledMode === 'later' && (
          <FormField label="Publish at" required error={errors.publishAt}>
            {(field) => (
              <Input
                {...field}
                type="datetime-local"
                value={publishAt}
                onChange={(e) => setPublishAt(e.target.value)}
              />
            )}
          </FormField>
        )}

        <FormField
          label="Expires at (optional)"
          hint="Announcements auto-hide after this date."
          error={errors.expiresAt}
        >
          {(field) => (
            <Input
              {...field}
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          )}
        </FormField>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink/10 bg-white/95 px-6 py-3 backdrop-blur lg:left-64">
        <div className="mx-auto flex max-w-3xl items-center justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push('/admin/announcements')}
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
          <Button type="submit" variant="primary" disabled={submitting}>
            {primaryLabel}
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