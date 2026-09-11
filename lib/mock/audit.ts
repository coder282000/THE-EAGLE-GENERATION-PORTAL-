// lib/mock/audit.ts
//
// PNL-18 Audit and Security — types, permission helpers, seed data,
// accessors.
//
// The audit log is append-only by design. No exported function in this
// file mutates an audit entry. The real append-only guarantee is a
// PostgreSQL trigger (RO-9); this mock preserves the contract at the
// API surface.

import type { MockUser } from '@/components/mock/data';

// ============================================================================
// Types
// ============================================================================

export type SecurityEventType =
  | 'LOGIN_FAILED'
  | 'ACCOUNT_LOCKED'
  | 'PRIVILEGE_GRANTED'
  | 'PRIVILEGE_REVOKED'
  | 'SESSION_REVOKED'
  | 'ANOMALY_DETECTED';

export type SecuritySeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AccessReviewStatus =
  | 'ACTIVE'
  | 'PENDING_REVIEW'
  | 'CERTIFIED'
  | 'REVOKE_PENDING'
  | 'REVOKED';

export type EntityType =
  | 'application'
  | 'member'
  | 'order'
  | 'transaction'
  | 'refund'
  | 'loan'
  | 'circle'
  | 'event'
  | 'campaign'
  | 'template'
  | 'announcement'
  | 'role';

export interface AuditEntry {
  id: number;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: EntityType;
  entityId: string;
  entityLabel: string;
  /** Only present in entity-scoped queries; excluded from list payloads. */
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  errorMessage: string | null;
  createdAt: string;
  chapterCode: string | null;
}

export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  actorId: string | null;
  actorName: string | null;
  targetId: string | null;
  targetName: string | null;
  metadata: Record<string, unknown>;
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  resolutionNote: string | null;
  escalated: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  device: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  startedAt: string;
  lastSeenAt: string;
  expiresAt: string;
  chapterCode: string | null;
}

export interface AccessReviewEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  grantedAt: string;
  grantedBy: string;
  lastUsedAt: string | null;
  reviewStatus: AccessReviewStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  chapterCode: string | null;
}

export interface AuditFilters {
  actorId?: string | 'ALL';
  actionPrefix?: string | 'ALL';
  entityType?: EntityType | 'ALL';
  success?: boolean | 'ALL';
  q?: string;
  from?: string;
  to?: string;
}

export interface SecurityEventFilters {
  severity?: SecuritySeverity | 'ALL';
  type?: SecurityEventType | 'ALL';
  resolved?: boolean | 'ALL';
  q?: string;
}

export interface SessionFilters {
  memberId?: string | 'ALL';
  device?: 'desktop' | 'mobile' | 'tablet' | 'unknown' | 'ALL';
  q?: string;
}

export interface AccessReviewFilters {
  role?: string | 'ALL';
  status?: AccessReviewStatus | 'ALL';
  staleOnly?: boolean;
  q?: string;
}

// ============================================================================
// Label maps
// ============================================================================

export const SECURITY_EVENT_TYPE_LABELS: Record<SecurityEventType, string> = {
  LOGIN_FAILED: 'Login failed',
  ACCOUNT_LOCKED: 'Account locked',
  PRIVILEGE_GRANTED: 'Privilege granted',
  PRIVILEGE_REVOKED: 'Privilege revoked',
  SESSION_REVOKED: 'Session revoked',
  ANOMALY_DETECTED: 'Anomaly detected',
};

export const SECURITY_SEVERITY_LABELS: Record<SecuritySeverity, string> = {
  INFO: 'Info',
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  CRITICAL: 'Critical',
};

export const ACCESS_REVIEW_STATUS_LABELS: Record<AccessReviewStatus, string> = {
  ACTIVE: 'Active',
  PENDING_REVIEW: 'Pending review',
  CERTIFIED: 'Certified',
  REVOKE_PENDING: 'Revoke pending',
  REVOKED: 'Revoked',
};

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  application: 'Application',
  member: 'Member',
  order: 'Order',
  transaction: 'Transaction',
  refund: 'Refund',
  loan: 'Loan',
  circle: 'Circle',
  event: 'Event',
  campaign: 'Campaign',
  template: 'Template',
  announcement: 'Announcement',
  role: 'Role',
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

