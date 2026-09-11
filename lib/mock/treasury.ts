// lib/mock/treasury.ts
// PNL-12 Treasury and Custody — types, seed data, RLS-aware accessors,
// permission helpers.
//
// All crypto amounts are integer micro-units (1 USDT = 1,000,000).
// All fiat amounts are integer minor units (1 KES = 100 cents).
// Never floats. Never bare numbers.

import { getCurrentUser } from "./current-user";
import type { MockUser } from "@/components/mock/data";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type Network = "TRC20" | "ERC20" | "BEP20";
export type CustodyTier = "HOT" | "WARM" | "COLD";
export type Asset = "USDT";

export interface TreasuryBalance {
  id: string;
  asset: Asset;
  network: Network;
  tier: CustodyTier;
  amountMicro: number;
  addressMasked: string;      // never the full address
  updatedAt: string;
}

export type WithdrawalStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "BROADCAST"
  | "CONFIRMING"
  | "COMPLETED"
  | "REJECTED"
  | "HALTED";

export interface WithdrawalRequest {
  id: string;
  reference: string;          // WD-26-XXXXX
  memberName: string;
  memberNumber: string;
  asset: Asset;
  network: Network;
  amountMicro: number;
  destinationMasked: string;
  kycTier: 0 | 1 | 2;
  amlFlagged: boolean;
  riskScore: number;          // 0-100
  status: WithdrawalStatus;
  initiatedAt: string;
  initiatedBy: string;         // member id
  decidedAt?: string;
  decidedBy?: string;
  rejectReason?: string;
  txHash?: string;
  confirmations?: number;
  requiredConfirmations?: number;
}

export type SweepDirection = "HOT_TO_WARM" | "WARM_TO_COLD" | "COLD_TO_HOT" | "WARM_TO_HOT";

export interface WalletSweep {
  id: string;
  reference: string;          // SWP-26-XXXX
  direction: SweepDirection;
  asset: Asset;
  network: Network;
  amountMicro: number;
  reason: string;
  status: "DRAFT" | "PENDING_WITNESS" | "BROADCAST" | "CONFIRMING" | "COMPLETED" | "FAILED";
  initiatedBy: string;
  witnessBy?: string;
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export type CeremonyPurpose =
  | "COLD_TRANSFER"
  | "KEY_ROTATION"
  | "RECOVERY_TEST"
  | "AUDIT";

export interface KeyCeremony {
  id: string;
  reference: string;          // KC-26-XX
  purpose: CeremonyPurpose;
  scheduledAt: string;
  completedAt?: string;
  participants: string[];      // user names, not IDs
  notes: string;
  outcome: "SCHEDULED" | "COMPLETED" | "ABORTED";
}

export interface ChainTransaction {
  id: string;
  txHash: string;
  network: Network;
  asset: Asset;
  amountMicro: number;
  direction: "INBOUND" | "OUTBOUND";
  confirmations: number;
  requiredConfirmations: number;
  reorgFlagged: boolean;
  reference: string;          // links to withdrawal, sweep, or deposit
  broadcastAt: string;
  confirmedAt?: string;
}

export interface WhitelistedAddress {
  id: string;
  label: string;
  addressMasked: string;
  network: Network;
  asset: Asset;
  proposedBy: string;
  proposedAt: string;
  coolingOffEndsAt: string;
  approvedBy?: string;
  approvedAt?: string;
  status: "COOLING_OFF" | "ACTIVE" | "REMOVED";
}

export interface KillSwitchState {
  active: boolean;
  reason?: string;
  setBy?: string;
  setAt?: string;
  releasedBy?: string;
  releasedAt?: string;
}

export interface CustodyReconciliationRow {
  id: string;
  asset: Asset;
  network: Network;
  onChainMicro: number;
  ledgerMicro: number;
  driftMicro: number;
  toleranceMicro: number;
  withinTolerance: boolean;
  at: string;
}

// ─────────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────────

export const NETWORK_LABELS: Record<Network, string> = {
  TRC20: "TRC20 (Tron)",
  ERC20: "ERC20 (Ethereum)",
  BEP20: "BEP20 (BSC)",
};

export const TIER_LABELS: Record<CustodyTier, string> = {
  HOT: "Hot",
  WARM: "Warm",
  COLD: "Cold",
};

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  PENDING_APPROVAL: "Pending approval",
  APPROVED: "Approved",
  BROADCAST: "Broadcast",
  CONFIRMING: "Confirming",
  COMPLETED: "Completed",
  REJECTED: "Rejected",
  HALTED: "Halted by kill switch",
};

