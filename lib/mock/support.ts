// lib/mock/support.ts
//
// PNL-20 Support Desk — types, permission helpers, seed data, accessors.
//
// Scoping follows the codebase pattern: chapter scoping via chapterCode
// compared against MockUser.chapterCode.

import type { MockUser } from '@/components/mock/data';

// ============================================================================
// Types
// ============================================================================

export type TicketStatus =
  | 'NEW'
  | 'OPEN'
  | 'PENDING_MEMBER'
  | 'RESOLVED'
  | 'CLOSED';

export type TicketPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type TicketCategory =
  | 'ACCOUNT'
  | 'BILLING'
  | 'VERIFICATION'
  | 'TECHNICAL'
  | 'OTHER';

export type MessageAuthorType = 'MEMBER' | 'AGENT';

export interface SupportTicket {
  id: string;
  reference: string;
  subject: string;
  body: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  memberId: string;
  memberName: string;
  memberEmail: string;
  memberChapterCode: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  linkedEntityType: string | null;
  linkedEntityId: string | null;
  linkedEntityLabel: string | null;
  createdAt: string;
  updatedAt: string;
  firstResponseAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorType: MessageAuthorType;
  body: string;
  isInternalNote: boolean;
  createdAt: string;
}

export interface CannedResponse {
  id: string;
  title: string;
  category: TicketCategory;
  body: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface TicketFilters {
  status?: TicketStatus | 'ALL';
  priority?: TicketPriority | 'ALL';
  category?: TicketCategory | 'ALL';
  assignee?: string | 'ALL' | 'ME' | 'UNASSIGNED';
  q?: string;
}

export interface CannedFilters {
  category?: TicketCategory | 'ALL';
  q?: string;
}

export interface SupportAnalytics {
  created: number;
  resolved: number;
  medianFirstResponseHours: number | null;
  medianResolveHours: number | null;
  backlog: number;
  reopened: number;
  volumeSeries: Array<{ date: string; created: number; resolved: number }>;
  categoryBreakdown: Array<{ category: TicketCategory; count: number }>;
  priorityMix: Array<{ priority: TicketPriority; count: number }>;
  topIssues: Array<{ subject: string; count: number }>;
}

// ============================================================================
// Label maps
// ============================================================================

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  NEW: 'New',
  OPEN: 'Open',
  PENDING_MEMBER: 'Pending member',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
};

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  ACCOUNT: 'Account',
  BILLING: 'Billing',
  VERIFICATION: 'Verification',
  TECHNICAL: 'Technical',
  OTHER: 'Other',
};

// ============================================================================
// Permission helpers
// ============================================================================

function isAdmin(user: MockUser): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}

function isSuperAdmin(user: MockUser): boolean {
  return user.role === 'SUPER_ADMIN';
}

function isChapterLeader(user: MockUser): boolean {
  return user.role === 'CHAPTER_LEADER';
}

function isFinanceOfficer(user: MockUser): boolean {
  return user.role === 'FINANCE_OFFICER';
}

export function canViewSupport(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user) || isFinanceOfficer(user);
}

export function canReplyToTicket(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user);
}

export function canAssignTicket(user: MockUser): boolean {
  return isAdmin(user);
}

export function canResolveTicket(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user);
}

export function canCloseTicket(user: MockUser): boolean {
  return isAdmin(user);
}

export function canReopenTicket(user: MockUser): boolean {
  return isSuperAdmin(user);
}

export function canManageCannedResponses(user: MockUser): boolean {
  return isAdmin(user);
}

export function canViewSupportAnalytics(user: MockUser): boolean {
  return isAdmin(user);
}

// ============================================================================
// Seed data
// ============================================================================

const now = Date.now();
const MINUTE = 1000 * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const minutesAgo = (n: number) => new Date(now - MINUTE * n).toISOString();
const hoursAgo = (n: number) => new Date(now - HOUR * n).toISOString();
const daysAgo = (n: number) => new Date(now - DAY * n).toISOString();

