// lib/mock/credit.ts
// PNL-10 Credit — types, seed data, RLS-aware accessors, permission helpers.
//
// All money in integer minor units + ISO 4217. Never floats.

import { getCurrentUser } from "./current-user";
import type { MockUser } from "@/components/mock/data";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type LoanProductType = "PERSONAL" | "BUSINESS" | "EMERGENCY" | "EDUCATION";

export interface LoanProduct {
  id: string;
  code: string;                    // "LP-PERS-01"
  name: string;
  type: LoanProductType;
  minAmountMinor: number;
  maxAmountMinor: number;
  minTenorMonths: number;
  maxTenorMonths: number;
  interestRateBps: number;         // annual, basis points
  interestBasis: "REDUCING" | "FLAT";
  processingFeeBps: number;
  insuranceFeeBps: number;
  eligibilityMinKycTier: 1 | 2;
  eligibilityMinSavingsMonths: number;
  requiresGuarantors: boolean;
  enabled: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type LoanApplicationStatus =
  | "SUBMITTED"
  | "ASSESSMENT"
  | "RECOMMENDED"
  | "APPROVED"
  | "DECLINED"
  | "WITHDRAWN"
  | "OFFER_ISSUED"
  | "OFFER_ACCEPTED"
  | "DISBURSED";

export interface LoanApplication {
  id: string;
  reference: string;               // LN-26-XXXX
  memberName: string;
  memberNumber: string;
  productId: string;
  productName: string;
  requestedAmountMinor: number;
  requestedTenorMonths: number;
  purpose: string;
  status: LoanApplicationStatus;
  recommendBy?: string;
  recommendedAt?: string;
  recommendedDecision?: "APPROVE" | "DECLINE" | "APPROVE_WITH_CONDITIONS";
  recommendReason?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  declineReason?: string;
  submittedAt: string;
  updatedAt: string;
  guarantorCount: number;
}

export type LoanStatus =
  | "ACTIVE"
  | "IN_ARREARS"
  | "RESTRUCTURED"
  | "CLOSED"
  | "WRITTEN_OFF";

export interface Loan {
  id: string;
  reference: string;               // LA-26-XXXX
  memberName: string;
  memberNumber: string;
  productName: string;
  principalMinor: number;
  outstandingMinor: number;
  currency: string;
  interestRateBps: number;
  tenorMonths: number;
  monthlyInstalmentMinor: number;
  disbursedAt: string;
  maturityAt: string;
  status: LoanStatus;
  nextDueAt?: string;
  daysInArrears: number;
  missedInstalments: number;
}

export type ArrearsBucket = "CURRENT" | "D1_30" | "D31_60" | "D61_90" | "D90_PLUS";

export interface ArrearsCase {
  id: string;
  loanId: string;
  loanReference: string;
  memberName: string;
  memberNumber: string;
  outstandingMinor: number;
  currency: string;
  bucket: ArrearsBucket;
  daysInArrears: number;
  lastContactAt?: string;
  lastContactMethod?: "CALL" | "SMS" | "EMAIL" | "IN_PERSON";
  nextActionAt?: string;
  nextActionNote?: string;
  openedAt: string;
}

export type RestructureStatus = "PENDING" | "APPROVED" | "REJECTED" | "WITHDRAWN";

export interface RestructureRequest {
  id: string;
  reference: string;
  loanId: string;
  loanReference: string;
  memberName: string;
  proposedBy: string;
  proposedAt: string;
  newTenorMonths: number;
  newInstalmentMinor: number;
  reason: string;
  status: RestructureStatus;
  decidedBy?: string;
  decidedAt?: string;
  decisionReason?: string;
}

export type WriteOffStatus = "PENDING" | "CREDIT_APPROVED" | "FINANCE_APPROVED" | "REJECTED";

export interface WriteOffRequest {
  id: string;
  reference: string;
  loanId: string;
  loanReference: string;
  memberName: string;
  memberNumber: string;
  outstandingMinor: number;
  currency: string;
  proposedBy: string;
  proposedAt: string;
  reason: string;
  creditApprovedBy?: string;
  creditApprovedAt?: string;
  financeApprovedBy?: string;
  financeApprovedAt?: string;
  status: WriteOffStatus;
}

export type GuaranteeStatus = "ACTIVE" | "RELEASED" | "CALLED" | "DEMANDED";

export interface Guarantee {
  id: string;
  loanId: string;
  loanReference: string;
  borrowerName: string;
  borrowerNumber: string;
  guarantorName: string;
  guarantorNumber: string;
  amountMinor: number;
  currency: string;
  status: GuaranteeStatus;
  registeredAt: string;
  releasedAt?: string;
  demandIssuedAt?: string;
}

export type CRBSubmissionStatus = "PENDING" | "SUBMITTED" | "ACKNOWLEDGED" | "FAILED";

export interface CRBSubmission {
  id: string;
  reference: string;
  loanReference: string;
  memberName: string;
  memberNumber: string;
  eventType: string;               // "DISBURSEMENT", "MISSED_INSTALMENT", "WRITE_OFF"
  status: CRBSubmissionStatus;
  submittedAt: string;
  acknowledgedAt?: string;
  crbReference?: string;
  failureReason?: string;
}

export interface CRBEnquiry {
  id: string;
  reference: string;
  memberName: string;
  memberNumber: string;
  purpose: string;                 // "LOAN_APPLICATION", "PORTFOLIO_REVIEW"
  requestedBy: string;
  requestedAt: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  resultSummary?: string;
}

export interface CreditAnalytics {
  period: string;
  applicationsReceived: number;
  applicationsApproved: number;
  applicationsDeclined: number;
  disbursementsMinor: number;
  repaymentsMinor: number;
  portfolioOutstandingMinor: number;
  par30: number;                   // Portfolio at Risk %, 30 days
  par60: number;
  par90: number;
  writeOffsMinor: number;
  restructures: number;
}

// ─────────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────────

export const PRODUCT_TYPE_LABELS: Record<LoanProductType, string> = {
  PERSONAL: "Personal loan",
  BUSINESS: "Business loan",
  EMERGENCY: "Emergency loan",
  EDUCATION: "Education loan",
};

export const LOAN_APP_STATUS_LABELS: Record<LoanApplicationStatus, string> = {
  SUBMITTED: "Submitted",
  ASSESSMENT: "Assessment",
  RECOMMENDED: "Recommended",
  APPROVED: "Approved",
  DECLINED: "Declined",
  WITHDRAWN: "Withdrawn",
  OFFER_ISSUED: "Offer issued",
  OFFER_ACCEPTED: "Offer accepted",
  DISBURSED: "Disbursed",
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  ACTIVE: "Active",
  IN_ARREARS: "In arrears",
  RESTRUCTURED: "Restructured",
  CLOSED: "Closed",
  WRITTEN_OFF: "Written off",
};

export const ARREARS_BUCKET_LABELS: Record<ArrearsBucket, string> = {
  CURRENT: "Current",
  D1_30: "1–30 days",
  D31_60: "31–60 days",
  D61_90: "61–90 days",
  D90_PLUS: "90+ days",
};

export const RESTRUCTURE_STATUS_LABELS: Record<RestructureStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  WITHDRAWN: "Withdrawn",
};

