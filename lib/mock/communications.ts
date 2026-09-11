// lib/mock/communications.ts
//
// PNL-07 Communications — types, permission helpers, seed data, accessors.
//
// Scoping convention matches the rest of the codebase: chapter scoping
// uses `chapterCode` (e.g. 'KU') compared against MockUser.chapterCode.
//
// Money values are integer minor units plus an explicit currency code.
// Never a float.

import type { MockUser } from '@/components/mock/data';

// ============================================================================
// Types
// ============================================================================

export type AnnouncementAudience = 'ALL' | 'CHAPTER' | 'TIER' | 'COHORT';
export type AnnouncementPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type AnnouncementStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'EXPIRED';

export type TemplateChannel = 'EMAIL' | 'SMS' | 'PUSH';

export type CampaignStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'PAUSED'
  | 'CANCELLED';

export type DeliveryStatus =
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'BOUNCED'
  | 'FAILED'
  | 'OPTED_OUT';

export interface AdminAnnouncement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  audienceRef: string | null;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishAt: string | null;
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  archivedAt: string | null;
  /** Members who have opened the announcement. */
  readBy: string[];
  /** Snapshot of the audience size when the announcement was published. */
  targetedCount: number;
}

export interface AdminTemplate {
  key: string;
  description: string;
  channel: TemplateChannel;
  version: number;
  subject: string | null;
  body: string;
  mergeFields: string[];
  active: boolean;
  updatedBy: string;
  updatedAt: string;
}

export interface AdminCampaign {
  id: string;
  name: string;
  segmentId: string;
  segmentName: string;
  channels: TemplateChannel[];
  templateKey: string | null;
  subject: string | null;
  body: string;
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  excludedCount: number;
  estimatedCostMinor: number;
  currency: string;
  createdBy: string;
  createdAt: string;
}

export interface AdminDelivery {
  id: string;
  campaignId: string | null;
  announcementId: string | null;
  templateKey: string | null;
  recipientId: string;
  /** Denormalized for the mock UI. Real backend joins. */
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  recipientChapterCode: string;
  channel: TemplateChannel;
  status: DeliveryStatus;
  provider: string;
  providerRef: string | null;
  errorCode: string | null;
  attempts: number;
  lastAttemptAt: string;
  createdAt: string;
}

export interface AnnouncementFilters {
  status?: AnnouncementStatus | 'ALL';
  priority?: AnnouncementPriority | 'ALL';
  audience?: AnnouncementAudience | 'ALL';
  q?: string;
  includeArchived?: boolean;
}

export interface TemplateFilters {
  channel?: TemplateChannel | 'ALL';
  state?: 'ALL' | 'ACTIVE' | 'DRAFT_PENDING';
  q?: string;
}

export interface CampaignFilters {
  status?: CampaignStatus | 'ALL';
  q?: string;
}

export interface DeliveryFilters {
  status?: DeliveryStatus | 'ALL';
  channel?: TemplateChannel | 'ALL';
  provider?: string | 'ALL';
  q?: string;
  days?: number;
}

// ============================================================================
// Label maps
// ============================================================================

export const ANNOUNCEMENT_AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  ALL: 'All members',
  CHAPTER: 'Chapter',
  TIER: 'Tier',
  COHORT: 'Cohort',
};

export const ANNOUNCEMENT_PRIORITY_LABELS: Record<AnnouncementPriority, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  EXPIRED: 'Expired',
};

export const TEMPLATE_CHANNEL_LABELS: Record<TemplateChannel, string> = {
  EMAIL: 'Email',
  SMS: 'SMS',
  PUSH: 'Push',
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  SENDING: 'Sending',
  SENT: 'Sent',
  PAUSED: 'Paused',
  CANCELLED: 'Cancelled',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  QUEUED: 'Queued',
  SENT: 'Sent',
  DELIVERED: 'Delivered',
  BOUNCED: 'Bounced',
  FAILED: 'Failed',
  OPTED_OUT: 'Opted out',
};

// ============================================================================
// Chapter lookup (matches PNL-04 / PNL-08)
// ============================================================================

const CHAPTER_NAMES: Record<string, string> = {
  KU: 'Kenyatta University',
  UON: 'University of Nairobi',
  STRATH: 'Strathmore University',
  NAIROBI_PRO: 'Nairobi Professional',
  KISUMU: 'Kisumu Chapter',
};