// ---------------------------------------------------------------------------
// Tickets
// ---------------------------------------------------------------------------

export const mockSupportTickets: SupportTicket[] = [
  {
    id: 'sup-001',
    reference: 'SUP-26-0042',
    subject: 'Cannot log in — password reset not arriving',
    body: 'I requested a password reset three times and have not received the email. My email is grace.njeri@example.com.',
    status: 'NEW',
    priority: 'NORMAL',
    category: 'ACCOUNT',
    memberId: 'user-grace',
    memberName: 'Grace Njeri',
    memberEmail: 'grace.njeri@example.com',
    memberChapterCode: 'KU',
    assignedTo: null,
    assignedToName: null,
    linkedEntityType: null,
    linkedEntityId: null,
    linkedEntityLabel: null,
    createdAt: minutesAgo(22),
    updatedAt: minutesAgo(22),
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: 'sup-002',
    reference: 'SUP-26-0041',
    subject: 'Refund for Founders Gala ticket',
    body: 'I cannot attend the Founders Gala. Can I please get a refund for my ticket?',
    status: 'OPEN',
    priority: 'HIGH',
    category: 'BILLING',
    memberId: 'user-david',
    memberName: 'David Ochieng',
    memberEmail: 'david.ochieng@example.com',
    memberChapterCode: 'UON',
    assignedTo: 'user-admin-miriam',
    assignedToName: 'Miriam K.',
    linkedEntityType: 'order',
    linkedEntityId: 'ord-2025-088',
    linkedEntityLabel: 'Founders Gala — Silver ticket',
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(3),
    firstResponseAt: hoursAgo(4),
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: 'sup-003',
    reference: 'SUP-26-0040',
    subject: 'KYC document rejected — resubmission unclear',
    body: 'My national ID was rejected but I do not understand why. It is a clean photo.',
    status: 'PENDING_MEMBER',
    priority: 'NORMAL',
    category: 'VERIFICATION',
    memberId: 'user-faith',
    memberName: 'Faith Wanjiku',
    memberEmail: 'faith.wanjiku@example.com',
    memberChapterCode: 'STRATH',
    assignedTo: 'user-solomon',
    assignedToName: 'Solomon A.',
    linkedEntityType: null,
    linkedEntityId: null,
    linkedEntityLabel: null,
    createdAt: daysAgo(1),
    updatedAt: hoursAgo(6),
    firstResponseAt: hoursAgo(20),
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: 'sup-004',
    reference: 'SUP-26-0039',
    subject: 'Course video not playing on mobile data',
    body: 'The Lesson 4 video buffers endlessly on my phone. I am on Safaricom data.',
    status: 'OPEN',
    priority: 'NORMAL',
    category: 'TECHNICAL',
    memberId: 'user-peter',
    memberName: 'Peter Mwangi',
    memberEmail: 'peter.mwangi@example.com',
    memberChapterCode: 'KU',
    assignedTo: null,
    assignedToName: null,
    linkedEntityType: null,
    linkedEntityId: null,
    linkedEntityLabel: null,
    createdAt: hoursAgo(8),
    updatedAt: hoursAgo(8),
    firstResponseAt: null,
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: 'sup-005',
    reference: 'SUP-26-0038',
    subject: 'URGENT — account suspended, cannot access my savings circle',
    body: 'I was suspended yesterday without explanation. I have contributions in a circle. Please restore access immediately.',
    status: 'OPEN',
    priority: 'URGENT',
    category: 'ACCOUNT',
    memberId: 'user-james',
    memberName: 'James Kariuki',
    memberEmail: 'james.kariuki@example.com',
    memberChapterCode: 'STRATH',
    assignedTo: 'user-solomon',
    assignedToName: 'Solomon A.',
    linkedEntityType: null,
    linkedEntityId: null,
    linkedEntityLabel: null,
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(1),
    firstResponseAt: hoursAgo(1),
    resolvedAt: null,
    closedAt: null,
  },
  {
    id: 'sup-006',
    reference: 'SUP-26-0037',
    subject: 'Wrong chapter assigned to my account',
    body: 'I am registered under KU but I study at Strathmore. Please update my chapter.',
    status: 'RESOLVED',
    priority: 'LOW',
    category: 'ACCOUNT',
    memberId: 'user-hannah',
    memberName: 'Hannah Njoroge',
    memberEmail: 'hannah.njoroge@example.com',
    memberChapterCode: 'UON',
    assignedTo: 'user-esther',
    assignedToName: 'Esther W.',
    linkedEntityType: null,
    linkedEntityId: null,
    linkedEntityLabel: null,
    createdAt: daysAgo(3),
    updatedAt: daysAgo(2),
    firstResponseAt: daysAgo(3),
    resolvedAt: daysAgo(2),
    closedAt: null,
  },
  {
    id: 'sup-007',
    reference: 'SUP-26-0036',
    subject: 'M-Pesa payment confirmed but ticket not issued',
    body: 'I paid KES 2,500 for the summit but did not receive my QR ticket.',
    status: 'RESOLVED',
    priority: 'HIGH',
    category: 'BILLING',
    memberId: 'user-michael',
    memberName: 'Michael Odhiambo',
    memberEmail: 'michael.odhiambo@example.com',
    memberChapterCode: 'UON',
    assignedTo: 'user-admin-miriam',
    assignedToName: 'Miriam K.',
    linkedEntityType: 'order',
    linkedEntityId: 'ord-2026-012',
    linkedEntityLabel: 'Annual Leadership Summit — Standard',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(4),
    firstResponseAt: daysAgo(5),
    resolvedAt: daysAgo(4),
    closedAt: daysAgo(4),
  },
  {
    id: 'sup-008',
    reference: 'SUP-26-0035',
    subject: 'Duplicate charge on my subscription',
    body: 'I was charged twice this month for the same subscription.',
    status: 'CLOSED',
    priority: 'HIGH',
    category: 'BILLING',
    memberId: 'user-rebecca',
    memberName: 'Rebecca Achieng',
    memberEmail: 'rebecca.achieng@example.com',
    memberChapterCode: 'NAIROBI_PRO',
    assignedTo: 'user-admin-miriam',
    assignedToName: 'Miriam K.',
    linkedEntityType: null,
    linkedEntityId: null,
    linkedEntityLabel: null,
    createdAt: daysAgo(8),
    updatedAt: daysAgo(7),
    firstResponseAt: daysAgo(8),
    resolvedAt: daysAgo(7),
    closedAt: daysAgo(6),
  },
];

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

