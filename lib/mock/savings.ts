// lib/mock/savings.ts
// PNL-11 Savings and SACCO - mock infrastructure.

import { getCurrentUser } from "./current-user";

// ---------- Types ----------

export type CircleType = "ROTATING" | "GOAL_BASED" | "INVESTMENT_POOL";
export type CircleFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY";
export type CircleStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "DISSOLVED";
export type CircleHealth = "HEALTHY" | "WATCHED" | "AT_RISK";

export interface SavingsCircle {
  id: string;
  name: string;
  type: CircleType;
  region: string;
  memberCount: number;
  contributionMinor: number;
  currency: string;
  frequency: CircleFrequency;
  nextPayoutAt?: string;
  arrearsCount: number;
  disputesOpen: number;
  lastContributionAt?: string;
  status: CircleStatus;
  health: CircleHealth;
  healthScore: number;
  leaderId?: string;
  leaderName?: string;
}

export type ContributionMethod = "MPESA" | "BANK" | "INTERNAL_TRANSFER";
export type ContributionStatus = "PAID" | "PENDING" | "FAILED" | "REVERSED" | "LATE";

export interface Contribution {
  id: string;
  createdAt: string;
  memberId: string;
  memberNumber: string;
  circleId: string;
  circleName: string;
  amountMinor: number;
  currency: string;
  method: ContributionMethod;
  status: ContributionStatus;
  ledgerPairId: string;
  failureReason?: string;
}

export type PayoutStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "FAILED";

export interface Payout {
  id: string;
  reference: string;
  circleId: string;
  circleName: string;
  recipientId: string;
  recipientMemberNumber: string;
  amountMinor: number;
  currency: string;
  initiatedBy: string;
  createdAt: string;
  status: PayoutStatus;
  reason: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  ledgerPairId?: string;
}

export type DisputePriority = "HIGH" | "MEDIUM" | "LOW";
export type DisputeStatus = "OPEN" | "INVESTIGATING" | "AWAITING_RESPONSE" | "RESOLVED" | "WITHDRAWN";

export interface DisputeNarrativeEntry {
  id: string;
  at: string;
  actor: string;
  body: string;
}

export interface Dispute {
  id: string;
  reference: string;
  circleId: string;
  circleName: string;
  raisedById: string;
  raisedByMemberNumber: string;
  subject: string;
  description: string;
  ledgerEntryId?: string;
  amountMinor?: number;
  currency?: string;
  priority: DisputePriority;
  status: DisputeStatus;
  assignedTo?: string;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
  narrative: DisputeNarrativeEntry[];
}

export type SegregationStatus = "BALANCED" | "EXCEPTIONS" | "INCOMPLETE";

export interface SegregationSnapshot {
  id: string;
  date: string;
  circleId: string;
  circleName: string;
  memberFundsMinor: number;
  externalBalanceMinor: number;
  operatingFundsMinor: number;
  currency: string;
  reconciledAt: string;
  status: SegregationStatus;
}

export interface ReconciliationRun {
  id: string;
  date: string;
  runAt: string;
  source: "NIGHTLY" | "MANUAL";
  matched: number;
  unmatched: number;
  exceptions: number;
}

export type SaccoReturnType = "MONTHLY_RETURN" | "QUARTERLY_RETURN" | "ANNUAL_RETURN" | "AD_HOC";
export type SaccoReturnStatus = "DRAFT" | "REVIEWED" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "OVERDUE";

export interface SaccoReturn {
  id: string;
  type: SaccoReturnType;
  period: string;
  dueAt: string;
  status: SaccoReturnStatus;
  preparedBy?: string;
  preparedAt?: string;
  submittedBy?: string;
  submittedAt?: string;
  regulatorReference?: string;
  fileUrl?: string;
  notes?: string;
}

// ---------- Permission helpers ----------

const SAVINGS_VIEW_ROLES = ["SUPER_ADMIN", "ADMIN", "FINANCE_OFFICER", "COMPLIANCE_LEAD", "CIRCLE_LEADER"];
const SAVINGS_ACTION_ROLES = ["SUPER_ADMIN", "FINANCE_OFFICER"];
const RETURN_SUBMIT_ROLES = ["SUPER_ADMIN", "COMPLIANCE_LEAD"];