export function getChapterName(chapterCode: string | null): string {
  if (!chapterCode) return 'Organisation-wide';
  return CHAPTER_NAMES[chapterCode] ?? chapterCode;
}

/** Approximate member counts for the audience preview. */
const MOCK_MEMBER_COUNT_BY_CHAPTER: Record<string, number> = {
  KU: 342,
  UON: 287,
  STRATH: 198,
  NAIROBI_PRO: 214,
  KISUMU: 96,
};

const MOCK_MEMBER_COUNT_BY_TIER: Record<string, number> = {
  STUDENT: 712,
  PROFESSIONAL: 358,
  ASSOCIATE: 67,
};

// ============================================================================
// Permission helpers
// ============================================================================

function isAdmin(user: MockUser): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}

function isChapterLeader(user: MockUser): boolean {
  return user.role === 'CHAPTER_LEADER';
}

function isFinanceOfficer(user: MockUser): boolean {
  return user.role === 'FINANCE_OFFICER';
}

function sameChapter(user: MockUser, code: string | null): boolean {
  if (!code) return false;
  return user.chapterCode === code;
}

export function canCreateAnnouncement(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user);
}

export function canEditAnnouncement(
  user: MockUser,
  item: AdminAnnouncement,
): boolean {
  if (isAdmin(user)) return true;
  if (
    isChapterLeader(user) &&
    item.audience === 'CHAPTER' &&
    sameChapter(user, item.audienceRef)
  ) {
    return true;
  }
  return false;
}

export function canArchiveAnnouncement(user: MockUser): boolean {
  return isAdmin(user);
}

export function canManageTemplates(user: MockUser): boolean {
  return isAdmin(user);
}

export function canSendCampaign(user: MockUser): boolean {
  return isAdmin(user);
}

export function canViewDeliveryLog(user: MockUser): boolean {
  return (
    isAdmin(user) || isFinanceOfficer(user) || isChapterLeader(user)
  );
}

export function canRetryDelivery(user: MockUser): boolean {
  return isAdmin(user);
}

export function canExportDeliveries(user: MockUser): boolean {
  return isAdmin(user) || isFinanceOfficer(user);
}

export function canReadDeliveriesReadOnly(user: MockUser): boolean {
  return isChapterLeader(user) || isFinanceOfficer(user);
}

// ============================================================================
// Seed data
// ============================================================================