export function canViewAuditLog(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user) || isFinanceOfficer(user);
}

export function canExportAudit(user: MockUser): boolean {
  return isAdmin(user) || isFinanceOfficer(user);
}

export function canViewSecurityEvents(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user);
}

export function canResolveSecurityEvent(user: MockUser): boolean {
  return isAdmin(user);
}

export function canEscalateSecurityEvent(user: MockUser): boolean {
  return isSuperAdmin(user);
}

export function canViewSessions(user: MockUser): boolean {
  return isAdmin(user) || isChapterLeader(user);
}

export function canRevokeSession(user: MockUser): boolean {
  return isAdmin(user);
}

export function canRevokeAllForUser(user: MockUser): boolean {
  return isSuperAdmin(user);
}

export function canViewAccessReview(user: MockUser): boolean {
  return isAdmin(user);
}

export function canCertifyAccess(user: MockUser): boolean {
  return isSuperAdmin(user);
}

export function canFlagAccess(user: MockUser): boolean {
  return isAdmin(user);
}

export function canRevokeAccess(user: MockUser): boolean {
  return isSuperAdmin(user);
}

// ============================================================================
// Seed data
// ============================================================================

const now = Date.now();
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;
const MINUTE = 1000 * 60;
const hoursAgo = (n: number) => new Date(now - HOUR * n).toISOString();
const daysAgo = (n: number) => new Date(now - DAY * n).toISOString();
const daysAhead = (n: number) => new Date(now + DAY * n).toISOString();
const minutesAgo = (n: number) => new Date(now - MINUTE * n).toISOString();

// ---------------------------------------------------------------------------
// Audit entries
// ---------------------------------------------------------------------------

export const mockAuditEntries: AuditEntry[] = [
  {
    id: 10001,
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    actorRole: 'SUPER_ADMIN',
    action: 'application.approved',
    entityType: 'application',
    entityId: 'app-042',
    entityLabel: 'APP-26-100042 · Grace Njeri',
    before: { status: 'INTERVIEWED' },
    after: { status: 'APPROVED', decidedBy: 'user-solomon' },
    ipAddress: '196.201.214.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: hoursAgo(2),
    chapterCode: 'KU',
  },
  {
    id: 10002,
    actorId: 'user-esther',
    actorName: 'Esther W.',
    actorRole: 'CHAPTER_LEADER',
    action: 'announcement.published',
    entityType: 'announcement',
    entityId: 'ann-002',
    entityLabel: 'Chapter leaders meeting — Thursday 6pm',
    before: { status: 'DRAFT' },
    after: { status: 'PUBLISHED' },
    ipAddress: '41.90.64.11',
    userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/119',
    success: true,
    errorMessage: null,
    createdAt: hoursAgo(6),
    chapterCode: 'KU',
  },
  {
    id: 10003,
    actorId: 'user-admin-miriam',
    actorName: 'Miriam K.',
    actorRole: 'FINANCE_OFFICER',
    action: 'refund.requested',
    entityType: 'refund',
    entityId: 'ref-042',
    entityLabel: 'Refund for EVT-26-0042',
    before: { status: 'CONFIRMED' },
    after: { status: 'REFUND_PENDING' },
    ipAddress: '196.201.214.9',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: hoursAgo(9),
    chapterCode: null,
  },
  {
    id: 10004,
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    actorRole: 'SUPER_ADMIN',
    action: 'role.granted',
    entityType: 'role',
    entityId: 'user-esther',
    entityLabel: 'CHAPTER_LEADER for Esther W.',
    before: { roles: ['MEMBER'] },
    after: { roles: ['MEMBER', 'CHAPTER_LEADER'] },
    ipAddress: '196.201.214.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: daysAgo(1),
    chapterCode: 'KU',
  },
  {
    id: 10005,
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    actorRole: 'SUPER_ADMIN',
    action: 'event.published',
    entityType: 'event',
    entityId: 'evt-001',
    entityLabel: 'Annual Leadership Summit 2026',
    before: { status: 'DRAFT' },
    after: { status: 'PUBLISHED' },
    ipAddress: '196.201.214.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: daysAgo(2),
    chapterCode: null,
  },
  {
    id: 10006,
    actorId: 'user-admin-miriam',
    actorName: 'Miriam K.',
    actorRole: 'FINANCE_OFFICER',
    action: 'refund.approved',
    entityType: 'refund',
    entityId: 'ref-038',
    entityLabel: 'Refund for EVT-26-0038',
    before: { status: 'REFUND_PENDING' },
    after: { status: 'REFUNDED' },
    ipAddress: '196.201.214.9',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: daysAgo(3),
    chapterCode: null,
  },
  {
    id: 10007,
    actorId: 'user-esther',
    actorName: 'Esther W.',
    actorRole: 'CHAPTER_LEADER',
    action: 'member.suspended',
    entityType: 'member',
    entityId: 'mem-0142',
    entityLabel: 'Peter Mwangi',
    before: { status: 'ACTIVE' },
    after: { status: 'SUSPENDED', reason: 'Community guidelines violation' },
    ipAddress: '41.90.64.11',
    userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/119',
    success: true,
    errorMessage: null,
    createdAt: daysAgo(4),
    chapterCode: 'KU',
  },
  {
    id: 10008,
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    actorRole: 'SUPER_ADMIN',
    action: 'campaign.sent',
    entityType: 'campaign',
    entityId: 'cmp-001',
    entityLabel: 'Summit early-bird blast',
    before: { status: 'SCHEDULED' },
    after: { status: 'SENT', recipientCount: 1137 },
    ipAddress: '196.201.214.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: daysAgo(5),
    chapterCode: null,
  },
  {
    id: 10009,
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    actorRole: 'SUPER_ADMIN',
    action: 'transaction.reconciled',
    entityType: 'transaction',
    entityId: 'txn-8821',
    entityLabel: 'M-Pesa settlement 2026-09-05',
    before: { status: 'PENDING' },
    after: { status: 'RECONCILED' },
    ipAddress: '196.201.214.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: daysAgo(6),
    chapterCode: null,
  },
  {
    id: 10010,
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    actorRole: 'SUPER_ADMIN',
    action: 'role.revoked',
    entityType: 'role',
    entityId: 'user-esther',
    entityLabel: 'MENTOR removed from Esther W.',
    before: { roles: ['MEMBER', 'CHAPTER_LEADER', 'MENTOR'] },
    after: { roles: ['MEMBER', 'CHAPTER_LEADER'] },
    ipAddress: '196.201.214.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120',
    success: true,
    errorMessage: null,
    createdAt: daysAgo(8),
    chapterCode: 'KU',
  },
];

