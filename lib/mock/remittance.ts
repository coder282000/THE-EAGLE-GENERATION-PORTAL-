// lib/mock/remittance.ts
// PNL-14 Remittance Operations — types, seed data, RLS-aware accessors,
// permission helpers. All money in integer minor units + ISO 4217.

import { getCurrentUser } from "./current-user";
import type { MockUser } from "@/components/mock/data";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type TransferDirection = "OUTBOUND" | "INBOUND";

export type TransferStatus =
  | "QUOTED"
  | "CONFIRMED"
  | "PAYMENT_RECEIVED"
  | "PAYOUT_INITIATED"
  | "PAYOUT_PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "REFUNDED"
  | "RECALLED";

export type Rail = "MPESA" | "AIRTEL_MONEY" | "BANK" | "MOBILE_MONEY";

export type CorridorStatus = "ACTIVE" | "PAUSED" | "DISABLED";

export type PayoutPartnerStatus = "ACTIVE" | "DEGRADED" | "OFFLINE";

export interface Corridor {
  id: string;
  code: string;                     // "KE-UG-MPESA"
  fromCountry: string;              // ISO 3166-1 alpha-2
  fromCurrency: string;             // "KES"
  toCountry: string;                // ISO
  toCurrency: string;               // "UGX"
  rail: Rail;
  status: CorridorStatus;
  minAmountMinor: number;
  maxAmountMinor: number;
  dailyCapMinor: number;
  cutoffLocalTime: string;          // "15:30"
  fxMarginBps: number;              // platform margin on top of mid-market
  payoutPartnerId: string;
  updatedAt: string;
  updatedBy: string;
}

export interface RemittanceTransfer {
  id: string;
  reference: string;                // REM-26-XXXXX
  direction: TransferDirection;
  status: TransferStatus;
  senderName: string;
  senderMemberNumber: string;
  recipientName: string;
  recipientPhone: string;
  corridorCode: string;
  fromCurrency: string;
  toCurrency: string;
  sendAmountMinor: number;
  payoutAmountMinor: number;
  feeMinor: number;
  fxRate: number;
  rail: Rail;
  payoutPartnerId: string;
  payoutPartnerName: string;
  travelRuleComplete: boolean;
  recallReason?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface PayoutPartner {
  id: string;
  code: string;                     // "PP-MPESA-KE"
  name: string;
  country: string;
  rail: Rail;
  status: PayoutPartnerStatus;
  successRate30d: number;           // 0-100
  avgLatencyMinutes: number;
  supportedCurrencies: string[];
  settlementAccount: string;        // masked
}

export interface FXRate {
  id: string;
  corridorCode: string;
  midMarket: number;
  platformRate: number;
  marginBps: number;
  refreshedAt: string;
}

export interface NostroBalance {
  id: string;
  corridorCode: string;
  partnerId: string;
  partnerName: string;
  currency: string;
  balanceMinor: number;
  operatingFloorMinor: number;
  sweepThresholdMinor: number;
  at: string;
}

export type ReturnStatus = "DRAFT" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "OVERDUE";

export interface RemittanceReturn {
  id: string;
  period: string;                   // "2026-Q1"
  corridorCode: string;
  regulator: string;                // "CBK", "BOU", etc.
  status: ReturnStatus;
  dueAt: string;
  submittedAt?: string;
  submittedBy?: string;
  note?: string;
}

// ─────────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────────

export const TRANSFER_DIRECTION_LABELS: Record<TransferDirection, string> = {
  OUTBOUND: "Outbound",
  INBOUND: "Inbound",
};

export const TRANSFER_STATUS_LABELS: Record<TransferStatus, string> = {
  QUOTED: "Quoted",
  CONFIRMED: "Confirmed",
  PAYMENT_RECEIVED: "Payment received",
  PAYOUT_INITIATED: "Payout initiated",
  PAYOUT_PROCESSING: "Payout processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  RECALLED: "Recalled",
};

export const RAIL_LABELS: Record<Rail, string> = {
  MPESA: "M-Pesa",
  AIRTEL_MONEY: "Airtel Money",
  BANK: "Bank transfer",
  MOBILE_MONEY: "Mobile money aggregator",
};

export const CORRIDOR_STATUS_LABELS: Record<CorridorStatus, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  DISABLED: "Disabled",
};

