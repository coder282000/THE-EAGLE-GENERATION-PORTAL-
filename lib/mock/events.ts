// lib/mock/events.ts
//
// PNL-08 Events — types, permission helpers, seed data, and accessors.
//
// These helpers stand in for the real server-side authorisation and
// PostgreSQL row-level security described in the Charter. They are the
// only path the UI should use to read event data. Hiding a control in
// the UI is not the control; the helper is.
//
// Scoping convention: matches the codebase pattern used by Application —
// chapter scoping is expressed as a `chapterCode` string (e.g. 'KU'),
// compared against `MockUser.chapterCode`. Where the specs say
// `chapter_id`, read `chapterCode` here.
//
// Note on two Event shapes: `mockEvents` in components/mock/data.ts is the
// member-facing public listing. This file defines `AdminEvent`, which is a
// separate concern (ticketing, check-in, analytics). Reconciliation is
// flagged in docs/follow-ups.md.

import type { MockUser } from '@/components/mock/data';

// ============================================================================
// Types
// ============================================================================

export type EventType =
  | 'CONFERENCE'
  | 'WEBINAR'
  | 'MEETUP'
  | 'TRAINING'
  | 'FUNDRAISER';

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'SOLD_OUT'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type RegistrationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'NO_SHOW';

export interface AdminEvent {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: EventType;
  chapterCode: string | null;
  venueName: string | null;
  venueAddress: string | null;
  onlineUrl: string | null;
  startsAt: string;
  endsAt: string;
  timezone: string;
  capacity: number | null;
  status: EventStatus;
  coverImage: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicketTier {
  id: string;
  eventId: string;
  name: string;
  priceMinor: number;
  currency: string;
  quantity: number | null;
  sold: number;
  salesOpen: string | null;
  salesClose: string | null;
}

export interface AdminRegistration {
  id: string;
  eventId: string;
  tierId: string;
  memberId: string;
  status: RegistrationStatus;
  reference: string;
  qrToken: string;
  amountMinor: number;
  currency: string;
  paymentId: string | null;
  registeredAt: string;
  checkedInAt: string | null;
  checkedInBy: string | null;

  // Denormalized for the mock UI. The real backend joins these.
  memberName: string;
  memberInitials: string;
  memberEmail: string;
  memberChapterCode: string;
  tierName: string;
  eventTitle: string;
  eventSlug: string;
}

export interface EventFilters {
  status?: EventStatus | 'ALL';
  type?: EventType | 'ALL';
  chapterCode?: string | 'ALL';
  q?: string;
}

export interface RegistrationFilters {
  status?: RegistrationStatus | 'ALL';
  tierId?: string | 'ALL';
  chapterCode?: string | 'ALL';
  q?: string;
}

export type CheckInOutcome =
  | 'VALID'
  | 'DUPLICATE'
  | 'INVALID'
  | 'WRONG_EVENT'
  | 'CANCELLED'
  | 'PAYMENT_PENDING';

export interface CheckInResult {
  outcome: CheckInOutcome;
  registration?: AdminRegistration;
}

export interface EventStats {
  registered: number;
  checkedIn: number;
  cancelled: number;
  revenueMinor: number;
  currency: string;
}

// ============================================================================
// Label maps
// ============================================================================

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  CONFERENCE: 'Conference',
  WEBINAR: 'Webinar',
  MEETUP: 'Meetup',
  TRAINING: 'Training',
  FUNDRAISER: 'Fundraiser',
};

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  SOLD_OUT: 'Sold out',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  CHECKED_IN: 'Checked in',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
  NO_SHOW: 'No-show',
};

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

// ============================================================================
// Role helpers
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

function sameChapter(user: MockUser, chapterCode: string | null): boolean {
  if (!chapterCode) return false;
  return user.chapterCode === chapterCode;
}

// ============================================================================
// Permission checks
// ============================================================================

export function canCreateEvent(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user);
}

export function canEditEvent(user: MockUser, event: AdminEvent): boolean {
  if (isAdmin(user)) return true;
  if (isChapterLeader(user) && sameChapter(user, event.chapterCode)) return true;
  return false;
}

export function canPublishEvent(user: MockUser, event: AdminEvent): boolean {
  return canEditEvent(user, event);
}

export function canCancelEvent(user: MockUser): boolean {
  return isAdmin(user);
}