// ---------------------------------------------------------------------------
// Security events
// ---------------------------------------------------------------------------

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'sec-001',
    type: 'LOGIN_FAILED',
    severity: 'LOW',
    actorId: null,
    actorName: 'grace.njeri@example.com',
    targetId: null,
    targetName: null,
    metadata: { ip: '41.90.64.55', attemptNumber: 2 },
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    resolutionNote: null,
    escalated: false,
    createdAt: minutesAgo(15),
  },
  {
    id: 'sec-002',
    type: 'LOGIN_FAILED',
    severity: 'MEDIUM',
    actorId: null,
    actorName: 'david.ochieng@example.com',
    targetId: null,
    targetName: null,
    metadata: { ip: '196.201.214.42', attemptNumber: 4, geolocation: 'Nairobi, KE' },
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    resolutionNote: null,
    escalated: false,
    createdAt: minutesAgo(42),
  },
  {
    id: 'sec-003',
    type: 'ACCOUNT_LOCKED',
    severity: 'HIGH',
    actorId: null,
    actorName: 'david.ochieng@example.com',
    targetId: 'user-david',
    targetName: 'David Ochieng',
    metadata: { reason: '5 failed attempts within 10 minutes', ip: '196.201.214.42' },
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    resolutionNote: null,
    escalated: false,
    createdAt: minutesAgo(40),
  },
  {
    id: 'sec-004',
    type: 'PRIVILEGE_GRANTED',
    severity: 'INFO',
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    targetId: 'user-esther',
    targetName: 'Esther W.',
    metadata: { role: 'CHAPTER_LEADER' },
    resolved: true,
    resolvedBy: 'user-solomon',
    resolvedAt: daysAgo(1),
    resolutionNote: 'Expected — quarterly role assignment',
    escalated: false,
    createdAt: daysAgo(1),
  },
  {
    id: 'sec-005',
    type: 'SESSION_REVOKED',
    severity: 'LOW',
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    targetId: 'user-peter',
    targetName: 'Peter Mwangi',
    metadata: { reason: 'Suspected compromise reported by member' },
    resolved: true,
    resolvedBy: 'user-solomon',
    resolvedAt: daysAgo(3),
    resolutionNote: 'Member confirmed device was lost. Session terminated.',
    escalated: false,
    createdAt: daysAgo(3),
  },
  {
    id: 'sec-006',
    type: 'ANOMALY_DETECTED',
    severity: 'CRITICAL',
    actorId: 'user-admin-miriam',
    actorName: 'Miriam K.',
    targetId: null,
    targetName: null,
    metadata: {
      rule: 'out_of_hours_financial_action',
      detail: 'Refund approval at 03:14 local time',
    },
    resolved: false,
    resolvedBy: null,
    resolvedAt: null,
    resolutionNote: null,
    escalated: true,
    createdAt: hoursAgo(20),
  },
  {
    id: 'sec-007',
    type: 'PRIVILEGE_REVOKED',
    severity: 'INFO',
    actorId: 'user-solomon',
    actorName: 'Solomon A.',
    targetId: 'user-esther',
    targetName: 'Esther W.',
    metadata: { role: 'MENTOR' },
    resolved: true,
    resolvedBy: 'user-solomon',
    resolvedAt: daysAgo(8),
    resolutionNote: 'Access review — role no longer required',
    escalated: false,
    createdAt: daysAgo(8),
  },
];

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