export const PARTNER_STATUS_LABELS: Record<PayoutPartnerStatus, string> = {
  ACTIVE: "Active",
  DEGRADED: "Degraded",
  OFFLINE: "Offline",
};

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  OVERDUE: "Overdue",
};

// ─────────────────────────────────────────────────────────────
// Money formatting
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
const future = (daysAhead: number) =>
  new Date(now.getTime() + daysAhead * 86400000).toISOString();

export const seedCorridors: Corridor[] = [
  {
    id: "cor-001",
    code: "KE-UG-MPESA",
    fromCountry: "KE",
    fromCurrency: "KES",
    toCountry: "UG",
    toCurrency: "UGX",
    rail: "MPESA",
    status: "ACTIVE",
    minAmountMinor: 100_00,
    maxAmountMinor: 1_500_000_00,
    dailyCapMinor: 20_000_000_00,
    cutoffLocalTime: "15:30",
    fxMarginBps: 85,
    payoutPartnerId: "pp-002",
    updatedAt: iso(3),
    updatedBy: "u-admin-01",
  },
  {
    id: "cor-002",
    code: "KE-TZ-MPESA",
    fromCountry: "KE",
    fromCurrency: "KES",
    toCountry: "TZ",
    toCurrency: "TZS",
    rail: "MPESA",
    status: "ACTIVE",
    minAmountMinor: 100_00,
    maxAmountMinor: 1_500_000_00,
    dailyCapMinor: 15_000_000_00,
    cutoffLocalTime: "15:00",
    fxMarginBps: 90,
    payoutPartnerId: "pp-003",
    updatedAt: iso(5),
    updatedBy: "u-admin-01",
  },
  {
    id: "cor-003",
    code: "KE-RW-MPESA",
    fromCountry: "KE",
    fromCurrency: "KES",
    toCountry: "RW",
    toCurrency: "RWF",
    rail: "MPESA",
    status: "ACTIVE",
    minAmountMinor: 100_00,
    maxAmountMinor: 1_000_000_00,
    dailyCapMinor: 10_000_000_00,
    cutoffLocalTime: "14:30",
    fxMarginBps: 95,
    payoutPartnerId: "pp-004",
    updatedAt: iso(7),
    updatedBy: "u-admin-01",
  },
  {
    id: "cor-004",
    code: "KE-CD-BANK",
    fromCountry: "KE",
    fromCurrency: "KES",
    toCountry: "CD",
    toCurrency: "USD",
    rail: "BANK",
    status: "PAUSED",
    minAmountMinor: 500_00,
    maxAmountMinor: 5_000_000_00,
    dailyCapMinor: 30_000_000_00,
    cutoffLocalTime: "12:00",
    fxMarginBps: 120,
    payoutPartnerId: "pp-005",
    updatedAt: iso(2),
    updatedBy: "u-admin-01",
  },
  {
    id: "cor-005",
    code: "UG-KE-MPESA",
    fromCountry: "UG",
    fromCurrency: "UGX",
    toCountry: "KE",
    toCurrency: "KES",
    rail: "MPESA",
    status: "ACTIVE",
    minAmountMinor: 500_00,
    maxAmountMinor: 2_000_000_00,
    dailyCapMinor: 25_000_000_00,
    cutoffLocalTime: "15:30",
    fxMarginBps: 80,
    payoutPartnerId: "pp-001",
    updatedAt: iso(3),
    updatedBy: "u-admin-01",
  },
  {
    id: "cor-006",
    code: "KE-KE-MPESA",
    fromCountry: "KE",
    fromCurrency: "KES",
    toCountry: "KE",
    toCurrency: "KES",
    rail: "MPESA",
    status: "ACTIVE",
    minAmountMinor: 100_00,
    maxAmountMinor: 500_000_00,
    dailyCapMinor: 5_000_000_00,
    cutoffLocalTime: "23:59",
    fxMarginBps: 0,
    payoutPartnerId: "pp-001",
    updatedAt: iso(30),
    updatedBy: "u-admin-01",
  },
];

