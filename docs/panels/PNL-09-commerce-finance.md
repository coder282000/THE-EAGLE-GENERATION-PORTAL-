# PANEL SPEC: PNL-09 Commerce and Finance

## 1. Identification
- Panel ID: PNL-09
- Layer: Admin Console
- Owner: Finance Officer (day-to-day), Product Lead (commerce config)
- Release: R3
- Priority: P0
- Related charter sections: 16.8 (Commerce, FR-8.1 to FR-8.12), 9.3
  (gate G-4), 19.3 (ledger_entry, approval_request), 20.3 (PaymentProvider)
- Related gates: G-4 (PSP integration certified, bank account and settlement
  flow documented, reconciliation proven)

## 2. Purpose
Oversight of every fiat money movement on the platform: transactions, orders,
refunds, settlements, reconciliation, and the financial reports that feed the
accounting system. This is the panel the Finance Officer uses daily, and the
one an auditor walks through when they want to see how the platform handles
money.

Commerce in R3 is fiat only. Virtual assets are R5 and belong to PNL-12 and
PNL-13. Fiat payments flow through a licensed PSP behind the
PaymentProvider interface.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All actions |
| FINANCE_OFFICER | Full | All actions including refund approval |
| ADMIN | Read-only | Monitoring and order management |
| COMPLIANCE_LEAD | Read-only | Regulator-facing evidence |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

Four-eyes rule: refunds require an initiator and an approver who are
different users. Enforced by the approval_request database CHECK constraint
(Charter 19.3). The same rule applies to manual financial adjustments.

## 4. Screens
| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-100 | Transaction list | /admin/finance | P0 |
| ADM-101 | Transaction detail | /admin/finance/transactions/[id] | P0 |
| ADM-102 | Order management | /admin/finance/orders | P1 |
| ADM-103 | Refund request and approval | /admin/finance/refunds | P0 |
| ADM-104 | Settlement reports | /admin/finance/settlements | P0 |
| ADM-105 | Daily reconciliation dashboard | /admin/finance/reconciliation | P0 |
| ADM-106 | Exception handling queue | /admin/finance/exceptions | P0 |
| ADM-107 | Product and pricing management | /admin/finance/products | P1 |
| ADM-108 | Discount and code management | /admin/finance/codes | P1 |
| ADM-109 | Subscription management | /admin/finance/subscriptions | P1 |
| ADM-110 | Revenue analytics | /admin/finance/revenue | P1 |
| ADM-111 | Chart of accounts and ledger explorer | /admin/finance/ledger | P0 |
| ADM-112 | Financial reporting and export | /admin/finance/reports | P0 |

## 5. Core workflows
- W1 Purchase: PSP confirms webhook -> order created -> ledger posted ->
  fulfilment (ticket, access, licence) -> reconciliation
- W2 Refund: initiator requests -> second approver approves -> PSP processes
  -> reversing ledger entry -> member notified
- W3 Reconciliation: nightly job matches PSP settlement against ledger,
  surfaces exceptions
- W4 Exception: investigate -> resolve or escalate -> close with reason
- W5 Subscription: renewal -> PSP charge -> success or dunning -> cancel or
  resume
- W6 Report: produce monthly figures -> export to accounting system

## 6. Entity model
Transaction, Order, OrderItem, Refund, Settlement, ReconciliationRun,
ReconciliationException, Product, PriceRule, DiscountCode, Subscription,
LedgerEntry (read-only view for the explorer).

Every value movement is a double-entry pair in ledger_entry. The ledger is
append-only. Refunds and adjustments are reversing entries, never edits.

## 7. Non-negotiables (from Charter)
- Money is integer minor units with an explicit ISO 4217 currency
- Every value movement is a double-entry pair in ledger_entry
- Refunds require four-eyes: initiator and approver must be different users
- ledger_entry is append-only; corrections are reversing entries
- Never trust the client for payment state; PSP webhooks are authoritative
- Webhooks are idempotent and signature-verified
- Daily reconciliation with exception reporting is mandatory (FR-8.10)
- KYC/CDD captured at first payment (FR-8.11)
- Sanctions and PEP screening on payer at onboarding and threshold breach
  (FR-8.12)

## 8. Related panels
PNL-02 (Applications) for the member identity behind a transaction.
PNL-03 (Members) for member 360.
PNL-11 (Savings) uses the same ledger and reconciliation patterns.
PNL-15 (Compliance) for KYC verification and AML alerts.
PNL-16 (Data Protection) for retention and DSR interactions with financial
records.
PNL-17 (Analytics) ADM-214 is the financial dashboard; ADM-110 in this panel
is the drill-down on commerce revenue surfaces. Potential overlap - see open
questions.

## 9. Acceptance criteria
- A Finance Officer can process a refund end-to-end under four-eyes
- Every transaction links to its PSP reference and its ledger pair
- Daily reconciliation either balances or surfaces named exceptions
- Ledger explorer shows any entry and its reversing counterpart
- Financial reports export in a format the accounting system accepts
- All exports are audited and watermarked

## 10. Open questions
- Q1: ADM-110 Revenue analytics overlaps with ADM-214 Financial analytics
  (PNL-17). Should ADM-110 be the revenue-by-surface drill-down and ADM-214
  the org-wide financial dashboard, or should they be merged? Product Lead
  and Finance Officer.
- Q2: Which accounting system do we export to? Xero, QuickBooks, or a CSV
  the Finance Officer imports manually? Finance Officer.
- Q3: Is the initial R3 launch a single currency (KES) or multi-currency?
  Charter assumes KES as default but doesn't forbid others. Finance Officer.
- Q4: Do we enable PSP refunds programmatically, or does the Finance Officer
  process refunds in the PSP dashboard and record them here? Depends on the
  licensed PSP capabilities. Finance Officer and Tech Lead.