export const WRITE_OFF_STATUS_LABELS: Record<WriteOffStatus, string> = {
  PENDING: "Pending credit approval",
  CREDIT_APPROVED: "Credit approved — pending finance",
  FINANCE_APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const GUARANTEE_STATUS_LABELS: Record<GuaranteeStatus, string> = {
  ACTIVE: "Active",
  RELEASED: "Released",
  CALLED: "Called",
  DEMANDED: "Demanded",
};

export const CRB_STATUS_LABELS: Record<CRBSubmissionStatus, string> = {
  PENDING: "Pending",
  SUBMITTED: "Submitted",
  ACKNOWLEDGED: "Acknowledged",
  FAILED: "Failed",
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

export function bpsToPct(bps: number): string {
  return `${(bps / 100).toFixed(2)}%`;
}

// ─────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────

const now = new Date();
const iso = (daysAgo: number, hoursAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();

export const seedProducts: LoanProduct[] = [
  {
    id: "lp-001",
    code: "LP-PERS-01",
    name: "Personal Development Loan",
    type: "PERSONAL",
    minAmountMinor: 50_000_00,
    maxAmountMinor: 2_000_000_00,
    minTenorMonths: 6,
    maxTenorMonths: 36,
    interestRateBps: 1_800,
    interestBasis: "REDUCING",
    processingFeeBps: 200,
    insuranceFeeBps: 100,
    eligibilityMinKycTier: 2,
    eligibilityMinSavingsMonths: 3,
    requiresGuarantors: true,
    enabled: true,
    updatedAt: iso(30),
    updatedBy: "u-credit-manager",
  },
  {
    id: "lp-002",
    code: "LP-BIZ-01",
    name: "Small Business Capital",
    type: "BUSINESS",
    minAmountMinor: 100_000_00,
    maxAmountMinor: 5_000_000_00,
    minTenorMonths: 12,
    maxTenorMonths: 48,
    interestRateBps: 1_600,
    interestBasis: "REDUCING",
    processingFeeBps: 150,
    insuranceFeeBps: 100,
    eligibilityMinKycTier: 2,
    eligibilityMinSavingsMonths: 6,
    requiresGuarantors: true,
    enabled: true,
    updatedAt: iso(30),
    updatedBy: "u-credit-manager",
  },
  {
    id: "lp-003",
    code: "LP-EMER-01",
    name: "Emergency Loan",
    type: "EMERGENCY",
    minAmountMinor: 10_000_00,
    maxAmountMinor: 300_000_00,
    minTenorMonths: 3,
    maxTenorMonths: 12,
    interestRateBps: 2_400,
    interestBasis: "FLAT",
    processingFeeBps: 300,
    insuranceFeeBps: 0,
    eligibilityMinKycTier: 1,
    eligibilityMinSavingsMonths: 1,
    requiresGuarantors: false,
    enabled: true,
    updatedAt: iso(30),
    updatedBy: "u-credit-manager",
  },
  {
    id: "lp-004",
    code: "LP-EDU-01",
    name: "Education Loan",
    type: "EDUCATION",
    minAmountMinor: 20_000_00,
    maxAmountMinor: 800_000_00,
    minTenorMonths: 6,
    maxTenorMonths: 24,
    interestRateBps: 1_400,
    interestBasis: "REDUCING",
    processingFeeBps: 100,
    insuranceFeeBps: 50,
    eligibilityMinKycTier: 1,
    eligibilityMinSavingsMonths: 2,
    requiresGuarantors: false,
    enabled: true,
    updatedAt: iso(30),
    updatedBy: "u-credit-manager",
  },
];

export const seedApplications: LoanApplication[] = [
  {
    id: "la-001",
    reference: "LN-26-20045",
    memberName: "Grace Wanjiru",
    memberNumber: "TEG-26-KU-0042",
    productId: "lp-001",
    productName: "Personal Development Loan",
    requestedAmountMinor: 500_000_00,
    requestedTenorMonths: 18,
    purpose: "Postgraduate tuition top-up",
    status: "RECOMMENDED",
    recommendBy: "u-credit-officer-01",
    recommendedAt: iso(0, 6),
    recommendedDecision: "APPROVE",
    recommendReason:
      "Stable savings history (12 months), full KYC, consistent contribution rate, existing loan repaid on schedule.",
    submittedAt: iso(2, 4),
    updatedAt: iso(0, 6),
    guarantorCount: 2,
  },
  {
    id: "la-002",
    reference: "LN-26-20044",
    memberName: "David Ochieng",
    memberNumber: "TEG-26-UON-0088",
    productId: "lp-002",
    productName: "Small Business Capital",
    requestedAmountMinor: 1_800_000_00,
    requestedTenorMonths: 36,
    purpose: "Working capital for retail venture expansion",
    status: "ASSESSMENT",
    submittedAt: iso(1, 8),
    updatedAt: iso(0, 2),
    guarantorCount: 3,
  },
  {
    id: "la-003",
    reference: "LN-26-20043",
    memberName: "Faith Njeri",
    memberNumber: "TEG-26-STR-0014",
    productId: "lp-001",
    productName: "Personal Development Loan",
    requestedAmountMinor: 300_000_00,
    requestedTenorMonths: 12,
    purpose: "Home renovation",
    status: "SUBMITTED",
    submittedAt: iso(0, 4),
    updatedAt: iso(0, 4),
    guarantorCount: 1,
  },
  {
    id: "la-004",
    reference: "LN-26-20042",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    productId: "lp-003",
    productName: "Emergency Loan",
    requestedAmountMinor: 80_000_00,
    requestedTenorMonths: 6,
    purpose: "Medical emergency",
    status: "APPROVED",
    recommendBy: "u-credit-officer-01",
    recommendedAt: iso(1, 4),
    recommendedDecision: "APPROVE",
    recommendReason: "Emergency category, prior repayment history clean.",
    confirmedBy: "u-credit-manager",
    confirmedAt: iso(1, 2),
    submittedAt: iso(1, 8),
    updatedAt: iso(1, 2),
    guarantorCount: 0,
  },
  {
    id: "la-005",
    reference: "LN-26-20041",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    productId: "lp-002",
    productName: "Small Business Capital",
    requestedAmountMinor: 2_500_000_00,
    requestedTenorMonths: 48,
    purpose: "Equipment purchase",
    status: "DECLINED",
    recommendBy: "u-credit-officer-01",
    recommendedAt: iso(3, 6),
    recommendedDecision: "DECLINE",
    recommendReason: "Debt service ratio above policy; existing guarantees exceed prudent exposure.",
    confirmedBy: "u-credit-manager",
    confirmedAt: iso(3, 4),
    declineReason: "DTI ratio 58%, policy maximum 45%.",
    submittedAt: iso(4, 6),
    updatedAt: iso(3, 4),
    guarantorCount: 2,
  },
  {
    id: "la-006",
    reference: "LN-26-20040",
    memberName: "Esther Wambui",
    memberNumber: "TEG-26-UON-0122",
    productId: "lp-001",
    productName: "Personal Development Loan",
    requestedAmountMinor: 750_000_00,
    requestedTenorMonths: 24,
    purpose: "Business school fees",
    status: "DISBURSED",
    recommendBy: "u-credit-officer-01",
    recommendedAt: iso(15, 4),
    recommendedDecision: "APPROVE",
    recommendReason: "Strong savings, consistent contribution history, Tier 2 KYC.",
    confirmedBy: "u-credit-manager",
    confirmedAt: iso(15, 2),
    submittedAt: iso(16, 6),
    updatedAt: iso(14, 2),
    guarantorCount: 2,
  },
];

export const seedLoans: Loan[] = [
  {
    id: "loan-001",
    reference: "LA-26-40021",
    memberName: "Esther Wambui",
    memberNumber: "TEG-26-UON-0122",
    productName: "Personal Development Loan",
    principalMinor: 750_000_00,
    outstandingMinor: 620_500_00,
    currency: "KES",
    interestRateBps: 1_800,
    tenorMonths: 24,
    monthlyInstalmentMinor: 36_800_00,
    disbursedAt: iso(14),
    maturityAt: new Date(now.getTime() + 24 * 30 * 86400000).toISOString(),
    status: "ACTIVE",
    nextDueAt: new Date(now.getTime() + 12 * 86400000).toISOString(),
    daysInArrears: 0,
    missedInstalments: 0,
  },
  {
    id: "loan-002",
    reference: "LA-26-40020",
    memberName: "James Kariuki",
    memberNumber: "TEG-26-NRB-0031",
    productName: "Small Business Capital",
    principalMinor: 1_200_000_00,
    outstandingMinor: 987_500_00,
    currency: "KES",
    interestRateBps: 1_600,
    tenorMonths: 36,
    monthlyInstalmentMinor: 42_500_00,
    disbursedAt: iso(45),
    maturityAt: new Date(now.getTime() + 36 * 30 * 86400000).toISOString(),
    status: "IN_ARREARS",
    nextDueAt: iso(-3),
    daysInArrears: 22,
    missedInstalments: 1,
  },
  {
    id: "loan-003",
    reference: "LA-26-40019",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    productName: "Emergency Loan",
    principalMinor: 150_000_00,
    outstandingMinor: 0,
    currency: "KES",
    interestRateBps: 2_400,
    tenorMonths: 6,
    monthlyInstalmentMinor: 27_500_00,
    disbursedAt: iso(240),
    maturityAt: iso(60),
    status: "CLOSED",
    daysInArrears: 0,
    missedInstalments: 0,
  },
  {
    id: "loan-004",
    reference: "LA-26-40018",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    productName: "Small Business Capital",
    principalMinor: 800_000_00,
    outstandingMinor: 780_000_00,
    currency: "KES",
    interestRateBps: 1_600,
    tenorMonths: 36,
    monthlyInstalmentMinor: 28_400_00,
    disbursedAt: iso(90),
    maturityAt: new Date(now.getTime() + 33 * 30 * 86400000).toISOString(),
    status: "RESTRUCTURED",
    nextDueAt: new Date(now.getTime() + 8 * 86400000).toISOString(),
    daysInArrears: 0,
    missedInstalments: 3,
  },
];

export const seedArrears: ArrearsCase[] = [
  {
    id: "arr-001",
    loanId: "loan-002",
    loanReference: "LA-26-40020",
    memberName: "James Kariuki",
    memberNumber: "TEG-26-NRB-0031",
    outstandingMinor: 987_500_00,
    currency: "KES",
    bucket: "D1_30",
    daysInArrears: 22,
    lastContactAt: iso(2),
    lastContactMethod: "SMS",
    nextActionAt: new Date(now.getTime() + 2 * 86400000).toISOString(),
    nextActionNote: "Follow-up call within contact hours",
    openedAt: iso(22),
  },
];

export const seedRestructures: RestructureRequest[] = [
  {
    id: "rs-001",
    reference: "RS-26-0022",
    loanId: "loan-004",
    loanReference: "LA-26-40018",
    memberName: "Mercy Achieng",
    proposedBy: "u-credit-officer-01",
    proposedAt: iso(30),
    newTenorMonths: 48,
    newInstalmentMinor: 22_000_00,
    reason: "Member's business income declined; extended tenor reduces instalment to manageable level",
    status: "APPROVED",
    decidedBy: "u-credit-manager",
    decidedAt: iso(29),
    decisionReason: "Affordability restored; no history of deliberate default",
  },
  {
    id: "rs-002",
    reference: "RS-26-0023",
    loanId: "loan-002",
    loanReference: "LA-26-40020",
    memberName: "James Kariuki",
    proposedBy: "u-credit-officer-01",
    proposedAt: iso(0, 8),
    newTenorMonths: 42,
    newInstalmentMinor: 38_000_00,
    reason: "Temporary income disruption due to family emergency; proposing 6-month extension",
    status: "PENDING",
  },
];

export const seedWriteOffs: WriteOffRequest[] = [
  {
    id: "wo-001",
    reference: "WO-26-0005",
    loanId: "loan-099",
    loanReference: "LA-25-38012",
    memberName: "Samuel Otieno",
    memberNumber: "TEG-26-NRB-0044",
    outstandingMinor: 145_000_00,
    currency: "KES",
    proposedBy: "u-credit-officer-01",
    proposedAt: iso(20),
    reason:
      "Member deceased 18 months ago; estate unresolved. Recovery not viable; legal opinion on file.",
    creditApprovedBy: "u-credit-manager",
    creditApprovedAt: iso(19),
    financeApprovedBy: "u-finance-officer",
    financeApprovedAt: iso(18),
    status: "FINANCE_APPROVED",
  },
];

export const seedGuarantees: Guarantee[] = [
  {
    id: "gu-001",
    loanId: "loan-001",
    loanReference: "LA-26-40021",
    borrowerName: "Esther Wambui",
    borrowerNumber: "TEG-26-UON-0122",
    guarantorName: "Grace Wanjiru",
    guarantorNumber: "TEG-26-KU-0042",
    amountMinor: 250_000_00,
    currency: "KES",
    status: "ACTIVE",
    registeredAt: iso(14),
  },
  {
    id: "gu-002",
    loanId: "loan-001",
    loanReference: "LA-26-40021",
    borrowerName: "Esther Wambui",
    borrowerNumber: "TEG-26-UON-0122",
    guarantorName: "David Ochieng",
    guarantorNumber: "TEG-26-UON-0088",
    amountMinor: 250_000_00,
    currency: "KES",
    status: "ACTIVE",
    registeredAt: iso(14),
  },
  {
    id: "gu-003",
    loanId: "loan-002",
    loanReference: "LA-26-40020",
    borrowerName: "James Kariuki",
    borrowerNumber: "TEG-26-NRB-0031",
    guarantorName: "Peter Mwangi",
    guarantorNumber: "TEG-26-KU-0091",
    amountMinor: 400_000_00,
    currency: "KES",
    status: "ACTIVE",
    registeredAt: iso(45),
  },
  {
    id: "gu-004",
    loanId: "loan-004",
    loanReference: "LA-26-40018",
    borrowerName: "Mercy Achieng",
    borrowerNumber: "TEG-26-KSM-0007",
    guarantorName: "Faith Njeri",
    guarantorNumber: "TEG-26-STR-0014",
    amountMinor: 200_000_00,
    currency: "KES",
    status: "ACTIVE",
    registeredAt: iso(90),
  },
  {
    id: "gu-005",
    loanId: "loan-003",
    loanReference: "LA-26-40019",
    borrowerName: "Peter Mwangi",
    borrowerNumber: "TEG-26-KU-0091",
    guarantorName: "James Kariuki",
    guarantorNumber: "TEG-26-NRB-0031",
    amountMinor: 50_000_00,
    currency: "KES",
    status: "RELEASED",
    registeredAt: iso(240),
    releasedAt: iso(60),
  },
];

export const seedCRBSubmissions: CRBSubmission[] = [
  {
    id: "crb-001",
    reference: "CRB-S-26-0811",
    loanReference: "LA-26-40021",
    memberName: "Esther Wambui",
    memberNumber: "TEG-26-UON-0122",
    eventType: "DISBURSEMENT",
    status: "ACKNOWLEDGED",
    submittedAt: iso(14),
    acknowledgedAt: iso(13),
    crbReference: "CRB/2026/04/03841",
  },
  {
    id: "crb-002",
    reference: "CRB-S-26-0810",
    loanReference: "LA-26-40020",
    memberName: "James Kariuki",
    memberNumber: "TEG-26-NRB-0031",
    eventType: "MISSED_INSTALMENT",
    status: "ACKNOWLEDGED",
    submittedAt: iso(21),
    acknowledgedAt: iso(20),
    crbReference: "CRB/2026/04/03789",
  },
  {
    id: "crb-003",
    reference: "CRB-S-26-0809",
    loanReference: "LA-26-40019",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    eventType: "CLOSURE",
    status: "ACKNOWLEDGED",
    submittedAt: iso(60),
    acknowledgedAt: iso(59),
    crbReference: "CRB/2026/03/03112",
  },
  {
    id: "crb-004",
    reference: "CRB-S-26-0812",
    loanReference: "LA-26-40018",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    eventType: "RESTRUCTURE",
    status: "PENDING",
    submittedAt: iso(0, 2),
  },
];

export const seedCRBEnquiries: CRBEnquiry[] = [
  {
    id: "crbe-001",
    reference: "CRB-E-26-0142",
    memberName: "Grace Wanjiru",
    memberNumber: "TEG-26-KU-0042",
    purpose: "LOAN_APPLICATION",
    requestedBy: "u-credit-officer-01",
    requestedAt: iso(2, 4),
    status: "COMPLETED",
    resultSummary: "No adverse records; two performing accounts across industry",
  },
  {
    id: "crbe-002",
    reference: "CRB-E-26-0141",
    memberName: "David Ochieng",
    memberNumber: "TEG-26-UON-0088",
    purpose: "LOAN_APPLICATION",
    requestedBy: "u-credit-officer-01",
    requestedAt: iso(1, 8),
    status: "COMPLETED",
    resultSummary: "No adverse records",
  },
  {
    id: "crbe-003",
    reference: "CRB-E-26-0140",
    memberName: "Faith Njeri",
    memberNumber: "TEG-26-STR-0014",
    purpose: "LOAN_APPLICATION",
    requestedBy: "u-credit-officer-01",
    requestedAt: iso(0, 4),
    status: "PENDING",
  },
];

export const seedAnalytics: CreditAnalytics[] = [
  {
    period: "Last 30 days",
    applicationsReceived: 24,
    applicationsApproved: 17,
    applicationsDeclined: 5,
    disbursementsMinor: 12_450_000_00,
    repaymentsMinor: 8_920_000_00,
    portfolioOutstandingMinor: 42_180_000_00,
    par30: 4.2,
    par60: 2.1,
    par90: 1.4,
    writeOffsMinor: 145_000_00,
    restructures: 3,
  },
  {
    period: "Last 7 days",
    applicationsReceived: 6,
    applicationsApproved: 4,
    applicationsDeclined: 1,
    disbursementsMinor: 3_200_000_00,
    repaymentsMinor: 2_780_000_00,
    portfolioOutstandingMinor: 42_180_000_00,
    par30: 4.2,
    par60: 2.1,
    par90: 1.4,
    writeOffsMinor: 0,
    restructures: 0,
  },
];

// ─────────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────────

type AllowedRole = MockUser["role"];

const CREDIT_READERS: AllowedRole[] = [
  "CREDIT_OFFICER",
  "CREDIT_ANALYST",
  "CREDIT_MANAGER",
  "FINANCE_OFFICER",
  "COMPLIANCE_LEAD",
  "ADMIN",
  "SUPER_ADMIN",
];

const CREDIT_OPERATORS: AllowedRole[] = ["CREDIT_OFFICER", "CREDIT_MANAGER", "SUPER_ADMIN"];
const CREDIT_DECIDERS: AllowedRole[] = ["CREDIT_MANAGER", "SUPER_ADMIN"];
const CREDIT_FINANCE: AllowedRole[] = ["FINANCE_OFFICER", "SUPER_ADMIN"];

function hasRole(user: MockUser | null, roles: AllowedRole[]): boolean {
  return user !== null && roles.includes(user.role);
}

export function canViewCredit(): boolean {
  return hasRole(getCurrentUser(), CREDIT_READERS);
}

export function canOperateCredit(): boolean {
  return hasRole(getCurrentUser(), CREDIT_OPERATORS);
}

export function canDecideCredit(): boolean {
  return hasRole(getCurrentUser(), CREDIT_DECIDERS);
}

export function canApproveFinance(): boolean {
  return hasRole(getCurrentUser(), CREDIT_FINANCE);
}

// Four-eyes: recommender cannot confirm own recommendation
export function canConfirmDecision(
  app: { recommendBy?: string } | null
): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, CREDIT_DECIDERS) && !hasRole(user, CREDIT_OPERATORS)) return false;
  if (!app || !app.recommendBy) return false;
  return app.recommendBy !== user.id;
}

