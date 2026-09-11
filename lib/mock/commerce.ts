// lib/mock/commerce.ts
// PNL-09 Commerce and Finance - mock infrastructure.
// Money is integer minor units + ISO 4217 currency. Never floats.

import { getCurrentUser } from "./current-user";

// ---------- Types ----------

export type TransactionType = "PAYMENT" | "REFUND" | "PAYOUT" | "ADJUSTMENT";
export type TransactionSurface = "EVENTS" | "SHOP" | "COURSES" | "SUBSCRIPTIONS" | "DONATIONS" | "SAVINGS";
export type TransactionMethod = "MPESA" | "CARD" | "BANK" | "INTERNAL";
export type TransactionStatus = "PENDING" | "SUCCESS" | "FAILED" | "REVERSED";

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  surface?: TransactionSurface;
  memberId: string;
  memberNumber: string;
  amountMinor: number;
  currency: string;
  method: TransactionMethod;
  pspReference?: string;
  pspAcceptedAt?: string;
  pspSettledAt?: string;
  ledgerPairId?: string;
  orderId?: string;
  status: TransactionStatus;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceMinor: number;
  totalMinor: number;
}

export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
export type FulfilmentStatus = "NOT_STARTED" | "IN_PROGRESS" | "FULFILLED" | "CANCELLED";

export interface Order {
  id: string;
  reference: string;
  memberId: string;
  memberNumber: string;
  surface: TransactionSurface;
  itemsCount: number;
  items: OrderItem[];
  totalMinor: number;
  currency: string;
  paymentStatus: PaymentStatus;
  fulfilmentStatus: FulfilmentStatus;
  createdAt: string;
  fulfilledAt?: string;
  transactionId?: string;
}

export type RefundStatus = "PENDING" | "APPROVED" | "REJECTED" | "EXECUTED" | "FAILED";

export interface Refund {
  id: string;
  reference: string;
  transactionId: string;
  transactionReference: string;
  orderId?: string;
  memberId: string;
  memberNumber: string;
  surface: TransactionSurface;
  amountMinor: number;
  currency: string;
  reason: string;
  initiatedBy: string;
  createdAt: string;
  status: RefundStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  ledgerPairId?: string;
  pspRefundReference?: string;
}

export type SettlementStatus = "EXPECTED" | "RECEIVED" | "OVERDUE" | "DISCREPANCY" | "CANCELLED";
export type SettlementPsp = "MPESA" | "CARD_PROVIDER" | "BANK";

export interface Settlement {
  id: string;
  reference: string;
  psp: SettlementPsp;
  periodFrom: string;
  periodTo: string;
  grossMinor: number;
  feesMinor: number;
  netMinor: number;
  currency: string;
  expectedAt: string;
  receivedAt?: string;
  status: SettlementStatus;
  bankReference?: string;
  statementUrl?: string;
  transactionCount: number;
}

export type ReconRunSource = "NIGHTLY" | "MANUAL";
export type ReconRunStatus = "BALANCED" | "EXCEPTIONS" | "INCOMPLETE" | "FAILED";

export interface ReconciliationRun {
  id: string;
  date: string;
  runAt: string;
  source: ReconRunSource;
  matched: number;
  unmatched: number;
  exceptions: number;
  durationSeconds: number;
  status: ReconRunStatus;
}

export type ExceptionType = "MISSING_IN_LEDGER" | "MISSING_IN_PSP" | "AMOUNT_MISMATCH" | "DUPLICATE" | "ORPHANED";
export type ExceptionStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "ESCALATED";

