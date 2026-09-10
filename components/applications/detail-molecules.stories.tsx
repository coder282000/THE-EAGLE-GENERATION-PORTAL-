import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { DetailSection, DetailField } from './detail-section';
import { AuditTrail, AuditEntry } from './audit-trail';
import { NotesPanel, Note } from './notes-panel';

// ─── DetailSection ─────────────────────────────────────
const detailMeta: Meta<typeof DetailSection> = {
  title: 'Applications/DetailSection',
  component: DetailSection,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[720px] p-6 bg-paper">
        <Story />
      </div>
    ),
  ],
};
export default detailMeta;
type DetailStory = StoryObj<typeof DetailSection>;

export const DetailGrid: DetailStory = {
  render: () => (
    <DetailSection title="Personal details">
      <DetailField label="First name" value="Dennis" />
      <DetailField label="Last name" value="Kimani" />
      <DetailField label="Email" value="dennis.k@example.com" />
      <DetailField label="Phone" value="+254 712 345 004" />
      <DetailField label="Date of birth" value="15 July 2003" />
      <DetailField label="Referral source" value={null} empty />
    </DetailSection>
  ),
};

export const DetailStacked: DetailStory = {
  render: () => (
    <DetailSection title="Motivation" layout="stacked">
      <DetailField
        label="Why the applicant wants to join"
        value="Interested in policy and civic engagement at the county level. Has worked with two youth-led civic organisations and wants a Kingdom-centred community for accountability."
      />
    </DetailSection>
  ),
};

export const DetailWithAction: DetailStory = {
  render: () => (
    <DetailSection
      title="Interview"
      action={
        <button className="text-xs font-medium text-primary hover:underline">
          Record outcome
        </button>
      }
    >
      <DetailField label="Scheduled" value="3 days ago" />
      <DetailField label="Interviewer" value="Esther W." />
      <DetailField label="Recommendation" value="Yes (4/5)" />
    </DetailSection>
  ),
};

// ─── AuditTrail ────────────────────────────────────────
type AuditStory = StoryObj<typeof AuditTrail>;

const sampleEntries: AuditEntry[] = [
  {
    id: '1',
    actor: 'Solomon A.',
    action: 'submitted application',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    category: 'status',
  },
  {
    id: '2',
    actor: 'Esther W.',
    action: 'scheduled interview',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    category: 'interview',
  },
  {
    id: '3',
    actor: 'Esther W.',
    action: 'recorded outcome',
    target: 'Yes (4/5)',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    category: 'interview',
  },
  {
    id: '4',
    actor: 'Solomon A.',
    action: 'added a note',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    category: 'note',
  },
  {
    id: '5',
    actor: 'Solomon A.',
    action: 'approved application',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    category: 'decision',
  },
  {
    id: '6',
    actor: 'Miriam K.',
    action: 'reopened application',
    target: 'compliance clarification',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    category: 'reopen',
  },
];

export const AuditDefault: AuditStory = {
  render: () => (
    <div className="w-[400px] p-6 bg-paper-elevated border border-border rounded-lg">
      <AuditTrail entries={sampleEntries} />
    </div>
  ),
};

export const AuditEmpty: AuditStory = {
  render: () => (
    <div className="w-[400px] p-6 bg-paper-elevated border border-border rounded-lg">
      <AuditTrail entries={[]} />
    </div>
  ),
};

// ─── NotesPanel ────────────────────────────────────────
const notesMeta: Meta<typeof NotesPanel> = {
  title: 'Applications/NotesPanel',
  component: NotesPanel,
  parameters: { layout: 'centered' },
  decorators: [
    (Story) => (
      <div className="w-[520px] p-6 bg-paper-elevated border border-border rounded-lg">
        <Story />
      </div>
    ),
  ],
};
export { notesMeta as NotesPanelMeta };
type NotesStory = StoryObj<typeof NotesPanel>;

const sampleNotes: Note[] = [
  {
    id: 'n1',
    authorId: 'user-esther',
    authorName: 'Esther W.',
    body: 'Called applicant to confirm details. Left voicemail.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  },
  {
    id: 'n2',
    authorId: 'user-solomon',
    authorName: 'Solomon A.',
    body: 'Concur with recommendation. Will issue decision after compliance confirms no PEP match.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  },
];

export const NotesWithData: NotesStory = {
  render: () => {
    const [notes, setNotes] = useState<Note[]>(sampleNotes);
    return (
      <NotesPanel
        notes={notes}
        onAddNote={async (body) => {
          await new Promise((r) => setTimeout(r, 400));
          setNotes((prev) => [
            ...prev,
            {
              id: `n${Date.now()}`,
              authorId: 'user-solomon',
              authorName: 'Solomon A.',
              body,
              createdAt: new Date().toISOString(),
            },
          ]);
        }}
      />
    );
  },
};

export const NotesEmpty: NotesStory = {
  render: () => (
    <NotesPanel notes={[]} onAddNote={() => {}} />
  ),
};

export const NotesReadOnly: NotesStory = {
  render: () => <NotesPanel notes={sampleNotes} onAddNote={() => {}} readOnly />,
};