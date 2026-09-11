// lib/mock/otc.ts
// PNL-13 OTC Desk — types, seed data, RLS-aware accessors, permission helpers.
// All money values are integer minor units + explicit ISO 4217 currency code.
// Never floats. Never bare numbers.

import { getCurrentUser } from "./current-user";
import type { MockUser } from "@/components/mock/data";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type OTCOrderSide = "BUY" | "SELL";

export type OTCOrderStatus =
  | "PENDING"
  | "MATCHED"
  | "ESCROW_HELD"
  | "PAYMENT_SENT"
  | "CRYPTO_RELEASED"
  | "COMPLETED"
  | "CANCELLED"
  | "DISPUTED"
  | "REFUNDED";

export type OTCNetwork = "TRC20" | "ERC20" | "BEP20";

export type OTCPaymentMethod = "MPESA" | "BANK_TRANSFER";

export interface OTCOrder {
  id: string;
  reference: string;              // OTC-26-XXXXX
  side: OTCOrderSide;
  memberId: string;
  memberName: string;
  memberNumber: string;
  fiatAmountMinor: number;        // KES cents
  fiatCurrency: string;           // "KES"
  cryptoAmountMicro: number;      // USDT × 1e6 (integer micro-units)
  cryptoAsset: string;            // "USDT"
  rate: number;                   // fiat per crypto, e.g. 129.45
  spreadBps: number;              // basis points
  status: OTCOrderStatus;
  network: OTCNetwork;
  paymentMethod: OTCPaymentMethod;
  agentId?: string;
  agentName?: string;
  escrowHeldAt?: string;
  matchedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  disputedAt?: string;
  txHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowRecord {
  id: string;
  orderId: string;
  orderRef: string;
  amountMinor: number;
  currency: string;
  status: "HELD" | "RELEASED" | "REFUNDED" | "DISPUTED";
  heldAt: string;
  releasedAt?: string;
  releasedBy?: string;
  reason?: string;
}

export type OTCDisputeStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "RESOLVED_BUYER"
  | "RESOLVED_SELLER"
  | "RESOLVED_SPLIT"
  | "ESCALATED"
  | "CLOSED";

export interface OTCDispute {
  id: string;
  reference: string;
  orderId: string;
  orderRef: string;
  raisedById: string;
  raisedByName: string;
  againstId: string;
  againstName: string;
  reason: string;
  description: string;
  status: OTCDisputeStatus;
  assignedTo?: string;
  openedAt: string;
  resolvedAt?: string;
  slaDeadline: string;
}

export type OTCAgentStatus = "ACTIVE" | "SUSPENDED" | "PENDING_REVIEW";
export type OTCAgentTier = "BRONZE" | "SILVER" | "GOLD";
export type OTCAgentKycStatus = "VERIFIED" | "PENDING" | "EXPIRED";

export interface OTCAgent {
  id: string;
  code: string;                   // AG-XXXX
  name: string;
  phone: string;
  email: string;
  status: OTCAgentStatus;
  tier: OTCAgentTier;
  dailyLimitMinor: number;
  monthlyLimitMinor: number;
  commissionBps: number;
  settlementAccount: string;      // masked
  kycStatus: OTCAgentKycStatus;
  onboardedAt: string;
  volume30dMinor: number;
  orders30d: number;
}

export type OTCTier = "NESTLING" | "RISING" | "EAGLE" | "DEFAULT";

export interface OTCSpreadConfig {
  id: string;
  pair: string;                   // "USDT/KES"
  tier: OTCTier;
  buyRate: number;
  sellRate: number;
  spreadBps: number;
  minAmountMinor: number;
  maxAmountMinor: number;
  updatedAt: string;
  updatedBy: string;
}

export interface OTCExposureSnapshot {
  asset: string;
  network: OTCNetwork;
  totalCrypto: number;
  hotCrypto: number;
  warmCrypto: number;
  coldCrypto: number;
  inEscrowCrypto: number;
  inFlightCrypto: number;
  at: string;
}

export interface OTCAnalytics {
  period: string;
  volumeMinor: number;
  orders: number;
  completedOrders: number;
  cancelledOrders: number;
  disputedOrders: number;
  avgSpreadBps: number;
  spreadCaptureMinor: number;
  avgTimeToCompleteMinutes: number;
  uniqueTraders: number;
}

// ─────────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────────

export const OTC_ORDER_STATUS_LABELS: Record<OTCOrderStatus, string> = {
  PENDING: "Pending",
  MATCHED: "Matched",
  ESCROW_HELD: "Escrow held",
  PAYMENT_SENT: "Payment sent",
  CRYPTO_RELEASED: "Crypto released",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  DISPUTED: "Disputed",
  REFUNDED: "Refunded",
};

export const OTC_ORDER_SIDE_LABELS: Record<OTCOrderSide, string> = {
  BUY: "Buy USDT",
  SELL: "Sell USDT",
};

export const OTC_NETWORK_LABELS: Record<OTCNetwork, string> = {
  TRC20: "TRC20 (Tron)",
  ERC20: "ERC20 (Ethereum)",
  BEP20: "BEP20 (BSC)",
};

export const OTC_PAYMENT_METHOD_LABELS: Record<OTCPaymentMethod, string> = {
  MPESA: "M-Pesa",
  BANK_TRANSFER: "Bank transfer",
};

export const OTC_DISPUTE_STATUS_LABELS: Record<OTCDisputeStatus, string> = {
  OPEN: "Open",
  INVESTIGATING: "Investigating",
  RESOLVED_BUYER: "Resolved — buyer",
  RESOLVED_SELLER: "Resolved — seller",
  RESOLVED_SPLIT: "Resolved — split",
  ESCALATED: "Escalated",
  CLOSED: "Closed",
};

export const OTC_AGENT_STATUS_LABELS: Record<OTCAgentStatus, string> = {
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
  PENDING_REVIEW: "Pending review",
};

export const OTC_AGENT_TIER_LABELS: Record<OTCAgentTier, string> = {
  BRONZE: "Bronze",
  SILVER: "Silver",
  GOLD: "Gold",
};

export const OTC_AGENT_KYC_LABELS: Record<OTCAgentKycStatus, string> = {
  VERIFIED: "Verified",
  PENDING: "Pending",
  EXPIRED: "Expired",
};

export const OTC_TIER_LABELS: Record<OTCTier, string> = {
  NESTLING: "Nestling",
  RISING: "Rising",
  EAGLE: "Eagle",
  DEFAULT: "Default",
};

// ─────────────────────────────────────────────────────────────
// Money formatting (minor units → display)
// ─────────────────────────────────────────────────────────────

export function formatMinor(minor: number, currency: string): string {
  const major = minor / 100;
  const formatted = major.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${formatted}`;
}

export function formatUsdtMicro(micro: number): string {
  const major = micro / 1_000_000;
  return `${major.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} USDT`;
}

// ─────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────

const now = new Date();
const iso = (daysAgo: number, hoursAgo = 0) =>
  new Date(
    now.getTime() - daysAgo * 86400000 - hoursAgo * 3600000
  ).toISOString();

export const seedOTCOrders: OTCOrder[] = [
  {
    id: "otc-001",
    reference: "OTC-26-10451",
    side: "BUY",
    memberId: "u-002",
    memberName: "Grace Wanjiru",
    memberNumber: "TEG-26-KU-0042",
    fiatAmountMinor: 1_294_500,
    fiatCurrency: "KES",
    cryptoAmountMicro: 10_000_000,
    cryptoAsset: "USDT",
    rate: 129.45,
    spreadBps: 45,
    status: "ESCROW_HELD",
    network: "TRC20",
    paymentMethod: "MPESA",
    agentId: "ag-002",
    agentName: "Nairobi P2P",
    escrowHeldAt: iso(0, 1),
    createdAt: iso(0, 2),
    updatedAt: iso(0, 1),
  },
  {
    id: "otc-002",
    reference: "OTC-26-10450",
    side: "SELL",
    memberId: "u-003",
    memberName: "David Ochieng",
    memberNumber: "TEG-26-UON-0088",
    fiatAmountMinor: 647_250,
    fiatCurrency: "KES",
    cryptoAmountMicro: 5_000_000,
    cryptoAsset: "USDT",
    rate: 129.45,
    spreadBps: 45,
    status: "PAYMENT_SENT",
    network: "TRC20",
    paymentMethod: "MPESA",
    agentId: "ag-001",
    agentName: "Tunda P2P",
    escrowHeldAt: iso(0, 3),
    matchedAt: iso(0, 3),
    createdAt: iso(0, 4),
    updatedAt: iso(0, 1),
  },
  {
    id: "otc-003",
    reference: "OTC-26-10449",
    side: "BUY",
    memberId: "u-004",
    memberName: "Faith Njeri",
    memberNumber: "TEG-26-STR-0014",
    fiatAmountMinor: 2_589_000,
    fiatCurrency: "KES",
    cryptoAmountMicro: 20_000_000,
    cryptoAsset: "USDT",
    rate: 129.45,
    spreadBps: 40,
    status: "COMPLETED",
    network: "TRC20",
    paymentMethod: "BANK_TRANSFER",
    agentId: "ag-003",
    agentName: "Eastleigh Traders",
    escrowHeldAt: iso(1, 5),
    matchedAt: iso(1, 6),
    completedAt: iso(1, 1),
    txHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    createdAt: iso(1, 8),
    updatedAt: iso(1, 1),
  },
  {
    id: "otc-004",
    reference: "OTC-26-10448",
    side: "SELL",
    memberId: "u-005",
    memberName: "James Kariuki",
    memberNumber: "TEG-26-NRB-0031",
    fiatAmountMinor: 388_350,
    fiatCurrency: "KES",
    cryptoAmountMicro: 3_000_000,
    cryptoAsset: "USDT",
    rate: 129.45,
    spreadBps: 50,
    status: "DISPUTED",
    network: "TRC20",
    paymentMethod: "MPESA",
    agentId: "ag-002",
    agentName: "Nairobi P2P",
    escrowHeldAt: iso(2, 3),
    matchedAt: iso(2, 4),
    disputedAt: iso(1, 2),
    createdAt: iso(2, 6),
    updatedAt: iso(1, 2),
  },
  {
    id: "otc-005",
    reference: "OTC-26-10447",
    side: "BUY",
    memberId: "u-006",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    fiatAmountMinor: 1_035_600,
    fiatCurrency: "KES",
    cryptoAmountMicro: 8_000_000,
    cryptoAsset: "USDT",
    rate: 129.45,
    spreadBps: 45,
    status: "PENDING",
    network: "TRC20",
    paymentMethod: "MPESA",
    createdAt: iso(0, 0),
    updatedAt: iso(0, 0),
  },
  {
    id: "otc-006",
    reference: "OTC-26-10446",
    side: "SELL",
    memberId: "u-007",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    fiatAmountMinor: 517_800,
    fiatCurrency: "KES",
    cryptoAmountMicro: 4_000_000,
    cryptoAsset: "USDT",
    rate: 129.45,
    spreadBps: 45,
    status: "CANCELLED",
    network: "TRC20",
    paymentMethod: "MPESA",
    cancelledAt: iso(1, 3),
    createdAt: iso(1, 5),
    updatedAt: iso(1, 3),
  },
  {
    id: "otc-007",
    reference: "OTC-26-10445",
    side: "BUY",
    memberId: "u-008",
    memberName: "Esther Wambui",
    memberNumber: "TEG-26-UON-0122",
    fiatAmountMinor: 6_472_500,
    fiatCurrency: "KES",
    cryptoAmountMicro: 50_000_000,
    cryptoAsset: "USDT",
    rate: 129.45,
    spreadBps: 30,
    status: "COMPLETED",
    network: "TRC20",
    paymentMethod: "BANK_TRANSFER",
    agentId: "ag-003",
    agentName: "Eastleigh Traders",
    escrowHeldAt: iso(3, 5),
    matchedAt: iso(3, 6),
    completedAt: iso(3, 1),
    createdAt: iso(3, 8),
    updatedAt: iso(3, 1),
  },
  {
    id: "otc-008",
    reference: "OTC-26-10444",
    side: "SELL",
    memberId: "u-002",
    memberName: "Grace Wanjiru",
    memberNumber: "TEG-26-KU-0042",
    fiatAmountMinor: 259_000,
    fiatCurrency: "KES",
    cryptoAmountMicro: 2_000_000,
    cryptoAsset: "USDT",
    rate: 129.50,
    spreadBps: 45,
    status: "REFUNDED",
    network: "TRC20",
    paymentMethod: "MPESA",
    escrowHeldAt: iso(5, 2),
    matchedAt: iso(5, 3),
    disputedAt: iso(4, 6),
    createdAt: iso(5, 4),
    updatedAt: iso(4, 1),
  },
];

export const seedEscrowRecords: EscrowRecord[] = [
  {
    id: "esc-001",
    orderId: "otc-001",
    orderRef: "OTC-26-10451",
    amountMinor: 1_294_500,
    currency: "KES",
    status: "HELD",
    heldAt: iso(0, 1),
  },
  {
    id: "esc-002",
    orderId: "otc-002",
    orderRef: "OTC-26-10450",
    amountMinor: 647_250,
    currency: "KES",
    status: "HELD",
    heldAt: iso(0, 3),
  },
  {
    id: "esc-003",
    orderId: "otc-003",
    orderRef: "OTC-26-10449",
    amountMinor: 2_589_000,
    currency: "KES",
    status: "RELEASED",
    heldAt: iso(1, 5),
    releasedAt: iso(1, 1),
    releasedBy: "u-admin-01",
    reason: "Order completed normally",
  },
  {
    id: "esc-004",
    orderId: "otc-004",
    orderRef: "OTC-26-10448",
    amountMinor: 388_350,
    currency: "KES",
    status: "DISPUTED",
    heldAt: iso(2, 3),
  },
  {
    id: "esc-005",
    orderId: "otc-008",
    orderRef: "OTC-26-10444",
    amountMinor: 259_000,
    currency: "KES",
    status: "REFUNDED",
    heldAt: iso(5, 2),
    releasedAt: iso(4, 1),
    releasedBy: "u-admin-01",
    reason: "Dispute resolved in seller's favour — full refund",
  },
];

export const seedOTCDisputes: OTCDispute[] = [
  {
    id: "dsp-001",
    reference: "DSP-26-0041",
    orderId: "otc-004",
    orderRef: "OTC-26-10448",
    raisedById: "u-005",
    raisedByName: "James Kariuki",
    againstId: "ag-002",
    againstName: "Nairobi P2P",
    reason: "Payment not received",
    description:
      "I sent USDT to the agent's address and the M-Pesa payment has not arrived after 4 hours. The agent is not responding to messages.",
    status: "INVESTIGATING",
    assignedTo: "u-admin-01",
    openedAt: iso(1, 2),
    slaDeadline: iso(-1, 0), // 1 day from now
  },
  {
    id: "dsp-002",
    reference: "DSP-26-0040",
    orderId: "otc-008",
    orderRef: "OTC-26-10444",
    raisedById: "u-002",
    raisedByName: "Grace Wanjiru",
    againstId: "ag-001",
    againstName: "Tunda P2P",
    reason: "Wrong amount received",
    description:
      "The M-Pesa amount credited was KES 5,000 less than the agreed quote.",
    status: "RESOLVED_SELLER",
    assignedTo: "u-admin-02",
    openedAt: iso(4, 6),
    resolvedAt: iso(4, 1),
    slaDeadline: iso(2, 6),
  },
];

export const seedOTCAgents: OTCAgent[] = [
  {
    id: "ag-001",
    code: "AG-0001",
    name: "Tunda P2P",
    phone: "+254 712 345 678",
    email: "ops@tundap2p.co.ke",
    status: "ACTIVE",
    tier: "GOLD",
    dailyLimitMinor: 50_000_000,
    monthlyLimitMinor: 800_000_000,
    commissionBps: 15,
    settlementAccount: "**** 4821",
    kycStatus: "VERIFIED",
    onboardedAt: iso(180),
    volume30dMinor: 412_800_000,
    orders30d: 318,
  },
  {
    id: "ag-002",
    code: "AG-0002",
    name: "Nairobi P2P",
    phone: "+254 722 987 654",
    email: "trade@nairobip2p.com",
    status: "ACTIVE",
    tier: "SILVER",
    dailyLimitMinor: 20_000_000,
    monthlyLimitMinor: 300_000_000,
    commissionBps: 20,
    settlementAccount: "**** 7633",
    kycStatus: "VERIFIED",
    onboardedAt: iso(120),
    volume30dMinor: 187_500_000,
    orders30d: 142,
  },
  {
    id: "ag-003",
    code: "AG-0003",
    name: "Eastleigh Traders",
    phone: "+254 733 111 222",
    email: "info@eastleightraders.co.ke",
    status: "ACTIVE",
    tier: "GOLD",
    dailyLimitMinor: 80_000_000,
    monthlyLimitMinor: 1_200_000_000,
    commissionBps: 12,
    settlementAccount: "**** 9247",
    kycStatus: "VERIFIED",
    onboardedAt: iso(240),
    volume30dMinor: 684_300_000,
    orders30d: 502,
  },
  {
    id: "ag-004",
    code: "AG-0004",
    name: "Mombasa Exchange",
    phone: "+254 741 555 777",
    email: "ops@mombasaexchange.co.ke",
    status: "PENDING_REVIEW",
    tier: "BRONZE",
    dailyLimitMinor: 5_000_000,
    monthlyLimitMinor: 75_000_000,
    commissionBps: 25,
    settlementAccount: "**** 3388",
    kycStatus: "PENDING",
    onboardedAt: iso(3),
    volume30dMinor: 0,
    orders30d: 0,
  },
  {
    id: "ag-005",
    code: "AG-0005",
    name: "Kisumu Trade Hub",
    phone: "+254 726 444 333",
    email: "contact@kisumutrade.co.ke",
    status: "SUSPENDED",
    tier: "BRONZE",
    dailyLimitMinor: 0,
    monthlyLimitMinor: 0,
    commissionBps: 30,
    settlementAccount: "**** 5571",
    kycStatus: "EXPIRED",
    onboardedAt: iso(90),
    volume30dMinor: 12_400_000,
    orders30d: 18,
  },
];

export const seedOTCSpreadConfigs: OTCSpreadConfig[] = [
  {
    id: "sp-001",
    pair: "USDT/KES",
    tier: "DEFAULT",
    buyRate: 129.45,
    sellRate: 128.95,
    spreadBps: 45,
    minAmountMinor: 100_000,
    maxAmountMinor: 50_000_000,
    updatedAt: iso(1),
    updatedBy: "u-admin-01",
  },
  {
    id: "sp-002",
    pair: "USDT/KES",
    tier: "NESTLING",
    buyRate: 129.65,
    sellRate: 128.75,
    spreadBps: 70,
    minAmountMinor: 100_000,
    maxAmountMinor: 10_000_000,
    updatedAt: iso(1),
    updatedBy: "u-admin-01",
  },
  {
    id: "sp-003",
    pair: "USDT/KES",
    tier: "RISING",
    buyRate: 129.50,
    sellRate: 128.90,
    spreadBps: 50,
    minAmountMinor: 100_000,
    maxAmountMinor: 30_000_000,
    updatedAt: iso(1),
    updatedBy: "u-admin-01",
  },
  {
    id: "sp-004",
    pair: "USDT/KES",
    tier: "EAGLE",
    buyRate: 129.40,
    sellRate: 129.00,
    spreadBps: 30,
    minAmountMinor: 500_000,
    maxAmountMinor: 100_000_000,
    updatedAt: iso(1),
    updatedBy: "u-admin-01",
  },
];

export const seedOTCExposure: OTCExposureSnapshot[] = [
  {
    asset: "USDT",
    network: "TRC20",
    totalCrypto: 1_245_800,
    hotCrypto: 120_000,
    warmCrypto: 425_800,
    coldCrypto: 700_000,
    inEscrowCrypto: 18_500,
    inFlightCrypto: 3_200,
    at: iso(0, 0),
  },
  {
    asset: "USDT",
    network: "ERC20",
    totalCrypto: 248_500,
    hotCrypto: 22_000,
    warmCrypto: 86_500,
    coldCrypto: 140_000,
    inEscrowCrypto: 4_200,
    inFlightCrypto: 800,
    at: iso(0, 0),
  },
  {
    asset: "USDT",
    network: "BEP20",
    totalCrypto: 82_300,
    hotCrypto: 8_500,
    warmCrypto: 28_800,
    coldCrypto: 45_000,
    inEscrowCrypto: 1_100,
    inFlightCrypto: 200,
    at: iso(0, 0),
  },
];

export const seedOTCAnalytics: OTCAnalytics[] = [
  {
    period: "Last 30 days",
    volumeMinor: 1_284_500_000,
    orders: 962,
    completedOrders: 897,
    cancelledOrders: 42,
    disputedOrders: 23,
    avgSpreadBps: 42,
    spreadCaptureMinor: 5_394_900,
    avgTimeToCompleteMinutes: 47,
    uniqueTraders: 418,
  },
  {
    period: "Last 7 days",
    volumeMinor: 318_200_000,
    orders: 241,
    completedOrders: 224,
    cancelledOrders: 11,
    disputedOrders: 6,
    avgSpreadBps: 44,
    spreadCaptureMinor: 1_400_080,
    avgTimeToCompleteMinutes: 42,
    uniqueTraders: 168,
  },
  {
    period: "Today",
    volumeMinor: 48_600_000,
    orders: 37,
    completedOrders: 31,
    cancelledOrders: 2,
    disputedOrders: 1,
    avgSpreadBps: 45,
    spreadCaptureMinor: 218_700,
    avgTimeToCompleteMinutes: 38,
    uniqueTraders: 34,
  },
];

// ─────────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────────

type AllowedRole = MockUser["role"];

const OTC_READERS: AllowedRole[] = [
  "FINANCE_OFFICER",
  "ADMIN",
  "SUPER_ADMIN",
  "COMPLIANCE_LEAD",
];

const OTC_INTERVENERS: AllowedRole[] = ["FINANCE_OFFICER", "SUPER_ADMIN"];
const OTC_RATE_MANAGERS: AllowedRole[] = ["FINANCE_OFFICER", "SUPER_ADMIN"];
const OTC_AGENT_MANAGERS: AllowedRole[] = ["ADMIN", "SUPER_ADMIN"];
const OTC_ARBITRATORS: AllowedRole[] = [
  "COMPLIANCE_LEAD",
  "ADMIN",
  "SUPER_ADMIN",
];

function hasRole(user: MockUser | null, roles: AllowedRole[]): boolean {
  return user !== null && roles.includes(user.role);
}

export function canViewOTC(): boolean {
  return hasRole(getCurrentUser(), OTC_READERS);
}

export function canInterveneOrder(): boolean {
  return hasRole(getCurrentUser(), OTC_INTERVENERS);
}

export function canManageRates(): boolean {
  return hasRole(getCurrentUser(), OTC_RATE_MANAGERS);
}

export function canManageAgents(): boolean {
  return hasRole(getCurrentUser(), OTC_AGENT_MANAGERS);
}

export function canArbitrateDisputes(): boolean {
  return hasRole(getCurrentUser(), OTC_ARBITRATORS);
}

// Four-eyes: an intervention cannot be approved by the same user who raised it.
export function canApproveIntervention(
  intervention: { initiatedBy: string } | null
): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, OTC_INTERVENERS)) return false;
  if (!intervention) return false;
  return intervention.initiatedBy !== user.id;
}

// A dispute cannot be resolved by the same user who opened it.
export function canResolveDispute(dispute: OTCDispute | null): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, OTC_ARBITRATORS)) return false;
  if (!dispute) return false;
  return dispute.raisedById !== user.id;
}

// ─────────────────────────────────────────────────────────────
// RLS-aware accessors
// ─────────────────────────────────────────────────────────────

export function getOTCOrders(): OTCOrder[] {
  if (!canViewOTC()) return [];
  return [...seedOTCOrders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getOTCOrderById(id: string): OTCOrder | null {
  if (!canViewOTC()) return null;
  return seedOTCOrders.find((o) => o.id === id) ?? null;
}

export function getOTCOrderByReference(ref: string): OTCOrder | null {
  if (!canViewOTC()) return null;
  return seedOTCOrders.find((o) => o.reference === ref) ?? null;
}

export function getEscrowRecords(): EscrowRecord[] {
  if (!canViewOTC()) return [];
  return [...seedEscrowRecords].sort((a, b) =>
    b.heldAt.localeCompare(a.heldAt)
  );
}

export function getEscrowByOrderId(orderId: string): EscrowRecord | null {
  if (!canViewOTC()) return null;
  return seedEscrowRecords.find((e) => e.orderId === orderId) ?? null;
}

export function getOTCDisputes(): OTCDispute[] {
  if (!canViewOTC()) return [];
  return [...seedOTCDisputes].sort((a, b) =>
    b.openedAt.localeCompare(a.openedAt)
  );
}

export function getOTCDisputeById(id: string): OTCDispute | null {
  if (!canViewOTC()) return null;
  return seedOTCDisputes.find((d) => d.id === id) ?? null;
}

export function getOTCAgents(): OTCAgent[] {
  if (!canViewOTC()) return [];
  return [...seedOTCAgents].sort((a, b) => a.code.localeCompare(b.code));
}

export function getOTCAgentById(id: string): OTCAgent | null {
  if (!canViewOTC()) return null;
  return seedOTCAgents.find((a) => a.id === id) ?? null;
}

export function getOTCSpreadConfigs(): OTCSpreadConfig[] {
  if (!canViewOTC()) return [];
  return [...seedOTCSpreadConfigs].sort((a, b) =>
    a.tier.localeCompare(b.tier)
  );
}

export function getOTCExposure(): OTCExposureSnapshot[] {
  if (!canViewOTC()) return [];
  return [...seedOTCExposure];
}

export function getOTCAnalytics(): OTCAnalytics[] {
  if (!canViewOTC()) return [];
  return [...seedOTCAnalytics];
}

// ─────────────────────────────────────────────────────────────
// Derived counts (never drift from source)
// ─────────────────────────────────────────────────────────────

export function getOTCOrderCounts() {
  const orders = canViewOTC() ? seedOTCOrders : [];
  return {
    total: orders.length,
    pending: orders.filter((o) => o.status === "PENDING").length,
    escrowHeld: orders.filter((o) => o.status === "ESCROW_HELD").length,
    inFlight: orders.filter((o) =>
      ["MATCHED", "PAYMENT_SENT", "CRYPTO_RELEASED"].includes(o.status)
    ).length,
    completed: orders.filter((o) => o.status === "COMPLETED").length,
    disputed: orders.filter((o) => o.status === "DISPUTED").length,
    cancelled: orders.filter((o) => o.status === "CANCELLED").length,
  };
}

export function getOTCDisputeCounts() {
  const disputes = canViewOTC() ? seedOTCDisputes : [];
  const nowIso = new Date().toISOString();
  return {
    total: disputes.length,
    open: disputes.filter((d) => d.status === "OPEN").length,
    investigating: disputes.filter((d) => d.status === "INVESTIGATING").length,
    escalated: disputes.filter((d) => d.status === "ESCALATED").length,
    breachedSla: disputes.filter(
      (d) =>
        !d.resolvedAt &&
        d.slaDeadline < nowIso &&
        d.status !== "CLOSED" &&
        d.status !== "RESOLVED_BUYER" &&
        d.status !== "RESOLVED_SELLER" &&
        d.status !== "RESOLVED_SPLIT"
    ).length,
  };
}

export function getEscrowTotals() {
  const held = canViewOTC()
    ? seedEscrowRecords.filter((e) => e.status === "HELD")
    : [];
  const disputed = canViewOTC()
    ? seedEscrowRecords.filter((e) => e.status === "DISPUTED")
    : [];
  return {
    heldCount: held.length,
    heldMinor: held.reduce((sum, e) => sum + e.amountMinor, 0),
    disputedCount: disputed.length,
    disputedMinor: disputed.reduce((sum, e) => sum + e.amountMinor, 0),
  };
}

export function getExposureTotals() {
  const snapshots = canViewOTC() ? seedOTCExposure : [];
  return {
    totalCrypto: snapshots.reduce((s, e) => s + e.totalCrypto, 0),
    hotCrypto: snapshots.reduce((s, e) => s + e.hotCrypto, 0),
    warmCrypto: snapshots.reduce((s, e) => s + e.warmCrypto, 0),
    coldCrypto: snapshots.reduce((s, e) => s + e.coldCrypto, 0),
    inEscrowCrypto: snapshots.reduce((s, e) => s + e.inEscrowCrypto, 0),
    inFlightCrypto: snapshots.reduce((s, e) => s + e.inFlightCrypto, 0),
  };
}