const now = Date.now();
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const daysAgo = (n: number) => new Date(now - DAY * n).toISOString();
const daysAhead = (n: number) => new Date(now + DAY * n).toISOString();

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export const mockAnnouncements: AdminAnnouncement[] = [
  {
    id: 'ann-001',
    title: 'Annual Leadership Summit 2026 — registration open',
    body: 'Registrations for the Annual Leadership Summit are now open. Three days of teaching, worship and marketplace application. Early-bird pricing ends in two weeks.',
    audience: 'ALL',
    audienceRef: null,
    priority: 'HIGH',
    status: 'PUBLISHED',
    publishAt: daysAgo(5),
    expiresAt: daysAhead(25),
    createdBy: 'user-solomon',
    createdAt: daysAgo(6),
    archivedAt: null,
    readBy: Array.from({ length: 412 }, (_, i) => `mem-${i + 1}`),
    targetedCount: 1137,
  },
  {
    id: 'ann-002',
    title: 'Chapter leaders meeting — Thursday 6pm',
    body: 'Monthly leaders call. Agenda: summit logistics, chapter reporting, and Q1 plans.',
    audience: 'CHAPTER',
    audienceRef: 'KU',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    publishAt: daysAgo(2),
    expiresAt: daysAhead(3),
    createdBy: 'user-esther',
    createdAt: daysAgo(3),
    archivedAt: null,
    readBy: Array.from({ length: 48 }, (_, i) => `ku-mem-${i + 1}`),
    targetedCount: 62,
  },
  {
    id: 'ann-003',
    title: 'New course: Governance and Public Sector Ethics',
    body: 'A 6-week cohort-based course starting next month. Applications open to Professional and Associate tier members.',
    audience: 'TIER',
    audienceRef: 'PROFESSIONAL',
    priority: 'MEDIUM',
    status: 'PUBLISHED',
    publishAt: daysAgo(10),
    expiresAt: daysAhead(20),
    createdBy: 'user-solomon',
    createdAt: daysAgo(11),
    archivedAt: null,
    readBy: Array.from({ length: 198 }, (_, i) => `pro-mem-${i + 1}`),
    targetedCount: 358,
  },
  {
    id: 'ann-004',
    title: 'System maintenance this Saturday',
    body: 'The portal will be unavailable on Saturday from 22:00 to 02:00 for scheduled maintenance. Plan your contributions accordingly.',
    audience: 'ALL',
    audienceRef: null,
    priority: 'LOW',
    status: 'PUBLISHED',
    publishAt: daysAgo(1),
    expiresAt: daysAhead(6),
    createdBy: 'user-solomon',
    createdAt: daysAgo(1),
    archivedAt: null,
    readBy: Array.from({ length: 210 }, (_, i) => `mem-${i + 1}`),
    targetedCount: 1137,
  },
  {
    id: 'ann-005',
    title: 'Draft: Kisumu chapter launch',
    body: 'Save the date for the Kisumu chapter launch. Details to follow.',
    audience: 'CHAPTER',
    audienceRef: 'KISUMU',
    priority: 'MEDIUM',
    status: 'DRAFT',
    publishAt: null,
    expiresAt: null,
    createdBy: 'user-solomon',
    createdAt: daysAgo(4),
    archivedAt: null,
    readBy: [],
    targetedCount: 96,
  },
  {
    id: 'ann-006',
    title: 'Reminder: Founders Gala reflections',
    body: 'Thank you to everyone who joined the Founders Gala. A short reflection and photo album are now available.',
    audience: 'ALL',
    audienceRef: null,
    priority: 'MEDIUM',
    status: 'SCHEDULED',
    publishAt: daysAhead(3),
    expiresAt: daysAhead(17),
    createdBy: 'user-solomon',
    createdAt: daysAgo(1),
    archivedAt: null,
    readBy: [],
    targetedCount: 1137,
  },
];

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export const mockTemplates: AdminTemplate[] = [
  {
    key: 'member.welcome',
    description: 'Sent when a new member completes onboarding.',
    channel: 'EMAIL',
    version: 3,
    subject: 'Welcome to the Eagle Generation, {{first_name}}',
    body:
      'Hi {{first_name}},\n\nWelcome to the Eagle Generation. Your member number is {{member_number}} and your chapter is {{chapter_name}}.\n\nTake a few minutes to complete your profile and explore your first course.\n\nSoaring above,\nThe Eagle Generation',
    mergeFields: ['first_name', 'member_number', 'chapter_name'],
    active: true,
    updatedBy: 'user-solomon',
    updatedAt: daysAgo(15),
  },
  {
    key: 'application.received',
    description: 'Acknowledgement sent when an application is submitted.',
    channel: 'EMAIL',
    version: 2,
    subject: 'We received your application ({{reference}})',
    body:
      'Hi {{first_name}},\n\nWe have received your application to join the Eagle Generation. Your reference is {{reference}}.\n\nWe review applications weekly. You will hear from us within 14 days.\n\nIn the meantime, you can check your status at any time.\n\nThe Eagle Generation',
    mergeFields: ['first_name', 'reference'],
    active: true,
    updatedBy: 'user-solomon',
    updatedAt: daysAgo(30),
  },
  {
    key: 'application.approved',
    description: 'Approval notification with next steps.',
    channel: 'EMAIL',
    version: 1,
    subject: 'Welcome — your application has been approved',
    body:
      'Hi {{first_name}},\n\nYour application has been approved. Your member number is {{member_number}} and your chapter is {{chapter_name}}.\n\nSign in to complete your profile.\n\nThe Eagle Generation',
    mergeFields: ['first_name', 'member_number', 'chapter_name'],
    active: true,
    updatedBy: 'user-solomon',
    updatedAt: daysAgo(60),
  },
  {
    key: 'refund.issued',
    description: 'Sent when a refund has been approved and processed.',
    channel: 'EMAIL',
    version: 1,
    subject: 'Refund of {{amount}} processed',
    body:
      'Hi {{first_name}},\n\nA refund of {{amount}} has been processed to your account.\n\nReference: {{reference}}\n\nIf you have any questions, reply to this email.\n\nThe Eagle Generation',
    mergeFields: ['first_name', 'amount', 'reference'],
    active: true,
    updatedBy: 'user-solomon',
    updatedAt: daysAgo(45),
  },
  {
    key: 'event.reminder',
    description: 'Reminder sent 24 hours before an event.',
    channel: 'SMS',
    version: 1,
    subject: null,
    body: 'Reminder: {{event_title}} tomorrow at {{start_time}}. See you there.',
    mergeFields: ['event_title', 'start_time'],
    active: true,
    updatedBy: 'user-solomon',
    updatedAt: daysAgo(20),
  },
];