function detectDevice(userAgent: string): 'desktop' | 'mobile' | 'tablet' | 'unknown' {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return 'tablet';
  if (/mobile|android|iphone/.test(ua)) return 'mobile';
  if (/windows|macintosh|linux/.test(ua)) return 'desktop';
  return 'unknown';
}

const SESSION_SEEDS: Array<Omit<Session, 'device'>> = [
  {
    id: 'ses-001',
    userId: 'user-solomon',
    userName: 'Solomon A.',
    userEmail: 'solomon@eaglegeneration.org',
    ipAddress: '196.201.214.5',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/120',
    startedAt: hoursAgo(3),
    lastSeenAt: minutesAgo(2),
    expiresAt: daysAhead(7),
    chapterCode: null,
  },
  {
    id: 'ses-002',
    userId: 'user-admin-miriam',
    userName: 'Miriam K.',
    userEmail: 'miriam@eaglegeneration.org',
    ipAddress: '196.201.214.9',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120',
    startedAt: hoursAgo(6),
    lastSeenAt: minutesAgo(12),
    expiresAt: daysAhead(7),
    chapterCode: null,
  },
  {
    id: 'ses-003',
    userId: 'user-esther',
    userName: 'Esther W.',
    userEmail: 'esther@eaglegeneration.org',
    ipAddress: '41.90.64.11',
    userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/119',
    startedAt: hoursAgo(1),
    lastSeenAt: minutesAgo(5),
    expiresAt: daysAhead(7),
    chapterCode: 'KU',
  },
  {
    id: 'ses-004',
    userId: 'user-esther',
    userName: 'Esther W.',
    userEmail: 'esther@eaglegeneration.org',
    ipAddress: '41.90.64.11',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/605',
    startedAt: daysAgo(1),
    lastSeenAt: hoursAgo(20),
    expiresAt: daysAhead(6),
    chapterCode: 'KU',
  },
  {
    id: 'ses-005',
    userId: 'user-grace',
    userName: 'Grace Njeri',
    userEmail: 'grace.njeri@example.com',
    ipAddress: '41.90.64.55',
    userAgent: 'Mozilla/5.0 (Linux; Android 13) Chrome/119',
    startedAt: hoursAgo(4),
    lastSeenAt: minutesAgo(30),
    expiresAt: daysAhead(7),
    chapterCode: 'KU',
  },
  {
    id: 'ses-006',
    userId: 'user-david',
    userName: 'David Ochieng',
    userEmail: 'david.ochieng@example.com',
    ipAddress: '196.201.214.42',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0) Firefox/121',
    startedAt: daysAgo(2),
    lastSeenAt: daysAgo(1),
    expiresAt: daysAhead(5),
    chapterCode: 'UON',
  },
];