export const mockTicketMessages: TicketMessage[] = [
  // sup-002 — refund conversation
  {
    id: 'msg-001',
    ticketId: 'sup-002',
    authorId: 'user-david',
    authorName: 'David Ochieng',
    authorType: 'MEMBER',
    body: 'I cannot attend the Founders Gala. Can I please get a refund for my ticket?',
    isInternalNote: false,
    createdAt: hoursAgo(5),
  },
  {
    id: 'msg-002',
    ticketId: 'sup-002',
    authorId: 'user-admin-miriam',
    authorName: 'Miriam K.',
    authorType: 'AGENT',
    body: 'Hi David, thanks for reaching out. I can see your Silver ticket purchase. Refunds are possible up to 7 days before the event. Let me confirm the event date and get back to you.',
    isInternalNote: false,
    createdAt: hoursAgo(4),
  },
  {
    id: 'msg-003',
    ticketId: 'sup-002',
    authorId: 'user-admin-miriam',
    authorName: 'Miriam K.',
    authorType: 'AGENT',
    body: 'Confirmed with the events team — refund is possible. Raising the request now, will need a second approval.',
    isInternalNote: true,
    createdAt: hoursAgo(3),
  },

  // sup-003 — KYC
  {
    id: 'msg-004',
    ticketId: 'sup-003',
    authorId: 'user-faith',
    authorName: 'Faith Wanjiku',
    authorType: 'MEMBER',
    body: 'My national ID was rejected but I do not understand why. It is a clean photo.',
    isInternalNote: false,
    createdAt: daysAgo(1),
  },
  {
    id: 'msg-005',
    ticketId: 'sup-003',
    authorId: 'user-solomon',
    authorName: 'Solomon A.',
    authorType: 'AGENT',
    body: 'Hi Faith, the image was flagged because the corners were cropped. Could you retake the photo with the full document visible against a dark background?',
    isInternalNote: false,
    createdAt: hoursAgo(20),
  },

  // sup-005 — urgent suspension
  {
    id: 'msg-006',
    ticketId: 'sup-005',
    authorId: 'user-james',
    authorName: 'James Kariuki',
    authorType: 'MEMBER',
    body: 'I was suspended yesterday without explanation. I have contributions in a circle. Please restore access immediately.',
    isInternalNote: false,
    createdAt: hoursAgo(2),
  },
  {
    id: 'msg-007',
    ticketId: 'sup-005',
    authorId: 'user-solomon',
    authorName: 'Solomon A.',
    authorType: 'AGENT',
    body: 'James, we are looking into this now. Your savings circle funds are safe and untouched. I will have an answer within the hour.',
    isInternalNote: false,
    createdAt: hoursAgo(1),
  },
  {
    id: 'msg-008',
    ticketId: 'sup-005',
    authorId: 'user-solomon',
    authorName: 'Solomon A.',
    authorType: 'AGENT',
    body: 'Suspension was triggered by a duplicate account flag on a shared IP. Investigate before reversing — see PNL-03 member detail.',
    isInternalNote: true,
    createdAt: hoursAgo(1),
  },
];

