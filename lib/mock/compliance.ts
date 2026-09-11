// lib/mock/compliance.ts
// PNL-15 Compliance — types, seed data, RLS-aware accessors, permission helpers.
//
// All money in integer minor units. All PII is mock; in production every field
// is encrypted at rest and access-restricted to the assigned analyst.

import { getCurrentUser } from "./current-user";
import type { MockUser } from "@/components/mock/data";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type KYCTier = 0 | 1 | 2;
export type KYCCaseStatus =
  | "SUBMITTED"
  | "IN_REVIEW"
  | "MORE_INFO_NEEDED"
  | "APPROVED"
  | "REJECTED";

export interface KYCCase {
  id: string;
  reference: string;               // KYC-26-XXXXX
  memberName: string;
  memberNumber: string;
  memberCountry: string;
  tier: KYCTier;
  status: KYCCaseStatus;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  assignee?: string;
  reason?: string;
  slaHours: number;
  documentCount: number;
}

export type AMLDisposition =
  | "PENDING"
  | "TRUE_POSITIVE"
  | "FALSE_POSITIVE"
  | "ESCALATED"
  | "SAR_FILED";

export type AMLAlertSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AMLAlert {
  id: string;
  reference: string;               // AML-26-XXXXX
  memberName: string;
  memberNumber: string;
  ruleCode: string;                // e.g. "VELOCITY_IN", "STRUCTURING"
  ruleName: string;
  severity: AMLAlertSeverity;
  amountMinor: number;
  currency: string;
  description: string;
  status: AMLDisposition;
  assignee?: string;
  raisedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
  sarReference?: string;
  slaHours: number;
}

export type SanctionsHitStatus =
  | "PENDING"
  | "CONFIRMED_TRUE"
  | "CONFIRMED_FALSE"
  | "ESCALATED";

export interface SanctionsHit {
  id: string;
  reference: string;               // SAN-26-XXXX
  subjectName: string;
  subjectMemberNumber: string;
  list: string;                    // "OFAC SDN", "UN Consolidated", "EU", "PEP"
  matchScore: number;              // 0-100
  status: SanctionsHitStatus;
  assignee?: string;
  raisedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
  slaHours: number;
}

export type SARStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "FILED"
  | "REJECTED"
  | "WITHDRAWN";

export interface SARCase {
  id: string;
  reference: string;               // SAR-26-XXX
  subjectName: string;
  subjectMemberNumber: string;
  linkedAlertId?: string;
  amountMinor: number;
  currency: string;
  narrative: string;
  status: SARStatus;
  draftedBy: string;
  draftedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  filedAt?: string;
  filingReference?: string;
  regulator: string;               // "FRC Kenya"
  reason?: string;
}

export interface MonitoringRule {
  id: string;
  code: string;                    // "VELOCITY_IN"
  name: string;
  description: string;
  severity: AMLAlertSeverity;
  enabled: boolean;
  thresholdMinor: number;
  windowHours: number;
  updatedAt: string;
  updatedBy: string;
}

export interface MemberRiskProfile {
  id: string;
  memberName: string;
  memberNumber: string;
  score: number;                   // 0-100
  band: "LOW" | "MEDIUM" | "HIGH";
  kycTier: KYCTier;
  jurisdiction: string;
  lastReviewedAt: string;
  flags: string[];
}

export type TravelRuleDirection = "SENT" | "RECEIVED";
export type TravelRuleStatus = "DELIVERED" | "FAILED" | "PENDING";

export interface TravelRuleMessage {
  id: string;
  reference: string;
  direction: TravelRuleDirection;
  counterpartyVasp: string;
  counterpartyCountry: string;
  transferReference: string;
  originator: string;
  beneficiary: string;
  amountMinor: number;
  currency: string;
  status: TravelRuleStatus;
  sentAt: string;
  deliveredAt?: string;
  failureReason?: string;
}

export type FilingStatus = "DRAFT" | "READY" | "SUBMITTED" | "ACKNOWLEDGED" | "OVERDUE";