export const mockSessions: Session[] = SESSION_SEEDS.map((s) => ({
  ...s,
  device: detectDevice(s.userAgent),
}));

// ---------------------------------------------------------------------------
// Access review entries
// ---------------------------------------------------------------------------

export const mockAccessReviews: AccessReviewEntry[] = [
  {
    id: 'acr-001',
    userId: 'user-solomon',
    userName: 'Solomon A.',
    userEmail: 'solomon@eaglegeneration.org',
    role: 'SUPER_ADMIN',
    grantedAt: daysAgo(365),
    grantedBy: 'user-bootstrap',
    lastUsedAt: minutesAgo(2),
    reviewStatus: 'ACTIVE',
    reviewedBy: null,
    reviewedAt: null,
    chapterCode: null,
  },
  {
    id: 'acr-002',
    userId: 'user-admin-miriam',
    userName: 'Miriam K.',
    userEmail: 'miriam@eaglegeneration.org',
    role: 'FINANCE_OFFICER',
    grantedAt: daysAgo(180),
    grantedBy: 'user-solomon',
    lastUsedAt: hoursAgo(6),
    reviewStatus: 'ACTIVE',
    reviewedBy: null,
    reviewedAt: null,
    chapterCode: null,
  },
  {
    id: 'acr-003',
    userId: 'user-esther',
    userName: 'Esther W.',
    userEmail: 'esther@eaglegeneration.org',
    role: 'CHAPTER_LEADER',
    grantedAt: daysAgo(120),
    grantedBy: 'user-solomon',
    lastUsedAt: hoursAgo(1),
    reviewStatus: 'CERTIFIED',
    reviewedBy: 'user-solomon',
    reviewedAt: daysAgo(30),
    chapterCode: 'KU',
  },
  {
    id: 'acr-004',
    userId: 'user-esther',
    userName: 'Esther W.',
    userEmail: 'esther@eaglegeneration.org',
    role: 'MENTOR',
    grantedAt: daysAgo(200),
    grantedBy: 'user-solomon',
    lastUsedAt: daysAgo(150),
    reviewStatus: 'REVOKED',
    reviewedBy: 'user-solomon',
    reviewedAt: daysAgo(8),
    chapterCode: 'KU',
  },
  {
    id: 'acr-005',
    userId: 'user-james',
    userName: 'Pastor James',
    userEmail: 'james@eaglegeneration.org',
    role: 'MENTOR',
    grantedAt: daysAgo(90),
    grantedBy: 'user-solomon',
    lastUsedAt: null,
    reviewStatus: 'PENDING_REVIEW',
    reviewedBy: null,
    reviewedAt: null,
    chapterCode: 'KU',
  },
  {
    id: 'acr-006',
    userId: 'user-circle-1',
    userName: 'Anne Wanjiku',
    userEmail: 'anne.wanjiku@example.com',
    role: 'CIRCLE_LEADER',
    grantedAt: daysAgo(60),
    grantedBy: 'user-solomon',
    lastUsedAt: daysAgo(45),
    reviewStatus: 'REVOKE_PENDING',
    reviewedBy: 'user-admin-miriam',
    reviewedAt: daysAgo(15),
    chapterCode: 'UON',
  },
  {
    id: 'acr-007',
    userId: 'user-admin-2',
    userName: 'Naomi Chebet',
    userEmail: 'naomi.chebet@example.com',
    role: 'ADMIN',
    grantedAt: daysAgo(240),
    grantedBy: 'user-solomon',
    lastUsedAt: daysAgo(120),
    reviewStatus: 'PENDING_REVIEW',
    reviewedBy: null,
    reviewedAt: null,
    chapterCode: 'KU',
  },
];

// ============================================================================
// Accessors — audit entries
// ============================================================================

const FINANCIAL_PREFIXES = ['refund', 'transaction', 'payout', 'ledger'];

function isFinancialAction(action: string): boolean {
  return FINANCIAL_PREFIXES.some((p) => action.startsWith(p));
}

