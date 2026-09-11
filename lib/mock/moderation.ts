// lib/mock/moderation.ts
// PNL-06 Moderation - mock infrastructure.

import { getCurrentUser } from "./current-user";

// ---------- Types ----------

export type ReportType = "POST" | "COMMENT" | "MESSAGE" | "USER" | "GROUP";
export type ReportPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type ReportStatus = "OPEN" | "IN_REVIEW" | "ESCALATED" | "RESOLVED" | "DISMISSED";

export interface Report {
  id: string;
  reference: string;
  type: ReportType;
  priority: ReportPriority;
  status: ReportStatus;
  targetSummary: string;
  targetAuthorId: string;
  targetAuthorName: string;
  targetChapterCode?: string;
  reportedById: string;
  reportedByName: string;
  reporterNote?: string;
  priorReportsOnTarget: number;
  createdAt: string;
  slaDeadlineAt: string;
  assignedTo?: string;
  notes: ReportNote[];
}

export interface ReportNote {
  id: string;
  author: string;
  at: string;
  body: string;
}

export type ContentType = "POST" | "COMMENT" | "MESSAGE";

export interface ContentItem {
  id: string;
  type: ContentType;
  snippet: string;
  body: string;
  authorId: string;
  authorName: string;
  chapterCode?: string;
  createdAt: string;
  reportCount: number;
  removedAt?: string;
  removedBy?: string;
}

export type GroupType = "STUDY" | "CHAPTER" | "MENTORSHIP" | "INTEREST";
export type GroupVisibility = "OPEN" | "CLOSED" | "SECRET";
export type GroupStatus = "ACTIVE" | "WATCHED" | "ARCHIVED" | "DELETED";

export interface Group {
  id: string;
  name: string;
  type: GroupType;
  visibility: GroupVisibility;
  ownerId: string;
  ownerName: string;
  chapterCode?: string;
  memberCount: number;
  reports30d: number;
  lastActivityAt: string;
  status: GroupStatus;
}

export type SafeguardingSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type SafeguardingStatus = "OPEN" | "INVESTIGATING" | "AWAITING_AUTHORITY" | "CLOSED";

export interface NarrativeEntry {
  id: string;
  category: "OBSERVATION" | "ACTION" | "OUTCOME";
  author: string;
  at: string;
  body: string;
}

export interface AuthorityContact {
  id: string;
  authority: string;
  method: string;
  summary: string;
  outcome: string;
  at: string;
  by: string;
}

export interface SafeguardingCase {
  id: string;
  reference: string;
  severity: SafeguardingSeverity;
  status: SafeguardingStatus;
  reportId?: string;
  subjectId: string;
  subjectName: string;
  isMinor: boolean;
  reporterId?: string;
  reporterName?: string;
  assignedTo?: string;
  narrative: NarrativeEntry[];
  authorityLog: AuthorityContact[];
  createdAt: string;
  closedAt?: string;
  closedReason?: string;
}

export type VettingStage = "SUBMITTED" | "BACKGROUND_CHECK" | "CODE_OF_CONDUCT" | "DECISION";
export type CheckStatus = "NOT_STARTED" | "IN_PROGRESS" | "CLEAR" | "ADVERSE" | "INCONCLUSIVE";
export type VettingStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";
export type FocusCategory = "CAREER" | "FAITH" | "LEADERSHIP" | "ENTREPRENEURSHIP" | "TECHNOLOGY" | "GOVERNANCE";

export interface MentorApplication {
  id: string;
  reference: string;
  userId: string;
  userName: string;
  memberNumber: string;
  focusCategories: FocusCategory[];
  submittedAt: string;
  stage: VettingStage;
  backgroundCheck: CheckStatus;
  codeAccepted: boolean;
  status: VettingStatus;
  notes: ReportNote[];
}

export type BanDuration = "TEMPORARY_7D" | "TEMPORARY_30D" | "TEMPORARY_90D" | "PERMANENT";
export type BanStatus = "ACTIVE" | "EXPIRED" | "REVOKED";
export type AppealStatus = "NONE" | "PENDING" | "UPHELD" | "DENIED";

