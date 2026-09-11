// lib/mock/data-protection.ts
// PNL-16 Data Protection - mock infrastructure. Mirrors eventual API contracts.

import { getCurrentUser } from "./current-user";

export type DSRType = "ACCESS" | "RECTIFICATION" | "ERASURE" | "PORTABILITY";

export type DSRStatus =
  | "RECEIVED"
  | "VERIFYING_IDENTITY"
  | "IN_PROGRESS"
  | "AWAITING_INFO"
  | "EXTENDED"
  | "COMPLETED"
  | "COMPLETED_PARTIAL"
  | "REJECTED";

export interface DSRTimelineEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  note?: string;
}

export interface DataSubjectRequest {
  id: string;
  reference: string;
  type: DSRType;
  status: DSRStatus;
  memberId: string;
  memberName: string;
  memberNumber: string;
  memberEmail: string;
  scope: string;
  receivedAt: string;
  deadlineAt: string;
  extended: boolean;
  extensionReason?: string;
  identityVerifiedAt?: string;
  completedAt?: string;
  completionMethod?: "DELIVERED" | "ANONYMISED" | "RECTIFIED" | "REJECTED";
  deliveryChannel?: "EMAIL" | "IN_APP" | "POST";
  deliveryProof?: string;
  assignedTo: string;
  notes: string;
  timeline: DSRTimelineEntry[];
}

export type ConsentPurpose =
  | "MARKETING" | "ANALYTICS" | "PRAYER_REQUESTS"
  | "DATA_SHARING" | "RESEARCH" | "CROSS_BORDER_TRANSFER";

export type ConsentStatus = "GRANTED" | "WITHDRAWN" | "EXPIRED" | "PENDING";

