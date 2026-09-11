# SCREEN SPEC: [ADM-100] Transaction List

## 1. Identification
- Screen ID: ADM-100
- Route: /admin/finance
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P0
- Related requirements: FR-8.8 (finance admin), FR-8.10 (reconciliation)
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Single list of every fiat money movement on the platform: payments received,
refunds issued, payouts, and manual adjustments. The Finance Officer's home
screen for commerce. Filters and search let them find a specific transaction
by PSP reference, member, order, or amount.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All transactions |
| FINANCE_OFFICER | Full | All transactions |
| ADMIN | Read-only | Monitoring |
| COMPLIANCE_LEAD | Read-only | All transactions |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance), dashboard alert, ADM-105 reconciliation
  drill, ADM-110 revenue drill
- Leads to: ADM-101 (transaction detail), ADM-102 (order detail),
  ADM-111 (ledger explorer filtered to the pair)
- Deep-linkable: yes. URL params: ?status, ?type, ?surface, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, date range (default current month)
- KPI row: five cards
  - Revenue collected (money, KES) - denominator: transactions in range
  - Transactions count (n)
  - Average value (money)
  - Refunds issued (money) - denominator: transactions in range
  - Failed or reversed (n)
- Filter bar: search by reference, member number, order id, PSP reference;
  status filter; type filter; surface filter; date range
- Data table: date, reference, type, surface, member number, amount,
  currency, method, PSP reference, status
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards with denominators |
| DateRangePicker | From/to filter |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| StatusBadge | Transaction status |
| MoneyCell | Integer minor units + currency |
| EmptyState | No transactions |

MoneyCell is the same wrapper used across savings. Renders
`KES 1,500.00` from integer minor units + ISO 4217 code. Never floats.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Transaction id | Transaction.id | string | Y | Read | Internal |
| Reference | Transaction.reference | string | Y | Read | Internal |
| Type | Transaction.type | enum | Y | Read | Internal |
| Surface | Transaction.surface | enum | N | Read | Internal |
| Member id | Transaction.memberId | string | Y | Read | PII |
| Member number | Transaction.memberNumber | string | Y | Read | PII |
| Amount minor | Transaction.amountMinor | int | Y | Read | Financial |
| Currency | Transaction.currency | char(3) | Y | Read | Internal |
| Method | Transaction.method | enum | Y | Read | Internal |
| PSP reference | Transaction.pspReference | string | N | Read | Internal |
| Status | Transaction.status | enum | Y | Read | Internal |
| Ledger pair id | Transaction.ledgerPairId | string | N | Read | Financial |
| Created at | Transaction.createdAt | timestamp | Y | Read | Internal |

Type: PAYMENT, REFUND, PAYOUT, ADJUSTMENT.
Surface: EVENTS, SHOP, COURSES, SUBSCRIPTIONS, DONATIONS, SAVINGS.
Method: MPESA, CARD, BANK, INTERNAL.
Status: PENDING, SUCCESS, FAILED, REVERSED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open transaction | Row click | FINANCE+ | No | GET /finance/transactions/:id | No |
| Open order | Row link | FINANCE+ | No | navigates to ADM-102 | No |
| Open ledger pair | Row link | FINANCE+ | No | navigates to ADM-111 | No |
| Export list | Toolbar | FINANCE+ | No | GET /finance/transactions.csv | Yes |

No mutating actions on this screen. Refunds and adjustments are initiated
from ADM-103 (refund approval) or ADM-101 (transaction detail).

## 9. States
- Empty: "No transactions in this period."
- Loading: skeleton rows.
- Populated: typical 100-2000 transactions per month.
- Populated extreme: pagination caps at 50 per page.
- Partial: if PSP reference data is missing for a row, the cell shows "—"
  with a tooltip "PSP reference pending".
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-financial roles.
- Offline: cached list visible; exports disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 24 months.
- If the range exceeds 90 days, export is recommended over on-screen
  viewing.
- Amounts are integer minor units with the explicit currency. The screen
  never displays a bare number.
- Export is watermarked with actor, range, filters, timestamp. Export
  includes member numbers, never names.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Reference and amount prominent. |
| md (>=768) | Table, first seven columns. |
| xl (>=1280) | Table, all columns. |

## 12. Accessibility
- Semantic table with `<caption>` "Transactions"
- `aria-sort` on sortable columns
- Money values read as text with currency, not as bare numbers
- Status badge uses text and colour
- Focus order: date range, filters, KPIs, table, pagination
- Row click reachable via Enter with visible focus ring

## 13. Performance
- Payload budget: 220 KB
- Cursor pagination, 50 per page
- Server-side aggregation for KPIs
- Search debounced at 300 ms
- Ledger pair links are references, not embedded data

## 14. Analytics
- finance.transactions.viewed (properties: range_days, filters_count)
- finance.transaction.opened (properties: type)
- finance.transactions.exported

## 15. Copy
- Title: "Transactions"
- Subtitle: "Every fiat money movement on the platform."
- Empty: "No transactions in this period."
- KPI denominators:
  - "across {n} transactions"
  - "of {n} transactions in range"
- Toast export: "Export ready. Member numbers only; no names."

## 16. Open questions
- Q1: Should refunds and payouts be included in the same list as payments,
  or is a per-type view more useful for the Finance Officer? Finance Officer.
- Q2: Do we show the ledger pair id on the list row, or only on the detail
  view? Finance Officer and Tech Lead.
- Q3: When a PSP reference is missing (pending webhook), what does the row
  show? Currently "—" with a tooltip. Confirm this is the desired behaviour.
  Finance Officer.