export interface BanRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  reasonCategory: string;
  reasonNote: string;
  duration: BanDuration;
  issuedBy: string;
  issuedAt: string;
  expiresAt?: string;
  status: BanStatus;
  appealStatus: AppealStatus;
}

export interface BlockRecord {
  id: string;
  blockerId: string;
  blockerName: string;
  blockedId: string;
  blockedName: string;
  since: string;
  source: "SELF" | "REPORT_ACTION";
  active: boolean;
}

export interface ModerationSummary {
  reportsReceived: number;
  medianFirstResponseH: number;
  medianResolutionH: number;
  resolutionRate: number;
  repeatReporterRate: number;
  resolutionMix: {
    removed: number;
    warned: number;
    suspended: number;
    escalated: number;
    dismissed: number;
  };
  responseBuckets: { bucket: string; count: number }[];
  topOffenders: { memberNumber: string; reports: number; actions: number }[];
  topReporters: { memberNumber: string; reports: number; dismissed: number }[];
  topChapters: { chapterCode: string; reports: number; per100: number }[];
}

// ---------- Permission helpers ----------

const MOD_VIEW_ROLES = ["ADMIN", "SUPER_ADMIN", "COMPLIANCE_LEAD", "CHAPTER_LEADER"];
const MOD_ACTION_ROLES = ["ADMIN", "SUPER_ADMIN"];

export function canViewModeration(): boolean {
  return MOD_VIEW_ROLES.includes(getCurrentUser().role);
}

export function canActionModeration(): boolean {
  return MOD_ACTION_ROLES.includes(getCurrentUser().role);
}

export function isChapterLeaderScoped(): boolean {
  return getCurrentUser().role === "CHAPTER_LEADER";
}

export function canViewSafeguarding(): boolean {
  const u = getCurrentUser();
  if (u.role === "SUPER_ADMIN" || u.role === "COMPLIANCE_LEAD") return true;
  return u.capabilities?.includes("SAFEGUARDING_HANDLER") ?? false;
}

export function canVetMentor(): boolean {
  const u = getCurrentUser();
  return u.role === "ADMIN" || u.role === "SUPER_ADMIN";
}

export function canMakeBanPermanent(): boolean {
  return getCurrentUser().role === "SUPER_ADMIN";
}

// ---------- Seed ----------

const now = new Date();
const days = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();
const hours = (n: number) => new Date(now.getTime() + n * 3600000).toISOString();