// Four-eyes: restructure proposer cannot approve own request
export function canApproveRestructure(
  rs: { proposedBy: string } | null
): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, CREDIT_DECIDERS)) return false;
  if (!rs) return false;
  return rs.proposedBy !== user.id;
}

// Four-eyes: write-off requires distinct credit and finance approvers, and
// neither can be the proposer.
export function canApproveWriteOff(
  wo: { proposedBy: string; creditApprovedBy?: string } | null,
  stage: "CREDIT" | "FINANCE"
): boolean {
  const user = getCurrentUser();
  if (!user || !wo) return false;
  if (wo.proposedBy === user.id) return false;
  if (stage === "CREDIT") return hasRole(user, CREDIT_DECIDERS);
  // Finance stage: must be a different user from whoever did credit approval
  if (wo.creditApprovedBy === user.id) return false;
  return hasRole(user, CREDIT_FINANCE);
}

// ─────────────────────────────────────────────────────────────
// RLS-aware accessors
// ─────────────────────────────────────────────────────────────

export function getProducts(): LoanProduct[] {
  if (!canViewCredit()) return [];
  return [...seedProducts].sort((a, b) => a.code.localeCompare(b.code));
}

export function getApplications(): LoanApplication[] {
  if (!canViewCredit()) return [];
  return [...seedApplications].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );
}