export const SWEEP_DIRECTION_LABELS: Record<SweepDirection, string> = {
  HOT_TO_WARM: "Hot → Warm",
  WARM_TO_COLD: "Warm → Cold",
  COLD_TO_HOT: "Cold → Hot",
  WARM_TO_HOT: "Warm → Hot",
};

export const SWEEP_STATUS_LABELS: Record<WalletSweep["status"], string> = {
  DRAFT: "Draft",
  PENDING_WITNESS: "Pending witness",
  BROADCAST: "Broadcast",
  CONFIRMING: "Confirming",
  COMPLETED: "Completed",
  FAILED: "Failed",
};

export const CEREMONY_PURPOSE_LABELS: Record<CeremonyPurpose, string> = {
  COLD_TRANSFER: "Cold transfer",
  KEY_ROTATION: "Key rotation",
  RECOVERY_TEST: "Recovery test",
  AUDIT: "Audit",
};

export const CEREMONY_OUTCOME_LABELS: Record<KeyCeremony["outcome"], string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  ABORTED: "Aborted",
};

export const WHITELIST_STATUS_LABELS: Record<WhitelistedAddress["status"], string> = {
  COOLING_OFF: "Cooling off",
  ACTIVE: "Active",
  REMOVED: "Removed",
};

// ─────────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────────

export function formatUsdt(micro: number): string {
  const major = micro / 1_000_000;
  return `${major.toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} USDT`;
}

// ─────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────