export const seedReports: Report[] = [
  {
    id: "r-1",
    reference: "RPT-26-00412",
    type: "COMMENT",
    priority: "HIGH",
    status: "OPEN",
    targetSummary: "Comment on \"Investing with integrity\" thread - aggressive reply to another member",
    targetAuthorId: "m-2",
    targetAuthorName: "David Ochieng",
    targetChapterCode: "UON",
    reportedById: "m-1",
    reportedByName: "Grace Wanjiru",
    reporterNote: "Repeatedly dismissive. This is the third comment in a week.",
    priorReportsOnTarget: 2,
    createdAt: hours(-6),
    slaDeadlineAt: hours(18),
    notes: [],
  },
  {
    id: "r-2",
    reference: "RPT-26-00411",
    type: "MESSAGE",
    priority: "CRITICAL",
    status: "ESCALATED",
    targetSummary: "Direct message thread - inappropriate contact with a student member",
    targetAuthorId: "m-9",
    targetAuthorName: "Peter Mwangi",
    targetChapterCode: "KU",
    reportedById: "m-3",
    reportedByName: "Faith Njeri",
    reporterNote: "I do not want to be contacted by this member again.",
    priorReportsOnTarget: 0,
    createdAt: days(-1),
    slaDeadlineAt: hours(2),
    assignedTo: "Solomon A.",
    notes: [
      { id: "n-1", author: "Solomon A.", at: days(-1), body: "Escalated to safeguarding. Case SGC-26-0007 opened." },
    ],
  },
  {
    id: "r-3",
    reference: "RPT-26-00410",
    type: "POST",
    priority: "MEDIUM",
    status: "IN_REVIEW",
    targetSummary: "Post in Marketplace group - promotional content unrelated to the community",
    targetAuthorId: "m-4",
    targetAuthorName: "James Kariuki",
    targetChapterCode: "KU",
    reportedById: "m-5",
    reportedByName: "Esther Mwangi",
    priorReportsOnTarget: 0,
    createdAt: hours(-30),
    slaDeadlineAt: days(1),
    assignedTo: "Solomon A.",
    notes: [],
  },
  {
    id: "r-4",
    reference: "RPT-26-00409",
    type: "USER",
    priority: "LOW",
    status: "OPEN",
    targetSummary: "Member profile - incomplete bio and offensive profile photo",
    targetAuthorId: "m-6",
    targetAuthorName: "Mary Wanjiku",
    targetChapterCode: "STRATH",
    reportedById: "m-2",
    reportedByName: "David Ochieng",
    priorReportsOnTarget: 0,
    createdAt: hours(-48),
    slaDeadlineAt: days(3),
    notes: [],
  },
  {
    id: "r-5",
    reference: "RPT-26-00408",
    type: "GROUP",
    priority: "HIGH",
    status: "RESOLVED",
    targetSummary: "Group \"Crypto Signals Kenya\" - unapproved commercial activity",
    targetAuthorId: "m-7",
    targetAuthorName: "Samuel Otieno",
    targetChapterCode: "UON",
    reportedById: "m-5",
    reportedByName: "Esther Mwangi",
    priorReportsOnTarget: 1,
    createdAt: days(-3),
    slaDeadlineAt: days(-2),
    assignedTo: "Solomon A.",
    notes: [
      { id: "n-2", author: "Solomon A.", at: days(-2), body: "Group archived. Owner notified." },
    ],
  },
  {
    id: "r-6",
    reference: "RPT-26-00407",
    type: "COMMENT",
    priority: "LOW",
    status: "DISMISSED",
    targetSummary: "Comment on cohort discussion - mild disagreement, not a guideline breach",
    targetAuthorId: "m-3",
    targetAuthorName: "Faith Njeri",
    targetChapterCode: "STRATH",
    reportedById: "m-1",
    reportedByName: "Grace Wanjiru",
    priorReportsOnTarget: 0,
    createdAt: days(-5),
    slaDeadlineAt: days(-2),
    assignedTo: "Solomon A.",
    notes: [
      { id: "n-3", author: "Solomon A.", at: days(-4), body: "Dismissed. No action warranted." },
    ],
  },
];

export const seedContent: ContentItem[] = [
  { id: "c-1", type: "POST", snippet: "Investing with integrity means…", body: "Investing with integrity means being transparent with your community and your family. It means refusing the shortcuts that compromise the next generation.", authorId: "m-1", authorName: "Grace Wanjiru", chapterCode: "KU", createdAt: days(-4), reportCount: 0 },
  { id: "c-2", type: "COMMENT", snippet: "That is naive.", body: "That is naive. Nobody builds real wealth by being polite about money.", authorId: "m-2", authorName: "David Ochieng", chapterCode: "UON", createdAt: hours(-8), reportCount: 3, removedAt: hours(-2), removedBy: "Solomon A." },
  { id: "c-3", type: "POST", snippet: "Crypto signals, guaranteed…", body: "Crypto signals, guaranteed 30% monthly. DM me to join the private group.", authorId: "m-7", authorName: "Samuel Otieno", chapterCode: "UON", createdAt: days(-3), reportCount: 2, removedAt: days(-2), removedBy: "Solomon A." },
  { id: "c-4", type: "POST", snippet: "Corporate ethics in the Kenyan market…", body: "Corporate ethics in the Kenyan market is not a cost. It is a competitive advantage for the next decade.", authorId: "m-4", authorName: "James Kariuki", chapterCode: "KU", createdAt: days(-6), reportCount: 0 },
  { id: "c-5", type: "COMMENT", snippet: "I disagree with the premise…", body: "I disagree with the premise of the module. Markets reward speed more than ethics.", authorId: "m-2", authorName: "David Ochieng", chapterCode: "UON", createdAt: days(-5), reportCount: 1 },
];