export interface ConsentRecord {
  id: string;
  memberId: string;
  memberName: string;
  memberNumber: string;
  purpose: ConsentPurpose;
  version: string;
  status: ConsentStatus;
  grantedAt?: string;
  withdrawnAt?: string;
  consentTextHash: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ConsentVersion {
  id: string;
  purpose: ConsentPurpose;
  version: string;
  effectiveAt: string;
  summary: string;
  publishedBy: string;
  publishedAt: string;
}

export type BreachSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type BreachCategory = "CONFIDENTIALITY" | "INTEGRITY" | "AVAILABILITY";
export type BreachStatus = "REPORTED" | "INVESTIGATING" | "CONTAINED" | "NOTIFIED" | "CLOSED";

export interface BreachIncident {
  id: string;
  reference: string;
  title: string;
  description: string;
  severity: BreachSeverity;
  category: BreachCategory;
  status: BreachStatus;
  discoveredAt: string;
  notificationDeadlineAt: string;
  notifiedODPCAt?: string;
  notifiedSubjectsAt?: string;
  affectedCount: number;
  affectedDataTypes: string[];
  containmentActions: string;
  resolutionSummary?: string;
  reportedBy: string;
}

export interface RetentionPolicy {
  id: string;
  entityName: string;
  dataCategory: string;
  retentionPeriodDays: number;
  legalBasis: string;
  lastPurgeRunAt?: string;
  nextPurgeRunAt: string;
  recordsEligible: number;
  recordsPendingReview: number;
  status: "ACTIVE" | "SUSPENDED";
  owner: string;
}

export type LawfulBasis =
  | "CONSENT" | "CONTRACT" | "LEGAL_OBLIGATION"
  | "VITAL_INTERESTS" | "PUBLIC_TASK" | "LEGITIMATE_INTERESTS";

export interface ROPAEntry {
  id: string;
  processingName: string;
  purpose: string;
  lawfulBasis: LawfulBasis;
  dataCategories: string[];
  dataSubjects: string[];
  recipients: string[];
  crossBorderTransfers: string[];
  retentionPeriod: string;
  securityMeasures: string;
  dpiaRequired: boolean;
  dpiaCompletedAt?: string;
  lastReviewedAt?: string;
  nextReviewAt: string;
  status: "ACTIVE" | "UNDER_REVIEW" | "ARCHIVED";
}

// ---------- Permission helpers ----------

const DP_ROLES = ["DATA_PROTECTION_OFFICER", "ADMIN", "SUPER_ADMIN", "COMPLIANCE_LEAD"];
const DP_ACTION_ROLES = ["DATA_PROTECTION_OFFICER", "ADMIN", "SUPER_ADMIN"];

export function canViewDataProtection(): boolean {
  return DP_ROLES.includes(getCurrentUser().role);
}

export function canActionDSR(): boolean {
  return DP_ACTION_ROLES.includes(getCurrentUser().role);
}

export function canReportBreach(): boolean {
  return DP_ACTION_ROLES.includes(getCurrentUser().role);
}

export function canEditROPA(): boolean {
  return DP_ACTION_ROLES.includes(getCurrentUser().role);
}

export function canRunPurge(): boolean {
  const r = getCurrentUser().role;
  return ["DATA_PROTECTION_OFFICER", "SUPER_ADMIN"].includes(r);
}

// ---------- Seed data ----------

const now = new Date();
const days = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();
const hours = (n: number) => new Date(now.getTime() + n * 3600000).toISOString();

export const seedDSRs: DataSubjectRequest[] = [
  {
    id: "dsr-1", reference: "DSR-26-00412", type: "ACCESS", status: "IN_PROGRESS",
    memberId: "m-1", memberName: "Grace Wanjiru", memberNumber: "TEG-26-KU-0042",
    memberEmail: "grace.w@example.com", scope: "All personal data held",
    receivedAt: days(-5), deadlineAt: days(25), extended: false,
    identityVerifiedAt: days(-4), assignedTo: "Solomon A.",
    notes: "Verified via MFA challenge.",
    timeline: [
      { id: "t1", at: days(-5), actor: "System", action: "Request received via member self-service" },
      { id: "t2", at: days(-4), actor: "Solomon A.", action: "Identity verified" },
    ],
  },
  {
    id: "dsr-2", reference: "DSR-26-00411", type: "ERASURE", status: "RECEIVED",
    memberId: "m-2", memberName: "David Ochieng", memberNumber: "TEG-26-UON-0031",
    memberEmail: "david.o@example.com", scope: "Account and profile data",
    receivedAt: days(-2), deadlineAt: days(28), extended: false, assignedTo: "Solomon A.",
    notes: "Member has financial history - anonymisation path applies.",
    timeline: [{ id: "t1", at: days(-2), actor: "System", action: "Request received via email" }],
  },
  {
    id: "dsr-3", reference: "DSR-26-00410", type: "PORTABILITY", status: "COMPLETED",
    memberId: "m-3", memberName: "Faith Njeri", memberNumber: "TEG-26-STRATH-0027",
    memberEmail: "faith.n@example.com", scope: "Course progress and certificates",
    receivedAt: days(-30), deadlineAt: days(-1), extended: false,
    identityVerifiedAt: days(-29), completedAt: days(-3), completionMethod: "DELIVERED",
    deliveryChannel: "EMAIL", deliveryProof: "JSON export emailed - msg_8x2n",
    assignedTo: "Solomon A.", notes: "",
    timeline: [
      { id: "t1", at: days(-30), actor: "System", action: "Request received" },
      { id: "t2", at: days(-29), actor: "Solomon A.", action: "Identity verified" },
      { id: "t3", at: days(-3), actor: "Solomon A.", action: "JSON export delivered by email" },
    ],
  },
  {
    id: "dsr-4", reference: "DSR-26-00409", type: "RECTIFICATION", status: "AWAITING_INFO",
    memberId: "m-4", memberName: "James Kariuki", memberNumber: "TEG-26-KU-0018",
    memberEmail: "james.k@example.com", scope: "Correct date of birth",
    receivedAt: days(-10), deadlineAt: days(20), extended: false,
    identityVerifiedAt: days(-9), assignedTo: "Solomon A.",
    notes: "Awaiting proof of correct DOB.",
    timeline: [
      { id: "t1", at: days(-10), actor: "System", action: "Request received" },
      { id: "t2", at: days(-9), actor: "Solomon A.", action: "Identity verified" },
      { id: "t3", at: days(-8), actor: "Solomon A.", action: "Requested supporting document" },
    ],
  },
  {
    id: "dsr-5", reference: "DSR-26-00408", type: "ACCESS", status: "EXTENDED",
    memberId: "m-5", memberName: "Esther Mwangi", memberNumber: "TEG-26-UON-0011",
    memberEmail: "esther.m@example.com", scope: "All personal data held",
    receivedAt: days(-35), deadlineAt: days(25), extended: true,
    extensionReason: "Complex request spanning multiple data stores.",
    identityVerifiedAt: days(-33), assignedTo: "Solomon A.",
    notes: "Extension applied under DPA s.28.",
    timeline: [
      { id: "t1", at: days(-35), actor: "System", action: "Request received" },
      { id: "t2", at: days(-33), actor: "Solomon A.", action: "Identity verified" },
      { id: "t3", at: days(-5), actor: "Solomon A.", action: "Deadline extended by 30 days" },
    ],
  },
];

export const seedConsents: ConsentRecord[] = [
  { id: "c-1", memberId: "m-1", memberName: "Grace Wanjiru", memberNumber: "TEG-26-KU-0042", purpose: "MARKETING", version: "1.2", status: "GRANTED", grantedAt: days(-180), consentTextHash: "sha256:ab12..." },
  { id: "c-2", memberId: "m-1", memberName: "Grace Wanjiru", memberNumber: "TEG-26-KU-0042", purpose: "ANALYTICS", version: "1.0", status: "GRANTED", grantedAt: days(-180), consentTextHash: "sha256:cd34..." },
  { id: "c-3", memberId: "m-2", memberName: "David Ochieng", memberNumber: "TEG-26-UON-0031", purpose: "MARKETING", version: "1.2", status: "WITHDRAWN", grantedAt: days(-200), withdrawnAt: days(-10), consentTextHash: "sha256:ab12..." },
  { id: "c-4", memberId: "m-2", memberName: "David Ochieng", memberNumber: "TEG-26-UON-0031", purpose: "PRAYER_REQUESTS", version: "1.0", status: "GRANTED", grantedAt: days(-150), consentTextHash: "sha256:ef56..." },
  { id: "c-5", memberId: "m-3", memberName: "Faith Njeri", memberNumber: "TEG-26-STRATH-0027", purpose: "DATA_SHARING", version: "1.1", status: "GRANTED", grantedAt: days(-90), consentTextHash: "sha256:gh78..." },
  { id: "c-6", memberId: "m-4", memberName: "James Kariuki", memberNumber: "TEG-26-KU-0018", purpose: "CROSS_BORDER_TRANSFER", version: "1.0", status: "PENDING", consentTextHash: "sha256:ij90..." },
];

export const seedConsentVersions: ConsentVersion[] = [
  { id: "cv-1", purpose: "MARKETING", version: "1.0", effectiveAt: days(-400), summary: "Initial marketing consent text.", publishedBy: "DPO", publishedAt: days(-400) },
  { id: "cv-2", purpose: "MARKETING", version: "1.1", effectiveAt: days(-250), summary: "Added SMS channel to marketing scope.", publishedBy: "DPO", publishedAt: days(-250) },
  { id: "cv-3", purpose: "MARKETING", version: "1.2", effectiveAt: days(-100), summary: "Material change: added profiling for personalisation. Re-consent required.", publishedBy: "DPO", publishedAt: days(-100) },
  { id: "cv-4", purpose: "ANALYTICS", version: "1.0", effectiveAt: days(-300), summary: "Initial analytics consent text.", publishedBy: "DPO", publishedAt: days(-300) },
  { id: "cv-5", purpose: "PRAYER_REQUESTS", version: "1.0", effectiveAt: days(-200), summary: "Prayer request processing - short retention, restricted access.", publishedBy: "DPO", publishedAt: days(-200) },
];

export const seedBreaches: BreachIncident[] = [
  {
    id: "b-1", reference: "BRC-26-0003",
    title: "Misconfigured S3 bucket exposed certificate PDFs",
    description: "A certificate PDF bucket was temporarily public for 47 minutes.",
    severity: "MEDIUM", category: "CONFIDENTIALITY", status: "CONTAINED",
    discoveredAt: hours(-30), notificationDeadlineAt: hours(42),
    affectedCount: 12, affectedDataTypes: ["Name", "Certificate ID"],
    containmentActions: "Bucket policy reverted. CloudFront cache invalidated. Access logs reviewed.",
    reportedBy: "DevOps",
  },
  {
    id: "b-2", reference: "BRC-26-0002",
    title: "Phishing attempt against admin account",
    description: "Three admins received a phishing email mimicking the login page.",
    severity: "HIGH", category: "CONFIDENTIALITY", status: "NOTIFIED",
    discoveredAt: days(-4), notificationDeadlineAt: days(-4), notifiedODPCAt: days(-4),
    affectedCount: 0, affectedDataTypes: [],
    containmentActions: "Blocked sender domain. MFA enforced. Admin session tokens rotated.",
    reportedBy: "Security",
  },
  {
    id: "b-3", reference: "BRC-26-0001",
    title: "Backup restore test discovered unencrypted snapshot",
    description: "A quarterly restore test found one old database snapshot without encryption.",
    severity: "LOW", category: "CONFIDENTIALITY", status: "CLOSED",
    discoveredAt: days(-45), notificationDeadlineAt: days(-45),
    affectedCount: 0, affectedDataTypes: [],
    containmentActions: "Snapshot deleted. Backup encryption policy enforced.",
    resolutionSummary: "No evidence of access. Policy fix deployed. Closed.",
    reportedBy: "DevOps",
  },
];

export const seedRetentionPolicies: RetentionPolicy[] = [
  { id: "r-1", entityName: "member_profile", dataCategory: "Identity", retentionPeriodDays: 2555, legalBasis: "Contract", lastPurgeRunAt: days(-1), nextPurgeRunAt: days(6), recordsEligible: 0, recordsPendingReview: 0, status: "ACTIVE", owner: "DPO" },
  { id: "r-2", entityName: "application", dataCategory: "Pre-membership", retentionPeriodDays: 365, legalBasis: "Consent", lastPurgeRunAt: days(-1), nextPurgeRunAt: days(6), recordsEligible: 42, recordsPendingReview: 5, status: "ACTIVE", owner: "DPO" },
  { id: "r-3", entityName: "prayer_request", dataCategory: "Special category", retentionPeriodDays: 30, legalBasis: "Consent", lastPurgeRunAt: days(-1), nextPurgeRunAt: days(6), recordsEligible: 128, recordsPendingReview: 0, status: "ACTIVE", owner: "DPO" },
  { id: "r-4", entityName: "transaction", dataCategory: "Financial", retentionPeriodDays: 2555, legalBasis: "Legal obligation", lastPurgeRunAt: days(-1), nextPurgeRunAt: days(6), recordsEligible: 0, recordsPendingReview: 0, status: "ACTIVE", owner: "Finance" },
  { id: "r-5", entityName: "audit_log", dataCategory: "Audit", retentionPeriodDays: 2555, legalBasis: "Legal obligation", lastPurgeRunAt: days(-1), nextPurgeRunAt: days(6), recordsEligible: 0, recordsPendingReview: 0, status: "ACTIVE", owner: "Compliance" },
  { id: "r-6", entityName: "notification", dataCategory: "Operational", retentionPeriodDays: 180, legalBasis: "Legitimate interests", lastPurgeRunAt: days(-1), nextPurgeRunAt: days(6), recordsEligible: 1204, recordsPendingReview: 0, status: "ACTIVE", owner: "DPO" },
];

export const seedROPA: ROPAEntry[] = [
  { id: "ropa-1", processingName: "Membership application processing", purpose: "Assess and admit members to TEG", lawfulBasis: "CONSENT", dataCategories: ["Identity", "Contact", "Education", "Faith affiliation"], dataSubjects: ["Applicants", "Members"], recipients: ["TEG Admin", "Chapter leaders (own chapter)"], crossBorderTransfers: [], retentionPeriod: "7 years after membership ends", securityMeasures: "Field-level encryption on DOB and phone; RLS; audit logging", dpiaRequired: true, dpiaCompletedAt: days(-60), lastReviewedAt: days(-30), nextReviewAt: days(335), status: "ACTIVE" },
  { id: "ropa-2", processingName: "Course delivery and certification", purpose: "Deliver cohort learning and issue certificates", lawfulBasis: "CONTRACT", dataCategories: ["Learning progress", "Assignments", "Assessment scores"], dataSubjects: ["Members"], recipients: ["Instructors", "Mentors"], crossBorderTransfers: [], retentionPeriod: "7 years after certificate issue", securityMeasures: "RLS scoped to cohort; audit; append-only certificate ledger", dpiaRequired: false, lastReviewedAt: days(-45), nextReviewAt: days(320), status: "ACTIVE" },
  { id: "ropa-3", processingName: "Prayer requests", purpose: "Pastoral care and support", lawfulBasis: "CONSENT", dataCategories: ["Special category - health, family, financial distress"], dataSubjects: ["Members"], recipients: ["Pastoral team"], crossBorderTransfers: [], retentionPeriod: "30 days", securityMeasures: "Restricted access; not indexed in general search; auto-purge", dpiaRequired: true, dpiaCompletedAt: days(-40), lastReviewedAt: days(-20), nextReviewAt: days(345), status: "ACTIVE" },
  { id: "ropa-4", processingName: "Payments and reconciliation", purpose: "Process payments for events, shop, courses, donations", lawfulBasis: "CONTRACT", dataCategories: ["Transaction", "Payment method", "Billing address"], dataSubjects: ["Members", "Donors"], recipients: ["Licensed PSP", "Finance team"], crossBorderTransfers: ["PSP may process in EU"], retentionPeriod: "7 years", securityMeasures: "Field-level encryption; four-eyes on refunds; append-only ledger", dpiaRequired: true, dpiaCompletedAt: days(-90), lastReviewedAt: days(-30), nextReviewAt: days(335), status: "ACTIVE" },
  { id: "ropa-5", processingName: "KYC and AML screening", purpose: "Meet regulatory obligations for regulated financial services", lawfulBasis: "LEGAL_OBLIGATION", dataCategories: ["Identity documents", "Liveness", "Sanctions hits", "PEP status"], dataSubjects: ["Members"], recipients: ["Compliance team", "KYC provider", "Screening provider"], crossBorderTransfers: ["KYC provider processes in EU"], retentionPeriod: "7 years after relationship ends", securityMeasures: "Field-level encryption; restricted access; audit; vendor DPAs", dpiaRequired: true, dpiaCompletedAt: days(-50), lastReviewedAt: days(-15), nextReviewAt: days(350), status: "ACTIVE" },
];

// ---------- Accessors (RLS simulated) ----------

export function getDSRs(): DataSubjectRequest[] {
  if (!canViewDataProtection()) return [];
  return [...seedDSRs].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export function getDSRById(id: string): DataSubjectRequest | null {
  if (!canViewDataProtection()) return null;
  return seedDSRs.find((d) => d.id === id) ?? null;
}

export function getConsents(): ConsentRecord[] {
  if (!canViewDataProtection()) return [];
  return seedConsents;
}

export function getConsentVersions(): ConsentVersion[] {
  if (!canViewDataProtection()) return [];
  return seedConsentVersions;
}

export function getBreaches(): BreachIncident[] {
  if (!canViewDataProtection()) return [];
  return [...seedBreaches].sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt));
}