export interface ReconciliationException {
  id: string;
  reference: string;
  type: ExceptionType;
  runId: string;
  amountMinor?: number;
  currency?: string;
  createdAt: string;
  ageHours: number;
  assignedTo?: string;
  status: ExceptionStatus;
  transactionId?: string;
  orderId?: string;
  pspReference?: string;
  pspEvidence?: string;
  resolution?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export type ProductSurface = "EVENTS" | "SHOP" | "COURSES" | "SUBSCRIPTIONS" | "DONATIONS";
export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";
export type ProductVisibility = "PUBLIC" | "MEMBER_ONLY" | "HIDDEN";

export interface Product {
  id: string;
  name: string;
  slug: string;
  surface: ProductSurface;
  category?: string;
  description?: string;
  priceMinor: number;
  currency: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  imageUrl?: string;
  activeCodes: number;
  createdAt: string;
  lastEditedAt: string;
  lastEditedBy: string;
}

export type CodeType = "PERCENT" | "FIXED_AMOUNT" | "FULL_WAIVER";
export type CodeScope = "ALL" | "SURFACE" | "PRODUCT" | "TIER" | "MEMBER_LIST";
export type CodeStatus = "DRAFT" | "ACTIVE" | "EXPIRED" | "EXHAUSTED" | "REVOKED";
export type MemberTier = "STUDENT" | "PROFESSIONAL" | "ASSOCIATE";

export interface DiscountCode {
  id: string;
  code: string;
  description: string;
  type: CodeType;
  valuePercent?: number;
  valueMinor?: number;
  currency?: string;
  scope: CodeScope;
  surface?: ProductSurface;
  productIds?: string[];
  memberTier?: MemberTier;
  memberIds?: string[];
  validFrom: string;
  validTo: string;
  usageCap?: number;
  redemptions: number;
  status: CodeStatus;
  createdBy: string;
  createdAt: string;
}

export type SubscriptionFrequency = "MONTHLY" | "QUARTERLY" | "ANNUAL";
export type SubscriptionStatus = "ACTIVE" | "PAUSED" | "DUNNING" | "CANCELLED" | "EXPIRED";
export type ChargeStatus = "SUCCESS" | "FAILED" | "PENDING";

export interface Subscription {
  id: string;
  memberId: string;
  memberNumber: string;
  planId: string;
  planName: string;
  amountMinor: number;
  currency: string;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  startedAt: string;
  nextChargeAt?: string;
  lastChargedAt?: string;
  lastChargeStatus?: ChargeStatus;
  cancelledAt?: string;
  cancellationReason?: string;
  dunningAttempts: number;
  pausedUntil?: string;
}

export type LedgerAccountType = "MEMBER" | "CIRCLE" | "ORG" | "TREASURY";
export type LedgerEntryType = "DEBIT" | "CREDIT";

export interface LedgerEntry {
  id: string;
  createdAt: string;
  accountId: string;
  accountType: LedgerAccountType;
  entryType: LedgerEntryType;
  amountMinor: number;
  currency: string;
  pairId: string;
  counterpartyAccountId: string;
  reference: string;
  reversesEntryId?: string;
  reversedByEntryId?: string;
  postedBy: string;
}

export type ReportKey =
  | "TRIAL_BALANCE"
  | "LEDGER_DETAIL"
  | "REVENUE_BY_SURFACE"
  | "REVENUE_BY_CHAPTER"
  | "REFUNDS_LOG"
  | "SETTLEMENT_SUMMARY"
  | "EXCEPTION_LOG"
  | "VAT_SUMMARY"
  | "AR_AGEING";

export type ReportFormat = "PDF" | "CSV";
export type ReportRunStatus = "PENDING" | "READY" | "FAILED";

export interface FinancialReport {
  key: ReportKey;
  name: string;
  description: string;
  typicalPeriod: "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "ANNUAL" | "CUSTOM";
  format: ReportFormat;
  lastRunAt?: string;
}

export interface ReportRun {
  id: string;
  reportKey: ReportKey;
  periodFrom: string;
  periodTo: string;
  generatedBy: string;
  generatedAt: string;
  format: ReportFormat;
  pdfUrl?: string;
  csvUrl?: string;
  status: ReportRunStatus;
}

// ---------- Permission helpers ----------

const FINANCE_VIEW = ["SUPER_ADMIN", "ADMIN", "FINANCE_OFFICER", "COMPLIANCE_LEAD"];
const FINANCE_ACTION = ["SUPER_ADMIN", "FINANCE_OFFICER"];
const FINANCE_REPORT_EXPORT = ["SUPER_ADMIN", "FINANCE_OFFICER", "COMPLIANCE_LEAD"];

export function canViewCommerce(): boolean {
  return FINANCE_VIEW.includes(getCurrentUser().role);
}

export function canActionCommerce(): boolean {
  return FINANCE_ACTION.includes(getCurrentUser().role);
}

export function canApproveRefund(refundId: string): boolean {
  const me = getCurrentUser();
  if (!FINANCE_ACTION.includes(me.role)) return false;
  const r = seedRefunds.find((x) => x.id === refundId);
  if (!r) return false;
  if (r.initiatedBy === me.name) return false;
  if (r.status !== "PENDING") return false;
  return true;
}

export function canEditPrice(): boolean {
  return FINANCE_ACTION.includes(getCurrentUser().role);
}

export function canEditCodeValue(): boolean {
  return FINANCE_ACTION.includes(getCurrentUser().role);
}

export function canExportReports(): boolean {
  return FINANCE_REPORT_EXPORT.includes(getCurrentUser().role);
}

// ---------- Seed: transactions ----------

const now = new Date();
const days = (n: number) => new Date(now.getTime() + n * 86400000).toISOString();
const hours = (n: number) => new Date(now.getTime() + n * 3600000).toISOString();

export const seedTransactions: Transaction[] = [
  { id: "tx-1", reference: "TXN-26-00412", type: "PAYMENT", surface: "EVENTS", memberId: "m-1", memberNumber: "TEG-26-KU-0042", amountMinor: 150000, currency: "KES", method: "MPESA", pspReference: "MPESA-9XK2A8", pspAcceptedAt: hours(-3), pspSettledAt: hours(-3), ledgerPairId: "lp-tx-1", orderId: "or-1", status: "SUCCESS", createdAt: hours(-3) },
  { id: "tx-2", reference: "TXN-26-00411", type: "PAYMENT", surface: "COURSES", memberId: "m-2", memberNumber: "TEG-26-UON-0031", amountMinor: 500000, currency: "KES", method: "MPESA", pspReference: "MPESA-7LP4C2", pspAcceptedAt: hours(-8), pspSettledAt: hours(-8), ledgerPairId: "lp-tx-2", orderId: "or-2", status: "SUCCESS", createdAt: hours(-8) },
  { id: "tx-3", reference: "TXN-26-00410", type: "PAYMENT", surface: "SHOP", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", amountMinor: 85000, currency: "KES", method: "CARD", pspReference: "CARD-1Z9K4P", pspAcceptedAt: days(-1), pspSettledAt: days(-1), ledgerPairId: "lp-tx-3", orderId: "or-3", status: "SUCCESS", createdAt: days(-1) },
  { id: "tx-4", reference: "TXN-26-00409", type: "PAYMENT", surface: "DONATIONS", memberId: "m-4", memberNumber: "TEG-26-KU-0018", amountMinor: 1000000, currency: "KES", method: "MPESA", pspReference: "MPESA-8XQ1M7", pspAcceptedAt: days(-2), pspSettledAt: days(-2), ledgerPairId: "lp-tx-4", status: "SUCCESS", createdAt: days(-2) },
  { id: "tx-5", reference: "TXN-26-00408", type: "PAYMENT", surface: "SUBSCRIPTIONS", memberId: "m-5", memberNumber: "TEG-26-UON-0011", amountMinor: 250000, currency: "KES", method: "MPESA", pspReference: "MPESA-4NB6K1", pspAcceptedAt: days(-3), pspSettledAt: days(-3), ledgerPairId: "lp-tx-5", status: "SUCCESS", createdAt: days(-3) },
  { id: "tx-6", reference: "TXN-26-00407", type: "REFUND", surface: "SHOP", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", amountMinor: 85000, currency: "KES", method: "CARD", pspReference: "CARD-1Z9K4P-REF", ledgerPairId: "lp-tx-6", status: "SUCCESS", createdAt: days(-3) },
  { id: "tx-7", reference: "TXN-26-00406", type: "PAYMENT", surface: "EVENTS", memberId: "m-6", memberNumber: "TEG-26-STRATH-0055", amountMinor: 75000, currency: "KES", method: "MPESA", pspReference: "MPESA-2QW9L3", pspAcceptedAt: days(-4), pspSettledAt: days(-4), ledgerPairId: "lp-tx-7", orderId: "or-4", status: "SUCCESS", createdAt: days(-4) },
  { id: "tx-8", reference: "TXN-26-00405", type: "PAYMENT", surface: "COURSES", memberId: "m-7", memberNumber: "TEG-26-UON-0021", amountMinor: 500000, currency: "KES", method: "MPESA", pspReference: "MPESA-5YT3H8", pspAcceptedAt: days(-5), pspSettledAt: days(-5), ledgerPairId: "lp-tx-8", orderId: "or-5", status: "SUCCESS", createdAt: days(-5) },
  { id: "tx-9", reference: "TXN-26-00404", type: "PAYMENT", surface: "SHOP", memberId: "m-8", memberNumber: "TEG-26-KSM-0045", amountMinor: 120000, currency: "KES", method: "MPESA", pspReference: "MPESA-6RH8M1", pspAcceptedAt: days(-6), pspSettledAt: days(-6), ledgerPairId: "lp-tx-9", orderId: "or-6", status: "SUCCESS", createdAt: days(-6) },
  { id: "tx-10", reference: "TXN-26-00403", type: "PAYMENT", surface: "DONATIONS", memberId: "m-1", memberNumber: "TEG-26-KU-0042", amountMinor: 500000, currency: "KES", method: "BANK", pspReference: "BANK-3FV7N2", pspAcceptedAt: days(-7), pspSettledAt: days(-7), ledgerPairId: "lp-tx-10", status: "SUCCESS", createdAt: days(-7) },
  { id: "tx-11", reference: "TXN-26-00402", type: "PAYMENT", surface: "EVENTS", memberId: "m-2", memberNumber: "TEG-26-UON-0031", amountMinor: 90000, currency: "KES", method: "MPESA", pspReference: "MPESA-9BK2P4", pspAcceptedAt: days(-8), ledgerPairId: "lp-tx-11", orderId: "or-7", status: "FAILED", createdAt: days(-8) },
  { id: "tx-12", reference: "TXN-26-00401", type: "PAYMENT", surface: "SHOP", memberId: "m-4", memberNumber: "TEG-26-KU-0018", amountMinor: 65000, currency: "KES", method: "MPESA", pspReference: "MPESA-7DM4R9", pspAcceptedAt: days(-9), pspSettledAt: days(-9), ledgerPairId: "lp-tx-12", orderId: "or-8", status: "SUCCESS", createdAt: days(-9) },
  { id: "tx-13", reference: "TXN-26-00400", type: "PAYMENT", surface: "COURSES", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", amountMinor: 500000, currency: "KES", method: "MPESA", pspReference: "MPESA-3GK8Q1", pspAcceptedAt: days(-10), pspSettledAt: days(-10), ledgerPairId: "lp-tx-13", orderId: "or-9", status: "SUCCESS", createdAt: days(-10) },
  { id: "tx-14", reference: "TXN-26-00399", type: "PAYMENT", surface: "SUBSCRIPTIONS", memberId: "m-6", memberNumber: "TEG-26-STRATH-0055", amountMinor: 250000, currency: "KES", method: "MPESA", pspReference: "MPESA-1PT5V6", pspAcceptedAt: days(-12), pspSettledAt: days(-12), ledgerPairId: "lp-tx-14", status: "SUCCESS", createdAt: days(-12) },
  { id: "tx-15", reference: "TXN-26-00398", type: "PAYMENT", surface: "EVENTS", memberId: "m-5", memberNumber: "TEG-26-UON-0011", amountMinor: 150000, currency: "KES", method: "MPESA", pspReference: "MPESA-8WV2S4", pspAcceptedAt: days(-14), pspSettledAt: days(-14), ledgerPairId: "lp-tx-15", orderId: "or-10", status: "SUCCESS", createdAt: days(-14) },
];

// ---------- Seed: orders ----------

const orderItem = (id: string, name: string, unit: number, qty = 1): OrderItem => ({
  id: `oi-${id}`,
  productId: `pr-${id}`,
  productName: name,
  quantity: qty,
  unitPriceMinor: unit,
  totalMinor: unit * qty,
});

export const seedOrders: Order[] = [
  { id: "or-1", reference: "ORD-26-00301", memberId: "m-1", memberNumber: "TEG-26-KU-0042", surface: "EVENTS", itemsCount: 1, items: [orderItem("1", "Market Outlook 2026 ticket", 150000)], totalMinor: 150000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "FULFILLED", createdAt: hours(-3), fulfilledAt: hours(-3), transactionId: "tx-1" },
  { id: "or-2", reference: "ORD-26-00300", memberId: "m-2", memberNumber: "TEG-26-UON-0031", surface: "COURSES", itemsCount: 1, items: [orderItem("2", "Marketplace Ethics cohort seat", 500000)], totalMinor: 500000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "FULFILLED", createdAt: hours(-8), fulfilledAt: hours(-8), transactionId: "tx-2" },
  { id: "or-3", reference: "ORD-26-00299", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", surface: "SHOP", itemsCount: 2, items: [orderItem("3a", "TEG journal", 50000, 1), orderItem("3b", "Kingdom Resources booklet", 35000, 1)], totalMinor: 85000, currency: "KES", paymentStatus: "REFUNDED", fulfilmentStatus: "CANCELLED", createdAt: days(-1), fulfilledAt: days(-1), transactionId: "tx-3" },
  { id: "or-4", reference: "ORD-26-00298", memberId: "m-6", memberNumber: "TEG-26-STRATH-0055", surface: "EVENTS", itemsCount: 1, items: [orderItem("4", "Governance Forum ticket", 75000)], totalMinor: 75000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "FULFILLED", createdAt: days(-4), fulfilledAt: days(-4), transactionId: "tx-7" },
  { id: "or-5", reference: "ORD-26-00297", memberId: "m-7", memberNumber: "TEG-26-UON-0021", surface: "COURSES", itemsCount: 1, items: [orderItem("5", "Technology with Integrity cohort seat", 500000)], totalMinor: 500000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "IN_PROGRESS", createdAt: days(-5), transactionId: "tx-8" },
  { id: "or-6", reference: "ORD-26-00296", memberId: "m-8", memberNumber: "TEG-26-KSM-0045", surface: "SHOP", itemsCount: 1, items: [orderItem("6", "Study pack", 120000)], totalMinor: 120000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "FULFILLED", createdAt: days(-6), fulfilledAt: days(-6), transactionId: "tx-9" },
  { id: "or-7", reference: "ORD-26-00295", memberId: "m-2", memberNumber: "TEG-26-UON-0031", surface: "EVENTS", itemsCount: 1, items: [orderItem("7", "Leadership Breakfast ticket", 90000)], totalMinor: 90000, currency: "KES", paymentStatus: "FAILED", fulfilmentStatus: "NOT_STARTED", createdAt: days(-8), transactionId: "tx-11" },
  { id: "or-8", reference: "ORD-26-00294", memberId: "m-4", memberNumber: "TEG-26-KU-0018", surface: "SHOP", itemsCount: 1, items: [orderItem("8", "Notebook set", 65000)], totalMinor: 65000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "FULFILLED", createdAt: days(-9), fulfilledAt: days(-9), transactionId: "tx-12" },
  { id: "or-9", reference: "ORD-26-00293", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", surface: "COURSES", itemsCount: 1, items: [orderItem("9", "Foundation cohort seat", 500000)], totalMinor: 500000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "FULFILLED", createdAt: days(-10), fulfilledAt: days(-10), transactionId: "tx-13" },
  { id: "or-10", reference: "ORD-26-00292", memberId: "m-5", memberNumber: "TEG-26-UON-0011", surface: "EVENTS", itemsCount: 1, items: [orderItem("10", "Networking dinner ticket", 150000)], totalMinor: 150000, currency: "KES", paymentStatus: "PAID", fulfilmentStatus: "FULFILLED", createdAt: days(-14), fulfilledAt: days(-14), transactionId: "tx-15" },
];

// ---------- Seed: refunds ----------

export const seedRefunds: Refund[] = [
  { id: "rf-1", reference: "RFD-26-00042", transactionId: "tx-3", transactionReference: "TXN-26-00410", orderId: "or-3", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", surface: "SHOP", amountMinor: 85000, currency: "KES", reason: "Item arrived damaged", initiatedBy: "Miriam K.", createdAt: days(-1), status: "PENDING" },
  { id: "rf-2", reference: "RFD-26-00041", transactionId: "tx-15", transactionReference: "TXN-26-00398", orderId: "or-10", memberId: "m-5", memberNumber: "TEG-26-UON-0011", surface: "EVENTS", amountMinor: 150000, currency: "KES", reason: "Event cancelled by organisers", initiatedBy: "Miriam K.", createdAt: days(-2), status: "PENDING" },
  { id: "rf-3", reference: "RFD-26-00040", transactionId: "tx-8", transactionReference: "TXN-26-00405", orderId: "or-5", memberId: "m-7", memberNumber: "TEG-26-UON-0021", surface: "COURSES", amountMinor: 500000, currency: "KES", reason: "Cannot attend the cohort dates", initiatedBy: "Solomon A.", createdAt: days(-3), status: "APPROVED", approvedBy: "Miriam K.", approvedAt: days(-2) },
  { id: "rf-4", reference: "RFD-26-00039", transactionId: "tx-12", transactionReference: "TXN-26-00401", orderId: "or-8", memberId: "m-4", memberNumber: "TEG-26-KU-0018", surface: "SHOP", amountMinor: 65000, currency: "KES", reason: "Duplicate order", initiatedBy: "Miriam K.", createdAt: days(-5), status: "REJECTED", rejectedBy: "Solomon A.", rejectedAt: days(-4), rejectionReason: "Order is not a duplicate. Confirm with member first." },
  { id: "rf-5", reference: "RFD-26-00038", transactionId: "tx-6", transactionReference: "TXN-26-00407", orderId: "or-3", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", surface: "SHOP", amountMinor: 85000, currency: "KES", reason: "Damaged item - second attempt", initiatedBy: "Solomon A.", createdAt: days(-7), status: "EXECUTED", approvedBy: "Miriam K.", approvedAt: days(-6), ledgerPairId: "lp-tx-6", pspRefundReference: "CARD-1Z9K4P-REF" },
];

// ---------- Seed: settlements ----------

export const seedSettlements: Settlement[] = [
  { id: "st-1", reference: "SET-26-MP-0042", psp: "MPESA", periodFrom: days(-1), periodTo: days(-1), grossMinor: 2450000, feesMinor: 49000, netMinor: 2401000, currency: "KES", expectedAt: days(0), receivedAt: hours(-4), status: "RECEIVED", bankReference: "BNK-2026-09-28-MP-42", statementUrl: "#", transactionCount: 42 },
  { id: "st-2", reference: "SET-26-MP-0041", psp: "MPESA", periodFrom: days(-2), periodTo: days(-2), grossMinor: 3120000, feesMinor: 62400, netMinor: 3057600, currency: "KES", expectedAt: days(-1), receivedAt: days(-1), status: "RECEIVED", bankReference: "BNK-2026-09-27-MP-41", statementUrl: "#", transactionCount: 56 },
  { id: "st-3", reference: "SET-26-CARD-0018", psp: "CARD_PROVIDER", periodFrom: days(-3), periodTo: days(-1), grossMinor: 850000, feesMinor: 25500, netMinor: 824500, currency: "KES", expectedAt: days(1), status: "EXPECTED", statementUrl: "#", transactionCount: 8 },
  { id: "st-4", reference: "SET-26-MP-0040", psp: "MPESA", periodFrom: days(-4), periodTo: days(-4), grossMinor: 2680000, feesMinor: 53600, netMinor: 2626400, currency: "KES", expectedAt: days(-3), status: "OVERDUE", statementUrl: "#", transactionCount: 47 },
  { id: "st-5", reference: "SET-26-BANK-0006", psp: "BANK", periodFrom: days(-10), periodTo: days(-7), grossMinor: 500000, feesMinor: 0, netMinor: 500000, currency: "KES", expectedAt: days(-5), receivedAt: days(-5), status: "RECEIVED", bankReference: "BNK-2026-09-23-BK-06", statementUrl: "#", transactionCount: 1 },
];

// ---------- Seed: reconciliation ----------

export const seedReconRuns: ReconciliationRun[] = [
  { id: "rr-1", date: days(0), runAt: hours(-6), source: "NIGHTLY", matched: 118, unmatched: 0, exceptions: 0, durationSeconds: 48, status: "BALANCED" },
  { id: "rr-2", date: days(-1), runAt: days(-1), source: "NIGHTLY", matched: 124, unmatched: 1, exceptions: 1, durationSeconds: 61, status: "EXCEPTIONS" },
  { id: "rr-3", date: days(-2), runAt: days(-2), source: "NIGHTLY", matched: 111, unmatched: 0, exceptions: 0, durationSeconds: 44, status: "BALANCED" },
  { id: "rr-4", date: days(-3), runAt: days(-3), source: "NIGHTLY", matched: 98, unmatched: 0, exceptions: 0, durationSeconds: 39, status: "BALANCED" },
  { id: "rr-5", date: days(-4), runAt: days(-4), source: "NIGHTLY", matched: 130, unmatched: 2, exceptions: 2, durationSeconds: 66, status: "EXCEPTIONS" },
  { id: "rr-6", date: days(-5), runAt: days(-5), source: "MANUAL", matched: 120, unmatched: 0, exceptions: 0, durationSeconds: 41, status: "BALANCED" },
  { id: "rr-7", date: days(-6), runAt: days(-6), source: "NIGHTLY", matched: 118, unmatched: 0, exceptions: 0, durationSeconds: 42, status: "BALANCED" },
];

export const seedExceptions: ReconciliationException[] = [
  { id: "ex-1", reference: "EXC-26-00201", type: "AMOUNT_MISMATCH", runId: "rr-2", amountMinor: 150000, currency: "KES", createdAt: days(-1), ageHours: 24, assignedTo: "Miriam K.", status: "INVESTIGATING", transactionId: "tx-15", orderId: "or-10", pspReference: "MPESA-8WV2S4", pspEvidence: "PSP shows KES 1,400.00, ledger shows KES 1,500.00." },
  { id: "ex-2", reference: "EXC-26-00200", type: "MISSING_IN_LEDGER", runId: "rr-5", amountMinor: 90000, currency: "KES", createdAt: days(-4), ageHours: 96, status: "OPEN", pspReference: "MPESA-9BK2P4", pspEvidence: "PSP shows successful payment, no ledger entry." },
  { id: "ex-3", reference: "EXC-26-00199", type: "DUPLICATE", runId: "rr-5", amountMinor: 150000, currency: "KES", createdAt: days(-4), ageHours: 96, status: "OPEN", transactionId: "tx-1", pspReference: "MPESA-9XK2A8", pspEvidence: "PSP reports one transaction, ledger has two entries." },
];

// ---------- Seed: products ----------

export const seedProducts: Product[] = [
  { id: "pr-1", name: "Market Outlook 2026 ticket", slug: "market-outlook-2026", surface: "EVENTS", category: "CONFERENCE", priceMinor: 150000, currency: "KES", status: "ACTIVE", visibility: "PUBLIC", activeCodes: 0, createdAt: days(-90), lastEditedAt: days(-10), lastEditedBy: "Solomon A." },
  { id: "pr-2", name: "Marketplace Ethics cohort seat", slug: "marketplace-ethics-cohort", surface: "COURSES", category: "COURSE", priceMinor: 500000, currency: "KES", status: "ACTIVE", visibility: "MEMBER_ONLY", activeCodes: 2, createdAt: days(-120), lastEditedAt: days(-20), lastEditedBy: "Miriam K." },
  { id: "pr-3", name: "Technology with Integrity cohort seat", slug: "technology-integrity-cohort", surface: "COURSES", category: "COURSE", priceMinor: 500000, currency: "KES", status: "ACTIVE", visibility: "MEMBER_ONLY", activeCodes: 1, createdAt: days(-100), lastEditedAt: days(-15), lastEditedBy: "Miriam K." },
  { id: "pr-4", name: "TEG journal", slug: "teg-journal", surface: "SHOP", category: "MERCHANDISE", priceMinor: 50000, currency: "KES", status: "ACTIVE", visibility: "PUBLIC", activeCodes: 0, createdAt: days(-200), lastEditedAt: days(-30), lastEditedBy: "Solomon A." },
  { id: "pr-5", name: "Kingdom Resources booklet", slug: "kingdom-resources-booklet", surface: "SHOP", category: "RESOURCES", priceMinor: 35000, currency: "KES", status: "ACTIVE", visibility: "PUBLIC", activeCodes: 0, createdAt: days(-180), lastEditedAt: days(-25), lastEditedBy: "Solomon A." },
  { id: "pr-6", name: "Standard membership", slug: "standard-membership", surface: "SUBSCRIPTIONS", category: "PLAN", priceMinor: 250000, currency: "KES", status: "ACTIVE", visibility: "MEMBER_ONLY", activeCodes: 0, createdAt: days(-300), lastEditedAt: days(-60), lastEditedBy: "Miriam K." },
  { id: "pr-7", name: "Support Pack: Silver", slug: "support-pack-silver", surface: "DONATIONS", category: "SPONSORSHIP", priceMinor: 500000, currency: "KES", status: "ACTIVE", visibility: "PUBLIC", activeCodes: 1, createdAt: days(-90), lastEditedAt: days(-30), lastEditedBy: "Miriam K." },
  { id: "pr-8", name: "Governance Forum ticket", slug: "governance-forum-ticket", surface: "EVENTS", category: "CONFERENCE", priceMinor: 75000, currency: "KES", status: "DRAFT", visibility: "HIDDEN", activeCodes: 0, createdAt: days(-15), lastEditedAt: days(-3), lastEditedBy: "Miriam K." },
];

// ---------- Seed: discount codes ----------

export const seedCodes: DiscountCode[] = [
  { id: "dc-1", code: "LAUNCH2026", description: "Launch discount for events", type: "PERCENT", valuePercent: 20, scope: "SURFACE", surface: "EVENTS", validFrom: days(-30), validTo: days(30), usageCap: 100, redemptions: 42, status: "ACTIVE", createdBy: "Miriam K.", createdAt: days(-30) },
  { id: "dc-2", code: "SCHOLAR-FOUNDATION-01", description: "Full scholarship for Foundation cohort", type: "FULL_WAIVER", scope: "PRODUCT", productIds: ["pr-3"], memberTier: "STUDENT", validFrom: days(-20), validTo: days(40), usageCap: 20, redemptions: 12, status: "ACTIVE", createdBy: "Miriam K.", createdAt: days(-20) },
  { id: "dc-3", code: "SPONSOR-KU-2026", description: "Kenyatta University chapter sponsorship", type: "FIXED_AMOUNT", valueMinor: 100000, currency: "KES", scope: "MEMBER_LIST", memberIds: ["user-solomon"], validFrom: days(-15), validTo: days(60), usageCap: 5, redemptions: 2, status: "ACTIVE", createdBy: "Solomon A.", createdAt: days(-15) },
  { id: "dc-4", code: "STUDENT50", description: "50% off for students", type: "PERCENT", valuePercent: 50, scope: "TIER", memberTier: "STUDENT", validFrom: days(-60), validTo: days(-10), usageCap: 200, redemptions: 78, status: "EXPIRED", createdBy: "Miriam K.", createdAt: days(-60) },
  { id: "dc-5", code: "EARLYBIRD-GOV", description: "Early bird for Governance Forum", type: "PERCENT", valuePercent: 25, scope: "PRODUCT", productIds: ["pr-8"], validFrom: days(5), validTo: days(35), usageCap: 50, redemptions: 0, status: "DRAFT", createdBy: "Miriam K.", createdAt: days(-2) },
];

// ---------- Seed: subscriptions ----------

export const seedSubscriptions: Subscription[] = [
  { id: "sub-1", memberId: "m-5", memberNumber: "TEG-26-UON-0011", planId: "pr-6", planName: "Standard membership", amountMinor: 250000, currency: "KES", frequency: "MONTHLY", status: "ACTIVE", startedAt: days(-90), nextChargeAt: days(4), lastChargedAt: days(-26), lastChargeStatus: "SUCCESS", dunningAttempts: 0 },
  { id: "sub-2", memberId: "m-6", memberNumber: "TEG-26-STRATH-0055", planId: "pr-6", planName: "Standard membership", amountMinor: 250000, currency: "KES", frequency: "MONTHLY", status: "ACTIVE", startedAt: days(-150), nextChargeAt: days(12), lastChargedAt: days(-18), lastChargeStatus: "SUCCESS", dunningAttempts: 0 },
  { id: "sub-3", memberId: "m-4", memberNumber: "TEG-26-KU-0018", planId: "pr-6", planName: "Standard membership", amountMinor: 250000, currency: "KES", frequency: "MONTHLY", status: "DUNNING", startedAt: days(-60), nextChargeAt: days(2), lastChargedAt: days(-3), lastChargeStatus: "FAILED", dunningAttempts: 2 },
  { id: "sub-4", memberId: "m-2", memberNumber: "TEG-26-UON-0031", planId: "pr-6", planName: "Standard membership", amountMinor: 250000, currency: "KES", frequency: "MONTHLY", status: "PAUSED", startedAt: days(-120), pausedUntil: days(20), lastChargedAt: days(-40), lastChargeStatus: "SUCCESS", dunningAttempts: 0 },
  { id: "sub-5", memberId: "m-3", memberNumber: "TEG-26-STRATH-0027", planId: "pr-6", planName: "Standard membership", amountMinor: 250000, currency: "KES", frequency: "MONTHLY", status: "CANCELLED", startedAt: days(-200), cancelledAt: days(-15), cancellationReason: "Member relocated", dunningAttempts: 0 },
];

// ---------- Seed: ledger entries (paired) ----------

export const seedLedgerEntries: LedgerEntry[] = [
  { id: "le-1", createdAt: hours(-3), accountId: "acc-treasury-kes", accountType: "TREASURY", entryType: "DEBIT", amountMinor: 150000, currency: "KES", pairId: "lp-tx-1", counterpartyAccountId: "acc-m-1", reference: "TXN-26-00412", postedBy: "system" },
  { id: "le-2", createdAt: hours(-3), accountId: "acc-m-1", accountType: "MEMBER", entryType: "CREDIT", amountMinor: 150000, currency: "KES", pairId: "lp-tx-1", counterpartyAccountId: "acc-treasury-kes", reference: "TXN-26-00412", postedBy: "system" },
  { id: "le-3", createdAt: hours(-8), accountId: "acc-treasury-kes", accountType: "TREASURY", entryType: "DEBIT", amountMinor: 500000, currency: "KES", pairId: "lp-tx-2", counterpartyAccountId: "acc-m-2", reference: "TXN-26-00411", postedBy: "system" },
  { id: "le-4", createdAt: hours(-8), accountId: "acc-m-2", accountType: "MEMBER", entryType: "CREDIT", amountMinor: 500000, currency: "KES", pairId: "lp-tx-2", counterpartyAccountId: "acc-treasury-kes", reference: "TXN-26-00411", postedBy: "system" },
  { id: "le-5", createdAt: days(-1), accountId: "acc-treasury-kes", accountType: "TREASURY", entryType: "DEBIT", amountMinor: 85000, currency: "KES", pairId: "lp-tx-3", counterpartyAccountId: "acc-m-3", reference: "TXN-26-00410", postedBy: "system" },
  { id: "le-6", createdAt: days(-1), accountId: "acc-m-3", accountType: "MEMBER", entryType: "CREDIT", amountMinor: 85000, currency: "KES", pairId: "lp-tx-3", counterpartyAccountId: "acc-treasury-kes", reference: "TXN-26-00410", postedBy: "system" },
];

// ---------- Seed: reports ----------

export const seedReports: FinancialReport[] = [
  { key: "TRIAL_BALANCE", name: "Trial balance", description: "Every account, debit and credit totals.", typicalPeriod: "MONTHLY", format: "PDF", lastRunAt: days(-2) },
  { key: "LEDGER_DETAIL", name: "Ledger detail", description: "Every entry in the range.", typicalPeriod: "MONTHLY", format: "CSV", lastRunAt: days(-2) },
  { key: "REVENUE_BY_SURFACE", name: "Revenue by surface", description: "Revenue grouped by commerce surface.", typicalPeriod: "MONTHLY", format: "PDF", lastRunAt: days(-2) },
  { key: "REVENUE_BY_CHAPTER", name: "Revenue by chapter", description: "Revenue attributed to each chapter.", typicalPeriod: "MONTHLY", format: "PDF" },
  { key: "REFUNDS_LOG", name: "Refunds log", description: "Every refund with its approver.", typicalPeriod: "MONTHLY", format: "CSV" },
  { key: "SETTLEMENT_SUMMARY", name: "Settlement summary", description: "Per-PSP settlement history.", typicalPeriod: "MONTHLY", format: "PDF", lastRunAt: days(-2) },
  { key: "EXCEPTION_LOG", name: "Exception log", description: "Every reconciliation exception and its resolution.", typicalPeriod: "MONTHLY", format: "CSV" },
  { key: "VAT_SUMMARY", name: "VAT summary", description: "Taxable revenue and VAT collected.", typicalPeriod: "QUARTERLY", format: "PDF" },
  { key: "AR_AGEING", name: "Receivables ageing", description: "Outstanding amounts by age bucket.", typicalPeriod: "MONTHLY", format: "PDF" },
];

export const seedReportRuns: ReportRun[] = [
  { id: "rn-1", reportKey: "TRIAL_BALANCE", periodFrom: days(-32), periodTo: days(-2), generatedBy: "Miriam K.", generatedAt: days(-2), format: "PDF", pdfUrl: "#", status: "READY" },
  { id: "rn-2", reportKey: "LEDGER_DETAIL", periodFrom: days(-32), periodTo: days(-2), generatedBy: "Miriam K.", generatedAt: days(-2), format: "CSV", csvUrl: "#", status: "READY" },
  { id: "rn-3", reportKey: "SETTLEMENT_SUMMARY", periodFrom: days(-32), periodTo: days(-2), generatedBy: "Miriam K.", generatedAt: days(-2), format: "PDF", pdfUrl: "#", status: "READY" },
  { id: "rn-4", reportKey: "REVENUE_BY_SURFACE", periodFrom: days(-62), periodTo: days(-32), generatedBy: "Miriam K.", generatedAt: days(-32), format: "PDF", pdfUrl: "#", status: "READY" },
];

// ---------- Accessors ----------

export function getTransactions(): Transaction[] {
  if (!canViewCommerce()) return [];
  return [...seedTransactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTransactionById(id: string): Transaction | null {
  if (!canViewCommerce()) return null;
  return seedTransactions.find((t) => t.id === id) ?? null;
}

export function getOrders(): Order[] {
  if (!canViewCommerce()) return [];
  return [...seedOrders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getOrderById(id: string): Order | null {
  if (!canViewCommerce()) return null;
  return seedOrders.find((o) => o.id === id) ?? null;
}

export function getRefunds(): Refund[] {
  if (!canViewCommerce()) return [];
  return [...seedRefunds].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRefundById(id: string): Refund | null {
  if (!canViewCommerce()) return null;
  return seedRefunds.find((r) => r.id === id) ?? null;
}

export function getSettlements(): Settlement[] {
  if (!canViewCommerce()) return [];
  return [...seedSettlements].sort((a, b) => b.expectedAt.localeCompare(a.expectedAt));
}

export function getReconRuns(): ReconciliationRun[] {
  if (!canViewCommerce()) return [];
  return [...seedReconRuns].sort((a, b) => b.date.localeCompare(a.date));
}

export function getExceptions(): ReconciliationException[] {
  if (!canViewCommerce()) return [];
  return [...seedExceptions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProducts(): Product[] {
  if (!canViewCommerce()) return [];
  return [...seedProducts];
}

export function getProductById(id: string): Product | null {
  if (!canViewCommerce()) return null;
  return seedProducts.find((p) => p.id === id) ?? null;
}

export function getCodes(): DiscountCode[] {
  if (!canViewCommerce()) return [];
  return [...seedCodes].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSubscriptions(): Subscription[] {
  if (!canViewCommerce()) return [];
  return [...seedSubscriptions].sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getLedgerEntries(): LedgerEntry[] {
  if (!canViewCommerce()) return [];
  return [...seedLedgerEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getReports(): FinancialReport[] {
  if (!canViewCommerce()) return [];
  return [...seedReports];
}

export function getReportRuns(): ReportRun[] {
  if (!canViewCommerce()) return [];
  return [...seedReportRuns].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

// ---------- Helpers ----------

export function formatMoney(minor: number, currency: string): string {
  const whole = Math.floor(minor / 100);
  const cents = String(minor % 100).padStart(2, "0");
  return `${currency} ${whole.toLocaleString("en-KE")}.${cents}`;
}

export function refundAgeHours(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 3600000);
}

export function reconDaysClean(): number {
  let n = 0;
  for (const r of [...seedReconRuns].sort((a, b) => b.date.localeCompare(a.date))) {
    if (r.exceptions === 0 && r.status === "BALANCED") n++;
    else break;
  }
  return n;
}

// ---------- Labels ----------

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  PAYMENT: "Payment",
  REFUND: "Refund",
  PAYOUT: "Payout",
  ADJUSTMENT: "Adjustment",
};

export const TRANSACTION_SURFACE_LABELS: Record<TransactionSurface, string> = {
  EVENTS: "Events",
  SHOP: "Shop",
  COURSES: "Courses",
  SUBSCRIPTIONS: "Subscriptions",
  DONATIONS: "Donations",
  SAVINGS: "Savings",
};

export const TRANSACTION_METHOD_LABELS: Record<TransactionMethod, string> = {
  MPESA: "M-Pesa",
  CARD: "Card",
  BANK: "Bank",
  INTERNAL: "Internal",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  PENDING: "Pending",
  SUCCESS: "Success",
  FAILED: "Failed",
  REVERSED: "Reversed",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  PARTIALLY_REFUNDED: "Partially refunded",
};

export const FULFILMENT_STATUS_LABELS: Record<FulfilmentStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  EXECUTED: "Executed",
  FAILED: "Failed",
};

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  EXPECTED: "Expected",
  RECEIVED: "Received",
  OVERDUE: "Overdue",
  DISCREPANCY: "Discrepancy",
  CANCELLED: "Cancelled",
};

export const EXCEPTION_TYPE_LABELS: Record<ExceptionType, string> = {
  MISSING_IN_LEDGER: "Missing in ledger",
  MISSING_IN_PSP: "Missing in PSP",
  AMOUNT_MISMATCH: "Amount mismatch",
  DUPLICATE: "Duplicate",
  ORPHANED: "Orphaned",
};

export const EXCEPTION_STATUS_LABELS: Record<ExceptionStatus, string> = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  RESOLVED: "Resolved",
  ESCALATED: "Escalated",
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ARCHIVED: "Archived",
};

export const CODE_TYPE_LABELS: Record<CodeType, string> = {
  PERCENT: "Percentage",
  FIXED_AMOUNT: "Fixed amount",
  FULL_WAIVER: "Full waiver",
};

export const CODE_SCOPE_LABELS: Record<CodeScope, string> = {
  ALL: "All products",
  SURFACE: "Surface",
  PRODUCT: "Specific products",
  TIER: "Member tier",
  MEMBER_LIST: "Member list",
};

export const CODE_STATUS_LABELS: Record<CodeStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  EXHAUSTED: "Exhausted",
  REVOKED: "Revoked",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  DUNNING: "Dunning",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const SETTLEMENT_PSP_LABELS: Record<SettlementPsp, string> = {
  MPESA: "M-Pesa",
  CARD_PROVIDER: "Card provider",
  BANK: "Bank",
};