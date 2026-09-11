# SCREEN SPEC: [ADM-104] Settlement Reports

## 1. Identification
- Screen ID: ADM-104
- Route: /admin/finance/settlements
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P0
- Related requirements: FR-8.8, FR-8.10 (reconciliation), RO-5
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Track what the licensed PSP has actually paid into the TEG account. Every
successful payment on the platform eventually settles: the PSP batches
transactions and transfers the net amount to TEG's bank account. This screen
shows what settled, what is pending, and what is overdue.

The Finance Officer uses this to answer three questions:
1. Has the PSP paid us what they owe us?
2. When is the next settlement due?
3. Are there settlements past their expected date?

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All settlements |
| FINANCE_OFFICER | Full | All settlements |
| ADMIN | Read-only | Monitoring |
| COMPLIANCE_LEAD | Read-only | All settlements |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance > Settlements), ADM-105 reconciliation
  drill, ADM-112 report
- Leads to: ADM-100 (transaction list filtered to the settlement), ADM-101
  (individual transaction), ADM-106 (exceptions)
- Deep-linkable: yes. URL params: ?status, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, notice about PSP settlement schedule
- KPI row: five cards
  - Settled this month (money, KES)
  - Pending settlement (money, KES)
  - Overdue (money, KES)
  - Expected next settlement (date)
  - Average settlement lag (days) - denominator: settlements in range
- Filter bar: date range, status filter, PSP filter
- Data table: settlement reference, PSP, period covered, gross amount,
  fees, net amount, currency, expected date, received date, status
- Pagination
- Row click opens a side panel with breakdown by transaction and any
  attached PSP statement

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards with denominators |
| DateRangePicker | From/to filter |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| SettlementDetailPanel | Side panel with breakdown |
| MoneyCell | Integer minor units + currency |
| StatusBadge | Settlement status |
| EmptyState | No settlements |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Settlement id | Settlement.id | string | Y | Read | Internal |
| Reference | Settlement.reference | string | Y | Read | Internal |
| PSP | Settlement.psp | enum | Y | Read | Internal |
| Period from | Settlement.periodFrom | date | Y | Read | Internal |
| Period to | Settlement.periodTo | date | Y | Read | Internal |
| Gross amount minor | Settlement.grossMinor | int | Y | Read | Financial |
| PSP fees minor | Settlement.feesMinor | int | Y | Read | Financial |
| Net amount minor | Settlement.netMinor | int | Y | Read | Financial |
| Currency | Settlement.currency | char(3) | Y | Read | Internal |
| Expected at | Settlement.expectedAt | date | Y | Read | Internal |
| Received at | Settlement.receivedAt | timestamp | N | Read | Internal |
| Status | Settlement.status | enum | Y | Read | Internal |
| Bank reference | Settlement.bankReference | string | N | Read | Internal |
| PSP statement url | Settlement.statementUrl | string | N | Read | Internal |
| Transaction count | Settlement.transactionCount | int | Y | Read | Internal |

PSP: MPESA, CARD_PROVIDER, BANK.
Status: EXPECTED, RECEIVED, OVERDUE, DISCREPANCY, CANCELLED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open settlement | Row click | FINANCE+ | No | GET /finance/settlements/:id | No |
| View transactions | Panel link | FINANCE+ | No | navigates to ADM-100 filtered | No |
| Mark received | Panel action | FINANCE+ | Yes | PATCH /finance/settlements/:id | Yes |
| Flag discrepancy | Panel action | FINANCE+ | Yes (reason) | PATCH /finance/settlements/:id | Yes |
| Download PSP statement | Panel action | FINANCE+ | No | GET (external URL) | Yes (log) |
| Export list | Toolbar | FINANCE+ | No | GET /finance/settlements.csv | Yes |

Marking a settlement as received does not alter the ledger. The ledger is
already correct at the transaction level. This action records the fact of
the bank transfer and updates the settlement's status.

## 9. States
- Empty: "No settlements in this period."
- Loading: skeleton rows.
- Populated: typical 3-30 settlements per month.
- Populated extreme: pagination caps at 25.
- Partial: if a settlement's bank reference is missing, the cell shows "—"
  with a tooltip "Awaiting bank statement".
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms; row updates.
- Destructive confirmation: flag discrepancy.

## 10. Validation and error handling
- Mark received requires the received amount to equal the net amount.
  Any mismatch must be flagged as a discrepancy instead.
- Flag discrepancy requires a reason from a fixed list (underpayment,
  overpayment, missing transfer, other) plus free text (min 20 chars).
- If a settlement is older than 30 days past its expected date and still
  EXPECTED, the row shows a critical indicator.
- All amounts are integer minor units with the explicit currency. Never
  floats.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Reference, PSP, net amount, status. |
| md (>=768) | Table, first seven columns. |
| xl (>=1280) | Table, all columns. |

## 12. Accessibility
- Semantic table with `<caption>` "Settlement reports"
- `aria-sort` on sortable columns
- Money values read with currency
- Status badge uses text and colour
- Overdue rows include an aria-describedby note explaining the delay
- Focus order: date range, filters, KPIs, table, pagination

## 13. Performance
- Payload budget: 220 KB
- Cursor pagination, 25 per page
- Settlement breakdown lazy-loads on panel open
- Export streamed server-side

## 14. Analytics
- finance.settlements.viewed (properties: range_days)
- finance.settlement.marked_received
- finance.settlement.discrepancy_flagged (properties: reason_category)
- finance.settlements.exported

## 15. Copy
- Title: "Settlements"
- Subtitle: "What the PSP has paid into the TEG account."
- Empty: "No settlements in this period."
- KPI denominators:
  - "median over {n} settlements in range"
- Mark received confirmation: "Mark this settlement as received? The received amount must equal the net amount. If they differ, flag a discrepancy instead."
- Flag discrepancy confirmation: "Flag a discrepancy? Choose a reason and describe what happened (min 20 chars). The reconciliation dashboard will pick this up."
- Overdue note: "Overdue by {n} days. Contact the PSP if not received within 48 hours."
- Toast received: "Settlement marked as received."
- Toast flagged: "Discrepancy flagged. Awaiting resolution."

## 16. Open questions
- Q1: How often does the PSP settle in Kenya? Is it T+1, T+2, or a
  weekly batch depending on the PSP? Finance Officer.
- Q2: Do we fetch PSP statements automatically via API, or does the
  Finance Officer upload them? Depends on the licensed PSP. Finance Officer
  and Tech Lead.
- Q3: When a settlement is overdue, does the platform need to notify the
  Finance Officer proactively? Finance Officer and Product Lead.
- Q4: Do we track per-surface settlement (e.g. M-Pesa events vs M-Pesa
  shop), or is the PSP the only grouping? Finance Officer.