// ---------------------------------------------------------------------------
// Campaigns
// ---------------------------------------------------------------------------

export const mockCampaigns: AdminCampaign[] = [
  {
    id: 'cmp-001',
    name: 'Summit early-bird blast',
    segmentId: 'seg-001',
    segmentName: 'All active members',
    channels: ['EMAIL'],
    templateKey: null,
    subject: 'Early-bird pricing ends in two weeks',
    body:
      'Hi {{first_name}},\n\nEarly-bird pricing for the Annual Leadership Summit ends in two weeks. Secure your place now.\n\nThe Eagle Generation',
    status: 'SENT',
    scheduledAt: null,
    sentAt: daysAgo(5),
    recipientCount: 1137,
    excludedCount: 42,
    estimatedCostMinor: 0,
    currency: 'KES',
    createdBy: 'user-solomon',
    createdAt: daysAgo(6),
  },
  {
    id: 'cmp-002',
    name: 'KU chapter dinner reminder',
    segmentId: 'seg-ku-active',
    segmentName: 'KU chapter — active members',
    channels: ['SMS'],
    templateKey: null,
    subject: null,
    body: 'Reminder: KU chapter dinner is Thursday at 6pm. See you there.',
    status: 'SENT',
    scheduledAt: null,
    sentAt: daysAgo(2),
    recipientCount: 62,
    excludedCount: 8,
    estimatedCostMinor: 6200,
    currency: 'KES',
    createdBy: 'user-solomon',
    createdAt: daysAgo(3),
  },
  {
    id: 'cmp-003',
    name: 'Professional tier — course launch',
    segmentId: 'seg-professional',
    segmentName: 'Professional tier',
    channels: ['EMAIL'],
    templateKey: null,
    subject: 'New course: Governance and Public Sector Ethics',
    body:
      'Hi {{first_name}},\n\nOur newest course opens for enrolment next week. Six weeks, cohort-based, certificate on completion.\n\nEnrol early to reserve a place.',
    status: 'SCHEDULED',
    scheduledAt: daysAhead(4),
    sentAt: null,
    recipientCount: 358,
    excludedCount: 12,
    estimatedCostMinor: 0,
    currency: 'KES',
    createdBy: 'user-solomon',
    createdAt: daysAgo(1),
  },
  {
    id: 'cmp-004',
    name: 'Q1 fundraising appeal',
    segmentId: 'seg-all',
    segmentName: 'All members',
    channels: ['EMAIL', 'SMS'],
    templateKey: null,
    subject: 'Support the scholarship fund',
    body:
      'Hi {{first_name}},\n\nThis quarter we are raising funds for the TEG scholarship. Every contribution helps a young leader take their next step.\n\nGive today.',
    status: 'DRAFT',
    scheduledAt: null,
    sentAt: null,
    recipientCount: 1137,
    excludedCount: 0,
    estimatedCostMinor: 113700,
    currency: 'KES',
    createdBy: 'user-solomon',
    createdAt: daysAgo(1),
  },
];

// ---------------------------------------------------------------------------
// Deliveries
// ---------------------------------------------------------------------------