const now = new Date();
const iso = (daysAgo: number, hoursAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();
const future = (hoursAhead: number) =>
  new Date(now.getTime() + hoursAhead * 3600000).toISOString();

export const seedTreasuryBalances: TreasuryBalance[] = [
  // TRC20
  { id: "tb-001", asset: "USDT", network: "TRC20", tier: "HOT",  amountMicro: 120_000_000_000,  addressMasked: "TJ…7f4h", updatedAt: iso(0, 0) },
  { id: "tb-002", asset: "USDT", network: "TRC20", tier: "WARM", amountMicro: 425_800_000_000,  addressMasked: "TC…9a2k", updatedAt: iso(0, 0) },
  { id: "tb-003", asset: "USDT", network: "TRC20", tier: "COLD", amountMicro: 700_000_000_000,  addressMasked: "TD…x8zr", updatedAt: iso(1, 0) },
  // ERC20
  { id: "tb-004", asset: "USDT", network: "ERC20", tier: "HOT",  amountMicro: 22_000_000_000,   addressMasked: "0x…8c3a", updatedAt: iso(0, 0) },
  { id: "tb-005", asset: "USDT", network: "ERC20", tier: "WARM", amountMicro: 86_500_000_000,   addressMasked: "0x…4b1f", updatedAt: iso(0, 0) },
  { id: "tb-006", asset: "USDT", network: "ERC20", tier: "COLD", amountMicro: 140_000_000_000,  addressMasked: "0x…a7e2", updatedAt: iso(1, 0) },
  // BEP20
  { id: "tb-007", asset: "USDT", network: "BEP20", tier: "HOT",  amountMicro: 8_500_000_000,    addressMasked: "0x…3d91", updatedAt: iso(0, 0) },
  { id: "tb-008", asset: "USDT", network: "BEP20", tier: "WARM", amountMicro: 28_800_000_000,   addressMasked: "0x…f0a4", updatedAt: iso(0, 0) },
  { id: "tb-009", asset: "USDT", network: "BEP20", tier: "COLD", amountMicro: 45_000_000_000,   addressMasked: "0x…2e77", updatedAt: iso(1, 0) },
];

export const seedWithdrawals: WithdrawalRequest[] = [
  {
    id: "wd-001",
    reference: "WD-26-40112",
    memberName: "Grace Wanjiru",
    memberNumber: "TEG-26-KU-0042",
    asset: "USDT",
    network: "TRC20",
    amountMicro: 50_000_000,
    destinationMasked: "TJ…7f4h",
    kycTier: 2,
    amlFlagged: false,
    riskScore: 12,
    status: "PENDING_APPROVAL",
    initiatedAt: iso(0, 1),
    initiatedBy: "u-002",
  },
  {
    id: "wd-002",
    reference: "WD-26-40111",
    memberName: "David Ochieng",
    memberNumber: "TEG-26-UON-0088",
    asset: "USDT",
    network: "TRC20",
    amountMicro: 25_000_000,
    destinationMasked: "TC…9a2k",
    kycTier: 2,
    amlFlagged: false,
    riskScore: 8,
    status: "PENDING_APPROVAL",
    initiatedAt: iso(0, 2),
    initiatedBy: "u-003",
  },
  {
    id: "wd-003",
    reference: "WD-26-40110",
    memberName: "Faith Njeri",
    memberNumber: "TEG-26-STR-0014",
    asset: "USDT",
    network: "TRC20",
    amountMicro: 200_000_000,
    destinationMasked: "TD…x8zr",
    kycTier: 2,
    amlFlagged: true,
    riskScore: 74,
    status: "PENDING_APPROVAL",
    initiatedAt: iso(0, 3),
    initiatedBy: "u-004",
  },
  {
    id: "wd-004",
    reference: "WD-26-40109",
    memberName: "James Kariuki",
    memberNumber: "TEG-26-NRB-0031",
    asset: "USDT",
    network: "TRC20",
    amountMicro: 100_000_000,
    destinationMasked: "TJ…7f4h",
    kycTier: 2,
    amlFlagged: false,
    riskScore: 22,
    status: "COMPLETED",
    initiatedAt: iso(0, 6),
    initiatedBy: "u-005",
    decidedAt: iso(0, 5),
    decidedBy: "u-admin-01",
    txHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    confirmations: 19,
    requiredConfirmations: 19,
  },
  {
    id: "wd-005",
    reference: "WD-26-40108",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    asset: "USDT",
    network: "TRC20",
    amountMicro: 10_000_000,
    destinationMasked: "TX…3m1p",
    kycTier: 1,
    amlFlagged: false,
    riskScore: 15,
    status: "REJECTED",
    initiatedAt: iso(1, 2),
    initiatedBy: "u-006",
    decidedAt: iso(1, 1),
    decidedBy: "u-admin-01",
    rejectReason: "Destination address is not on the member's whitelist and cooling-off has not expired.",
  },
  {
    id: "wd-006",
    reference: "WD-26-40107",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    asset: "USDT",
    network: "ERC20",
    amountMicro: 15_000_000,
    destinationMasked: "0x…8c3a",
    kycTier: 2,
    amlFlagged: false,
    riskScore: 18,
    status: "CONFIRMING",
    initiatedAt: iso(1, 4),
    initiatedBy: "u-007",
    decidedAt: iso(1, 3),
    decidedBy: "u-admin-01",
    txHash: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    confirmations: 8,
    requiredConfirmations: 12,
  },
];

export const seedSweeps: WalletSweep[] = [
  {
    id: "swp-001",
    reference: "SWP-26-0112",
    direction: "HOT_TO_WARM",
    asset: "USDT",
    network: "TRC20",
    amountMicro: 80_000_000_000,
    reason: "Hot balance exceeded working float threshold",
    status: "COMPLETED",
    initiatedBy: "u-admin-01",
    witnessBy: "u-admin-02",
    txHash: "c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4",
    createdAt: iso(2, 3),
    completedAt: iso(2, 2),
  },
  {
    id: "swp-002",
    reference: "SWP-26-0111",
    direction: "WARM_TO_COLD",
    asset: "USDT",
    network: "TRC20",
    amountMicro: 150_000_000_000,
    reason: "Monthly cold sweep per treasury policy",
    status: "COMPLETED",
    initiatedBy: "u-admin-01",
    witnessBy: "u-admin-02",
    txHash: "d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5",
    createdAt: iso(30, 0),
    completedAt: iso(30, -2),
  },
  {
    id: "swp-003",
    reference: "SWP-26-0113",
    direction: "HOT_TO_WARM",
    asset: "USDT",
    network: "ERC20",
    amountMicro: 12_000_000_000,
    reason: "Routine hot float management",
    status: "PENDING_WITNESS",
    initiatedBy: "u-admin-01",
    createdAt: iso(0, 1),
  },
];

export const seedCeremonies: KeyCeremony[] = [
  {
    id: "kc-001",
    reference: "KC-26-04",
    purpose: "COLD_TRANSFER",
    scheduledAt: iso(1),
    completedAt: iso(1, -1),
    participants: ["Solomon A.", "Miriam W.", "Compliance Lead"],
    notes: "Quarterly cold sweep of 150,000 USDT from warm TRC20 to cold TRC20. Multi-party signing completed.",
    outcome: "COMPLETED",
  },
  {
    id: "kc-002",
    reference: "KC-26-05",
    purpose: "KEY_ROTATION",
    scheduledAt: future(24),
    participants: ["Solomon A.", "Miriam W."],
    notes: "Scheduled annual key rotation for ERC20 cold wallet. Ledger-based recovery verified against new keys before use.",
    outcome: "SCHEDULED",
  },
  {
    id: "kc-003",
    reference: "KC-26-03",
    purpose: "RECOVERY_TEST",
    scheduledAt: iso(45),
    completedAt: iso(45, -3),
    participants: ["Solomon A.", "Compliance Lead"],
    notes: "Annual recovery drill on testnet. Recovery key reconstructed by two of three custodians; no funds moved.",
    outcome: "COMPLETED",
  },
];

export const seedChainTransactions: ChainTransaction[] = [
  {
    id: "ctx-001",
    txHash: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
    network: "TRC20",
    asset: "USDT",
    amountMicro: 100_000_000,
    direction: "OUTBOUND",
    confirmations: 19,
    requiredConfirmations: 19,
    reorgFlagged: false,
    reference: "WD-26-40109",
    broadcastAt: iso(0, 5),
    confirmedAt: iso(0, 4),
  },
  {
    id: "ctx-002",
    txHash: "b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3",
    network: "ERC20",
    asset: "USDT",
    amountMicro: 15_000_000,
    direction: "OUTBOUND",
    confirmations: 8,
    requiredConfirmations: 12,
    reorgFlagged: false,
    reference: "WD-26-40107",
    broadcastAt: iso(1, 3),
  },
  {
    id: "ctx-003",
    txHash: "e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6",
    network: "TRC20",
    asset: "USDT",
    amountMicro: 500_000_000,
    direction: "INBOUND",
    confirmations: 12,
    requiredConfirmations: 19,
    reorgFlagged: true,
    reference: "DEP-26-0809",
    broadcastAt: iso(0, 3),
  },
  {
    id: "ctx-004",
    txHash: "f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7",
    network: "TRC20",
    asset: "USDT",
    amountMicro: 80_000_000,
    direction: "OUTBOUND",
    confirmations: 19,
    requiredConfirmations: 19,
    reorgFlagged: false,
    reference: "SWP-26-0112",
    broadcastAt: iso(2, 2),
    confirmedAt: iso(2, 1),
  },
];

export const seedWhitelist: WhitelistedAddress[] = [
  {
    id: "wl-001",
    label: "Grace W. — personal Trezor",
    addressMasked: "TJ…7f4h",
    network: "TRC20",
    asset: "USDT",
    proposedBy: "u-admin-01",
    proposedAt: iso(5),
    coolingOffEndsAt: iso(4),
    approvedBy: "u-admin-02",
    approvedAt: iso(4),
    status: "ACTIVE",
  },
  {
    id: "wl-002",
    label: "Nairobi business account",
    addressMasked: "0x…8c3a",
    network: "ERC20",
    asset: "USDT",
    proposedBy: "u-admin-01",
    proposedAt: iso(2),
    coolingOffEndsAt: future(4),
    status: "COOLING_OFF",
  },
  {
    id: "wl-003",
    label: "Emergency cold reserve (internal)",
    addressMasked: "TD…x8zr",
    network: "TRC20",
    asset: "USDT",
    proposedBy: "u-admin-02",
    proposedAt: iso(60),
    coolingOffEndsAt: iso(59),
    approvedBy: "u-admin-01",
    approvedAt: iso(59),
    status: "ACTIVE",
  },
  {
    id: "wl-004",
    label: "Old Eastleigh address (removed)",
    addressMasked: "TE…2v5q",
    network: "TRC20",
    asset: "USDT",
    proposedBy: "u-admin-01",
    proposedAt: iso(120),
    coolingOffEndsAt: iso(119),
    approvedBy: "u-admin-02",
    approvedAt: iso(119),
    status: "REMOVED",
  },
];

export const seedKillSwitch: KillSwitchState = {
  active: false,
  reason: undefined,
  setBy: undefined,
  setAt: undefined,
};

export const seedReconciliation: CustodyReconciliationRow[] = [
  { id: "cr-001", asset: "USDT", network: "TRC20", onChainMicro: 1_245_800_000_000, ledgerMicro: 1_245_800_000_000, driftMicro: 0, toleranceMicro: 1_000, withinTolerance: true, at: iso(0, 0) },
  { id: "cr-002", asset: "USDT", network: "ERC20", onChainMicro: 248_500_000_000,  ledgerMicro: 248_500_000_000, driftMicro: 0, toleranceMicro: 1_000, withinTolerance: true, at: iso(0, 0) },
  { id: "cr-003", asset: "USDT", network: "BEP20", onChainMicro: 82_300_000_000,   ledgerMicro: 82_300_000_000, driftMicro: 0, toleranceMicro: 1_000, withinTolerance: true, at: iso(0, 0) },
];

// ─────────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────────

type AllowedRole = MockUser["role"];

const TREASURY_READERS: AllowedRole[] = [
  "FINANCE_OFFICER",
  "ADMIN",
  "SUPER_ADMIN",
  "COMPLIANCE_LEAD",
];

const TREASURY_OPERATORS: AllowedRole[] = ["FINANCE_OFFICER", "SUPER_ADMIN"];

function hasRole(user: MockUser | null, roles: AllowedRole[]): boolean {
  return user !== null && roles.includes(user.role);
}

export function canViewTreasury(): boolean {
  return hasRole(getCurrentUser(), TREASURY_READERS);
}

export function canOperateTreasury(): boolean {
  return hasRole(getCurrentUser(), TREASURY_OPERATORS);
}

// Kill switch is SUPER_ADMIN only
export function canToggleKillSwitch(): boolean {
  const user = getCurrentUser();
  return user !== null && user.role === "SUPER_ADMIN";
}

// Four-eyes: cannot approve own withdrawal
export function canApproveWithdrawal(
  withdrawal: { initiatedBy: string } | null
): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, TREASURY_OPERATORS)) return false;
  if (!withdrawal) return false;
  return withdrawal.initiatedBy !== user.id;
}