export const seedGroups: Group[] = [
  { id: "g-1", name: "Crypto Signals Kenya", type: "INTEREST", visibility: "OPEN", ownerId: "m-7", ownerName: "Samuel Otieno", chapterCode: "UON", memberCount: 34, reports30d: 2, lastActivityAt: days(-3), status: "ARCHIVED" },
  { id: "g-2", name: "Marketplace Ethics Study", type: "STUDY", visibility: "CLOSED", ownerId: "m-4", ownerName: "James Kariuki", chapterCode: "KU", memberCount: 12, reports30d: 0, lastActivityAt: hours(-12), status: "ACTIVE" },
  { id: "g-3", name: "Governance Reading Circle", type: "STUDY", visibility: "OPEN", ownerId: "m-3", ownerName: "Faith Njeri", chapterCode: "STRATH", memberCount: 27, reports30d: 0, lastActivityAt: hours(-4), status: "ACTIVE" },
  { id: "g-4", name: "Women in Tech Kenya", type: "INTEREST", visibility: "OPEN", ownerId: "m-1", ownerName: "Grace Wanjiru", chapterCode: "KU", memberCount: 45, reports30d: 1, lastActivityAt: hours(-30), status: "WATCHED" },
  { id: "g-5", name: "Kisumu Chapter", type: "CHAPTER", visibility: "CLOSED", ownerId: "m-8", ownerName: "Ruth Ochieng", chapterCode: "KSM", memberCount: 18, reports30d: 0, lastActivityAt: days(-1), status: "ACTIVE" },
];

export const seedSafeguardingCases: SafeguardingCase[] = [
  {
    id: "sc-1",
    reference: "SGC-26-0007",
    severity: "CRITICAL",
    status: "INVESTIGATING",
    reportId: "r-2",
    subjectId: "m-9",
    subjectName: "Peter Mwangi",
    isMinor: false,
    reporterId: "m-3",
    reporterName: "Faith Njeri",
    assignedTo: "Solomon A.",
    narrative: [
      { id: "sn-1", category: "OBSERVATION", author: "Solomon A.", at: days(-1), body: "Message thread shows repeated unsolicited contact after clear refusal." },
    ],
    authorityLog: [],
    createdAt: days(-1),
  },
  {
    id: "sc-2",
    reference: "SGC-26-0006",
    severity: "HIGH",
    status: "AWAITING_AUTHORITY",
    subjectId: "m-10",
    subjectName: "Brian Kimani",
    isMinor: true,
    reporterId: "m-6",
    reporterName: "Mary Wanjiku",
    assignedTo: "Solomon A.",
    narrative: [
      { id: "sn-2", category: "OBSERVATION", author: "Solomon A.", at: days(-4), body: "Reporting member advises subject is 17. Age verification pending." },
      { id: "sn-3", category: "ACTION", author: "Solomon A.", at: days(-3), body: "Notified Compliance Lead. Restricted subject account pending review." },
    ],
    authorityLog: [
      { id: "al-1", authority: "Children's Officer", method: "Phone", summary: "Initial case referral", outcome: "Awaiting callback", at: days(-3), by: "Solomon A." },
    ],
    createdAt: days(-4),
  },
  {
    id: "sc-3",
    reference: "SGC-26-0005",
    severity: "MEDIUM",
    status: "CLOSED",
    subjectId: "m-11",
    subjectName: "Catherine Njoki",
    isMinor: false,
    assignedTo: "Solomon A.",
    narrative: [
      { id: "sn-4", category: "OBSERVATION", author: "Solomon A.", at: days(-12), body: "Subject reported inappropriate behaviour by a member. Investigation found no breach." },
      { id: "sn-5", category: "OUTCOME", author: "Solomon A.", at: days(-8), body: "No further action. Reporter notified. Case closed with Compliance Lead sign-off." },
    ],
    authorityLog: [],
    createdAt: days(-12),
    closedAt: days(-8),
    closedReason: "No breach identified. Reported in good faith.",
  },
];