export const seedRemittanceTransfers: RemittanceTransfer[] = [
  {
    id: "rem-001",
    reference: "REM-26-50111",
    direction: "OUTBOUND",
    status: "COMPLETED",
    senderName: "Grace Wanjiru",
    senderMemberNumber: "TEG-26-KU-0042",
    recipientName: "Achieng Odongo",
    recipientPhone: "+256 772 456 789",
    corridorCode: "KE-UG-MPESA",
    fromCurrency: "KES",
    toCurrency: "UGX",
    sendAmountMinor: 500_00,
    payoutAmountMinor: 15_200_00,
    feeMinor: 65_00,
    fxRate: 30.4,
    rail: "MPESA",
    payoutPartnerId: "pp-002",
    payoutPartnerName: "MTN Uganda",
    travelRuleComplete: true,
    createdAt: iso(0, 4),
    updatedAt: iso(0, 1),
    completedAt: iso(0, 1),
  },
  {
    id: "rem-002",
    reference: "REM-26-50110",
    direction: "OUTBOUND",
    status: "PAYOUT_PROCESSING",
    senderName: "David Ochieng",
    senderMemberNumber: "TEG-26-UON-0088",
    recipientName: "Jean Paul Habimana",
    recipientPhone: "+250 788 123 456",
    corridorCode: "KE-RW-MPESA",
    fromCurrency: "KES",
    toCurrency: "RWF",
    sendAmountMinor: 1_200_00,
    payoutAmountMinor: 13_440_00,
    feeMinor: 150_00,
    fxRate: 11.2,
    rail: "MPESA",
    payoutPartnerId: "pp-004",
    payoutPartnerName: "MTN Rwanda",
    travelRuleComplete: true,
    createdAt: iso(0, 6),
    updatedAt: iso(0, 2),
  },
  {
    id: "rem-003",
    reference: "REM-26-50109",
    direction: "OUTBOUND",
    status: "FAILED",
    senderName: "Faith Njeri",
    senderMemberNumber: "TEG-26-STR-0014",
    recipientName: "Juma Mkapa",
    recipientPhone: "+255 715 222 333",
    corridorCode: "KE-TZ-MPESA",
    fromCurrency: "KES",
    toCurrency: "TZS",
    sendAmountMinor: 800_00,
    payoutAmountMinor: 15_200_00,
    feeMinor: 100_00,
    fxRate: 19.0,
    rail: "MPESA",
    payoutPartnerId: "pp-003",
    payoutPartnerName: "Vodacom Tanzania",
    travelRuleComplete: true,
    failureReason: "Recipient phone number not registered on M-Pesa",
    createdAt: iso(1, 2),
    updatedAt: iso(1, 1),
  },
  {
    id: "rem-004",
    reference: "REM-26-50108",
    direction: "OUTBOUND",
    status: "RECALLED",
    senderName: "James Kariuki",
    senderMemberNumber: "TEG-26-NRB-0031",
    recipientName: "Denis Mutombo",
    recipientPhone: "+243 815 555 666",
    corridorCode: "KE-CD-BANK",
    fromCurrency: "KES",
    toCurrency: "USD",
    sendAmountMinor: 2_000_00,
    payoutAmountMinor: 15_000_00,
    feeMinor: 300_00,
    fxRate: 7.5,
    rail: "BANK",
    payoutPartnerId: "pp-005",
    payoutPartnerName: "Equity BCDC",
    travelRuleComplete: true,
    recallReason: "Beneficiary bank account closed",
    createdAt: iso(2, 8),
    updatedAt: iso(2, 1),
  },
  {
    id: "rem-005",
    reference: "REM-26-50107",
    direction: "OUTBOUND",
    status: "QUOTED",
    senderName: "Mercy Achieng",
    senderMemberNumber: "TEG-26-KSM-0007",
    recipientName: "Sarah Nakato",
    recipientPhone: "+256 701 999 888",
    corridorCode: "KE-UG-MPESA",
    fromCurrency: "KES",
    toCurrency: "UGX",
    sendAmountMinor: 250_00,
    payoutAmountMinor: 7_600_00,
    feeMinor: 35_00,
    fxRate: 30.4,
    rail: "MPESA",
    payoutPartnerId: "pp-002",
    payoutPartnerName: "MTN Uganda",
    travelRuleComplete: false,
    createdAt: iso(0, 0),
    updatedAt: iso(0, 0),
  },
  {
    id: "rem-006",
    reference: "REM-26-50106",
    direction: "INBOUND",
    status: "COMPLETED",
    senderName: "Peter Mwangi",
    senderMemberNumber: "TEG-26-KU-0091",
    recipientName: "Esther Wambui",
    recipientPhone: "+254 722 111 222",
    corridorCode: "UG-KE-MPESA",
    fromCurrency: "UGX",
    toCurrency: "KES",
    sendAmountMinor: 200_000_00,
    payoutAmountMinor: 6_600_00,
    feeMinor: 40_00,
    fxRate: 0.033,
    rail: "MPESA",
    payoutPartnerId: "pp-001",
    payoutPartnerName: "Safaricom M-Pesa",
    travelRuleComplete: true,
    createdAt: iso(3, 5),
    updatedAt: iso(3, 1),
    completedAt: iso(3, 1),
  },
  {
    id: "rem-007",
    reference: "REM-26-50105",
    direction: "OUTBOUND",
    status: "REFUNDED",
    senderName: "Esther Wambui",
    senderMemberNumber: "TEG-26-UON-0122",
    recipientName: "Yves Kabila",
    recipientPhone: "+243 821 333 444",
    corridorCode: "KE-CD-BANK",
    fromCurrency: "KES",
    toCurrency: "USD",
    sendAmountMinor: 5_000_00,
    payoutAmountMinor: 37_500_00,
    feeMinor: 500_00,
    fxRate: 7.5,
    rail: "BANK",
    payoutPartnerId: "pp-005",
    payoutPartnerName: "Equity BCDC",
    travelRuleComplete: true,
    failureReason: "Sanctions screening hit — referral cleared after review",
    createdAt: iso(5, 6),
    updatedAt: iso(4, 2),
  },
];

