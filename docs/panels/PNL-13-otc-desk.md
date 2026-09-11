# PNL-13 — OTC Desk (Admin Console)

**Panel ID:** PNL-13
**Release:** R5 (gate G-6)
**Layer:** Admin Console
**Screens:** 8
**Route prefix:** /admin/otc

---

## 1. Purpose

Operate, monitor and intervene in the OTC desk: the fiat-to-crypto and crypto-to-fiat exchange between members and the platform. This panel is the back office for every USDT/KES trade, every escrow hold, every dispute, every agent, and every rate the platform quotes.

The OTC desk is a licensed activity (VA exchange, broker and payment processor). Every screen in this panel carries regulatory weight. Every value movement is four-eyes. Every rate change is audited. Every dispute has an SLA.

## 2. Users

| Role | Access | Notes |
|---|---|---|
| FINANCE_OFFICER | Full (own actions four-eyes) | Rate management, manual intervention, liquidity |
| ADMIN | Read + dispute arbitration | Cannot approve own interventions |
| COMPLIANCE_LEAD | Read + dispute arbitration + AML | Can escalate, cannot move funds |
| SUPER_ADMIN | Full | Can override, audited |
| CHAPTER_LEADER | None | Not a financial role |
| MENTOR / MEMBER | None | Member-facing OTC lives at /otc, not here |

## 3. Workflows

### W1 — Order lifecycle
PENDING → MATCHED → ESCROW_HELD → PAYMENT_SENT → CRYPTO_RELEASED → COMPLETED
                                                                  → DISPUTED → REFUNDED / SPLIT

### W2 — Manual intervention (four-eyes)
Finance Officer raises an intervention → status becomes PENDING_APPROVAL → second approver (Super Admin or another Finance Officer) approves or rejects → if approved, action applied; if rejected, order returns to prior state. Both actions audited.

### W3 — Rate change
Finance Officer edits buy/sell rate for a pair+tier → change is drafted → preview of margin impact → confirm → new rate takes effect immediately; old rate archived. Every change audited with before/after.

### W4 — Dispute arbitration
Member raises dispute on /otc/orders/[id]/dispute → lands in ADM-164 queue → assigned to COMPLIANCE_LEAD or ADMIN → investigation → resolution (BUYER / SELLER / SPLIT) → escrow released accordingly → both parties notified.

### W5 — Agent onboarding
Admin creates agent → KYC verified → limits set → commission set → settlement account linked → agent ACTIVE. Suspension is one-click, audited.

### W6 — Liquidity monitoring
Hot / warm / cold balances per network, in-escrow, in-flight. Alerts fire when hot balance falls below threshold.

## 4. Entity model

- **OTCOrder** — one trade, from placement to completion
- **EscrowRecord** — one escrow hold per order (held, released, refunded, disputed)
- **OTCDispute** — one dispute per challenged order
- **OTCAgent** — one registered agent (P2P counterparty)
- **OTCSpreadConfig** — one rate+spread row per pair × tier
- **OTCExposureSnapshot** — point-in-time liquidity snapshot per asset × network
- **OTCAnalytics** — one aggregation per period

## 5. Non-negotiables

1. **Money is integer minor units + ISO 4217 currency code.** Never a float.
2. **Four-eyes on every value movement.** Manual interventions, refunds, splits — initiator ≠ approver.
3. **`ledger_entry` and `audit_log` are append-only.** Corrections are reversing entries.
4. **Never trust the client.** Balance and status come from the platform, not the browser.
5. **Kill switch is one click.** SUPER_ADMIN can halt all OTC trades platform-wide.
6. **Travel Rule.** Qualifying transfers carry originator + beneficiary data.
7. **Every rate change is audited** with before/after values.
8. **Disputes have an SLA.** 48 hours from OPEN to RESOLVED, escalating at 24.

## 6. Cross-panel links

- PNL-09 Commerce & Finance — ledger explorer, reconciliation
- PNL-12 Treasury & Custody — hot/warm/cold balances, withdrawal approval
- PNL-15 Compliance — AML alerts, sanctions hits, SAR filing
- PNL-18 Audit & Security — audit explorer, session review

## 7. Acceptance criteria

- An admin can move a PENDING order through to COMPLETED using only this panel.
- Every status transition writes an audit row with actor, action, before, after, timestamp.
- An intervention attempt by the same user who raised it is refused with a clear error.
- A rate change is visible in the order book within one refresh cycle.
- A dispute cannot be resolved by the same user who opened it.
- The liquidity dashboard reflects every escrow hold within 30 seconds.

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | SLA hours for dispute resolution — 48h or 72h? | Compliance Lead |
| Q2 | Agent commission payout cadence — weekly or monthly? | Finance |
| Q3 | Split resolution splits — 50/50 or custom? | Compliance Lead |
| Q4 | Should COMPLIANCE_LEAD be able to approve interventions? | Compliance Lead |
| Q5 | Kill switch — global or per-corridor? | Tech Lead |