export const seedMentorApplications: MentorApplication[] = [
  {
    id: "ma-1",
    reference: "MNT-26-0012",
    userId: "m-12",
    userName: "Paul Kamau",
    memberNumber: "TEG-26-KU-0088",
    focusCategories: ["CAREER", "LEADERSHIP"],
    submittedAt: days(-3),
    stage: "BACKGROUND_CHECK",
    backgroundCheck: "IN_PROGRESS",
    codeAccepted: true,
    status: "PENDING",
    notes: [],
  },
  {
    id: "ma-2",
    reference: "MNT-26-0011",
    userId: "m-13",
    userName: "Grace Achieng",
    memberNumber: "TEG-26-UON-0091",
    focusCategories: ["ENTREPRENEURSHIP", "GOVERNANCE"],
    submittedAt: days(-6),
    stage: "DECISION",
    backgroundCheck: "CLEAR",
    codeAccepted: true,
    status: "PENDING",
    notes: [
      { id: "mn-1", author: "Solomon A.", at: days(-2), body: "Reference checks clean. Ready for approval." },
    ],
  },
  {
    id: "ma-3",
    reference: "MNT-26-0010",
    userId: "m-14",
    userName: "Joseph Barasa",
    memberNumber: "TEG-26-STRATH-0072",
    focusCategories: ["TECHNOLOGY", "FAITH"],
    submittedAt: days(-10),
    stage: "CODE_OF_CONDUCT",
    backgroundCheck: "CLEAR",
    codeAccepted: false,
    status: "PENDING",
    notes: [],
  },
  {
    id: "ma-4",
    reference: "MNT-26-0009",
    userId: "m-15",
    userName: "Anne Muthoni",
    memberNumber: "TEG-26-KU-0065",
    focusCategories: ["CAREER", "TECHNOLOGY"],
    submittedAt: days(-14),
    stage: "DECISION",
    backgroundCheck: "ADVERSE",
    codeAccepted: true,
    status: "REJECTED",
    notes: [
      { id: "mn-2", author: "Solomon A.", at: days(-10), body: "Adverse background check result. Notified applicant per policy." },
    ],
  },
  {
    id: "ma-5",
    reference: "MNT-26-0008",
    userId: "m-16",
    userName: "Michael Waweru",
    memberNumber: "TEG-26-UON-0055",
    focusCategories: ["LEADERSHIP"],
    submittedAt: days(-20),
    stage: "DECISION",
    backgroundCheck: "CLEAR",
    codeAccepted: true,
    status: "APPROVED",
    notes: [],
  },
];

export const seedBans: BanRecord[] = [
  {
    id: "b-1",
    memberId: "m-7",
    memberName: "Samuel Otieno",
    memberNumber: "TEG-26-UON-0021",
    reasonCategory: "Unapproved commercial activity",
    reasonNote: "Repeated promotion of unlicensed financial services to members.",
    duration: "TEMPORARY_30D",
    issuedBy: "Solomon A.",
    issuedAt: days(-2),
    expiresAt: days(28),
    status: "ACTIVE",
    appealStatus: "NONE",
  },
  {
    id: "b-2",
    memberId: "m-17",
    memberName: "Daniel Kiptoo",
    memberNumber: "TEG-26-KU-0043",
    reasonCategory: "Harassment",
    reasonNote: "Repeated hostile messages to multiple members after warning.",
    duration: "TEMPORARY_90D",
    issuedBy: "Solomon A.",
    issuedAt: days(-20),
    expiresAt: days(70),
    status: "ACTIVE",
    appealStatus: "PENDING",
  },
  {
    id: "b-3",
    memberId: "m-18",
    memberName: "Kevin Omondi",
    memberNumber: "TEG-26-STRATH-0060",
    reasonCategory: "Fraud attempt",
    reasonNote: "Attempted fraudulent OTC transaction.",
    duration: "PERMANENT",
    issuedBy: "SUPER_ADMIN",
    issuedAt: days(-45),
    status: "ACTIVE",
    appealStatus: "DENIED",
  },
];