// Four-eyes: sweep requires witness != initiator
export function canWitnessSweep(
  sweep: { initiatedBy: string } | null
): boolean {
  const user = getCurrentUser();
  if (!user || !hasRole(user, TREASURY_OPERATORS)) return false;
  if (!sweep) return false;
  return sweep.initiatedBy !== user.id;
}

// ─────────────────────────────────────────────────────────────
// RLS-aware accessors
// ─────────────────────────────────────────────────────────────

export function getTreasuryBalances(): TreasuryBalance[] {
  if (!canViewTreasury()) return [];
  return [...seedTreasuryBalances].sort((a, b) => {
    if (a.network !== b.network) return a.network.localeCompare(b.network);
    const order: CustodyTier[] = ["HOT", "WARM", "COLD"];
    return order.indexOf(a.tier) - order.indexOf(b.tier);
  });
}

export function getWithdrawals(): WithdrawalRequest[] {
  if (!canViewTreasury()) return [];
  return [...seedWithdrawals].sort((a, b) =>
    b.initiatedAt.localeCompare(a.initiatedAt)
  );
}

export function getWithdrawalById(id: string): WithdrawalRequest | null {
  if (!canViewTreasury()) return null;
  return seedWithdrawals.find((w) => w.id === id) ?? null;
}