export function canCheckIn(user: MockUser, event: AdminEvent): boolean {
  if (isAdmin(user)) return true;
  if (isChapterLeader(user) && sameChapter(user, event.chapterCode)) return true;
  return false;
}

export function canExportRegistrations(user: MockUser): boolean {
  return isAdmin(user) || isFinanceOfficer(user);
}

export function canRequestRefund(user: MockUser): boolean {
  return isFinanceOfficer(user);
}

export function canViewEventRevenue(user: MockUser): boolean {
  return isAdmin(user) || isFinanceOfficer(user);
}

export function canExportEventAnalytics(user: MockUser): boolean {
  return isAdmin(user) || isFinanceOfficer(user);
}

// ============================================================================
// Seed data
// ============================================================================

const now = Date.now();
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const daysAgo = (n: number) => new Date(now - DAY * n).toISOString();
const daysAhead = (n: number) => new Date(now + DAY * n).toISOString();

export const mockAdminEvents: AdminEvent[] = [
  {
    id: 'evt-001',
    slug: 'annual-leadership-summit-2026',
    title: 'Annual Leadership Summit 2026',
    description:
      'The annual gathering of Eagles from across East Africa. Three days of teaching, worship, and marketplace application.',
    type: 'CONFERENCE',
    chapterCode: null,
    venueName: 'KICC',
    venueAddress: 'Harambee Avenue, Nairobi',
    onlineUrl: null,
    startsAt: daysAhead(45),
    endsAt: daysAhead(47),
    timezone: 'Africa/Nairobi',
    capacity: 500,
    status: 'PUBLISHED',
    coverImage: null,
    createdBy: 'user-solomon',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(5),
  },
  {
    id: 'evt-002',
    slug: 'marketplace-ethics-webinar',
    title: 'Marketplace Ethics Webinar',
    description:
      'A one-hour online session on ethical decision-making in business, led by Pastor James.',
    type: 'WEBINAR',
    chapterCode: null,
    venueName: null,
    venueAddress: null,
    onlineUrl: 'https://meet.example.org/marketplace-ethics',
    startsAt: daysAhead(7),
    endsAt: daysAhead(7),
    timezone: 'Africa/Nairobi',
    capacity: null,
    status: 'PUBLISHED',
    coverImage: null,
    createdBy: 'user-solomon',
    createdAt: daysAgo(14),
    updatedAt: daysAgo(2),
  },
  {
    id: 'evt-003',
    slug: 'ku-monthly-meetup-november',
    title: 'KU Chapter Monthly Meetup',
    description:
      'Monthly gathering of the Kenyatta University chapter. Fellowship, worship, and a short teaching.',
    type: 'MEETUP',
    chapterCode: 'KU',
    venueName: 'KU Main Hall',
    venueAddress: 'Kenyatta University, Thika Road',
    onlineUrl: null,
    startsAt: daysAhead(2),
    endsAt: daysAhead(2),
    timezone: 'Africa/Nairobi',
    capacity: 80,
    status: 'PUBLISHED',
    coverImage: null,
    createdBy: 'user-esther',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(1),
  },
  {
    id: 'evt-004',
    slug: 'governance-training-uon',
    title: 'Governance Training: Public Sector Ethics',
    description:
      'A full-day training on ethical governance for chapter members pursuing public sector careers.',
    type: 'TRAINING',
    chapterCode: 'UON',
    venueName: 'UON Towers',
    venueAddress: 'University Way, Nairobi',
    onlineUrl: null,
    startsAt: daysAhead(21),
    endsAt: daysAhead(21),
    timezone: 'Africa/Nairobi',
    capacity: 40,
    status: 'PUBLISHED',
    coverImage: null,
    createdBy: 'user-solomon',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(3),
  },
  {
    id: 'evt-005',
    slug: 'founders-gala-2025',
    title: 'Founders Gala 2025',
    description:
      'A black-tie fundraiser to support the TEG scholarship fund.',
    type: 'FUNDRAISER',
    chapterCode: null,
    venueName: 'Serena Hotel',
    venueAddress: 'Kenyatta Avenue, Nairobi',
    onlineUrl: null,
    startsAt: daysAgo(30),
    endsAt: daysAgo(30),
    timezone: 'Africa/Nairobi',
    capacity: 300,
    status: 'COMPLETED',
    coverImage: null,
    createdBy: 'user-solomon',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(30),
  },
  {
    id: 'evt-006',
    slug: 'kisumu-regional-gathering',
    title: 'Kisumu Regional Gathering',
    description: 'First regional gathering of the Kisumu chapter. Details to follow.',
    type: 'MEETUP',
    chapterCode: 'KISUMU',
    venueName: 'Impala Park',
    venueAddress: 'Kisumu',
    onlineUrl: null,
    startsAt: daysAhead(60),
    endsAt: daysAhead(60),
    timezone: 'Africa/Nairobi',
    capacity: 100,
    status: 'DRAFT',
    coverImage: null,
    createdBy: 'user-solomon',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
  },
];