const RECIPIENTS = [
  { name: 'Grace Njeri', email: 'grace.njeri@example.com', phone: '+254712345001', chapterCode: 'KU' },
  { name: 'David Ochieng', email: 'david.ochieng@example.com', phone: '+254712345002', chapterCode: 'UON' },
  { name: 'Faith Wanjiku', email: 'faith.wanjiku@example.com', phone: '+254712345003', chapterCode: 'STRATH' },
  { name: 'Peter Mwangi', email: 'peter.mwangi@example.com', phone: '+254712345004', chapterCode: 'KU' },
  { name: 'Esther Wambui', email: 'esther.wambui@example.com', phone: '+254712345005', chapterCode: 'UON' },
  { name: 'Samuel Kipchoge', email: 'samuel.kipchoge@example.com', phone: '+254712345006', chapterCode: 'STRATH' },
  { name: 'Mercy Wairimu', email: 'mercy.wairimu@example.com', phone: '+254712345007', chapterCode: 'KU' },
  { name: 'John Kamau', email: 'john.kamau@example.com', phone: '+254712345008', chapterCode: 'UON' },
  { name: 'Sarah Atieno', email: 'sarah.atieno@example.com', phone: '+254712345009', chapterCode: 'KISUMU' },
  { name: 'Daniel Mutua', email: 'daniel.mutua@example.com', phone: '+254712345010', chapterCode: 'NAIROBI_PRO' },
  { name: 'Ruth Wanjala', email: 'ruth.wanjala@example.com', phone: '+254712345011', chapterCode: 'KU' },
  { name: 'James Kariuki', email: 'james.kariuki@example.com', phone: '+254712345012', chapterCode: 'STRATH' },
  { name: 'Hannah Njoroge', email: 'hannah.njoroge@example.com', phone: '+254712345013', chapterCode: 'UON' },
  { name: 'Isaac Otieno', email: 'isaac.otieno@example.com', phone: '+254712345014', chapterCode: 'KISUMU' },
  { name: 'Rebecca Achieng', email: 'rebecca.achieng@example.com', phone: '+254712345015', chapterCode: 'NAIROBI_PRO' },
  { name: 'Michael Odhiambo', email: 'michael.odhiambo@example.com', phone: '+254712345016', chapterCode: 'UON' },
  { name: 'Naomi Chebet', email: 'naomi.chebet@example.com', phone: '+254712345017', chapterCode: 'KU' },
  { name: 'Paul Muthoka', email: 'paul.muthoka@example.com', phone: '+254712345018', chapterCode: 'STRATH' },
  { name: 'Rachelle Wanjiru', email: 'rachelle.wanjiru@example.com', phone: '+254712345019', chapterCode: 'KU' },
  { name: 'Stephen Njenga', email: 'stephen.njenga@example.com', phone: '+254712345020', chapterCode: 'NAIROBI_PRO' },
];

interface DeliverySpec {
  channel: TemplateChannel;
  statuses: DeliveryStatus[];
  provider: string;
  campaignId?: string;
  announcementId?: string;
  templateKey?: string;
  daysBack: number;
}

const DELIVERY_SPECS: DeliverySpec[] = [
  // Summit announcement email
  {
    channel: 'EMAIL',
    statuses: [
      ...Array(12).fill('DELIVERED'),
      ...Array(2).fill('FAILED'),
      ...Array(1).fill('BOUNCED'),
    ],
    provider: 'postmark',
    announcementId: 'ann-001',
    daysBack: 5,
  },
  // KU chapter SMS to leaders
  {
    channel: 'SMS',
    statuses: [
      ...Array(6).fill('DELIVERED'),
      ...Array(2).fill('SENT'),
      ...Array(1).fill('FAILED'),
    ],
    provider: 'africastalking',
    announcementId: 'ann-002',
    daysBack: 2,
  },
  // Summit blast (campaign cmp-001)
  {
    channel: 'EMAIL',
    statuses: [
      ...Array(15).fill('DELIVERED'),
      ...Array(1).fill('OPTED_OUT'),
    ],
    provider: 'postmark',
    campaignId: 'cmp-001',
    daysBack: 5,
  },
  // KU chapter dinner (campaign cmp-002, SMS)
  {
    channel: 'SMS',
    statuses: [
      ...Array(8).fill('DELIVERED'),
      ...Array(1).fill('OPTED_OUT'),
      ...Array(1).fill('FAILED'),
    ],
    provider: 'africastalking',
    campaignId: 'cmp-002',
    daysBack: 2,
  },
];