export function getApplicationById(id: string): LoanApplication | null {
  if (!canViewCredit()) return null;
  return seedApplications.find((a) => a.id === id) ?? null;
}

export function getLoans(): Loan[] {
  if (!canViewCredit()) return [];
  return [...seedLoans].sort((a, b) =>
    b.disbursedAt.localeCompare(a.disbursedAt)
  );
}

export function getLoanById(id: string): Loan | null {
  if (!canViewCredit()) return null;
  return seedLoans.find((l) => l.id === id) ?? null;
}

export function getArrears(): ArrearsCase[] {
  if (!canViewCredit()) return [];
  return [...seedArrears].sort((a, b) => b.daysInArrears - a.daysInArrears);
}

export function getRestructures(): RestructureRequest[] {
  if (!canViewCredit()) return [];
  return [...seedRestructures].sort((a, b) =>
    b.proposedAt.localeCompare(a.proposedAt)
  );
}

export function getWriteOffs(): WriteOffRequest[] {
  if (!canViewCredit()) return [];
  return [...seedWriteOffs].sort((a, b) =>
    b.proposedAt.localeCompare(a.proposedAt)
  );
}

export function getGuarantees(): Guarantee[] {
  if (!canViewCredit()) return [];
  return [...seedGuarantees].sort((a, b) =>
    b.registeredAt.localeCompare(a.registeredAt)
  );
}