// ---------------------------------------------------------------------------
// Canned responses
// ---------------------------------------------------------------------------

export const mockCannedResponses: CannedResponse[] = [
  {
    id: 'can-001',
    title: 'Password reset not received',
    category: 'ACCOUNT',
    body: 'Hi {{first_name}}, we have re-sent the password reset email. Please check your spam folder. If it does not arrive within 10 minutes, reply here and we will issue a temporary password.',
    tags: ['password', 'login', 'reset'],
    createdBy: 'user-solomon',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(15),
    usageCount: 47,
  },
  {
    id: 'can-002',
    title: 'Refund eligibility — event ticket',
    category: 'BILLING',
    body: 'Hi {{first_name}}, refunds for event tickets are available up to 7 days before the event date. Your request has been logged and will be processed within 3 working days.',
    tags: ['refund', 'event', 'ticket'],
    createdBy: 'user-admin-miriam',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(10),
    usageCount: 32,
  },
  {
    id: 'can-003',
    title: 'KYC document rejected — common reasons',
    category: 'VERIFICATION',
    body: 'Hi {{first_name}}, common reasons a document is rejected: corners cropped, glare or shadow, expired document, or a mismatch with the name on your profile. Please retake the photo in good lighting with the full document visible.',
    tags: ['kyc', 'document', 'verification'],
    createdBy: 'user-solomon',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(5),
    usageCount: 18,
  },
  {
    id: 'can-004',
    title: 'Video buffering on mobile data',
    category: 'TECHNICAL',
    body: 'Hi {{first_name}}, this is usually a bandwidth issue. Please try: (1) switching to WiFi if available, (2) closing background apps, (3) playing the lesson with the "low-data" toggle on. If it still fails, reply with your device model.',
    tags: ['video', 'buffering', 'mobile'],
    createdBy: 'user-solomon',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(20),
    usageCount: 21,
  },
  {
    id: 'can-005',
    title: 'Account suspended — under review',
    category: 'ACCOUNT',
    body: 'Hi {{first_name}}, your account is currently suspended pending review. Your funds and data are safe. We will respond within 24 hours with next steps or a resolution.',
    tags: ['suspended', 'account', 'review'],
    createdBy: 'user-solomon',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(30),
    usageCount: 8,
  },
  {
    id: 'can-006',
    title: 'Wrong chapter assigned',
    category: 'ACCOUNT',
    body: 'Hi {{first_name}}, I have updated your chapter to {{chapter_name}}. This change is immediate. If your member number still shows the old chapter code, that is expected — chapter codes in member numbers are immutable. Your new chapter home is live.',
    tags: ['chapter', 'membership'],
    createdBy: 'user-esther',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
    usageCount: 5,
  },
];