function buildDeliveries(): AdminDelivery[] {
  const out: AdminDelivery[] = [];
  let counter = 1;
  let recipientIdx = 0;

  for (const spec of DELIVERY_SPECS) {
    for (const status of spec.statuses) {
      const recipient = RECIPIENTS[recipientIdx % RECIPIENTS.length];
      recipientIdx += 1;
      const id = `del-${String(counter).padStart(5, '0')}`;
      counter += 1;
      out.push({
        id,
        campaignId: spec.campaignId ?? null,
        announcementId: spec.announcementId ?? null,
        templateKey: spec.templateKey ?? null,
        recipientId: `mem-${String(recipientIdx).padStart(4, '0')}`,
        recipientName: recipient.name,
        recipientEmail: recipient.email,
        recipientPhone: recipient.phone,
        recipientChapterCode: recipient.chapterCode,
        channel: spec.channel,
        status,
        provider: spec.provider,
        providerRef: `prv_${id}`,
        errorCode:
          status === 'FAILED'
            ? 'SOFT_BOUNCE'
            : status === 'BOUNCED'
            ? 'HARD_BOUNCE'
            : null,
        attempts: status === 'FAILED' ? 2 : 1,
        lastAttemptAt: daysAgo(spec.daysBack),
        createdAt: daysAgo(spec.daysBack),
      });
    }
  }
  return out;
}

export const mockDeliveries: AdminDelivery[] = buildDeliveries();

// ============================================================================
// Announcement accessors
// ============================================================================

export function getAnnouncements(
  user: MockUser,
  filters?: AnnouncementFilters,
): AdminAnnouncement[] {
  let result = mockAnnouncements;

  // CHAPTER_LEADER sees only their own chapter's announcements.
  if (isChapterLeader(user) && user.chapterCode) {
    result = result.filter(
      (a) => a.audience === 'CHAPTER' && a.audienceRef === user.chapterCode,
    );
  }

  if (!filters?.includeArchived) {
    result = result.filter((a) => !a.archivedAt);
  }
  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((a) => a.status === filters.status);
  }
  if (filters?.priority && filters.priority !== 'ALL') {
    result = result.filter((a) => a.priority === filters.priority);
  }
  if (filters?.audience && filters.audience !== 'ALL') {
    result = result.filter((a) => a.audience === filters.audience);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.body.toLowerCase().includes(q),
    );
  }

  return [...result].sort((a, b) => {
    const aAt = a.publishAt ? new Date(a.publishAt).getTime() : 0;
    const bAt = b.publishAt ? new Date(b.publishAt).getTime() : 0;
    if (aAt === bAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return bAt - aAt;
  });
}

export function getAnnouncementById(
  id: string,
  _user: MockUser,
): AdminAnnouncement | null {
  return mockAnnouncements.find((a) => a.id === id) ?? null;
}

export interface AnnouncementStats {
  publishedThisMonth: number;
  scheduled: number;
  drafts: number;
  averageReadRate: number | null;
}

export function getAnnouncementStats(user: MockUser): AnnouncementStats {
  const scoped = getAnnouncements(user);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthStartMs = monthStart.getTime();

  const publishedThisMonth = scoped.filter(
    (a) =>
      a.status === 'PUBLISHED' &&
      a.publishAt != null &&
      new Date(a.publishAt).getTime() >= monthStartMs,
  ).length;
  const scheduled = scoped.filter((a) => a.status === 'SCHEDULED').length;
  const drafts = scoped.filter((a) => a.status === 'DRAFT').length;

  const published = scoped.filter(
    (a) => a.status === 'PUBLISHED' && a.targetedCount > 0,
  );
  const totalRead = published.reduce((sum, a) => sum + a.readBy.length, 0);
  const totalTargeted = published.reduce((sum, a) => sum + a.targetedCount, 0);
  const averageReadRate =
    totalTargeted > 0 ? Math.round((totalRead / totalTargeted) * 100) : null;

  return { publishedThisMonth, scheduled, drafts, averageReadRate };
}

export function saveAnnouncementDraft(
  data: Partial<AdminAnnouncement>,
): AdminAnnouncement | null {
  if (!data.id) return null;
  return mockAnnouncements.find((a) => a.id === data.id) ?? null;
}

export function publishAnnouncement(
  data: Partial<AdminAnnouncement>,
): AdminAnnouncement | null {
  return saveAnnouncementDraft(data);
}