export function getCRBSubmissions(): CRBSubmission[] {
  if (!canViewCredit()) return [];
  return [...seedCRBSubmissions].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );
}

export function getCRBEnquiries(): CRBEnquiry[] {
  if (!canViewCredit()) return [];
  return [...seedCRBEnquiries].sort((a, b) =>
    b.requestedAt.localeCompare(a.requestedAt)
  );
}

export function getAnalytics(): CreditAnalytics[] {
  if (!canViewCredit()) return [];
  return [...seedAnalytics];
}

// ─────────────────────────────────────────────────────────────
// Derived counts
// ─────────────────────────────────────────────────────────────

export function getApplicationCounts() {
  const apps = canViewCredit() ? seedApplications : [];
  return {
    total: apps.length,
    submitted: apps.filter((a) => a.status === "SUBMITTED").length,
    assessment: apps.filter((a) => a.status === "ASSESSMENT").length,
    recommended: apps.filter((a) => a.status === "RECOMMENDED").length,
    approved: apps.filter((a) => a.status === "APPROVED").length,
    declined: apps.filter((a) => a.status === "DECLINED").length,
    disbursed: apps.filter((a) => a.status === "DISBURSED").length,
  };
}

export function getLoanBookCounts() {
  const loans = canViewCredit() ? seedLoans : [];
  return {
    total: loans.length,
    active: loans.filter((l) => l.status === "ACTIVE").length,
    inArrears: loans.filter((l) => l.status === "IN_ARREARS").length,
    restructured: loans.filter((l) => l.status === "RESTRUCTURED").length,
    closed: loans.filter((l) => l.status === "CLOSED").length,
    writtenOff: loans.filter((l) => l.status === "WRITTEN_OFF").length,
  };
}