export function getAuditEntries(
  user: MockUser,
  filters?: AuditFilters,
): AuditEntry[] {
  let result = mockAuditEntries;

  if (isChapterLeader(user) && user.chapterCode) {
    const code = user.chapterCode;
    result = result.filter((e) => e.chapterCode === code);
  } else if (isFinanceOfficer(user)) {
    result = result.filter((e) => isFinancialAction(e.action));
  }

  if (filters?.actorId && filters.actorId !== 'ALL') {
    result = result.filter((e) => e.actorId === filters.actorId);
  }
  if (filters?.actionPrefix && filters.actionPrefix !== 'ALL') {
    const prefix = filters.actionPrefix;
    result = result.filter((e) => e.action.startsWith(prefix));
  }
  if (filters?.entityType && filters.entityType !== 'ALL') {
    result = result.filter((e) => e.entityType === filters.entityType);
  }
  if (typeof filters?.success === 'boolean') {
    result = result.filter((e) => e.success === filters.success);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (e) =>
        e.actorName.toLowerCase().includes(q) ||
        e.action.toLowerCase().includes(q) ||
        e.entityLabel.toLowerCase().includes(q),
    );
  }
  if (filters?.from) {
    const fromMs = new Date(filters.from).getTime();
    result = result.filter(
      (e) => new Date(e.createdAt).getTime() >= fromMs,
    );
  }
  if (filters?.to) {
    const toMs = new Date(filters.to).getTime();
    result = result.filter((e) => new Date(e.createdAt).getTime() <= toMs);
  }

  return [...result].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getAuditEntryById(id: number): AuditEntry | null {
  return mockAuditEntries.find((e) => e.id === id) ?? null;
}

export interface AuditStats {
  entries24h: number;
  distinctActors24h: number;
  failedActions24h: number;
  changeVsPrior: number;
}

export function getAuditStats(user: MockUser): AuditStats {
  const scoped = getAuditEntries(user);
  const cutoffNow = now - DAY;
  const cutoffPrior = now - 2 * DAY;
  const recent = scoped.filter(
    (e) => new Date(e.createdAt).getTime() >= cutoffNow,
  );
  const prior = scoped.filter((e) => {
    const t = new Date(e.createdAt).getTime();
    return t >= cutoffPrior && t < cutoffNow;
  });
  const distinctActors = new Set(recent.map((e) => e.actorId)).size;
  const failed = recent.filter((e) => !e.success).length;
  const change =
    prior.length === 0
      ? recent.length > 0
        ? 100
        : 0
      : Math.round(((recent.length - prior.length) / prior.length) * 100);

  return {
    entries24h: recent.length,
    distinctActors24h: distinctActors,
    failedActions24h: failed,
    changeVsPrior: change,
  };
}