export function getSweeps(): WalletSweep[] {
  if (!canViewTreasury()) return [];
  return [...seedSweeps].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getCeremonies(): KeyCeremony[] {
  if (!canViewTreasury()) return [];
  return [...seedCeremonies].sort((a, b) =>
    b.scheduledAt.localeCompare(a.scheduledAt)
  );
}

export function getChainTransactions(): ChainTransaction[] {
  if (!canViewTreasury()) return [];
  return [...seedChainTransactions].sort((a, b) =>
    b.broadcastAt.localeCompare(a.broadcastAt)
  );
}

export function getWhitelist(): WhitelistedAddress[] {
  if (!canViewTreasury()) return [];
  return [...seedWhitelist].sort((a, b) =>
    b.proposedAt.localeCompare(a.proposedAt)
  );
}

export function getKillSwitch(): KillSwitchState {
  if (!canViewTreasury()) {
    return { active: false };
  }
  return { ...seedKillSwitch };
}

export function getReconciliation(): CustodyReconciliationRow[] {
  if (!canViewTreasury()) return [];
  return [...seedReconciliation];
}

// ─────────────────────────────────────────────────────────────
// Derived totals
// ─────────────────────────────────────────────────────────────

export function getTreasuryTotals() {
  const balances = canViewTreasury() ? seedTreasuryBalances : [];
  const sum = (tier: CustodyTier) =>
    balances.filter((b) => b.tier === tier).reduce((s, b) => s + b.amountMicro, 0);
  const byNetwork = (network: Network) =>
    balances.filter((b) => b.network === network).reduce((s, b) => s + b.amountMicro, 0);
  return {
    hotMicro: sum("HOT"),
    warmMicro: sum("WARM"),
    coldMicro: sum("COLD"),
    totalMicro: balances.reduce((s, b) => s + b.amountMicro, 0),
    byNetwork: {
      TRC20: byNetwork("TRC20"),
      ERC20: byNetwork("ERC20"),
      BEP20: byNetwork("BEP20"),
    },
  };
}

export function getWithdrawalCounts() {
  const withdrawals = canViewTreasury() ? seedWithdrawals : [];
  return {
    total: withdrawals.length,
    pendingApproval: withdrawals.filter((w) => w.status === "PENDING_APPROVAL").length,
    amlFlagged: withdrawals.filter((w) => w.amlFlagged && w.status === "PENDING_APPROVAL").length,
    highRisk: withdrawals.filter((w) => w.riskScore >= 60 && w.status === "PENDING_APPROVAL").length,
    confirming: withdrawals.filter((w) => w.status === "CONFIRMING").length,
    completed: withdrawals.filter((w) => w.status === "COMPLETED").length,
    rejected: withdrawals.filter((w) => w.status === "REJECTED").length,
  };
}

export function getReconciliationDrift() {
  const rows = canViewTreasury() ? seedReconciliation : [];
  const driftRows = rows.filter((r) => !r.withinTolerance);
  return {
    rowCount: rows.length,
    driftCount: driftRows.length,
    driftRows,
  };
}

export function getPendingSweeps() {
  const sweeps = canViewTreasury() ? seedSweeps : [];
  return {
    pendingWitness: sweeps.filter((s) => s.status === "PENDING_WITNESS").length,
    pendingWitnessSweeps: sweeps.filter((s) => s.status === "PENDING_WITNESS"),
    confirming: sweeps.filter((s) => s.status === "CONFIRMING").length,
  };
}