export const seedPayoutPartners: PayoutPartner[] = [
  {
    id: "pp-001",
    code: "PP-MPESA-KE",
    name: "Safaricom M-Pesa",
    country: "KE",
    rail: "MPESA",
    status: "ACTIVE",
    successRate30d: 99.2,
    avgLatencyMinutes: 4,
    supportedCurrencies: ["KES"],
    settlementAccount: "**** 4821",
  },
  {
    id: "pp-002",
    code: "PP-MTN-UG",
    name: "MTN Uganda",
    country: "UG",
    rail: "MPESA",
    status: "ACTIVE",
    successRate30d: 97.5,
    avgLatencyMinutes: 8,
    supportedCurrencies: ["UGX"],
    settlementAccount: "**** 7633",
  },
  {
    id: "pp-003",
    code: "PP-VODA-TZ",
    name: "Vodacom Tanzania",
    country: "TZ",
    rail: "MPESA",
    status: "DEGRADED",
    successRate30d: 88.4,
    avgLatencyMinutes: 27,
    supportedCurrencies: ["TZS"],
    settlementAccount: "**** 9247",
  },
  {
    id: "pp-004",
    code: "PP-MTN-RW",
    name: "MTN Rwanda",
    country: "RW",
    rail: "MPESA",
    status: "ACTIVE",
    successRate30d: 96.8,
    avgLatencyMinutes: 12,
    supportedCurrencies: ["RWF"],
    settlementAccount: "**** 3388",
  },
  {
    id: "pp-005",
    code: "PP-EQUITY-CD",
    name: "Equity BCDC",
    country: "CD",
    rail: "BANK",
    status: "OFFLINE",
    successRate30d: 72.1,
    avgLatencyMinutes: 240,
    supportedCurrencies: ["USD", "CDF"],
    settlementAccount: "**** 5571",
  },
];