// ---------------------------------------------------------------------------
// Registrations
// ---------------------------------------------------------------------------

const ATTENDEES = [
  { name: 'Grace Njeri', initials: 'GN', email: 'grace.njeri@example.com', chapterCode: 'KU' },
  { name: 'David Ochieng', initials: 'DO', email: 'david.ochieng@example.com', chapterCode: 'UON' },
  { name: 'Faith Wanjiku', initials: 'FW', email: 'faith.wanjiku@example.com', chapterCode: 'STRATH' },
  { name: 'Peter Mwangi', initials: 'PM', email: 'peter.mwangi@example.com', chapterCode: 'KU' },
  { name: 'Esther Wambui', initials: 'EW', email: 'esther.wambui@example.com', chapterCode: 'UON' },
  { name: 'Samuel Kipchoge', initials: 'SK', email: 'samuel.kipchoge@example.com', chapterCode: 'STRATH' },
  { name: 'Mercy Wairimu', initials: 'MW', email: 'mercy.wairimu@example.com', chapterCode: 'KU' },
  { name: 'John Kamau', initials: 'JK', email: 'john.kamau@example.com', chapterCode: 'UON' },
  { name: 'Sarah Atieno', initials: 'SA', email: 'sarah.atieno@example.com', chapterCode: 'KISUMU' },
  { name: 'Daniel Mutua', initials: 'DM', email: 'daniel.mutua@example.com', chapterCode: 'NAIROBI_PRO' },
  { name: 'Ruth Wanjala', initials: 'RW', email: 'ruth.wanjala@example.com', chapterCode: 'KU' },
  { name: 'James Kariuki', initials: 'JK', email: 'james.kariuki@example.com', chapterCode: 'STRATH' },
  { name: 'Hannah Njoroge', initials: 'HN', email: 'hannah.njoroge@example.com', chapterCode: 'UON' },
  { name: 'Isaac Otieno', initials: 'IO', email: 'isaac.otieno@example.com', chapterCode: 'KISUMU' },
  { name: 'Rebecca Achieng', initials: 'RA', email: 'rebecca.achieng@example.com', chapterCode: 'NAIROBI_PRO' },
  { name: 'Michael Odhiambo', initials: 'MO', email: 'michael.odhiambo@example.com', chapterCode: 'UON' },
  { name: 'Naomi Chebet', initials: 'NC', email: 'naomi.chebet@example.com', chapterCode: 'KU' },
  { name: 'Paul Muthoka', initials: 'PM', email: 'paul.muthoka@example.com', chapterCode: 'STRATH' },
  { name: 'Rachelle Wanjiru', initials: 'RW', email: 'rachelle.wanjiru@example.com', chapterCode: 'KU' },
  { name: 'Stephen Njenga', initials: 'SN', email: 'stephen.njenga@example.com', chapterCode: 'NAIROBI_PRO' },
  { name: 'Lydia Mueni', initials: 'LM', email: 'lydia.mueni@example.com', chapterCode: 'KU' },
  { name: 'Thomas Barasa', initials: 'TB', email: 'thomas.barasa@example.com', chapterCode: 'KISUMU' },
  { name: 'Priscilla Adhiambo', initials: 'PA', email: 'priscilla.adhiambo@example.com', chapterCode: 'UON' },
  { name: 'Josiah Kiprop', initials: 'JK', email: 'josiah.kiprop@example.com', chapterCode: 'STRATH' },
  { name: 'Martha Wangari', initials: 'MW', email: 'martha.wangari@example.com', chapterCode: 'KU' },
  { name: 'Brian Ochieng', initials: 'BO', email: 'brian.ochieng@example.com', chapterCode: 'UON' },
  { name: 'Anne Njoki', initials: 'AN', email: 'anne.njoki@example.com', chapterCode: 'STRATH' },
  { name: 'Eliud Cheruiyot', initials: 'EC', email: 'eliud.cheruiyot@example.com', chapterCode: 'KISUMU' },
  { name: 'Joy Wanjala', initials: 'JW', email: 'joy.wanjala@example.com', chapterCode: 'KU' },
  { name: 'Caleb Wekesa', initials: 'CW', email: 'caleb.wekesa@example.com', chapterCode: 'NAIROBI_PRO' },
];