// ============================================================================
// Accessors — tickets
// ============================================================================

function sameChapter(user: MockUser, code: string | null): boolean {
  if (!code) return false;
  return user.chapterCode === code;
}

export function getTickets(
  user: MockUser,
  filters?: TicketFilters,
): SupportTicket[] {
  let result = mockSupportTickets;

  if (isChapterLeader(user) && user.chapterCode) {
    result = result.filter((t) => sameChapter(user, t.memberChapterCode));
  } else if (isFinanceOfficer(user)) {
    result = result.filter((t) => t.category === 'BILLING');
  }

  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((t) => t.status === filters.status);
  }
  if (filters?.priority && filters.priority !== 'ALL') {
    result = result.filter((t) => t.priority === filters.priority);
  }
  if (filters?.category && filters.category !== 'ALL') {
    result = result.filter((t) => t.category === filters.category);
  }
  if (filters?.assignee && filters.assignee !== 'ALL') {
    if (filters.assignee === 'ME') {
      result = result.filter((t) => t.assignedTo === user.id);
    } else if (filters.assignee === 'UNASSIGNED') {
      result = result.filter((t) => t.assignedTo == null);
    } else {
      result = result.filter((t) => t.assignedTo === filters.assignee);
    }
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (t) =>
        t.subject.toLowerCase().includes(q) ||
        t.reference.toLowerCase().includes(q) ||
        t.memberName.toLowerCase().includes(q) ||
        t.memberEmail.toLowerCase().includes(q),
    );
  }

  return [...result].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getTicketById(
  user: MockUser,
  id: string,
): SupportTicket | null {
  const t = mockSupportTickets.find((item) => item.id === id);
  if (!t) return null;
  if (isChapterLeader(user) && user.chapterCode) {
    return sameChapter(user, t.memberChapterCode) ? t : null;
  }
  if (isFinanceOfficer(user)) {
    return t.category === 'BILLING' ? t : null;
  }
  return t;
}

export interface TicketStats {
  newCount: number;
  unassigned: number;
  assignedToMe: number;
  oldestOpenHours: number | null;
}