export function getArrearsBuckets() {
  const arrears = canViewCredit() ? seedArrears : [];
  return {
    current: arrears.filter((a) => a.bucket === "CURRENT").length,
    d1_30: arrears.filter((a) => a.bucket === "D1_30").length,
    d31_60: arrears.filter((a) => a.bucket === "D31_60").length,
    d61_90: arrears.filter((a) => a.bucket === "D61_90").length,
    d90Plus: arrears.filter((a) => a.bucket === "D90_PLUS").length,
    total: arrears.length,
  };
}

export function getRestructureCounts() {
  const rs = canViewCredit() ? seedRestructures : [];
  return {
    total: rs.length,
    pending: rs.filter((r) => r.status === "PENDING").length,
    approved: rs.filter((r) => r.status === "APPROVED").length,
    rejected: rs.filter((r) => r.status === "REJECTED").length,
  };
}

export function getWriteOffCounts() {
  const wo = canViewCredit() ? seedWriteOffs : [];
  return {
    total: wo.length,
    pending: wo.filter((w) => w.status === "PENDING").length,
    creditApproved: wo.filter((w) => w.status === "CREDIT_APPROVED").length,
    financeApproved: wo.filter((w) => w.status === "FINANCE_APPROVED").length,
    rejected: wo.filter((w) => w.status === "REJECTED").length,
  };
}

export function getGuaranteeCounts() {
  const g = canViewCredit() ? seedGuarantees : [];
  return {
    total: g.length,
    active: g.filter((x) => x.status === "ACTIVE").length,
    released: g.filter((x) => x.status === "RELEASED").length,
    demanded: g.filter((x) => x.status === "DEMANDED").length,
  };
}

export function getCRBCounts() {
  const submissions = canViewCredit() ? seedCRBSubmissions : [];
  const enquiries = canViewCredit() ? seedCRBEnquiries : [];
  return {
    submissions: submissions.length,
    submitted: submissions.filter((s) => s.status === "SUBMITTED" || s.status === "ACKNOWLEDGED").length,
    pending: submissions.filter((s) => s.status === "PENDING").length,
    failed: submissions.filter((s) => s.status === "FAILED").length,
    enquiries: enquiries.length,
    pendingEnquiries: enquiries.filter((e) => e.status === "PENDING").length,
  };
}