export const seedBlocks: BlockRecord[] = [
  { id: "bl-1", blockerId: "m-1", blockerName: "Grace Wanjiru", blockedId: "m-2", blockedName: "David Ochieng", since: days(-5), source: "SELF", active: true },
  { id: "bl-2", blockerId: "m-3", blockerName: "Faith Njeri", blockedId: "m-9", blockedName: "Peter Mwangi", since: days(-1), source: "SELF", active: true },
  { id: "bl-3", blockerId: "m-5", blockerName: "Esther Mwangi", blockedId: "m-7", blockedName: "Samuel Otieno", since: days(-10), source: "REPORT_ACTION", active: true },
  { id: "bl-4", blockerId: "m-6", blockerName: "Mary Wanjiku", blockedId: "m-17", blockedName: "Daniel Kiptoo", since: days(-25), source: "SELF", active: true },
  { id: "bl-5", blockerId: "m-4", blockerName: "James Kariuki", blockedId: "m-18", blockedName: "Kevin Omondi", since: days(-40), source: "REPORT_ACTION", active: true },
];

export const seedModerationSummary: ModerationSummary = {
  reportsReceived: 87,
  medianFirstResponseH: 3.4,
  medianResolutionH: 26.8,
  resolutionRate: 0.91,
  repeatReporterRate: 0.14,
  resolutionMix: {
    removed: 32,
    warned: 18,
    suspended: 4,
    escalated: 6,
    dismissed: 27,
  },
  responseBuckets: [
    { bucket: "0-4h", count: 41 },
    { bucket: "4-8h", count: 22 },
    { bucket: "8-12h", count: 11 },
    { bucket: "12-24h", count: 8 },
    { bucket: "24h+", count: 5 },
  ],
  topOffenders: [
    { memberNumber: "TEG-26-UON-0021", reports: 5, actions: 3 },
    { memberNumber: "TEG-26-KU-0043", reports: 4, actions: 2 },
    { memberNumber: "TEG-26-UON-0031", reports: 3, actions: 1 },
    { memberNumber: "TEG-26-STRATH-0060", reports: 2, actions: 2 },
  ],
  topReporters: [
    { memberNumber: "TEG-26-UON-0011", reports: 6, dismissed: 1 },
    { memberNumber: "TEG-26-KU-0042", reports: 4, dismissed: 1 },
    { memberNumber: "TEG-26-STRATH-0027", reports: 3, dismissed: 0 },
  ],
  topChapters: [
    { chapterCode: "UON", reports: 31, per100: 4.2 },
    { chapterCode: "KU", reports: 24, per100: 3.1 },
    { chapterCode: "STRATH", reports: 18, per100: 2.8 },
    { chapterCode: "KSM", reports: 9, per100: 1.9 },
    { chapterCode: "NAIROBI_PROF", reports: 5, per100: 0.8 },
  ],
};

// ---------- Accessors with RLS simulation ----------

export function getReports(): Report[] {
  if (!canViewModeration()) return [];
  const u = getCurrentUser();
  const all = [...seedReports].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (isChapterLeaderScoped()) {
    return all.filter((r) => r.targetChapterCode === u.chapterCode);
  }
  return all;
}

export function getReportById(id: string): Report | null {
  if (!canViewModeration()) return null;
  const r = seedReports.find((x) => x.id === id) ?? null;
  if (!r) return null;
  const u = getCurrentUser();
  if (isChapterLeaderScoped() && r.targetChapterCode !== u.chapterCode) return null;
  return r;
}

export function getContent(): ContentItem[] {
  if (!canViewModeration()) return [];
  const u = getCurrentUser();
  if (isChapterLeaderScoped()) {
    return seedContent.filter((c) => c.chapterCode === u.chapterCode);
  }
  return [...seedContent];
}

export function getGroups(): Group[] {
  if (!canViewModeration()) return [];
  const u = getCurrentUser();
  if (isChapterLeaderScoped()) {
    return seedGroups.filter((g) => g.chapterCode === u.chapterCode);
  }
  return [...seedGroups];
}