interface RegSpec {
  eventId: string;
  tierId: string;
  statuses: RegistrationStatus[];
}

const REG_SPECS: RegSpec[] = [
  // evt-001 — Summit: 30 total
  {
    eventId: 'evt-001',
    tierId: 'tier-001-standard',
    statuses: [
      ...Array(15).fill('CONFIRMED'),
      ...Array(2).fill('PENDING'),
      ...Array(1).fill('CANCELLED'),
    ],
  },
  {
    eventId: 'evt-001',
    tierId: 'tier-001-student',
    statuses: [...Array(10).fill('CONFIRMED'), ...Array(1).fill('REFUNDED')],
  },
  {
    eventId: 'evt-001',
    tierId: 'tier-001-vip',
    statuses: [...Array(1).fill('CONFIRMED')],
  },
  // evt-002 — Webinar: 20 CONFIRMED
  {
    eventId: 'evt-002',
    tierId: 'tier-002-free',
    statuses: [...Array(20).fill('CONFIRMED')],
  },
  // evt-003 — KU Meetup: 15
  {
    eventId: 'evt-003',
    tierId: 'tier-003-free',
    statuses: [
      ...Array(8).fill('CHECKED_IN'),
      ...Array(5).fill('CONFIRMED'),
      ...Array(1).fill('NO_SHOW'),
      ...Array(1).fill('CANCELLED'),
    ],
  },
  // evt-004 — UON Training: 15
  {
    eventId: 'evt-004',
    tierId: 'tier-004-standard',
    statuses: [...Array(10).fill('CONFIRMED'), ...Array(2).fill('PENDING')],
  },
  {
    eventId: 'evt-004',
    tierId: 'tier-004-student',
    statuses: [...Array(3).fill('CONFIRMED')],
  },
  // evt-005 — Gala: 30 (past, completed)
  {
    eventId: 'evt-005',
    tierId: 'tier-005-bronze',
    statuses: [
      ...Array(5).fill('CHECKED_IN'),
      ...Array(5).fill('CONFIRMED'),
      ...Array(2).fill('NO_SHOW'),
      ...Array(1).fill('REFUNDED'),
    ],
  },
  {
    eventId: 'evt-005',
    tierId: 'tier-005-silver',
    statuses: [
      ...Array(5).fill('CHECKED_IN'),
      ...Array(4).fill('CONFIRMED'),
      ...Array(2).fill('NO_SHOW'),
      ...Array(1).fill('REFUNDED'),
    ],
  },
  {
    eventId: 'evt-005',
    tierId: 'tier-005-gold',
    statuses: [
      ...Array(2).fill('CHECKED_IN'),
      ...Array(1).fill('CONFIRMED'),
      ...Array(1).fill('NO_SHOW'),
      ...Array(1).fill('REFUNDED'),
    ],
  },
];

const TIER_PRICES: Record<string, { name: string; priceMinor: number; quantity: number | null }> = {
  'tier-001-standard': { name: 'Standard', priceMinor: 250000, quantity: 300 },
  'tier-001-student': { name: 'Student', priceMinor: 150000, quantity: 150 },
  'tier-001-vip': { name: 'VIP', priceMinor: 500000, quantity: 50 },
  'tier-002-free': { name: 'Free', priceMinor: 0, quantity: null },
  'tier-003-free': { name: 'Free', priceMinor: 0, quantity: 80 },
  'tier-004-standard': { name: 'Standard', priceMinor: 100000, quantity: 30 },
  'tier-004-student': { name: 'Student', priceMinor: 50000, quantity: 10 },
  'tier-005-bronze': { name: 'Bronze', priceMinor: 500000, quantity: null },
  'tier-005-silver': { name: 'Silver', priceMinor: 1000000, quantity: null },
  'tier-005-gold': { name: 'Gold', priceMinor: 2500000, quantity: null },
};