export interface RegulatoryFiling {
  id: string;
  regulator: string;               // "CBK", "FRC", "ODPC", "SASRA"
  filingName: string;              // "Quarterly AML Return"
  period: string;                  // "2026-Q1"
  dueAt: string;
  status: FilingStatus;
  owner: string;
  submittedAt?: string;
  reference?: string;
}

export type ControlStatus = "EFFECTIVE" | "NEEDS_ATTENTION" | "FAILING" | "NOT_TESTED";

export interface ControlEvidence {
  id: string;
  code: string;                    // "C-AML-001"
  name: string;
  owner: string;
  lastTestedAt: string;
  nextReviewAt: string;
  status: ControlStatus;
  evidenceCount: number;
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────────

export const KYC_STATUS_LABELS: Record<KYCCaseStatus, string> = {
  SUBMITTED: "Submitted",
  IN_REVIEW: "In review",
  MORE_INFO_NEEDED: "More info needed",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const AML_STATUS_LABELS: Record<AMLDisposition, string> = {
  PENDING: "Pending",
  TRUE_POSITIVE: "True positive",
  FALSE_POSITIVE: "False positive",
  ESCALATED: "Escalated",
  SAR_FILED: "SAR filed",
};

export const AML_SEVERITY_LABELS: Record<AMLAlertSeverity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const SANCTIONS_STATUS_LABELS: Record<SanctionsHitStatus, string> = {
  PENDING: "Pending",
  CONFIRMED_TRUE: "Confirmed true",
  CONFIRMED_FALSE: "Confirmed false",
  ESCALATED: "Escalated",
};

export const SAR_STATUS_LABELS: Record<SARStatus, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending approval",
  FILED: "Filed",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const TRAVEL_RULE_STATUS_LABELS: Record<TravelRuleStatus, string> = {
  DELIVERED: "Delivered",
  FAILED: "Failed",
  PENDING: "Pending",
};

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  DRAFT: "Draft",
  READY: "Ready",
  SUBMITTED: "Submitted",
  ACKNOWLEDGED: "Acknowledged",
  OVERDUE: "Overdue",
};

export const CONTROL_STATUS_LABELS: Record<ControlStatus, string> = {
  EFFECTIVE: "Effective",
  NEEDS_ATTENTION: "Needs attention",
  FAILING: "Failing",
  NOT_TESTED: "Not tested",
};

export const KYC_TIER_LABELS: Record<KYCTier, string> = {
  0: "None",
  1: "Basic",
  2: "Full",
};

// ─────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────

export function formatMinor(minor: number, currency: string): string {
  const major = minor / 100;
  return `${currency} ${major.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ─────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────

const now = new Date();
const iso = (daysAgo: number, hoursAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();
const future = (hoursAhead: number) =>
  new Date(now.getTime() + hoursAhead * 3600000).toISOString();

export const seedKYCCases: KYCCase[] = [
  {
    id: "kyc-001",
    reference: "KYC-26-10021",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    memberCountry: "KE",
    tier: 1,
    status: "IN_REVIEW",
    submittedAt: iso(0, 3),
    assignee: "u-compliance-01",
    slaHours: 24,
    documentCount: 3,
  },
  {
    id: "kyc-002",
    reference: "KYC-26-10020",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    memberCountry: "KE",
    tier: 2,
    status: "SUBMITTED",
    submittedAt: iso(0, 1),
    slaHours: 24,
    documentCount: 4,
  },
  {
    id: "kyc-003",
    reference: "KYC-26-10019",
    memberName: "Esther Wambui",
    memberNumber: "TEG-26-UON-0122",
    memberCountry: "KE",
    tier: 2,
    status: "MORE_INFO_NEEDED",
    submittedAt: iso(2, 0),
    assignee: "u-compliance-01",
    reason: "Utility bill does not match registered address — please resubmit",
    slaHours: 24,
    documentCount: 4,
  },
  {
    id: "kyc-004",
    reference: "KYC-26-10018",
    memberName: "Samuel Otieno",
    memberNumber: "TEG-26-NRB-0044",
    memberCountry: "KE",
    tier: 1,
    status: "APPROVED",
    submittedAt: iso(3, 0),
    decidedAt: iso(2, 6),
    decidedBy: "u-compliance-01",
    reason: "Documents verified against registry",
    slaHours: 24,
    documentCount: 3,
  },
  {
    id: "kyc-005",
    reference: "KYC-26-10017",
    memberName: "Daniel Kipchoge",
    memberNumber: "TEG-26-STR-0055",
    memberCountry: "KE",
    tier: 2,
    status: "REJECTED",
    submittedAt: iso(5, 0),
    decidedAt: iso(4, 12),
    decidedBy: "u-compliance-01",
    reason: "Selfie/liveness check failed on three attempts; suspected synthetic identity",
    slaHours: 24,
    documentCount: 4,
  },
];

export const seedAMLAlerts: AMLAlert[] = [
  {
    id: "aml-001",
    reference: "AML-26-04012",
    memberName: "Faith Njeri",
    memberNumber: "TEG-26-STR-0014",
    ruleCode: "VELOCITY_IN",
    ruleName: "Velocity — inbound",
    severity: "HIGH",
    amountMinor: 2_589_000_00,
    currency: "KES",
    description: "12 inbound deposits over 4 hours, exceeding the velocity threshold of 5 per 4 hours.",
    status: "PENDING",
    raisedAt: iso(0, 2),
    slaHours: 48,
  },
  {
    id: "aml-002",
    reference: "AML-26-04011",
    memberName: "James Kariuki",
    memberNumber: "TEG-26-NRB-0031",
    ruleCode: "STRUCTURING",
    ruleName: "Structuring pattern",
    severity: "MEDIUM",
    amountMinor: 1_800_000_00,
    currency: "KES",
    description: "Three deposits of KES 600,000 each over 3 days, just below the KES 1,000,000 reporting threshold.",
    status: "PENDING",
    raisedAt: iso(0, 8),
    slaHours: 48,
  },
  {
    id: "aml-003",
    reference: "AML-26-04010",
    memberName: "Grace Wanjiru",
    memberNumber: "TEG-26-KU-0042",
    ruleCode: "OUT_CROSS_BORDER",
    ruleName: "Cross-border outbound",
    severity: "LOW",
    amountMinor: 500_00,
    currency: "KES",
    description: "Outbound remittance to Uganda; standard travel rule exchange completed.",
    status: "FALSE_POSITIVE",
    assignee: "u-compliance-01",
    raisedAt: iso(1, 4),
    decidedAt: iso(1, 2),
    decidedBy: "u-compliance-01",
    reason: "Standard corridor activity — no further action",
    slaHours: 48,
  },
  {
    id: "aml-004",
    reference: "AML-26-04009",
    memberName: "Esther Wambui",
    memberNumber: "TEG-26-UON-0122",
    ruleCode: "PEP_MATCH",
    ruleName: "PEP proximity match",
    severity: "CRITICAL",
    amountMinor: 5_000_00,
    currency: "KES",
    description: "Name matched a PEP list within 3 degrees of relation.",
    status: "ESCALATED",
    assignee: "u-compliance-01",
    raisedAt: iso(2, 6),
    decidedAt: iso(2, 3),
    decidedBy: "u-compliance-01",
    reason: "Escalated to Compliance Lead for enhanced due diligence",
    slaHours: 48,
  },
  {
    id: "aml-005",
    reference: "AML-26-04008",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    ruleCode: "ROUND_AMOUNT",
    ruleName: "Round-amount pattern",
    severity: "LOW",
    amountMinor: 10_000_00,
    currency: "KES",
    description: "Multiple round-number deposits across 7 days.",
    status: "TRUE_POSITIVE",
    assignee: "u-compliance-01",
    raisedAt: iso(3, 4),
    decidedAt: iso(3, 1),
    decidedBy: "u-compliance-01",
    reason: "Unusual pattern — SAR filed",
    sarReference: "SAR-26-0091",
    slaHours: 48,
  },
];

export const seedSanctionsHits: SanctionsHit[] = [
  {
    id: "san-001",
    reference: "SAN-26-0012",
    subjectName: "Esther Wambui",
    subjectMemberNumber: "TEG-26-UON-0122",
    list: "UN Consolidated",
    matchScore: 78,
    status: "PENDING",
    raisedAt: iso(0, 4),
    slaHours: 12,
  },
  {
    id: "san-002",
    reference: "SAN-26-0011",
    subjectName: "James Mwangi (member: James Kariuki)",
    subjectMemberNumber: "TEG-26-NRB-0031",
    list: "OFAC SDN",
    matchScore: 62,
    status: "CONFIRMED_FALSE",
    assignee: "u-compliance-01",
    raisedAt: iso(2, 2),
    decidedAt: iso(2, 1),
    decidedBy: "u-compliance-01",
    reason: "Common name; DOB and nationality do not match",
    slaHours: 12,
  },
  {
    id: "san-003",
    reference: "SAN-26-0010",
    subjectName: "David Ochieng",
    subjectMemberNumber: "TEG-26-UON-0088",
    list: "EU Consolidated",
    matchScore: 55,
    status: "CONFIRMED_FALSE",
    assignee: "u-compliance-01",
    raisedAt: iso(5, 3),
    decidedAt: iso(5, 2),
    decidedBy: "u-compliance-01",
    reason: "Low match score, no corroborating identifiers",
    slaHours: 12,
  },
];

export const seedSARs: SARCase[] = [
  {
    id: "sar-001",
    reference: "SAR-26-0091",
    subjectName: "Mercy Achieng",
    subjectMemberNumber: "TEG-26-KSM-0007",
    linkedAlertId: "aml-005",
    amountMinor: 10_000_00,
    currency: "KES",
    narrative:
      "The member placed twelve deposits of KES 10,000 each over a seven-day period, each just under the KES 1,000,000 reporting threshold when combined with prior-week activity. Pattern is consistent with structuring. Transaction monitoring rule ROUND_AMOUNT raised alert AML-26-04008 on the seventh day. The member has no prior AML history on the platform and self-declares a small business on the source-of-funds declaration. Recommend review under Section 44A of the Proceeds of Crime and Anti-Money Laundering Act.",
    status: "PENDING_APPROVAL",
    draftedBy: "u-compliance-01",
    draftedAt: iso(1, 6),
    regulator: "FRC Kenya",
  },
  {
    id: "sar-002",
    reference: "SAR-26-0090",
    subjectName: "Solomon Wasike",
    subjectMemberNumber: "TEG-26-KU-0002",
    amountMinor: 4_500_000_00,
    currency: "KES",
    narrative:
      "Reported for complete file. Withdrawn on 2026-04-02 after corroborating documentation was provided by the member showing licensed business income matching the deposit pattern.",
    status: "WITHDRAWN",
    draftedBy: "u-compliance-01",
    draftedAt: iso(10, 4),
    regulator: "FRC Kenya",
    reason: "Source-of-funds documentation provided and verified",
  },
  {
    id: "sar-003",
    reference: "SAR-26-0089",
    subjectName: "Peter Mwangi",
    subjectMemberNumber: "TEG-26-KU-0091",
    amountMinor: 2_000_000_00,
    currency: "KES",
    narrative:
      "Third-party deposit pattern with account taker over in excess of typical thresholds. Full narrative and supporting transaction graph attached in the D8.1 repository.",
    status: "FILED",
    draftedBy: "u-compliance-01",
    draftedAt: iso(20, 5),
    approvedBy: "u-compliance-lead",
    approvedAt: iso(19, 6),
    filedAt: iso(19, 2),
    filingReference: "FRC/2026/04/0231",
    regulator: "FRC Kenya",
  },
];

export const seedMonitoringRules: MonitoringRule[] = [
  {
    id: "rule-001",
    code: "VELOCITY_IN",
    name: "Velocity — inbound",
    description: "Fires when a member receives more than 5 inbound transfers in a 4-hour window.",
    severity: "HIGH",
    enabled: true,
    thresholdMinor: 500_000_00,
    windowHours: 4,
    updatedAt: iso(14),
    updatedBy: "u-compliance-lead",
  },
  {
    id: "rule-002",
    code: "STRUCTURING",
    name: "Structuring pattern",
    description: "Fires when 3+ deposits just below the KES 1,000,000 threshold occur within 72 hours.",
    severity: "MEDIUM",
    enabled: true,
    thresholdMinor: 999_999_00,
    windowHours: 72,
    updatedAt: iso(14),
    updatedBy: "u-compliance-lead",
  },
  {
    id: "rule-003",
    code: "OUT_CROSS_BORDER",
    name: "Cross-border outbound",
    description: "Fires on every outbound cross-border remittance for review.",
    severity: "LOW",
    enabled: true,
    thresholdMinor: 100_000_00,
    windowHours: 24,
    updatedAt: iso(14),
    updatedBy: "u-compliance-lead",
  },
  {
    id: "rule-004",
    code: "PEP_MATCH",
    name: "PEP proximity match",
    description: "Fires when member name matches a PEP list within 3 degrees of relation.",
    severity: "CRITICAL",
    enabled: true,
    thresholdMinor: 0,
    windowHours: 0,
    updatedAt: iso(30),
    updatedBy: "u-compliance-lead",
  },
  {
    id: "rule-005",
    code: "ROUND_AMOUNT",
    name: "Round-amount pattern",
    description: "Fires when 5+ round-number deposits appear within a 7-day window.",
    severity: "LOW",
    enabled: true,
    thresholdMinor: 1_000_000_00,
    windowHours: 168,
    updatedAt: iso(60),
    updatedBy: "u-compliance-lead",
  },
];

export const seedMemberRisk: MemberRiskProfile[] = [
  {
    id: "risk-001",
    memberName: "Faith Njeri",
    memberNumber: "TEG-26-STR-0014",
    score: 74,
    band: "HIGH",
    kycTier: 2,
    jurisdiction: "KE",
    lastReviewedAt: iso(2),
    flags: ["High velocity", "Recent high-value trades"],
  },
  {
    id: "risk-002",
    memberName: "Esther Wambui",
    memberNumber: "TEG-26-UON-0122",
    score: 68,
    band: "HIGH",
    kycTier: 2,
    jurisdiction: "KE",
    lastReviewedAt: iso(2),
    flags: ["PEP proximity match", "Pending EDD"],
  },
  {
    id: "risk-003",
    memberName: "James Kariuki",
    memberNumber: "TEG-26-NRB-0031",
    score: 52,
    band: "MEDIUM",
    kycTier: 2,
    jurisdiction: "KE",
    lastReviewedAt: iso(5),
    flags: ["Structuring pattern"],
  },
  {
    id: "risk-004",
    memberName: "Grace Wanjiru",
    memberNumber: "TEG-26-KU-0042",
    score: 22,
    band: "LOW",
    kycTier: 2,
    jurisdiction: "KE",
    lastReviewedAt: iso(30),
    flags: [],
  },
  {
    id: "risk-005",
    memberName: "David Ochieng",
    memberNumber: "TEG-26-UON-0088",
    score: 18,
    band: "LOW",
    kycTier: 2,
    jurisdiction: "KE",
    lastReviewedAt: iso(30),
    flags: [],
  },
];

export const seedTravelRule: TravelRuleMessage[] = [
  {
    id: "tr-001",
    reference: "TR-26-0088",
    direction: "SENT",
    counterpartyVasp: "MTN Uganda",
    counterpartyCountry: "UG",
    transferReference: "REM-26-50111",
    originator: "Grace Wanjiru (TEG-26-KU-0042)",
    beneficiary: "Achieng Odongo",
    amountMinor: 500_00,
    currency: "KES",
    status: "DELIVERED",
    sentAt: iso(0, 4),
    deliveredAt: iso(0, 4),
  },
  {
    id: "tr-002",
    reference: "TR-26-0087",
    direction: "SENT",
    counterpartyVasp: "MTN Rwanda",
    counterpartyCountry: "RW",
    transferReference: "REM-26-50110",
    originator: "David Ochieng (TEG-26-UON-0088)",
    beneficiary: "Jean Paul Habimana",
    amountMinor: 1_200_00,
    currency: "KES",
    status: "PENDING",
    sentAt: iso(0, 6),
  },
  {
    id: "tr-003",
    reference: "TR-26-0086",
    direction: "SENT",
    counterpartyVasp: "Vodacom Tanzania",
    counterpartyCountry: "TZ",
    transferReference: "REM-26-50109",
    originator: "Faith Njeri (TEG-26-STR-0014)",
    beneficiary: "Juma Mkapa",
    amountMinor: 800_00,
    currency: "KES",
    status: "FAILED",
    sentAt: iso(1, 2),
    failureReason: "Counterparty VASP returned 400 — beneficiary phone not registered",
  },
  {
    id: "tr-004",
    reference: "TR-26-0085",
    direction: "RECEIVED",
    counterpartyVasp: "Equity BCDC",
    counterpartyCountry: "CD",
    transferReference: "REM-26-50108",
    originator: "Denis Mutombo",
    beneficiary: "James Kariuki (TEG-26-NRB-0031)",
    amountMinor: 200_000_00,
    currency: "UGX",
    status: "DELIVERED",
    sentAt: iso(2, 8),
    deliveredAt: iso(2, 7),
  },
];

export const seedFilings: RegulatoryFiling[] = [
  {
    id: "fil-001",
    regulator: "FRC",
    filingName: "Quarterly AML Return",
    period: "2026-Q1",
    dueAt: future(48),
    status: "READY",
    owner: "u-compliance-lead",
  },
  {
    id: "fil-002",
    regulator: "CBK",
    filingName: "Monthly Payment Services Report",
    period: "2026-04",
    dueAt: future(120),
    status: "DRAFT",
    owner: "u-compliance-lead",
  },
  {
    id: "fil-003",
    regulator: "ODPC",
    filingName: "Annual Data Protection Compliance Report",
    period: "2025",
    dueAt: future(360),
    status: "DRAFT",
    owner: "u-compliance-lead",
  },
  {
    id: "fil-004",
    regulator: "SASRA",
    filingName: "Quarterly SACCO Return",
    period: "2026-Q1",
    dueAt: iso(2),
    status: "OVERDUE",
    owner: "u-compliance-lead",
  },
  {
    id: "fil-005",
    regulator: "CBK",
    filingName: "Quarterly Payment Services Return",
    period: "2025-Q4",
    dueAt: iso(20),
    status: "ACKNOWLEDGED",
    owner: "u-compliance-lead",
    submittedAt: iso(22),
    reference: "CBK/PSR/2025/Q4/0891",
  },
];

export const seedControls: ControlEvidence[] = [
  {
    id: "ctl-001",
    code: "C-AML-001",
    name: "Customer Due Diligence on onboarding",
    owner: "u-compliance-01",
    lastTestedAt: iso(7),
    nextReviewAt: future(720),
    status: "EFFECTIVE",
    evidenceCount: 24,
  },
  {
    id: "ctl-002",
    code: "C-AML-002",
    name: "Transaction monitoring rule coverage",
    owner: "u-compliance-lead",
    lastTestedAt: iso(14),
    nextReviewAt: future(1440),
    status: "EFFECTIVE",
    evidenceCount: 15,
  },
  {
    id: "ctl-003",
    code: "C-AML-003",
    name: "Sanctions and PEP screening",
    owner: "u-compliance-01",
    lastTestedAt: iso(30),
    nextReviewAt: future(360),
    status: "NEEDS_ATTENTION",
    evidenceCount: 8,
    notes: "One pending hit beyond SLA — resolved within hours but flagged for review.",
  },
  {
    id: "ctl-004",
    code: "C-AML-004",
    name: "SAR filing timeliness",
    owner: "u-compliance-lead",
    lastTestedAt: iso(20),
    nextReviewAt: future(480),
    status: "EFFECTIVE",
    evidenceCount: 6,
  },
  {
    id: "ctl-005",
    code: "C-DPA-001",
    name: "DPO appointment and DPIA currency",
    owner: "u-compliance-lead",
    lastTestedAt: iso(90),
    nextReviewAt: future(2160),
    status: "EFFECTIVE",
    evidenceCount: 4,
  },
  {
    id: "ctl-006",
    code: "C-CUS-001",
    name: "Custody key ceremony procedure",
    owner: "u-super-admin-01",
    lastTestedAt: iso(45),
    nextReviewAt: future(1440),
    status: "NOT_TESTED",
    evidenceCount: 3,
    notes: "Next scheduled ceremony will provide fresh evidence.",
  },
  {
    id: "ctl-007",
    code: "C-AUD-001",
    name: "Append-only audit log integrity",
    owner: "u-tech-lead",
    lastTestedAt: iso(3),
    nextReviewAt: future(1680),
    status: "EFFECTIVE",
    evidenceCount: 12,
  },
];

// ─────────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────────

type AllowedRole = MockUser["role"];

const COMPLIANCE_READERS: AllowedRole[] = [
  "COMPLIANCE_LEAD",
  "COMPLIANCE_ANALYST",
  "FINANCE_OFFICER",
  "ADMIN",
  "SUPER_ADMIN",
];

const COMPLIANCE_WRITERS: AllowedRole[] = [
  "COMPLIANCE_LEAD",
  "COMPLIANCE_ANALYST",
  "SUPER_ADMIN",
];

const COMPLIANCE_LEAD_ROLES: AllowedRole[] = ["COMPLIANCE_LEAD", "SUPER_ADMIN"];

function hasRole(user: MockUser | null, roles: AllowedRole[]): boolean {
  return user !== null && roles.includes(user.role);
}

export function canViewCompliance(): boolean {
  return hasRole(getCurrentUser(), COMPLIANCE_READERS);
}

export function canWorkCases(): boolean {
  return hasRole(getCurrentUser(), COMPLIANCE_WRITERS);
}

export function canApproveSARs(): boolean {
  return hasRole(getCurrentUser(), COMPLIANCE_LEAD_ROLES);
}

export function canManageRules(): boolean {
  return hasRole(getCurrentUser(), COMPLIANCE_LEAD_ROLES);
}

// Four-eyes: SAR cannot be approved by the analyst who drafted it
export function canApproveSAR(
  sar: { draftedBy: string } | null
): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, COMPLIANCE_LEAD_ROLES)) return false;
  if (!sar) return false;
  return sar.draftedBy !== user.id;
}

// ─────────────────────────────────────────────────────────────
// RLS-aware accessors
// ─────────────────────────────────────────────────────────────

export function getKYCCases(): KYCCase[] {
  if (!canViewCompliance()) return [];
  return [...seedKYCCases].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );
}

export function getKYCCaseById(id: string): KYCCase | null {
  if (!canViewCompliance()) return null;
  return seedKYCCases.find((c) => c.id === id) ?? null;
}

export function getAMLAlerts(): AMLAlert[] {
  if (!canViewCompliance()) return [];
  return [...seedAMLAlerts].sort((a, b) =>
    b.raisedAt.localeCompare(a.raisedAt)
  );
}

export function getAMLAlertById(id: string): AMLAlert | null {
  if (!canViewCompliance()) return null;
  return seedAMLAlerts.find((a) => a.id === id) ?? null;
}

export function getSanctionsHits(): SanctionsHit[] {
  if (!canViewCompliance()) return [];
  return [...seedSanctionsHits].sort((a, b) =>
    b.raisedAt.localeCompare(a.raisedAt)
  );
}

export function getSARs(): SARCase[] {
  if (!canViewCompliance()) return [];
  return [...seedSARs].sort((a, b) =>
    b.draftedAt.localeCompare(a.draftedAt)
  );
}

export function getMonitoringRules(): MonitoringRule[] {
  if (!canViewCompliance()) return [];
  return [...seedMonitoringRules].sort((a, b) =>
    a.code.localeCompare(b.code)
  );
}

export function getMemberRisk(): MemberRiskProfile[] {
  if (!canViewCompliance()) return [];
  return [...seedMemberRisk].sort((a, b) => b.score - a.score);
}

export function getTravelRuleMessages(): TravelRuleMessage[] {
  if (!canViewCompliance()) return [];
  return [...seedTravelRule].sort((a, b) =>
    b.sentAt.localeCompare(a.sentAt)
  );
}

export function getFilings(): RegulatoryFiling[] {
  if (!canViewCompliance()) return [];
  return [...seedFilings].sort((a, b) => a.dueAt.localeCompare(b.dueAt));
}

export function getControls(): ControlEvidence[] {
  if (!canViewCompliance()) return [];
  return [...seedControls].sort((a, b) =>
    a.code.localeCompare(b.code)
  );
}

// ─────────────────────────────────────────────────────────────
// Derived counts
// ─────────────────────────────────────────────────────────────

export function getKYCQueueCounts() {
  const cases = canViewCompliance() ? seedKYCCases : [];
  const nowIso = new Date().toISOString();
  const breachSla = (c: KYCCase) => {
    if (c.status === "APPROVED" || c.status === "REJECTED") return false;
    const submitted = new Date(c.submittedAt).getTime();
    const deadline = submitted + c.slaHours * 3600000;
    return deadline < Date.now() || (nowIso && false);
  };
  return {
    total: cases.length,
    pending: cases.filter((c) => c.status === "SUBMITTED" || c.status === "IN_REVIEW").length,
    moreInfo: cases.filter((c) => c.status === "MORE_INFO_NEEDED").length,
    approved: cases.filter((c) => c.status === "APPROVED").length,
    rejected: cases.filter((c) => c.status === "REJECTED").length,
    breachedSla: cases.filter(breachSla).length,
  };
}

export function getAMLQueueCounts() {
  const alerts = canViewCompliance() ? seedAMLAlerts : [];
  return {
    total: alerts.length,
    pending: alerts.filter((a) => a.status === "PENDING").length,
    escalated: alerts.filter((a) => a.status === "ESCALATED").length,
    truePositive: alerts.filter((a) => a.status === "TRUE_POSITIVE").length,
    falsePositive: alerts.filter((a) => a.status === "FALSE_POSITIVE").length,
    sarFiled: alerts.filter((a) => a.status === "SAR_FILED").length,
    critical: alerts.filter((a) => a.severity === "CRITICAL" && a.status === "PENDING").length,
  };
}

export function getSanctionsCounts() {
  const hits = canViewCompliance() ? seedSanctionsHits : [];
  return {
    total: hits.length,
    pending: hits.filter((h) => h.status === "PENDING").length,
    confirmedTrue: hits.filter((h) => h.status === "CONFIRMED_TRUE").length,
    confirmedFalse: hits.filter((h) => h.status === "CONFIRMED_FALSE").length,
    escalated: hits.filter((h) => h.status === "ESCALATED").length,
  };
}

export function getSARCounts() {
  const sars = canViewCompliance() ? seedSARs : [];
  return {
    total: sars.length,
    draft: sars.filter((s) => s.status === "DRAFT").length,
    pendingApproval: sars.filter((s) => s.status === "PENDING_APPROVAL").length,
    filed: sars.filter((s) => s.status === "FILED").length,
    rejected: sars.filter((s) => s.status === "REJECTED").length,
    withdrawn: sars.filter((s) => s.status === "WITHDRAWN").length,
  };
}

export function getTravelRuleCounts() {
  const messages = canViewCompliance() ? seedTravelRule : [];
  return {
    total: messages.length,
    delivered: messages.filter((m) => m.status === "DELIVERED").length,
    failed: messages.filter((m) => m.status === "FAILED").length,
    pending: messages.filter((m) => m.status === "PENDING").length,
  };
}

export function getFilingCounts() {
  const filings = canViewCompliance() ? seedFilings : [];
  const nowIso = new Date().toISOString();
  const overdue = filings.filter((f) => {
    if (f.status === "ACKNOWLEDGED" || f.status === "SUBMITTED") return false;
    return f.dueAt < nowIso;
  }).length;
  return {
    total: filings.length,
    draft: filings.filter((f) => f.status === "DRAFT").length,
    ready: filings.filter((f) => f.status === "READY").length,
    submitted: filings.filter((f) => f.status === "SUBMITTED").length,
    acknowledged: filings.filter((f) => f.status === "ACKNOWLEDGED").length,
    overdue,
  };
}

export function getControlCounts() {
  const controls = canViewCompliance() ? seedControls : [];
  return {
    total: controls.length,
    effective: controls.filter((c) => c.status === "EFFECTIVE").length,
    needsAttention: controls.filter((c) => c.status === "NEEDS_ATTENTION").length,
    failing: controls.filter((c) => c.status === "FAILING").length,
    notTested: controls.filter((c) => c.status === "NOT_TESTED").length,
  };
}