export function getSafeguardingCases(): SafeguardingCase[] {
  if (!canViewSafeguarding()) return [];
  const u = getCurrentUser();
  if (u.role === "SUPER_ADMIN" || u.role === "COMPLIANCE_LEAD") return [...seedSafeguardingCases];
  return seedSafeguardingCases.filter((c) => c.assignedTo === u.name);
}

export function getSafeguardingCaseById(id: string): SafeguardingCase | null {
  if (!canViewSafeguarding()) return null;
  const c = seedSafeguardingCases.find((x) => x.id === id) ?? null;
  if (!c) return null;
  const u = getCurrentUser();
  if (u.role === "SUPER_ADMIN" || u.role === "COMPLIANCE_LEAD") return c;
  if (c.assignedTo !== u.name) return null;
  return c;
}

export function getMentorApplications(): MentorApplication[] {
  if (!canViewModeration()) return [];
  return [...seedMentorApplications];
}

export function getMentorApplicationById(id: string): MentorApplication | null {
  if (!canViewModeration()) return null;
  return seedMentorApplications.find((m) => m.id === id) ?? null;
}

export function getBans(): BanRecord[] {
  if (!canViewModeration()) return [];
  return [...seedBans];
}

export function getBlocks(): BlockRecord[] {
  if (!canViewModeration()) return [];
  return [...seedBlocks];
}

export function getModerationSummary(): ModerationSummary | null {
  if (!canViewModeration()) return null;
  return seedModerationSummary;
}

// ---------- Helpers ----------

export function reportAgeHours(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
}

export function slaRemainingHours(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 3600000);
}

export function isSlaBreached(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

// ---------- Labels ----------

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  POST: "Post",
  COMMENT: "Comment",
  MESSAGE: "Message",
  USER: "Member profile",
  GROUP: "Group",
};

export const REPORT_PRIORITY_LABELS: Record<ReportPriority, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  OPEN: "Open",
  IN_REVIEW: "In review",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed",
};

export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  STUDY: "Study",
  CHAPTER: "Chapter",
  MENTORSHIP: "Mentorship",
  INTEREST: "Interest",
};

export const GROUP_VISIBILITY_LABELS: Record<GroupVisibility, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
  SECRET: "Secret",
};

export const GROUP_STATUS_LABELS: Record<GroupStatus, string> = {
  ACTIVE: "Active",
  WATCHED: "Watched",
  ARCHIVED: "Archived",
  DELETED: "Deleted",
};

export const SAFEGUARDING_SEVERITY_LABELS: Record<SafeguardingSeverity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const SAFEGUARDING_STATUS_LABELS: Record<SafeguardingStatus, string> = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  AWAITING_AUTHORITY: "Awaiting authority",
  CLOSED: "Closed",
};

export const VETTING_STAGE_LABELS: Record<VettingStage, string> = {
  SUBMITTED: "Submitted",
  BACKGROUND_CHECK: "Background check",
  CODE_OF_CONDUCT: "Code of conduct",
  DECISION: "Decision",
};

export const CHECK_STATUS_LABELS: Record<CheckStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  CLEAR: "Clear",
  ADVERSE: "Adverse",
  INCONCLUSIVE: "Inconclusive",
};

export const VETTING_STATUS_LABELS: Record<VettingStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const FOCUS_CATEGORY_LABELS: Record<FocusCategory, string> = {
  CAREER: "Career",
  FAITH: "Faith",
  LEADERSHIP: "Leadership",
  ENTREPRENEURSHIP: "Entrepreneurship",
  TECHNOLOGY: "Technology",
  GOVERNANCE: "Governance",
};

export const BAN_DURATION_LABELS: Record<BanDuration, string> = {
  TEMPORARY_7D: "7 days",
  TEMPORARY_30D: "30 days",
  TEMPORARY_90D: "90 days",
  PERMANENT: "Permanent",
};

export const BAN_STATUS_LABELS: Record<BanStatus, string> = {
  ACTIVE: "Active",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};

export const APPEAL_STATUS_LABELS: Record<AppealStatus, string> = {
  NONE: "None",
  PENDING: "Pending",
  UPHELD: "Upheld",
  DENIED: "Denied",
};