export function updateAnnouncement(
  id: string,
  _data: Partial<AdminAnnouncement>,
): AdminAnnouncement | null {
  return mockAnnouncements.find((a) => a.id === id) ?? null;
}

export function duplicateAnnouncement(id: string): AdminAnnouncement | null {
  const source = mockAnnouncements.find((a) => a.id === id);
  return source ?? null;
}

export function archiveAnnouncement(id: string): boolean {
  const a = mockAnnouncements.find((item) => item.id === id);
  if (!a) return false;
  a.archivedAt = new Date().toISOString();
  return true;
}

// ============================================================================
// Audience preview
// ============================================================================

export interface AudiencePreview {
  total: number;
  byChapter: Array<{ code: string; count: number }>;
}

export function previewAudience(
  audience: AnnouncementAudience,
  audienceRef: string | null,
  _user: MockUser,
): AudiencePreview {
  if (audience === 'ALL') {
    const total = Object.values(MOCK_MEMBER_COUNT_BY_CHAPTER).reduce(
      (sum, n) => sum + n,
      0,
    );
    const byChapter = Object.entries(MOCK_MEMBER_COUNT_BY_CHAPTER).map(
      ([code, count]) => ({ code, count }),
    );
    return { total, byChapter };
  }
  if (audience === 'CHAPTER' && audienceRef) {
    const count = MOCK_MEMBER_COUNT_BY_CHAPTER[audienceRef] ?? 0;
    return { total: count, byChapter: [{ code: audienceRef, count }] };
  }
  if (audience === 'TIER' && audienceRef) {
    const count = MOCK_MEMBER_COUNT_BY_TIER[audienceRef] ?? 0;
    return { total: count, byChapter: [] };
  }
  // COHORT not implemented
  return { total: 0, byChapter: [] };
}

// ============================================================================
// Template accessors
// ============================================================================

export function getTemplates(
  _user: MockUser,
  filters?: TemplateFilters,
): AdminTemplate[] {
  let result = mockTemplates;
  if (filters?.channel && filters.channel !== 'ALL') {
    result = result.filter((t) => t.channel === filters.channel);
  }
  if (filters?.state === 'ACTIVE') {
    result = result.filter((t) => t.active);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.key.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q),
    );
  }
  return [...result].sort((a, b) => a.key.localeCompare(b.key));
}

export function getTemplateByKey(
  key: string,
  _user: MockUser,
): AdminTemplate | null {
  return mockTemplates.find((t) => t.key === key) ?? null;
}

export function saveTemplateVersion(
  _user: MockUser,
  key: string,
  data: Partial<AdminTemplate>,
): AdminTemplate | null {
  const existing = mockTemplates.find((t) => t.key === key);
  if (!existing) return null;
  if (data.subject !== undefined) existing.subject = data.subject;
  if (data.body !== undefined) existing.body = data.body;
  existing.version += 1;
  existing.updatedAt = new Date().toISOString();
  return existing;
}

export function activateVersion(
  _user: MockUser,
  key: string,
  _version: number,
): boolean {
  const t = mockTemplates.find((item) => item.key === key);
  if (!t) return false;
  t.active = true;
  return true;
}

// ============================================================================
// Campaign accessors
// ============================================================================

export function getCampaigns(
  _user: MockUser,
  filters?: CampaignFilters,
): AdminCampaign[] {
  let result = mockCampaigns;
  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((c) => c.status === filters.status);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter((c) => c.name.toLowerCase().includes(q));
  }
  return [...result].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getCampaignById(
  id: string,
  _user: MockUser,
): AdminCampaign | null {
  return mockCampaigns.find((c) => c.id === id) ?? null;
}

export function saveCampaignDraft(
  data: Partial<AdminCampaign>,
): AdminCampaign | null {
  if (!data.id) return null;
  return mockCampaigns.find((c) => c.id === data.id) ?? null;
}

export function sendCampaign(id: string): boolean {
  const c = mockCampaigns.find((item) => item.id === id);
  if (!c) return false;
  c.status = 'SENT';
  c.sentAt = new Date().toISOString();
  return true;
}

export function scheduleCampaign(id: string, at: string): boolean {
  const c = mockCampaigns.find((item) => item.id === id);
  if (!c) return false;
  c.status = 'SCHEDULED';
  c.scheduledAt = at;
  return true;
}

