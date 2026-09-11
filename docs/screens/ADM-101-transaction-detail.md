# SCREEN SPEC: [ADM-101] Transaction Detail

## 1. Identification
- Screen ID: ADM-101
- Route: /admin/finance/transactions/[id]
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P0
- Related requirements: FR-8.7, FR-8.9, FR-8.10, RO-6, RO-7
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Full workspace for a single transaction: the PSP trail, the ledger pair, the
order it belongs to, and every action available to the Finance Officer. This
is where a refund is initiated, a manual adjustment is proposed, and the
auditor sees the full evidence trail from payment to settlement.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All actions |
| FINANCE_OFFICER | Full | All actions including refund initiation |
| ADMIN | Read-only | Monitoring |
| COMPLIANCE_LEAD | Read-only | All data |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

Four-eyes: a refund initiated on this screen must be approved by a different
user on ADM-103 before it is executed.

## 4. Entry and exit points
- Reached from: ADM-100 row click, ADM-102 order line link, ADM-111 ledger
  explorer drill
- Leads to: ADM-102 (order detail), ADM-103 (refund approval), ADM-111
  (ledger explorer), member 360, PSP dashboard (external link)
- Deep-linkable: yes. URL params: none (id in path)

## 5. Layout and regions
- Header: reference, type, amount, currency, status badge, date
- Timeline strip: Created -> PSP accepted -> Webhook confirmed -> Ledger
  posted -> Settled (or refunded). Shows current stage clearly.
- Left column (2/3):
  - Transaction summary card
  - PSP reference card (with external PSP link)
  - Ledger pair card (debit and credit lines, pair id, link to explorer)
  - Order card (order id, surface, items, link to ADM-102)
  - Member card (member number, link to member 360)
- Right column (1/3):
  - Actions panel: Initiate refund, Propose adjustment, View PSP dashboard,
    Export receipt
  - Audit trail (last 20 entries)

## 6. Components
| Component | Purpose |
|---|---|
| TransactionTimeline | Visual stage strip |
| DetailSection | Titled section wrapper |
| LedgerPairCard | Debit and credit rows with running balance |
| MoneyCell | Integer minor units + currency |
| StatusBadge | Transaction status |
| AuditTrail | Reused from applications module |
| ConfirmDialog | Refund, adjustment |
| EmptyState | Not-found |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Transaction id | Transaction.id | string | Y | Read | Internal |
| Reference | Transaction.reference | string | Y | Read | Internal |
| Type | Transaction.type | enum | Y | Read | Internal |
| Surface | Transaction.surface | enum | N | Read | Internal |
| Amount minor | Transaction.amountMinor | int | Y | Read | Financial |
| Currency | Transaction.currency | char(3) | Y | Read | Internal |
| Method | Transaction.method | enum | Y | Read | Internal |
| Status | Transaction.status | enum | Y | Read | Internal |
| PSP reference | Transaction.pspReference | string | N | Read | Internal |
| PSP accepted at | Transaction.pspAcceptedAt | timestamp | N | Read | Internal |
| PSP settled at | Transaction.pspSettledAt | timestamp | N | Read | Internal |
| Ledger pair id | Transaction.ledgerPairId | string | N | Read | Financial |
| Ledger entries | LedgerEntry[] | list | N | Read | Financial |
| Order id | Transaction.orderId | string | N | Read | Internal |
| Order items | OrderItem[] | list | N | Read | Financial |
| Member id | Transaction.memberId | string | Y | Read | PII |
| Member number | Transaction.memberNumber | string | Y | Read | PII |
| Created at | Transaction.createdAt | timestamp | Y | Read | Internal |
| Audit trail | AuditEntry[] | list | Y | Read | Internal |

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Initiate refund | Actions panel | FINANCE+ | Yes (reason) | POST /finance/refunds | Yes |
| Propose adjustment | Actions panel | FINANCE+ | Yes (reason + typed amount) | POST /finance/adjustments | Yes |
| Open order | Order card | FINANCE+ | No | navigates to ADM-102 | No |
| Open ledger explorer | Ledger card | FINANCE+ | No | navigates to ADM-111 | No |
| Open PSP dashboard | PSP card | FINANCE+ | No | opens external URL | Yes (log) |
| Export receipt | Toolbar | FINANCE+ | No | GET /finance/transactions/:id/receipt.pdf | Yes |
| Export full detail | Toolbar | FINANCE+ | No | GET /finance/transactions/:id.csv | Yes |

Refund initiation creates an `approval_request` with `request_type=REFUND`.
The initiator cannot approve their own request.

## 9. States
- Not-found: card with "Transaction not found."
- Loading: skeleton header, timeline, cards, actions.
- Populated: full workspace.
- Populated extreme: order with 20+ items; items list scrolls within the
  card.
- Partial: if the order card fails to load, the rest of the transaction
  still renders with an inline retry on that card.
- Error: full-page error card with Retry.
- Permission denied: 403 card for non-financial roles.
- Offline: cached summary visible; mutating actions disabled.
- Success: toast confirms refund initiated; the timeline updates to show
  "Refund pending approval".
- Destructive confirmation: refund, adjustment.

## 10. Validation and error handling
- Refund amount cannot exceed the original transaction amount minus any
  prior refunds against the same order.
- Adjustment requires a typed amount matching the proposed value, plus a
  reason (min 20 chars).
- If the transaction is already fully refunded, refund is disabled with a
  tooltip explaining why.
- If the transaction failed at the PSP, refund is disabled.
- All amounts are integer minor units with the explicit currency.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. Timeline becomes vertical. Actions become a bottom sheet. |
| md (>=768) | Single column, wider. Actions inline above cards. |
| lg (>=1024) | Two columns: main content left (2/3), actions and audit right (1/3). |
| xl (>=1280) | Same two-column, wider margins. |

## 12. Accessibility
- Timeline is an `<ol>` with `aria-current="step"` for the current stage
- Ledger pair card uses a table with explicit `<caption>` "Ledger entries"
- Money values read with currency
- Confirm dialogs are focus traps; Escape cancels
- Focus order: header, timeline, cards, actions, audit trail

## 13. Performance
- Payload budget: 220 KB
- Audit trail paginated at 20, expandable
- Order items lazy-load if more than 5
- Receipt PDF generated server-side, cached for 24h

## 14. Analytics
- finance.transaction.viewed (properties: type, status)
- finance.refund.initiated (properties: amount_bucket)
- finance.adjustment.proposed
- finance.receipt.downloaded

## 15. Copy
- Title: "{reference}"
- Subtitle: "{type} / {surface} / {amount}"
- Timeline stages: Created, PSP accepted, Webhook confirmed, Ledger posted, Settled
- Refund confirmation: "Initiate a refund of {amount}? A second approver is required before the PSP is instructed."
- Adjustment confirmation: "Propose an adjustment? Type the amount to confirm. Reason required (min 20 chars)."
- Refund disabled tooltip: "This transaction is fully refunded."
- Refund disabled tooltip failed: "Failed transactions cannot be refunded."
- Toast refund: "Refund initiated. Awaiting approval."

## 16. Open questions
- Q1: Do we allow partial refunds, or only full refunds of the original
  transaction? Finance Officer.
- Q2: When a transaction spans multiple order items, does a refund need to
  specify which items, or is the transaction the refund unit? Finance Officer
  and Product Lead.
- Q3: Should the PSP dashboard link be recorded in the audit log every time
  it is clicked? Tech Lead and Compliance Lead.