function buildRegistrations(): AdminRegistration[] {
  const regs: AdminRegistration[] = [];
  let counter = 1;
  let attendeeIdx = 0;

  for (const spec of REG_SPECS) {
    const event = mockAdminEvents.find((e) => e.id === spec.eventId);
    const tierInfo = TIER_PRICES[spec.tierId];
    if (!event || !tierInfo) continue;

    spec.statuses.forEach((status, idx) => {
      const attendee = ATTENDEES[attendeeIdx % ATTENDEES.length];
      attendeeIdx += 1;
      const regNumber = String(counter).padStart(4, '0');
      const registrationId = `reg-${regNumber}`;
      counter += 1;

      const registeredAt = daysAgo(30 - (counter % 30));
      const checkedInAt =
        status === 'CHECKED_IN'
          ? new Date(new Date(event.startsAt).getTime() + 15 * 60 * 1000).toISOString()
          : null;

      regs.push({
        id: registrationId,
        eventId: event.id,
        tierId: spec.tierId,
        memberId: `mem-${String(attendeeIdx).padStart(4, '0')}`,
        status,
        reference: `EVT-26-${regNumber}`,
        qrToken: `qrt_${registrationId}_${event.id}`,
        amountMinor: tierInfo.priceMinor,
        currency: 'KES',
        paymentId: tierInfo.priceMinor > 0 ? `pay_${regNumber}` : null,
        registeredAt,
        checkedInAt,
        checkedInBy: status === 'CHECKED_IN' ? 'user-esther' : null,
        memberName: attendee.name,
        memberInitials: attendee.initials,
        memberEmail: attendee.email,
        memberChapterCode: attendee.chapterCode,
        tierName: tierInfo.name,
        eventTitle: event.title,
        eventSlug: event.slug,
      });

      // Silence unused-var warning when status is CANCELLED etc.
      void idx;
    });
  }

  return regs;
}

export const mockAdminRegistrations: AdminRegistration[] = buildRegistrations();

export const mockAdminTicketTiers: AdminTicketTier[] = Object.entries(TIER_PRICES).map(
  ([id, info]) => {
    const eventId = id.split('-').slice(0, 2).join('-'); // tier-001-standard -> evt? no
    // Derive event id properly: tier-<num>-<name> -> evt-<num>
    const parts = id.split('-');
    const num = parts[1];
    const resolvedEventId = `evt-${num}`;
    void eventId;
    const sold = mockAdminRegistrations.filter(
      (r) =>
        r.tierId === id &&
        (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN'),
    ).length;
    return {
      id,
      eventId: resolvedEventId,
      name: info.name,
      priceMinor: info.priceMinor,
      currency: 'KES',
      quantity: info.quantity,
      sold,
      salesOpen: null,
      salesClose: null,
    };
  },
);

// ============================================================================
// Accessors
// ============================================================================

export function getEvents(
  user: MockUser,
  filters?: EventFilters,
): AdminEvent[] {
  let result = mockAdminEvents;

  // Chapter scoping
  if (isChapterLeader(user) && user.chapterCode) {
    result = result.filter((e) => e.chapterCode === user.chapterCode);
  }

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((e) => e.status === filters.status);
  }
  if (filters?.type && filters.type !== 'ALL') {
    result = result.filter((e) => e.type === filters.type);
  }
  if (filters?.chapterCode && filters.chapterCode !== 'ALL') {
    result = result.filter((e) => e.chapterCode === filters.chapterCode);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.slug.toLowerCase().includes(q) ||
        (e.venueName ?? '').toLowerCase().includes(q),
    );
  }

  return [...result].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  );
}

export function getEventById(id: string, _user: MockUser): AdminEvent | null {
  return mockAdminEvents.find((e) => e.id === id) ?? null;
}

export function getEventTiers(eventId: string): AdminTicketTier[] {
  return mockAdminTicketTiers.filter((t) => t.eventId === eventId);
}

