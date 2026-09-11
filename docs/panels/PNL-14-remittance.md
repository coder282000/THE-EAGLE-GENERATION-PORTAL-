# PNL-14 — Remittance Operations (Admin Console)

**Panel ID:** PNL-14
**Release:** R5 (gate G-6)
**Layer:** Admin Console
**Screens:** 8
**Route prefix:** /admin/remittance

---

## 1. Purpose

Operate the cross-border remittance desk: every outbound and inbound transfer between Kenya and the supported corridors (Uganda, Tanzania, Rwanda, DRC, and any future corridor). This is the back office for every quote, every FX margin, every payout partner, every failed transfer, and every corridor configuration.

Remittance is a licensed activity under the CBK National Payments Strategy and (for outbound to virtual assets) the VASP Act 2025. Every value movement is four-eyes. Every corridor change is audited. Every failed payout has a recall path.

## 2. Users

| Role | Access | Notes |
|---|---|---|
| FINANCE_OFFICER | Full (own actions four-eyes) | Corridor config, FX margins, intervention |
| ADMIN | Read + intervention | Cannot approve own interventions |
| COMPLIANCE_LEAD | Read + AML escalation | Can flag, cannot move funds |
| SUPER_ADMIN | Full | Can override, audited |
| CHAPTER_LEADER | None | Not a financial role |
| MENTOR / MEMBER | None | Member-facing remittance lives at /remit |

## 3. Workflows

### W1 — Transfer lifecycle
QUOTED → CONFIRMED → PAYMENT_RECEIVED → PAYOUT_INITIATED → PAYOUT_PROCESSING → COMPLETED
                                                                         → FAILED → REFUNDED / RECALLED

### W2 — Manual intervention (four-eyes)
Finance Officer raises intervention on a stuck transfer → PENDING_APPROVAL → second approver (Super Admin or another Finance Officer) approves → action applied. Both actions audited.

### W3 — Corridor change
Finance Officer toggles corridor on/off, changes cut-off times, adjusts daily limits → change drafted → confirm → new config takes effect on next quote. Every change audited with before/after.

### W4 — FX margin adjustment
Finance Officer edits the platform margin per corridor → preview of impact on a standard 10,000 KES quote → confirm → margin applied immediately.

### W5 — Failed payout recall
Payout partner returns FAILED with reason → transfer appears in recall queue → Finance Officer raises recall to originating rail → refund confirmed within 72 hours → member notified.

### W6 — Float / nostro monitoring
Balance per corridor per partner. Alerts when float falls below operating floor or above sweep threshold.

## 4. Entity model

- **RemittanceTransfer** — one transfer, from quote to settlement
- **Corridor** — one config row per sending-country × receiving-country × rail
- **FXRate** — one row per corridor per refresh interval
- **PayoutPartner** — one row per partner (M-Pesa, Airtel Money, bank, mobile money aggregator)
- **NostroBalance** — point-in-time float snapshot per corridor per partner
- **RemittanceReturn** — one regulatory return per period per corridor

## 5. Non-negotiables

1. **Money is integer minor units + ISO 4217.** Never a float.
2. **Four-eyes on every value movement.** Interventions, refunds, manual adjustments.
3. **`ledger_entry` and `audit_log` are append-only.** Corrections are reversing entries.
4. **Never trust the client.** Provider and ledger are authoritative.
5. **Travel Rule.** Originator + beneficiary data on qualifying transfers.
6. **Every corridor change is audited** with before/after.
7. **Failed payouts have a 72-hour recall path.**
8. **FX margin changes take effect on the next quote**, not retroactively.

## 6. Cross-panel links

- PNL-09 Commerce & Finance — ledger, reconciliation, refunds
- PNL-13 OTC Desk — the crypto side of the remittance flow
- PNL-15 Compliance — Travel Rule log, AML alerts
- PNL-18 Audit & Security — audit explorer

## 7. Acceptance criteria

- An admin can take a QUOTED transfer to COMPLETED using only this panel.
- Every status transition writes an audit row with actor, action, before, after, timestamp.
- A corridor cannot be disabled without a reason; the change is audited.
- An intervention attempt by the same user who raised it is refused with a clear error.
- A failed payout appears in the recall queue within 60 seconds.
- Nostro positions reconcile against PNL-09 ledger daily, with an exception path.

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Corridor cut-off times — CBK or commercial? | Compliance Lead |
| Q2 | FX margin basis — mid-market or partner quote? | Finance |
| Q3 | Are all corridors equally live, or staged rollout? | Finance |
| Q4 | Payout partner SLA — minutes, hours, next-day? | Finance |
| Q5 | Does Uganda/Tanzania/Rwanda traffic need local settlement rails? | Compliance Lead |