export function getEntityAuditTrail(
  entityType: EntityType,
  entityId: string,
  user: MockUser,
): AuditEntry[] {
  const scopedIds = new Set(getAuditEntries(user).map((e) => e.id));
  return mockAuditEntries
    .filter(
      (e) =>
        e.entityType === entityType &&
        e.entityId === entityId &&
        scopedIds.has(e.id),
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export function getActorOptions(): Array<{ id: string; name: string }> {
  const seen = new Map<string, string>();
  for (const e of mockAuditEntries) {
    if (!seen.has(e.actorId)) seen.set(e.actorId, e.actorName);
  }
  return Array.from(seen.entries()).map(([id, name]) => ({ id, name }));
}

export function getActionPrefixOptions(): string[] {
  const prefixes = new Set<string>();
  for (const e of mockAuditEntries) {
    const [prefix] = e.action.split('.');
    if (prefix) prefixes.add(prefix);
  }
  return Array.from(prefixes).sort();
}

// ============================================================================
// Accessors — security events
// ============================================================================

export function getSecurityEvents(
  user: MockUser,
  filters?: SecurityEventFilters,
): SecurityEvent[] {
  let result = mockSecurityEvents;

  if (isChapterLeader(user) && user.chapterCode) {
    const code = user.chapterCode;
    const memberEmails = new Set(
      mockAccessReviews
        .filter((a) => a.chapterCode === code)
        .map((a) => a.userEmail),
    );
    result = result.filter(
      (e) =>
        (e.actorName && memberEmails.has(e.actorName)) ||
        (e.targetName && mockAccessReviews.some(
          (a) => a.chapterCode === code && a.userName === e.targetName,
        )),
    );
  }

  if (filters?.severity && filters.severity !== 'ALL') {
    result = result.filter((e) => e.severity === filters.severity);
  }
  if (filters?.type && filters.type !== 'ALL') {
    result = result.filter((e) => e.type === filters.type);
  }
  if (typeof filters?.resolved === 'boolean') {
    result = result.filter((e) => e.resolved === filters.resolved);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (e) =>
        (e.actorName ?? '').toLowerCase().includes(q) ||
        (e.targetName ?? '').toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q),
    );
  }

  return [...result].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function getSecurityEventById(id: string): SecurityEvent | null {
  return mockSecurityEvents.find((e) => e.id === id) ?? null;
}

export interface SecurityEventStats {
  open: number;
  criticalUnresolved: number;
  resolved24h: number;
  medianResolveHours: number | null;
}

export function getSecurityEventStats(user: MockUser): SecurityEventStats {
  const scoped = getSecurityEvents(user);
  const open = scoped.filter((e) => !e.resolved).length;
  const criticalUnresolved = scoped.filter(
    (e) => !e.resolved && e.severity === 'CRITICAL',
  ).length;
  const resolved24h = scoped.filter(
    (e) =>
      e.resolved &&
      e.resolvedAt != null &&
      new Date(e.resolvedAt).getTime() >= now - DAY,
  ).length;
  const resolveDurations = scoped
    .filter((e) => e.resolved && e.resolvedAt)
    .map(
      (e) =>
        (new Date(e.resolvedAt!).getTime() - new Date(e.createdAt).getTime()) /
        HOUR,
    )
    .sort((a, b) => a - b);
  const medianResolveHours =
    resolveDurations.length > 0
      ? Math.round(resolveDurations[Math.floor(resolveDurations.length / 2)])
      : null;
  return { open, criticalUnresolved, resolved24h, medianResolveHours };
}

export function resolveSecurityEvent(
  _user: MockUser,
  id: string,
  note?: string,
): boolean {
  const e = mockSecurityEvents.find((item) => item.id === id);
  if (!e || e.resolved) return false;
  e.resolved = true;
  e.resolvedBy = _user.id;
  e.resolvedAt = new Date().toISOString();
  e.resolutionNote = note ?? null;
  return true;
}

export function escalateSecurityEvent(_user: MockUser, id: string): boolean {
  const e = mockSecurityEvents.find((item) => item.id === id);
  if (!e) return false;
  e.escalated = true;
  return true;
}

// ============================================================================
// Accessors — sessions
// ============================================================================

export function getActiveSessions(
  user: MockUser,
  filters?: SessionFilters,
): Session[] {
  let result = mockSessions;

  if (isChapterLeader(user) && user.chapterCode) {
    const code = user.chapterCode;
    result = result.filter((s) => s.chapterCode === code);
  }

  if (filters?.memberId && filters.memberId !== 'ALL') {
    result = result.filter((s) => s.userId === filters.memberId);
  }
  if (filters?.device && filters.device !== 'ALL') {
    result = result.filter((s) => s.device === filters.device);
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (s) =>
        s.userName.toLowerCase().includes(q) ||
        s.userEmail.toLowerCase().includes(q) ||
        s.ipAddress.includes(q) ||
        s.userAgent.toLowerCase().includes(q),
    );
  }

  return [...result].sort(
    (a, b) => new Date(b.lastSeenAt).getTime() - new Date(a.lastSeenAt).getTime(),
  );
}

export interface SessionStats {
  total: number;
  uniqueUsers: number;
  mobile: number;
  longestIdleHours: number | null;
}

export function getSessionStats(user: MockUser): SessionStats {
  const scoped = getActiveSessions(user);
  const uniqueUsers = new Set(scoped.map((s) => s.userId)).size;
  const mobile = scoped.filter((s) => s.device === 'mobile').length;
  const idleHours = scoped.map(
    (s) => (now - new Date(s.lastSeenAt).getTime()) / HOUR,
  );
  const longestIdleHours =
    idleHours.length > 0 ? Math.round(Math.max(...idleHours)) : null;
  return { total: scoped.length, uniqueUsers, mobile, longestIdleHours };
}

export function revokeSession(_user: MockUser, id: string): boolean {
  const idx = mockSessions.findIndex((s) => s.id === id);
  if (idx === -1) return false;
  mockSessions.splice(idx, 1);
  return true;
}