export function canViewSavings(): boolean {
  return SAVINGS_VIEW_ROLES.includes(getCurrentUser().role);
}

export function canActionSavings(): boolean {
  return SAVINGS_ACTION_ROLES.includes(getCurrentUser().role);
}

export function canApprovePayout(payoutId: string): boolean {
  const me = getCurrentUser();
  if (!SAVINGS_ACTION_ROLES.includes(me.role)) return false;
  const p = seedPayouts.find((x) => x.id === payoutId);
  if (!p) return false;
  if (p.initiatedBy === me.name) return false;
  if (p.status !== "PENDING") return false;
  return true;
}

export function canSubmitReturn(): boolean {
  return RETURN_SUBMIT_ROLES.includes(getCurrentUser().role);
}

export function isCircleLeaderScoped(): boolean {
  return getCurrentUser().role === "CIRCLE_LEADER";
}

// ---------- Seed data ----------

const now = new Date();
const days = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();
const hours = (n: number) => new Date(now.getTime() + n * 3600000).toISOString();

export const seedCircles: SavingsCircle[] = [
  {
    id: "sc-1",
    name: "Alpha Investors",
    type: "ROTATING",
    region: "Nairobi",
    memberCount: 12,
    contributionMinor: 1000000,
    currency: "KES",
    frequency: "MONTHLY",
    nextPayoutAt: days(14),
    arrearsCount: 0,
    disputesOpen: 0,
    lastContributionAt: hours(-20),
    status: "ACTIVE",
    health: "HEALTHY",
    healthScore: 92,
    leaderId: "m-1",
    leaderName: "Grace Wanjiru",
  },
  {
    id: "sc-2",
    name: "Community Growth",
    type: "ROTATING",
    region: "Nairobi",
    memberCount: 18,
    contributionMinor: 750000,
    currency: "KES",
    frequency: "MONTHLY",
    nextPayoutAt: days(5),
    arrearsCount: 2,
    disputesOpen: 1,
    lastContributionAt: hours(-3),
    status: "ACTIVE",
    health: "WATCHED",
    healthScore: 68,
    leaderId: "m-5",
    leaderName: "Esther Mwangi",
  },
  {
    id: "sc-3",
    name: "Kisumu Traders Circle",
    type: "GOAL_BASED",
    region: "Kisumu",
    memberCount: 9,
    contributionMinor: 500000,
    currency: "KES",
    frequency: "WEEKLY",
    nextPayoutAt: days(2),
    arrearsCount: 0,
    disputesOpen: 0,
    lastContributionAt: hours(-1),
    status: "ACTIVE",
    health: "HEALTHY",
    healthScore: 88,
    leaderId: "m-8",
    leaderName: "Ruth Ochieng",
  },
  {
    id: "sc-4",
    name: "Youth Investors Fund",
    type: "INVESTMENT_POOL",
    region: "Thika",
    memberCount: 24,
    contributionMinor: 250000,
    currency: "KES",
    frequency: "BIWEEKLY",
    nextPayoutAt: days(30),
    arrearsCount: 5,
    disputesOpen: 2,
    lastContributionAt: days(-5),
    status: "ACTIVE",
    health: "AT_RISK",
    healthScore: 42,
    leaderId: "m-4",
    leaderName: "James Kariuki",
  },
  {
    id: "sc-5",
    name: "Women of Purpose SACCO",
    type: "ROTATING",
    region: "Nairobi",
    memberCount: 15,
    contributionMinor: 1200000,
    currency: "KES",
    frequency: "MONTHLY",
    nextPayoutAt: days(20),
    arrearsCount: 0,
    disputesOpen: 0,
    lastContributionAt: hours(-8),
    status: "ACTIVE",
    health: "HEALTHY",
    healthScore: 90,
    leaderId: "m-6",
    leaderName: "Mary Wanjiku",
  },
  {
    id: "sc-6",
    name: "Eldoret Founders",
    type: "ROTATING",
    region: "Eldoret",
    memberCount: 6,
    contributionMinor: 800000,
    currency: "KES",
    frequency: "MONTHLY",
    nextPayoutAt: days(-2),
    arrearsCount: 3,
    disputesOpen: 0,
    lastContributionAt: days(-10),
    status: "PAUSED",
    health: "AT_RISK",
    healthScore: 38,
    leaderId: "m-2",
    leaderName: "David Ochieng",
  },
];

