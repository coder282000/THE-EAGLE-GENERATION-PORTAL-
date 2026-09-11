# PNL-12 — Treasury and Custody (Admin Console)

**Panel ID:** PNL-12
**Release:** R5 (gate G-6)
**Layer:** Admin Console
**Screens:** 8
**Route prefix:** /admin/treasury

---

## 1. Purpose

Operate the platform's cryptocurrency treasury: hot, warm and cold balances per asset per network. Approve member withdrawals under four-eyes. Move funds between custody tiers at documented, audited key ceremonies. Monitor on-chain transaction confirmations, reorganisation events, and stuck transactions. Reconcile on-chain holdings against the ledger.

This is the panel that holds value. Every action carries regulatory weight under gate G-6. Every value movement is four-eyes. Every key ceremony is witnessed and logged. Every withdrawal over the risk threshold is rate-limited and can be halted platform-wide by the kill switch.

## 2. Users

| Role | Access | Notes |
|---|---|---|
| FINANCE_OFFICER | Full (own actions four-eyes) | Withdrawal approval, sweeps, reconciliation |
| SUPER_ADMIN | Full | Kill switch, key ceremony witness, override |
| ADMIN | Read only | Cannot move funds |
| COMPLIANCE_LEAD | Read + escalation | AML freeze requests |
| CHAPTER_LEADER | None | Not a financial role |
| MENTOR / MEMBER | None | Member-facing wallet is at /wallet |

**Note:** The custody module is the one candidate for extraction from the monolith. If the R5 security review concludes that key-handling code must run in a separately deployed, network-isolated service, extract it and record a new ADR. Until then, keys are managed by the custody provider or HSM — never in the application database, never in the repository, never in an environment variable accessible to the API process.

## 3. Workflows

### W1 — Member withdrawal (four-eyes)
Member requests withdrawal on /wallet → KYC tier check → limit check → AML screen → address whitelist + cooling-off → PENDING_APPROVAL. Finance Officer reviews and either approves or rejects. On approve: ledger debited (double-entry), on-chain broadcast, confirmations monitored. On reject: withdrawal returns to the member with reason.

### W2 — Hot-to-warm sweep
Hot balance exceeds working float → sweep to warm wallet → transaction drafted → confirmed by two operators → broadcast → confirmed on-chain → balances updated. Every sweep has a reason and a witness.

### W3 — Cold storage operations (key ceremony)
Cold transfers require a documented key ceremony: participants present, procedure followed, transaction signed offline, broadcast by a second operator, logged. The screen shows the ceremony log, not the ceremony itself — the ceremony is a procedure, not a UI.

### W4 — On-chain monitoring
Every deposit, withdrawal and internal sweep is tracked from broadcast to confirmed. Confirmation thresholds are per-network and configurable. Reorg events must not double-credit — the monitor surfaces reorgs and marks affected deposits for manual review.

### W5 — Address whitelist
Finance Officer proposes a new withdrawal address → cooling-off period (default 24 hours) begins → after cooling-off, a second Finance Officer approves → address becomes available. Removal is immediate. Both actions audited.

### W6 — Kill switch
SUPER_ADMIN can halt all withdrawals platform-wide in one audited action. Halted withdrawals are not cancelled — they remain in queue with status HALTED until the switch is released. Release is also audited. The switch affects withdrawals only, not deposits or reads.

### W7 — Custody reconciliation
On-chain holdings (sum of hot + warm + cold, per asset per network) are compared against the ledger balance for the platform treasury account. Drift above tolerance is a P0 incident. Exceptions raised for manual review.

## 4. Entity model

- **TreasuryBalance** — point-in-time snapshot per asset × network × tier (hot/warm/cold)
- **WithdrawalRequest** — one member withdrawal, from request to confirmation
- **WalletSweep** — one hot→warm, warm→cold, cold→hot sweep, with witness
- **KeyCeremony** — one documented ceremony, participants, purpose, outcome
- **ChainTransaction** — one on-chain broadcast, confirmation count, reorg flag
- **WhitelistedAddress** — one saved withdrawal address with cooling-off state
- **KillSwitchState** — current state, who set it, when, reason, release history
- **CustodyReconciliationRow** — one asset × network × tier per reconciliation run

## 5. Non-negotiables

1. **Custody keys never touch the application database, the repository, or the API process memory.** Managed custody provider or HSM only.
2. **Every value movement is four-eyes.** Withdrawals, sweeps, cold operations, reversals.
3. **`ledger_entry` and `audit_log` are append-only.** Corrections are reversing entries.
4. **The kill switch halts withdrawals in one audited action**, releases in one audited action.
5. **Cold transfers require a documented key ceremony** with participants logged.
6. **Chain reorganisations must not double-credit.** Deposits have per-network confirmation thresholds; reorgs surface for manual review.
7. **Never credit on zero confirmations.**
8. **Address whitelisting has a cooling-off period** enforced in code, not policy.
9. **Reconciliation drift above tolerance is a P0 incident.**
10. **All money in integer minor units (crypto in micro-units) + explicit asset code.**

## 6. Cross-panel links

- PNL-09 Commerce & Finance — ledger explorer, reconciliation, refunds
- PNL-13 OTC Desk — liquidity view, sweep recommendations
- PNL-14 Remittance Operations — outbound corridor funding
- PNL-15 Compliance — AML alerts, Travel Rule, SAR filing
- PNL-18 Audit & Security — audit explorer, session review

## 7. Acceptance criteria

- A SUPER_ADMIN can halt withdrawals platform-wide in one action, and the halt is audited.
- A withdrawal cannot be approved by the same user who triggered it.
- Every sweep requires two distinct operators (initiator and witness).
- A cold transfer cannot be executed without a key ceremony log entry.
- A chain reorg on a deposited transaction flags the deposit for review within 30 seconds.
- Reconciliation drift above tolerance raises a P0 alert and blocks new withdrawal approvals until resolved.
- A whitelisted address cannot be used until cooling-off has expired.

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Cooling-off period — 24 hours or 48? | Compliance Lead |
| Q2 | Reconciliation tolerance — 0.01% or zero-tolerance? | Finance |
| Q3 | Confirmation thresholds per network — current values? | Tech Lead |
| Q4 | Kill switch — withdrawals only, or also deposits? | Tech Lead |
| Q5 | Which managed custody provider, and which HSM? | Tech Lead + Compliance Lead |
| Q6 | Key ceremony frequency — per cold transfer, or scheduled? | Compliance Lead |