export function revokeAllForUser(_user: MockUser, userId: string): number {
  const before = mockSessions.length;
  const remaining = mockSessions.filter((s) => s.userId !== userId);
  mockSessions.length = 0;
  mockSessions.push(...remaining);
  return before - mockSessions.length;
}

// ============================================================================
// Accessors — access review
// ============================================================================

export function getAccessReviews(
  user: MockUser,
  filters?: AccessReviewFilters,
): AccessReviewEntry[] {
  let result = mockAccessReviews;

  if (!isAdmin(user)) {
    // CHAPTER_LEADER and above could be scoped; for now, only admins.
    result = [];
  }

  if (filters?.role && filters.role !== 'ALL') {
    result = result.filter((e) => e.role === filters.role);
  }
  if (filters?.status && filters.status !== 'ALL') {
    result = result.filter((e) => e.reviewStatus === filters.status);
  }
  if (filters?.staleOnly) {
    const cutoff = now - 90 * DAY;
    result = result.filter(
      (e) =>
        e.reviewStatus !== 'REVOKED' &&
        (e.lastUsedAt == null ||
          new Date(e.lastUsedAt).getTime() < cutoff),
    );
  }
  if (filters?.q) {
    const q = filters.q.toLowerCase().trim();
    result = result.filter(
      (e) =>
        e.userName.toLowerCase().includes(q) ||
        e.userEmail.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q),
    );
  }

  return [...result].sort((a, b) => a.userName.localeCompare(b.userName));
}

export interface AccessReviewStats {
  total: number;
  stale: number;
  pending: number;
  revokedThisQuarter: number;
}

export function getAccessReviewStats(user: MockUser): AccessReviewStats {
  const scoped = getAccessReviews(user);
  const cutoff = now - 90 * DAY;
  const quarterStart = new Date();
  quarterStart.setMonth(quarterStart.getMonth() - 3);
  const stale = scoped.filter(
    (e) =>
      e.reviewStatus !== 'REVOKED' &&
      (e.lastUsedAt == null || new Date(e.lastUsedAt).getTime() < cutoff),
  ).length;
  const pending = scoped.filter(
    (e) =>
      e.reviewStatus === 'PENDING_REVIEW' ||
      e.reviewStatus === 'REVOKE_PENDING',
  ).length;
  const revokedThisQuarter = scoped.filter(
    (e) =>
      e.reviewStatus === 'REVOKED' &&
      e.reviewedAt != null &&
      new Date(e.reviewedAt).getTime() >= quarterStart.getTime(),
  ).length;
  return {
    total: scoped.length,
    stale,
    pending,
    revokedThisQuarter,
  };
}

export function certifyAccess(user: MockUser, id: string): boolean {
  const e = mockAccessReviews.find((item) => item.id === id);
  if (!e || e.reviewStatus === 'REVOKED') return false;
  e.reviewStatus = 'CERTIFIED';
  e.reviewedBy = user.id;
  e.reviewedAt = new Date().toISOString();
  return true;
}

export function flagForRevocation(user: MockUser, id: string): boolean {
  const e = mockAccessReviews.find((item) => item.id === id);
  if (!e || e.reviewStatus === 'REVOKED') return false;
  e.reviewStatus = 'REVOKE_PENDING';
  e.reviewedBy = user.id;
  e.reviewedAt = new Date().toISOString();
  return true;
}

export function revokeAccess(user: MockUser, id: string): boolean {
  const e = mockAccessReviews.find((item) => item.id === id);
  if (!e || e.reviewStatus === 'REVOKED') return false;
  // Guard against removing the last SUPER_ADMIN.
  if (e.role === 'SUPER_ADMIN') {
    const active = mockAccessReviews.filter(
      (a) => a.role === 'SUPER_ADMIN' && a.reviewStatus !== 'REVOKED',
    );
    if (active.length <= 1) return false;
  }
  e.reviewStatus = 'REVOKED';
  e.reviewedBy = user.id;
  e.reviewedAt = new Date().toISOString();
  return true;
}

export function getRoleOptions(): string[] {
  const roles = new Set(mockAccessReviews.map((e) => e.role));
  return Array.from(roles).sort();
}