export const seedFXRates: FXRate[] = [
  { id: "fx-001", corridorCode: "KE-UG-MPESA", midMarket: 30.1,  platformRate: 30.4,  marginBps: 85, refreshedAt: iso(0, 0) },
  { id: "fx-002", corridorCode: "KE-TZ-MPESA", midMarket: 18.85, platformRate: 19.0,  marginBps: 90, refreshedAt: iso(0, 0) },
  { id: "fx-003", corridorCode: "KE-RW-MPESA", midMarket: 11.1,  platformRate: 11.2,  marginBps: 95, refreshedAt: iso(0, 0) },
  { id: "fx-004", corridorCode: "KE-CD-BANK",  midMarket: 7.45,  platformRate: 7.5,   marginBps: 120, refreshedAt: iso(0, 0) },
  { id: "fx-005", corridorCode: "UG-KE-MPESA", midMarket: 0.0327, platformRate: 0.033, marginBps: 80, refreshedAt: iso(0, 0) },
];

export const seedNostroBalances: NostroBalance[] = [
  {
    id: "nost-001",
    corridorCode: "KE-UG-MPESA",
    partnerId: "pp-002",
    partnerName: "MTN Uganda",
    currency: "UGX",
    balanceMinor: 62_000_000_00,
    operatingFloorMinor: 20_000_000_00,
    sweepThresholdMinor: 80_000_000_00,
    at: iso(0, 0),
  },
  {
    id: "nost-002",
    corridorCode: "KE-TZ-MPESA",
    partnerId: "pp-003",
    partnerName: "Vodacom Tanzania",
    currency: "TZS",
    balanceMinor: 14_200_000_00,
    operatingFloorMinor: 10_000_000_00,
    sweepThresholdMinor: 40_000_000_00,
    at: iso(0, 0),
  },
  {
    id: "nost-003",
    corridorCode: "KE-RW-MPESA",
    partnerId: "pp-004",
    partnerName: "MTN Rwanda",
    currency: "RWF",
    balanceMinor: 42_800_000_00,
    operatingFloorMinor: 15_000_000_00,
    sweepThresholdMinor: 60_000_000_00,
    at: iso(0, 0),
  },
  {
    id: "nost-004",
    corridorCode: "KE-CD-BANK",
    partnerId: "pp-005",
    partnerName: "Equity BCDC",
    currency: "USD",
    balanceMinor: 8_400_00,
    operatingFloorMinor: 15_000_00,
    sweepThresholdMinor: 60_000_00,
    at: iso(0, 0),
  },
];

export const seedRemittanceReturns: RemittanceReturn[] = [
  {
    id: "ret-001",
    period: "2026-Q1",
    corridorCode: "KE-UG-MPESA",
    regulator: "CBK",
    status: "SUBMITTED",
    dueAt: future(3),
    submittedAt: iso(2),
    submittedBy: "u-admin-01",
  },
  {
    id: "ret-002",
    period: "2026-Q1",
    corridorCode: "KE-TZ-MPESA",
    regulator: "CBK",
    status: "DRAFT",
    dueAt: future(3),
  },
  {
    id: "ret-003",
    period: "2026-Q1",
    corridorCode: "KE-RW-MPESA",
    regulator: "CBK",
    status: "DRAFT",
    dueAt: future(3),
  },
  {
    id: "ret-004",
    period: "2026-Q1",
    corridorCode: "KE-CD-BANK",
    regulator: "CBK",
    status: "OVERDUE",
    dueAt: iso(2),
  },
];

// ─────────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────────

type AllowedRole = MockUser["role"];

const REMIT_READERS: AllowedRole[] = [
  "FINANCE_OFFICER",
  "ADMIN",
  "SUPER_ADMIN",
  "COMPLIANCE_LEAD",
];

const REMIT_INTERVENERS: AllowedRole[] = ["FINANCE_OFFICER", "SUPER_ADMIN"];
const REMIT_CORRIDOR_MANAGERS: AllowedRole[] = ["FINANCE_OFFICER", "SUPER_ADMIN"];
const REMIT_FX_MANAGERS: AllowedRole[] = ["FINANCE_OFFICER", "SUPER_ADMIN"];

function hasRole(user: MockUser | null, roles: AllowedRole[]): boolean {
  return user !== null && roles.includes(user.role);
}

export function canViewRemittance(): boolean {
  return hasRole(getCurrentUser(), REMIT_READERS);
}