export function getEventRegistrations(
  eventId: string,
  _user: MockUser,
  filters?: RegistrationFilters,
): AdminRegistration[] {
  let result = mockAdminRegistrations.filter((r) => r.eventId === eventId);

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((r) => r.status === filters.status);
  }
  if (filters?.tierId && filters.tierId !== 'ALL') {
    result = result.filter((r) => r.tierId === filters.tierId);
  }
  if (filters?.chapterCode && filters.chapterCode !== 'ALL') {
    result = result.filter((r) => r.memberChapterCode === filters.chapterCode);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.memberName.toLowerCase().includes(q) ||
        r.memberEmail.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q),
    );
  }

  return [...result].sort(
    (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
  );
}

export function searchRegistrations(
  query: string,
  eventId: string,
): AdminRegistration[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return mockAdminRegistrations.filter(
    (r) =>
      r.eventId === eventId &&
      (r.memberName.toLowerCase().includes(q) ||
        r.memberEmail.toLowerCase().includes(q) ||
        r.reference.toLowerCase().includes(q)),
  );
}

export function getEventStats(eventId: string): EventStats {
  const regs = mockAdminRegistrations.filter((r) => r.eventId === eventId);
  const registered = regs.filter((r) =>
    ['PENDING', 'CONFIRMED', 'CHECKED_IN'].includes(r.status),
  ).length;
  const checkedIn = regs.filter((r) => r.status === 'CHECKED_IN').length;
  const cancelled = regs.filter((r) =>
    ['CANCELLED', 'REFUNDED'].includes(r.status),
  ).length;
  const revenueMinor = regs
    .filter((r) => ['CONFIRMED', 'CHECKED_IN'].includes(r.status))
    .reduce((sum, r) => sum + r.amountMinor, 0);
  return { registered, checkedIn, cancelled, revenueMinor, currency: 'KES' };
}

export function checkInByToken(
  token: string,
  eventId: string,
): CheckInResult {
  const reg = mockAdminRegistrations.find(
    (r) => r.qrToken === token && r.eventId === eventId,
  );
  if (!reg) {
    const inOtherEvent = mockAdminRegistrations.find((r) => r.qrToken === token);
    if (inOtherEvent) return { outcome: 'WRONG_EVENT' };
    return { outcome: 'INVALID' };
  }
  return checkInByRegistration(reg.id);
}

export function checkInByRegistration(
  registrationId: string,
): CheckInResult {
  const reg = mockAdminRegistrations.find((r) => r.id === registrationId);
  if (!reg) return { outcome: 'INVALID' };
  if (reg.status === 'CHECKED_IN') {
    return { outcome: 'DUPLICATE', registration: reg };
  }
  if (reg.status === 'CANCELLED' || reg.status === 'REFUNDED') {
    return { outcome: 'CANCELLED', registration: reg };
  }
  if (reg.status === 'PENDING') {
    return { outcome: 'PAYMENT_PENDING', registration: reg };
  }
  // Mutate the mock in place to reflect the check-in.
  reg.status = 'CHECKED_IN';
  reg.checkedInAt = new Date().toISOString();
  reg.checkedInBy = 'user-esther';
  return { outcome: 'VALID', registration: reg };
}

export function undoCheckIn(registrationId: string): boolean {
  const reg = mockAdminRegistrations.find((r) => r.id === registrationId);
  if (!reg || reg.status !== 'CHECKED_IN') return false;
  reg.status = 'CONFIRMED';
  reg.checkedInAt = null;
  reg.checkedInBy = null;
  return true;
}

export function markNoShow(registrationIds: string[]): number {
  let count = 0;
  for (const id of registrationIds) {
    const reg = mockAdminRegistrations.find((r) => r.id === id);
    if (reg && reg.status === 'CONFIRMED') {
      reg.status = 'NO_SHOW';
      count += 1;
    }
  }
  return count;
}

export function requestRefund(
  _registrationId: string,
  _reason: string,
  _note?: string,
): boolean {
  // Approval-request flow lives in PNL-09. Nothing to do here yet.
  return true;
}

export function saveEventDraft(data: Partial<AdminEvent>): AdminEvent | null {
  if (!data.id) return null;
  return mockAdminEvents.find((e) => e.id === data.id) ?? null;
}

export function publishEvent(data: Partial<AdminEvent>): AdminEvent | null {
  return saveEventDraft(data);
}

export function updateEvent(
  id: string,
  _data: Partial<AdminEvent>,
): AdminEvent | null {
  return mockAdminEvents.find((e) => e.id === id) ?? null;
}

export function cancelEvent(_id: string, _reason: string): boolean {
  return true;
}