export function getTicketStats(user: MockUser): TicketStats {
  const scoped = getTickets(user);
  const openTickets = scoped.filter(
    (t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED',
  );
  const newCount = scoped.filter((t) => t.status === 'NEW').length;
  const unassigned = openTickets.filter((t) => t.assignedTo == null).length;
  const assignedToMe = openTickets.filter(
    (t) => t.assignedTo === user.id,
  ).length;
  const oldestOpen =
    openTickets.length > 0
      ? openTickets.reduce((oldest, t) =>
          new Date(t.createdAt).getTime() < new Date(oldest.createdAt).getTime()
            ? t
            : oldest,
        )
      : null;
  const oldestOpenHours = oldestOpen
    ? Math.round(
        (now - new Date(oldestOpen.createdAt).getTime()) / HOUR,
      )
    : null;

  return { newCount, unassigned, assignedToMe, oldestOpenHours };
}

export function getTicketMessages(
  _user: MockUser,
  ticketId: string,
): TicketMessage[] {
  return mockTicketMessages
    .filter((m) => m.ticketId === ticketId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export function addTicketMessage(
  user: MockUser,
  ticketId: string,
  body: string,
  isInternalNote: boolean,
): TicketMessage | null {
  const ticket = mockSupportTickets.find((t) => t.id === ticketId);
  if (!ticket) return null;
  const msg: TicketMessage = {
    id: `msg-${Date.now().toString(36)}`,
    ticketId,
    authorId: user.id,
    authorName: user.name,
    authorType: 'AGENT',
    body,
    isInternalNote,
    createdAt: new Date().toISOString(),
  };
  mockTicketMessages.push(msg);
  ticket.updatedAt = msg.createdAt;
  if (!isInternalNote && ticket.firstResponseAt == null) {
    ticket.firstResponseAt = msg.createdAt;
  }
  if (!isInternalNote && ticket.status === 'NEW') {
    ticket.status = 'OPEN';
  }
  return msg;
}

export function assignTicket(
  user: MockUser,
  ticketId: string,
  assigneeId: string,
  assigneeName: string,
): boolean {
  const ticket = mockSupportTickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  ticket.assignedTo = assigneeId;
  ticket.assignedToName = assigneeName;
  ticket.updatedAt = new Date().toISOString();
  void user;
  return true;
}

export function resolveTicket(user: MockUser, ticketId: string): boolean {
  const ticket = mockSupportTickets.find((t) => t.id === ticketId);
  if (!ticket || ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
    return false;
  }
  ticket.status = 'RESOLVED';
  ticket.resolvedAt = new Date().toISOString();
  ticket.updatedAt = ticket.resolvedAt;
  void user;
  return true;
}

export function closeTicket(user: MockUser, ticketId: string): boolean {
  const ticket = mockSupportTickets.find((t) => t.id === ticketId);
  if (!ticket || ticket.status === 'CLOSED') return false;
  ticket.status = 'CLOSED';
  ticket.closedAt = new Date().toISOString();
  ticket.updatedAt = ticket.closedAt;
  void user;
  return true;
}

export function reopenTicket(user: MockUser, ticketId: string): boolean {
  const ticket = mockSupportTickets.find((t) => t.id === ticketId);
  if (!ticket) return false;
  if (ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED') return false;
  ticket.status = 'OPEN';
  ticket.resolvedAt = null;
  ticket.closedAt = null;
  ticket.updatedAt = new Date().toISOString();
  void user;
  return true;
}

export function getAgentOptions(): Array<{ id: string; name: string }> {
  const set = new Map<string, string>();
  for (const t of mockSupportTickets) {
    if (t.assignedTo && t.assignedToName) {
      set.set(t.assignedTo, t.assignedToName);
    }
  }
  return Array.from(set.entries()).map(([id, name]) => ({ id, name }));
}

// ============================================================================
// Accessors — canned responses
// ============================================================================

export function getCannedResponses(
  _user: MockUser,
  filters?: CannedFilters,
): CannedResponse[] {
  let result = mockCannedResponses;
  if (filters?.category && filters.category !== 'ALL') {
    result = result.filter((r) => r.category === filters.category);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.body.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }
  return [...result].sort((a, b) => b.usageCount - a.usageCount);
}

export function getCannedResponseById(id: string): CannedResponse | null {
  return mockCannedResponses.find((r) => r.id === id) ?? null;
}

export function saveCannedResponse(
  user: MockUser,
  data: Partial<CannedResponse> & { id?: string },
): CannedResponse | null {
  const nowIso = new Date().toISOString();
  if (data.id) {
    const existing = mockCannedResponses.find((r) => r.id === data.id);
    if (!existing) return null;
    if (data.title !== undefined) existing.title = data.title;
    if (data.category !== undefined) existing.category = data.category;
    if (data.body !== undefined) existing.body = data.body;
    if (data.tags !== undefined) existing.tags = data.tags;
    existing.updatedAt = nowIso;
    return existing;
  }
  if (!data.title || !data.body || !data.category) return null;
  const created: CannedResponse = {
    id: `can-${Date.now().toString(36)}`,
    title: data.title,
    category: data.category,
    body: data.body,
    tags: data.tags ?? [],
    createdBy: user.id,
    createdAt: nowIso,
    updatedAt: nowIso,
    usageCount: 0,
  };
  mockCannedResponses.push(created);
  return created;
}

export function deleteCannedResponse(id: string): boolean {
  const idx = mockCannedResponses.findIndex((r) => r.id === id);
  if (idx === -1) return false;
  mockCannedResponses.splice(idx, 1);
  return true;
}

// ============================================================================
// Analytics
// ============================================================================

export function getSupportAnalytics(
  _user: MockUser,
  rangeDays: number,
): SupportAnalytics {
  const cutoff = now - rangeDays * DAY;
  const scoped = mockSupportTickets.filter(
    (t) => new Date(t.createdAt).getTime() >= cutoff,
  );

  const created = scoped.length;
  const resolved = scoped.filter((t) => t.resolvedAt != null).length;
  const backlog = mockSupportTickets.filter(
    (t) => t.status !== 'RESOLVED' && t.status !== 'CLOSED',
  ).length;

  const firstResponseDurations = scoped
    .filter((t) => t.firstResponseAt)
    .map(
      (t) =>
        (new Date(t.firstResponseAt!).getTime() -
          new Date(t.createdAt).getTime()) /
        HOUR,
    )
    .sort((a, b) => a - b);
  const resolveDurations = scoped
    .filter((t) => t.resolvedAt)
    .map(
      (t) =>
        (new Date(t.resolvedAt!).getTime() -
          new Date(t.createdAt).getTime()) /
        HOUR,
    )
    .sort((a, b) => a - b);

  const medianFirstResponseHours =
    firstResponseDurations.length > 0
      ? Math.round(
          firstResponseDurations[
            Math.floor(firstResponseDurations.length / 2)
          ],
        )
      : null;
  const medianResolveHours =
    resolveDurations.length > 0
      ? Math.round(resolveDurations[Math.floor(resolveDurations.length / 2)])
      : null;

  // Volume by day (created vs resolved)
  const dayBuckets = new Map<string, { created: number; resolved: number }>();
  for (let i = 0; i < rangeDays; i++) {
    const key = new Date(now - i * DAY).toISOString().slice(0, 10);
    dayBuckets.set(key, { created: 0, resolved: 0 });
  }
  for (const t of scoped) {
    const k = t.createdAt.slice(0, 10);
    const bucket = dayBuckets.get(k);
    if (bucket) bucket.created += 1;
    if (t.resolvedAt) {
      const rk = t.resolvedAt.slice(0, 10);
      const rb = dayBuckets.get(rk);
      if (rb) rb.resolved += 1;
    }
  }
  const volumeSeries = Array.from(dayBuckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({
      date: new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
      }),
      created: v.created,
      resolved: v.resolved,
    }));

  const categoryMap = new Map<TicketCategory, number>();
  for (const t of scoped) {
    categoryMap.set(t.category, (categoryMap.get(t.category) ?? 0) + 1);
  }
  const categoryBreakdown = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);

  const priorityMap = new Map<TicketPriority, number>();
  for (const t of scoped) {
    priorityMap.set(t.priority, (priorityMap.get(t.priority) ?? 0) + 1);
  }
  const priorityMix = Array.from(priorityMap.entries())
    .map(([priority, count]) => ({ priority, count }))
    .sort((a, b) => b.count - a.count);

  const subjectMap = new Map<string, number>();
  for (const t of scoped) {
    subjectMap.set(t.subject, (subjectMap.get(t.subject) ?? 0) + 1);
  }
  const topIssues = Array.from(subjectMap.entries())
    .map(([subject, count]) => ({ subject, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    created,
    resolved,
    medianFirstResponseHours,
    medianResolveHours,
    backlog,
    reopened: 0,
    volumeSeries,
    categoryBreakdown,
    priorityMix,
    topIssues,
  };
}