export function getRetentionPolicies(): RetentionPolicy[] {
  if (!canViewDataProtection()) return [];
  return seedRetentionPolicies;
}

export function getROPA(): ROPAEntry[] {
  if (!canViewDataProtection()) return [];
  return seedROPA;
}

export function hoursUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 3600000);
}

export function daysUntil(iso: string): number {
  return Math.round((new Date(iso).getTime() - Date.now()) / 86400000);
}

export function isOverdue(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

// ---------- Labels ----------

export const DSR_TYPE_LABELS: Record<DSRType, string> = {
  ACCESS: "Access", RECTIFICATION: "Rectification",
  ERASURE: "Erasure", PORTABILITY: "Portability",
};

export const DSR_STATUS_LABELS: Record<DSRStatus, string> = {
  RECEIVED: "Received", VERIFYING_IDENTITY: "Verifying identity",
  IN_PROGRESS: "In progress", AWAITING_INFO: "Awaiting info",
  EXTENDED: "Extended", COMPLETED: "Completed",
  COMPLETED_PARTIAL: "Completed (partial)", REJECTED: "Rejected",
};

export const CONSENT_PURPOSE_LABELS: Record<ConsentPurpose, string> = {
  MARKETING: "Marketing", ANALYTICS: "Analytics",
  PRAYER_REQUESTS: "Prayer requests", DATA_SHARING: "Data sharing",
  RESEARCH: "Research", CROSS_BORDER_TRANSFER: "Cross-border transfer",
};

export const CONSENT_STATUS_LABELS: Record<ConsentStatus, string> = {
  GRANTED: "Granted", WITHDRAWN: "Withdrawn", EXPIRED: "Expired", PENDING: "Pending",
};

export const BREACH_SEVERITY_LABELS: Record<BreachSeverity, string> = {
  LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical",
};

export const BREACH_STATUS_LABELS: Record<BreachStatus, string> = {
  REPORTED: "Reported", INVESTIGATING: "Investigating",
  CONTAINED: "Contained", NOTIFIED: "Notified", CLOSED: "Closed",
};

export const LAWFUL_BASIS_LABELS: Record<LawfulBasis, string> = {
  CONSENT: "Consent", CONTRACT: "Contract",
  LEGAL_OBLIGATION: "Legal obligation", VITAL_INTERESTS: "Vital interests",
  PUBLIC_TASK: "Public task", LEGITIMATE_INTERESTS: "Legitimate interests",
};