export function canInterveneTransfer(): boolean {
  return hasRole(getCurrentUser(), REMIT_INTERVENERS);
}

export function canManageCorridors(): boolean {
  return hasRole(getCurrentUser(), REMIT_CORRIDOR_MANAGERS);
}

export function canManageFXRates(): boolean {
  return hasRole(getCurrentUser(), REMIT_FX_MANAGERS);
}

// Four-eyes: cannot approve own intervention
export function canApproveIntervention(
  intervention: { initiatedBy: string } | null
): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, REMIT_INTERVENERS)) return false;
  if (!intervention) return false;
  return intervention.initiatedBy !== user.id;
}

// ─────────────────────────────────────────────────────────────
// RLS-aware accessors
// ─────────────────────────────────────────────────────────────

export function getTransfers(): RemittanceTransfer[] {
  if (!canViewRemittance()) return [];
  return [...seedRemittanceTransfers].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getTransferById(id: string): RemittanceTransfer | null {
  if (!canViewRemittance()) return null;
  return seedRemittanceTransfers.find((t) => t.id === id) ?? null;
}

export function getCorridors(): Corridor[] {
  if (!canViewRemittance()) return [];
  return [...seedCorridors].sort((a, b) => a.code.localeCompare(b.code));
}

export function getCorridorByCode(code: string): Corridor | null {
  if (!canViewRemittance()) return null;
  return seedCorridors.find((c) => c.code === code) ?? null;
}

export function getPayoutPartners(): PayoutPartner[] {
  if (!canViewRemittance()) return [];
  return [...seedPayoutPartners].sort((a, b) => a.code.localeCompare(b.code));
}

export function getFXRates(): FXRate[] {
  if (!canViewRemittance()) return [];
  return [...seedFXRates];
}

export function getNostroBalances(): NostroBalance[] {
  if (!canViewRemittance()) return [];
  return [...seedNostroBalances];
}

export function getRemittanceReturns(): RemittanceReturn[] {
  if (!canViewRemittance()) return [];
  return [...seedRemittanceReturns].sort((a, b) =>
    a.dueAt.localeCompare(b.dueAt)
  );
}

// ─────────────────────────────────────────────────────────────
// Derived counts
// ─────────────────────────────────────────────────────────────

export function getTransferCounts() {
  const transfers = canViewRemittance() ? seedRemittanceTransfers : [];
  return {
    total: transfers.length,
    inFlight: transfers.filter((t) =>
      [
        "QUOTED",
        "CONFIRMED",
        "PAYMENT_RECEIVED",
        "PAYOUT_INITIATED",
        "PAYOUT_PROCESSING",
      ].includes(t.status)
    ).length,
    failed: transfers.filter((t) => t.status === "FAILED").length,
    completed: transfers.filter((t) => t.status === "COMPLETED").length,
    recalled: transfers.filter((t) => t.status === "RECALLED").length,
    refunded: transfers.filter((t) => t.status === "REFUNDED").length,
  };
}

export function getCorridorCounts() {
  const corridors = canViewRemittance() ? seedCorridors : [];
  return {
    total: corridors.length,
    active: corridors.filter((c) => c.status === "ACTIVE").length,
    paused: corridors.filter((c) => c.status === "PAUSED").length,
    disabled: corridors.filter((c) => c.status === "DISABLED").length,
  };
}

export function getPartnerHealth() {
  const partners = canViewRemittance() ? seedPayoutPartners : [];
  return {
    total: partners.length,
    active: partners.filter((p) => p.status === "ACTIVE").length,
    degraded: partners.filter((p) => p.status === "DEGRADED").length,
    offline: partners.filter((p) => p.status === "OFFLINE").length,
  };
}

export function getNostroAlerts() {
  const balances = canViewRemittance() ? seedNostroBalances : [];
  const belowFloor = balances.filter((b) => b.balanceMinor < b.operatingFloorMinor);
  const aboveSweep = balances.filter((b) => b.balanceMinor > b.sweepThresholdMinor);
  return {
    belowFloor,
    aboveSweep,
    count: belowFloor.length + aboveSweep.length,
  };
}