export function cancelCampaign(id: string): boolean {
  const c = mockCampaigns.find((item) => item.id === id);
  if (!c) return false;
  c.status = 'CANCELLED';
  return true;
}

// ============================================================================
// Delivery accessors
// ============================================================================

export function getDeliveries(
  user: MockUser,
  filters?: DeliveryFilters,
): AdminDelivery[] {
  let result = mockDeliveries;

  // CHAPTER_LEADER scope — deliveries to their own chapter's members only.
  if (isChapterLeader(user) && user.chapterCode) {
    result = result.filter(
      (d) => d.recipientChapterCode === user.chapterCode,
    );
  }

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((d) => d.status === filters.status);
  }
  if (filters?.channel && filters.channel !== 'ALL') {
    result = result.filter((d) => d.channel === filters.channel);
  }
  if (filters?.provider && filters.provider !== 'ALL') {
    result = result.filter((d) => d.provider === filters.provider);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (d) =>
        d.recipientName.toLowerCase().includes(q) ||
        d.recipientEmail.toLowerCase().includes(q) ||
        d.recipientPhone.includes(q) ||
        (d.providerRef ?? '').toLowerCase().includes(q),
    );
  }
  if (filters?.days) {
    const cutoff = Date.now() - filters.days * DAY;
    result = result.filter(
      (d) => new Date(d.lastAttemptAt).getTime() >= cutoff,
    );
  }

  return [...result].sort(
    (a, b) =>
      new Date(b.lastAttemptAt).getTime() -
      new Date(a.lastAttemptAt).getTime(),
  );
}

export function getDeliveryById(
  id: string,
  _user: MockUser,
): AdminDelivery | null {
  return mockDeliveries.find((d) => d.id === id) ?? null;
}

export interface DeliveryStats {
  sentToday: number;
  deliveredToday: number;
  failedToday: number;
  bouncedToday: number;
}

export function getDeliveryStats(user: MockUser): DeliveryStats {
  const scoped = getDeliveries(user);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayMs = todayStart.getTime();
  const todays = scoped.filter(
    (d) => new Date(d.lastAttemptAt).getTime() >= todayMs,
  );
  return {
    sentToday: todays.length,
    deliveredToday: todays.filter((d) => d.status === 'DELIVERED').length,
    failedToday: todays.filter((d) => d.status === 'FAILED').length,
    bouncedToday: todays.filter((d) => d.status === 'BOUNCED').length,
  };
}

export function retryDelivery(id: string): boolean {
  const d = mockDeliveries.find((item) => item.id === id);
  if (!d) return false;
  if (d.status === 'DELIVERED' || d.status === 'OPTED_OUT') return false;
  d.attempts += 1;
  d.lastAttemptAt = new Date().toISOString();
  d.status = 'SENT';
  d.errorCode = null;
  return true;
}

export function retryBulk(ids: string[]): { retried: number; skipped: number } {
  let retried = 0;
  let skipped = 0;
  for (const id of ids) {
    if (retryDelivery(id)) retried += 1;
    else skipped += 1;
  }
  return { retried, skipped };
}
// ============================================================================
// Create (added for ADM-080 composer)
// ============================================================================

export interface CreateAnnouncementInput {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  audienceRef: string | null;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  publishAt: string | null;
  expiresAt: string | null;
}

export function createAnnouncement(
  user: MockUser,
  data: CreateAnnouncementInput,
): AdminAnnouncement | null {
  if (isChapterLeader(user)) {
    if (data.audience !== 'CHAPTER' || data.audienceRef !== user.chapterCode) {
      return null;
    }
  } else if (!isAdmin(user)) {
    return null;
  }

  const preview = previewAudience(data.audience, data.audienceRef, user);
  const item: AdminAnnouncement = {
    id: `ann-${Date.now().toString(36)}`,
    title: data.title,
    body: data.body,
    audience: data.audience,
    audienceRef: data.audienceRef,
    priority: data.priority,
    status: data.status,
    publishAt: data.publishAt,
    expiresAt: data.expiresAt,
    createdBy: user.id,
    createdAt: new Date().toISOString(),
    archivedAt: null,
    readBy: [],
    targetedCount: preview.total,
  };
  mockAnnouncements.push(item);
  return item;
}