export const seedContributions: Contribution[] = [
  { id: "ct-1", createdAt: hours(-1), memberId: "m-1", memberNumber: "TEG-26-KU-0042", circleId: "sc-3", circleName: "Kisumu Traders Circle", amountMinor: 500000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-1" },
  { id: "ct-2", createdAt: hours(-3), memberId: "m-5", memberNumber: "TEG-26-UON-0011", circleId: "sc-2", circleName: "Community Growth", amountMinor: 750000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-2" },
  { id: "ct-3", createdAt: hours(-8), memberId: "m-6", memberNumber: "TEG-26-STRATH-0027", circleId: "sc-5", circleName: "Women of Purpose SACCO", amountMinor: 1200000, currency: "KES", method: "BANK", status: "PAID", ledgerPairId: "lp-ct-3" },
  { id: "ct-4", createdAt: hours(-20), memberId: "m-1", memberNumber: "TEG-26-KU-0042", circleId: "sc-1", circleName: "Alpha Investors", amountMinor: 1000000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-4" },
  { id: "ct-5", createdAt: days(-1), memberId: "m-2", memberNumber: "TEG-26-UON-0031", circleId: "sc-2", circleName: "Community Growth", amountMinor: 750000, currency: "KES", method: "MPESA", status: "LATE", ledgerPairId: "lp-ct-5" },
  { id: "ct-6", createdAt: days(-1), memberId: "m-4", memberNumber: "TEG-26-KU-0018", circleId: "sc-4", circleName: "Youth Investors Fund", amountMinor: 250000, currency: "KES", method: "MPESA", status: "FAILED", ledgerPairId: "lp-ct-6", failureReason: "Insufficient M-Pesa balance" },
  { id: "ct-7", createdAt: days(-2), memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", circleId: "sc-3", circleName: "Kisumu Traders Circle", amountMinor: 500000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-7" },
  { id: "ct-8", createdAt: days(-3), memberId: "m-7", memberNumber: "TEG-26-UON-0021", circleId: "sc-4", circleName: "Youth Investors Fund", amountMinor: 250000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-8" },
  { id: "ct-9", createdAt: days(-4), memberId: "m-8", memberNumber: "TEG-26-KSM-0045", circleId: "sc-3", circleName: "Kisumu Traders Circle", amountMinor: 500000, currency: "KES", method: "BANK", status: "PAID", ledgerPairId: "lp-ct-9" },
  { id: "ct-10", createdAt: days(-5), memberId: "m-4", memberNumber: "TEG-26-KU-0018", circleId: "sc-4", circleName: "Youth Investors Fund", amountMinor: 250000, currency: "KES", method: "MPESA", status: "REVERSED", ledgerPairId: "lp-ct-10" },
  { id: "ct-11", createdAt: days(-6), memberId: "m-1", memberNumber: "TEG-26-KU-0042", circleId: "sc-1", circleName: "Alpha Investors", amountMinor: 1000000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-11" },
  { id: "ct-12", createdAt: days(-8), memberId: "m-5", memberNumber: "TEG-26-UON-0011", circleId: "sc-2", circleName: "Community Growth", amountMinor: 750000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-12" },
  { id: "ct-13", createdAt: days(-10), memberId: "m-6", memberNumber: "TEG-26-STRATH-0027", circleId: "sc-5", circleName: "Women of Purpose SACCO", amountMinor: 1200000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-13" },
  { id: "ct-14", createdAt: days(-12), memberId: "m-2", memberNumber: "TEG-26-UON-0031", circleId: "sc-6", circleName: "Eldoret Founders", amountMinor: 800000, currency: "KES", method: "MPESA", status: "LATE", ledgerPairId: "lp-ct-14" },
  { id: "ct-15", createdAt: days(-14), memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", circleId: "sc-1", circleName: "Alpha Investors", amountMinor: 1000000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-15" },
    { id: "ct-16", createdAt: days(-2), memberId: "user-solomon", memberNumber: "TEG-26-KU-0001", circleId: "sc-1", circleName: "Alpha Investors", amountMinor: 1000000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-16" },
    { id: "ct-17", createdAt: days(-9), memberId: "user-solomon", memberNumber: "TEG-26-KU-0001", circleId: "sc-1", circleName: "Alpha Investors", amountMinor: 1000000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-17" },
    { id: "ct-18", createdAt: days(-1), memberId: "user-solomon", memberNumber: "TEG-26-KU-0001", circleId: "sc-3", circleName: "Kisumu Traders Circle", amountMinor: 500000, currency: "KES", method: "MPESA", status: "PAID", ledgerPairId: "lp-ct-18" },
    { id: "ct-19", createdAt: hours(-2), memberId: "user-solomon", memberNumber: "TEG-26-KU-0001", circleId: "sc-2", circleName: "Community Growth", amountMinor: 750000, currency: "KES", method: "MPESA", status: "PENDING", ledgerPairId: "lp-ct-19" }
];

export const seedPayouts: Payout[] = [
  {
    id: "po-1",
    reference: "PO-26-00412",
    circleId: "sc-2",
    circleName: "Community Growth",
    recipientId: "m-5",
    recipientMemberNumber: "TEG-26-UON-0011",
    amountMinor: 13500000,
    currency: "KES",
    initiatedBy: "Miriam K.",
    createdAt: hours(-20),
    status: "PENDING",
    reason: "Scheduled rotation, month 4 of 18.",
  },
  {
    id: "po-2",
    reference: "PO-26-00411",
    circleId: "sc-3",
    circleName: "Kisumu Traders Circle",
    recipientId: "m-3",
    recipientMemberNumber: "TEG-26-STRATH-0027",
    amountMinor: 4500000,
    currency: "KES",
    initiatedBy: "Solomon A.",
    createdAt: hours(-30),
    status: "PENDING",
    reason: "Scheduled rotation, week 4 of 9.",
  },
  {
    id: "po-3",
    reference: "PO-26-00410",
    circleId: "sc-1",
    circleName: "Alpha Investors",
    recipientId: "m-1",
    recipientMemberNumber: "TEG-26-KU-0042",
    amountMinor: 12000000,
    currency: "KES",
    initiatedBy: "Miriam K.",
    createdAt: days(-2),
    status: "APPROVED",
    reason: "Scheduled rotation, month 3 of 12.",
    approvedBy: "Solomon A.",
    approvedAt: days(-1),
  },
  {
    id: "po-4",
    reference: "PO-26-00409",
    circleId: "sc-5",
    circleName: "Women of Purpose SACCO",
    recipientId: "m-6",
    recipientMemberNumber: "TEG-26-STRATH-0027",
    amountMinor: 18000000,
    currency: "KES",
    initiatedBy: "Miriam K.",
    createdAt: days(-5),
    status: "EXECUTED",
    reason: "Scheduled rotation, month 6 of 15.",
    approvedBy: "Solomon A.",
    approvedAt: days(-4),
    ledgerPairId: "lp-po-4",
  },
  {
    id: "po-5",
    reference: "PO-26-00408",
    circleId: "sc-4",
    circleName: "Youth Investors Fund",
    recipientId: "m-7",
    recipientMemberNumber: "TEG-26-UON-0021",
    amountMinor: 6000000,
    currency: "KES",
    initiatedBy: "Miriam K.",
    createdAt: days(-8),
    status: "REJECTED",
    reason: "Scheduled rotation, month 2 of 24.",
    rejectedBy: "Solomon A.",
    rejectedAt: days(-7),
    rejectionReason: "Two members have open disputes. Resolve before payout.",
  },
  {
    id: "po-6",
    reference: "PO-26-00407",
    circleId: "sc-1",
    circleName: "Alpha Investors",
    recipientId: "m-1",
    recipientMemberNumber: "TEG-26-KU-0042",
    amountMinor: 12000000,
    currency: "KES",
    initiatedBy: "Solomon A.",
    createdAt: days(-14),
    status: "EXECUTED",
    reason: "Scheduled rotation, month 2 of 12.",
    approvedBy: "Miriam K.",
    approvedAt: days(-13),
    ledgerPairId: "lp-po-6",
  },
];

export const seedDisputes: Dispute[] = [
  {
    id: "di-1",
    reference: "DSP-26-0007",
    circleId: "sc-2",
    circleName: "Community Growth",
    raisedById: "m-2",
    raisedByMemberNumber: "TEG-26-UON-0031",
    subject: "Contribution marked late in error",
    description: "I paid on time via M-Pesa on 3 September. The system shows late. Please correct.",
    ledgerEntryId: "ct-5",
    amountMinor: 750000,
    currency: "KES",
    priority: "HIGH",
    status: "INVESTIGATING",
    assignedTo: "Miriam K.",
    createdAt: days(-3),
    narrative: [
      { id: "dn-1", at: days(-3), actor: "System", body: "Dispute raised by member." },
      { id: "dn-2", at: days(-2), actor: "Miriam K.", body: "Requested M-Pesa receipt from member." },
    ],
  },
  {
    id: "di-2",
    reference: "DSP-26-0006",
    circleId: "sc-4",
    circleName: "Youth Investors Fund",
    raisedById: "m-4",
    raisedByMemberNumber: "TEG-26-KU-0018",
    subject: "Contribution reversed without notice",
    description: "My contribution on 5 September was reversed. I was not told why.",
    ledgerEntryId: "ct-10",
    amountMinor: 250000,
    currency: "KES",
    priority: "MEDIUM",
    status: "AWAITING_RESPONSE",
    assignedTo: "Miriam K.",
    createdAt: days(-5),
    narrative: [
      { id: "dn-3", at: days(-5), actor: "System", body: "Dispute raised." },
      { id: "dn-4", at: days(-4), actor: "Miriam K.", body: "Investigated. Reversal was due to a duplicate entry. Awaiting member confirmation." },
    ],
  },
  {
    id: "di-3",
    reference: "DSP-26-0005",
    circleId: "sc-4",
    circleName: "Youth Investors Fund",
    raisedById: "m-7",
    raisedByMemberNumber: "TEG-26-UON-0021",
    subject: "Payout order changed without agreement",
    description: "My position in the payout order changed from 2nd to 5th.",
    priority: "MEDIUM",
    status: "OPEN",
    createdAt: days(-2),
    narrative: [
      { id: "dn-5", at: days(-2), actor: "System", body: "Dispute raised." },
    ],
  },
  {
    id: "di-4",
    reference: "DSP-26-0004",
    circleId: "sc-1",
    circleName: "Alpha Investors",
    raisedById: "m-1",
    raisedByMemberNumber: "TEG-26-KU-0042",
    subject: "Contribution receipt not received",
    description: "I made my contribution but did not receive the receipt by email.",
    amountMinor: 1000000,
    currency: "KES",
    priority: "LOW",
    status: "RESOLVED",
    assignedTo: "Miriam K.",
    createdAt: days(-12),
    resolvedAt: days(-9),
    resolution: "Receipt re-sent. Confirmed receipt by member. Closed.",
    narrative: [
      { id: "dn-6", at: days(-12), actor: "System", body: "Dispute raised." },
      { id: "dn-7", at: days(-9), actor: "Miriam K.", body: "Receipt re-sent via Postmark. Member confirmed." },
    ],
  },
];

export const seedSnapshots: SegregationSnapshot[] = [
  { id: "ss-1", date: days(0), circleId: "sc-1", circleName: "Alpha Investors", memberFundsMinor: 120000000, externalBalanceMinor: 120000000, operatingFundsMinor: 45000000, currency: "KES", reconciledAt: hours(-6), status: "BALANCED" },
  { id: "ss-2", date: days(0), circleId: "sc-2", circleName: "Community Growth", memberFundsMinor: 135000000, externalBalanceMinor: 135000000, operatingFundsMinor: 45000000, currency: "KES", reconciledAt: hours(-6), status: "BALANCED" },
  { id: "ss-3", date: days(0), circleId: "sc-3", circleName: "Kisumu Traders Circle", memberFundsMinor: 45000000, externalBalanceMinor: 45000000, operatingFundsMinor: 45000000, currency: "KES", reconciledAt: hours(-6), status: "BALANCED" },
  { id: "ss-4", date: days(0), circleId: "sc-4", circleName: "Youth Investors Fund", memberFundsMinor: 60000000, externalBalanceMinor: 59750000, operatingFundsMinor: 45000000, currency: "KES", reconciledAt: hours(-6), status: "EXCEPTIONS" },
  { id: "ss-5", date: days(0), circleId: "sc-5", circleName: "Women of Purpose SACCO", memberFundsMinor: 180000000, externalBalanceMinor: 180000000, operatingFundsMinor: 45000000, currency: "KES", reconciledAt: hours(-6), status: "BALANCED" },
  { id: "ss-6", date: days(0), circleId: "sc-6", circleName: "Eldoret Founders", memberFundsMinor: 48000000, externalBalanceMinor: 48000000, operatingFundsMinor: 45000000, currency: "KES", reconciledAt: hours(-6), status: "BALANCED" },
];

export const seedRuns: ReconciliationRun[] = [
  { id: "rr-1", date: days(0), runAt: hours(-6), source: "NIGHTLY", matched: 82, unmatched: 1, exceptions: 1 },
  { id: "rr-2", date: days(-1), runAt: days(-1), source: "NIGHTLY", matched: 84, unmatched: 0, exceptions: 0 },
  { id: "rr-3", date: days(-2), runAt: days(-2), source: "NIGHTLY", matched: 79, unmatched: 0, exceptions: 0 },
  { id: "rr-4", date: days(-3), runAt: days(-3), source: "NIGHTLY", matched: 81, unmatched: 2, exceptions: 2 },
  { id: "rr-5", date: days(-4), runAt: days(-4), source: "NIGHTLY", matched: 85, unmatched: 0, exceptions: 0 },
  { id: "rr-6", date: days(-5), runAt: days(-5), source: "MANUAL", matched: 80, unmatched: 0, exceptions: 0 },
  { id: "rr-7", date: days(-6), runAt: days(-6), source: "NIGHTLY", matched: 83, unmatched: 0, exceptions: 0 },
];

export const seedReturns: SaccoReturn[] = [
  {
    id: "ret-1",
    type: "MONTHLY_RETURN",
    period: "2026-09",
    dueAt: days(4),
    status: "DRAFT",
    preparedBy: "Miriam K.",
    preparedAt: hours(-30),
  },
  {
    id: "ret-2",
    type: "MONTHLY_RETURN",
    period: "2026-08",
    dueAt: days(-26),
    status: "SUBMITTED",
    preparedBy: "Miriam K.",
    preparedAt: days(-30),
    submittedBy: "Solomon A.",
    submittedAt: days(-28),
    regulatorReference: "SASRA-2026-08-3128",
  },
  {
    id: "ret-3",
    type: "MONTHLY_RETURN",
    period: "2026-07",
    dueAt: days(-56),
    status: "ACCEPTED",
    preparedBy: "Miriam K.",
    preparedAt: days(-60),
    submittedBy: "Solomon A.",
    submittedAt: days(-58),
    regulatorReference: "SASRA-2026-07-2904",
  },
  {
    id: "ret-4",
    type: "QUARTERLY_RETURN",
    period: "2026-Q2",
    dueAt: days(-80),
    status: "ACCEPTED",
    preparedBy: "Miriam K.",
    preparedAt: days(-85),
    submittedBy: "Solomon A.",
    submittedAt: days(-82),
    regulatorReference: "SASRA-Q2-2026-105",
  },
  {
    id: "ret-5",
    type: "ANNUAL_RETURN",
    period: "2025",
    dueAt: days(-250),
    status: "ACCEPTED",
    preparedBy: "Miriam K.",
    preparedAt: days(-255),
    submittedBy: "Solomon A.",
    submittedAt: days(-252),
    regulatorReference: "SASRA-2025-ANNUAL-078",
  },
];

// ---------- Accessors with RLS simulation ----------

export function getCircles(): SavingsCircle[] {
  if (!canViewSavings()) return [];
  const me = getCurrentUser();
  if (isCircleLeaderScoped()) {
    return seedCircles.filter((c) => c.leaderId === me.id);
  }
  return [...seedCircles];
}

export function getCircleById(id: string): SavingsCircle | null {
  if (!canViewSavings()) return null;
  const c = seedCircles.find((x) => x.id === id) ?? null;
  if (!c) return null;
  const me = getCurrentUser();
  if (isCircleLeaderScoped() && c.leaderId !== me.id) return null;
  return c;
}

export function getContributions(): Contribution[] {
  if (!canViewSavings()) return [];
  return [...seedContributions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getContributionsByCircle(circleId: string): Contribution[] {
  if (!canViewSavings()) return [];
  return getContributions().filter((c) => c.circleId === circleId);
}

export function getPayouts(): Payout[] {
  if (!canViewSavings()) return [];
  return [...seedPayouts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPendingPayouts(): Payout[] {
  return getPayouts().filter((p) => p.status === "PENDING");
}

export function getPayoutById(id: string): Payout | null {
  if (!canViewSavings()) return null;
  return seedPayouts.find((p) => p.id === id) ?? null;
}

export function getDisputes(): Dispute[] {
  if (!canViewSavings()) return [];
  const me = getCurrentUser();
  let r = [...seedDisputes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  if (isCircleLeaderScoped()) {
    const own = seedCircles.filter((c) => c.leaderId === me.id).map((c) => c.id);
    r = r.filter((d) => own.includes(d.circleId));
  }
  return r;
}

export function getSnapshots(): SegregationSnapshot[] {
  const me = getCurrentUser();
  if (!["SUPER_ADMIN", "FINANCE_OFFICER", "ADMIN", "COMPLIANCE_LEAD"].includes(me.role)) return [];
  return [...seedSnapshots];
}

export function getReconciliationRuns(): ReconciliationRun[] {
  const me = getCurrentUser();
  if (!["SUPER_ADMIN", "FINANCE_OFFICER", "ADMIN", "COMPLIANCE_LEAD"].includes(me.role)) return [];
  return [...seedRuns].sort((a, b) => b.date.localeCompare(a.date));
}

export function getReturns(): SaccoReturn[] {
  const me = getCurrentUser();
  if (!["SUPER_ADMIN", "FINANCE_OFFICER", "COMPLIANCE_LEAD"].includes(me.role)) return [];
  return [...seedReturns].sort((a, b) => b.period.localeCompare(a.period));
}

// ---------- Derived helpers ----------

export function drift(snap: SegregationSnapshot): number {
  return snap.externalBalanceMinor - snap.memberFundsMinor;
}

export function totalMemberFunds(): number {
  return seedSnapshots.reduce((s, x) => s + x.memberFundsMinor, 0);
}

export function totalOperatingFunds(): number {
  return seedSnapshots.reduce((s, x) => s + x.operatingFundsMinor, 0);
}

export function daysClean(): number {
  let count = 0;
  for (const run of [...seedRuns].sort((a, b) => b.date.localeCompare(a.date))) {
    if (run.exceptions === 0) count++;
    else break;
  }
  return count;
}

export function payoutAgeHours(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
}

export function formatMoney(minor: number, currency: string): string {
  const whole = Math.floor(minor / 100);
  const cents = String(minor % 100).padStart(2, "0");
  return `${currency} ${whole.toLocaleString("en-KE")}.${cents}`;
}

// ---------- Labels ----------

export const CIRCLE_TYPE_LABELS: Record<CircleType, string> = {
  ROTATING: "Rotating",
  GOAL_BASED: "Goal-based",
  INVESTMENT_POOL: "Investment pool",
};

export const CIRCLE_FREQUENCY_LABELS: Record<CircleFrequency, string> = {
  WEEKLY: "Weekly",
  BIWEEKLY: "Biweekly",
  MONTHLY: "Monthly",
};

export const CIRCLE_STATUS_LABELS: Record<CircleStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
  DISSOLVED: "Dissolved",
};

export const CIRCLE_HEALTH_LABELS: Record<CircleHealth, string> = {
  HEALTHY: "Healthy",
  WATCHED: "Watched",
  AT_RISK: "At risk",
};

export const CONTRIBUTION_METHOD_LABELS: Record<ContributionMethod, string> = {
  MPESA: "M-Pesa",
  BANK: "Bank",
  INTERNAL_TRANSFER: "Internal transfer",
};

export const CONTRIBUTION_STATUS_LABELS: Record<ContributionStatus, string> = {
  PAID: "Paid",
  PENDING: "Pending",
  FAILED: "Failed",
  REVERSED: "Reversed",
  LATE: "Late",
};

export const PAYOUT_STATUS_LABELS: Record<PayoutStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXECUTED: "Executed",
  FAILED: "Failed",
};

export const DISPUTE_PRIORITY_LABELS: Record<DisputePriority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const DISPUTE_STATUS_LABELS: Record<DisputeStatus, string> = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  AWAITING_RESPONSE: "Awaiting response",
  RESOLVED: "Resolved",
  WITHDRAWN: "Withdrawn",
};

export const SEGREGATION_STATUS_LABELS: Record<SegregationStatus, string> = {
  BALANCED: "Balanced",
  EXCEPTIONS: "Exceptions",
  INCOMPLETE: "Incomplete",
};

export const RETURN_TYPE_LABELS: Record<SaccoReturnType, string> = {
  MONTHLY_RETURN: "Monthly return",
  QUARTERLY_RETURN: "Quarterly return",
  ANNUAL_RETURN: "Annual return",
  AD_HOC: "Ad-hoc",
};

export const RETURN_STATUS_LABELS: Record<SaccoReturnStatus, string> = {
  DRAFT: "Draft",
  REVIEWED: "Reviewed",
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  OVERDUE: "Overdue",
};

// ---------- Circle memberships ----------
// Added for the member-scoped savings view. Maps a platform user to the
// circles they belong to. In production this table is the canonical source
// for "which circles am I in".

export type MembershipRole = "LEADER" | "MEMBER";

export interface CircleMembership {
  id: string;
  circleId: string;
  userId: string;
  memberNumber: string;
  joinedAt: string;
  role: MembershipRole;
}

export const seedMemberships: CircleMembership[] = [
  { id: "cm-1", circleId: "sc-1", userId: "user-solomon", memberNumber: "TEG-26-KU-0001", joinedAt: days(-120), role: "MEMBER" },
  { id: "cm-2", circleId: "sc-2", userId: "user-solomon", memberNumber: "TEG-26-KU-0001", joinedAt: days(-90), role: "MEMBER" },
  { id: "cm-3", circleId: "sc-3", userId: "user-solomon", memberNumber: "TEG-26-KU-0001", joinedAt: days(-60), role: "MEMBER" },
  { id: "cm-4", circleId: "sc-1", userId: "user-admin-miriam", memberNumber: "TEG-26-STRATH-0027", joinedAt: days(-150), role: "MEMBER" },
  { id: "cm-5", circleId: "sc-5", userId: "user-admin-miriam", memberNumber: "TEG-26-STRATH-0027", joinedAt: days(-100), role: "MEMBER" },
  { id: "cm-6", circleId: "sc-3", userId: "user-esther", memberNumber: "TEG-26-KSM-0045", joinedAt: days(-80), role: "MEMBER" },
  { id: "cm-7", circleId: "sc-5", userId: "user-compliance-james", memberNumber: "TEG-26-KU-0088", joinedAt: days(-50), role: "MEMBER" },
];

export function getMyMemberships(): CircleMembership[] {
  const me = getCurrentUser();
  return seedMemberships.filter((m) => m.userId === me.id);
}

export function getMyMemberNumber(): string | null {
  const me = getCurrentUser();
  return seedMemberships.find((m) => m.userId === me.id)?.memberNumber ?? null;
}

export function getMyCircles(): SavingsCircle[] {
  const me = getCurrentUser();
  const ids = seedMemberships.filter((m) => m.userId === me.id).map((m) => m.circleId);
  return seedCircles.filter((c) => ids.includes(c.id));
}

export function getMyContributions(): Contribution[] {
  const mn = getMyMemberNumber();
  if (!mn) return [];
  return seedContributions
    .filter((c) => c.memberNumber === mn)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMyPendingContributions(): Contribution[] {
  return getMyContributions().filter((c) => c.status === "PENDING" || c.status === "LATE");
}

export function getMyPayouts(): Payout[] {
  const mn = getMyMemberNumber();
  if (!mn) return [];
  return seedPayouts
    .filter((p) => p.recipientMemberNumber === mn)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUpcomingPayoutsForMyCircles(): Payout[] {
  const ids = getMyCircles().map((c) => c.id);
  return seedPayouts
    .filter((p) => ids.includes(p.circleId) && (p.status === "PENDING" || p.status === "APPROVED"))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export const MEMBERSHIP_ROLE_LABELS: Record<MembershipRole, string> = {
  LEADER: "Leader",
  MEMBER: "Member",
};