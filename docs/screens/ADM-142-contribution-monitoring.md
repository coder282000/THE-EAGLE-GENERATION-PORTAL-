# SCREEN SPEC: [ADM-142] Contribution Monitoring

## 1. Identification
- Screen ID: ADM-142
- Route: /admin/savings/contributions
- Layer: Admin Console
- Module: Savings and SACCO
- Release: R4
- Priority: P1
- Related requirements: FR-9.3, FR-9.4, FR-9.7
- Related panel: PNL-11
- Related gates: G-5

## 2. Purpose
Cross-circle view of every contribution made, pending, or missed. Finance
uses this to chase arrears, verify PSP settlements, and spot patterns. It
is the operational view that supports the daily reconciliation.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All contributions |
| FINANCE_OFFICER | Full | All contributions |
| ADMIN | Full, read-only | All contributions |
| COMPLIANCE_LEAD | Read-only | All contributions |
| CIRCLE_LEADER | Own circle only | RLS enforced |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Savings > Contributions), ADM-141 link "View all
  contributions", ADM-105 reconciliation drill
- Leads to: ADM-141 (circle detail), member 360, transaction detail (PNL-09)
- Deep-linkable: yes. URL params: ?status, ?circle, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, date range (default current month)
- KPI row: five cards
  - Contributions collected (money, KES)
  - Contributions count
  - On-time rate (%) - denominator: contributions due in range
  - Arrears amount (money)
  - Failed attempts (n)
- Filter bar: search member, status filter, circle filter, date range
- Data table: date, member (member number), circle, amount, currency,
  method, status, ledger pair reference
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| DateRangePicker | From/to filter |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| StatusBadge | Contribution status |
| MoneyCell | Renders integer minor units + currency |
| EmptyState | No contributions |

MoneyCell is a small wrapper for consistent money rendering. It takes
integer minor units and a currency code and renders "KES 1,500.00". It is
used across all savings screens.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Contribution id | Contribution.id | string | Y | Read | Internal |
| Date | Contribution.createdAt | timestamp | Y | Read | Internal |
| Member id | Contribution.memberId | string | Y | Read | PII |
| Member number | Contribution.memberNumber | string | Y | Read | PII |
| Circle id | Contribution.circleId | string | Y | Read | Internal |
| Circle name | Contribution.circleName | string | Y | Read | Internal |
| Amount | Contribution.amountMinor | int | Y | Read | Financial |
| Currency | Contribution.currency | char(3) | Y | Read | Internal |
| Method | Contribution.method | enum | Y | Read | Internal |
| Status | Contribution.status | enum | Y | Read | Internal |
| Ledger pair ref | Contribution.ledgerPairId | string | Y | Read | Financial |
| Failure reason | Contribution.failureReason | text | N | Read | Internal |

Method: MPESA, BANK, INTERNAL_TRANSFER.
Status: PAID, PENDING, FAILED, REVERSED, LATE.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open circle | Row click | FINANCE+ | No | navigates to ADM-141 | No |
| Open member | Row click on member | FINANCE+ | No | navigates to member 360 | No |
| Mark late | Row action | FINANCE+ | Yes | PATCH /savings/contributions/:id | Yes |
| Reverse | Row action | FINANCE+ | Yes | POST /savings/contributions/:id/reverse | Yes |
| Export list | Toolbar | FINANCE+ | No | GET /savings/contributions.csv | Yes |

Reversal creates a reversing ledger pair. It never edits the original entry.
The audit log records the reversing entry reference.

## 9. States
- Empty: "No contributions in this period."
- Loading: skeleton rows.
- Populated: typical 100-1000 contributions per month.
- Populated extreme: pagination caps at 50 per page.
- Partial: if PSP settlement data is missing for some rows, the row shows a
  "settlement pending" indicator.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-savings roles.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms mark late or reverse; row updates in place.
- Destructive confirmation: reversal only.

## 10. Validation and error handling
- Date range must have from <= to. Max 24 months.
- Mark late requires a reason from a fixed list.
- Reverse requires a reason (min 20 chars) and produces a reversing ledger
  pair, never an edit.
- Amounts are integer minor units with the circle's currency. Never floats.
- Export is watermarked with actor, range, filters, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Member number and amount prominent. |
| md (>=768) | Table, first six columns. |
| xl (>=1280) | Table, all columns. |

## 12. Accessibility
- Semantic table with `<caption>` "Contributions"
- `aria-sort` on sortable columns
- Money values read with currency
- Status badge uses text and colour
- Confirmation dialogs are focus traps
- Focus order: date range, filters, KPIs, table, pagination

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 50 per page
- Search debounced at 300 ms
- Ledger pair references are links, not embedded data

## 14. Analytics
- savings.contributions.viewed (properties: filters_count)
- savings.contribution.marked_late
- savings.contribution.reversed
- savings.contributions.exported

## 15. Copy
- Title: "Contributions"
- Subtitle: "Every contribution made, pending, or missed."
- Empty: "No contributions in this period."
- KPI denominators:
  - "of {n} contributions due in range"
- Mark late confirmation: "Mark this contribution as late? A reason is required. The member is notified."
- Reverse confirmation: "Reverse this contribution? A reversing entry will be created. The original is never edited. Reason required."
- Toast reverse: "Contribution reversed. Ledger updated with a reversing pair."

## 16. Open questions
- Q1: Should reversal be restricted to amounts above a threshold, or is any
  amount reversible with proper authorisation? Finance Officer.
- Q2: Do we track failed PSP attempts separately for reporting, or is the
  FAILED status enough? Finance Officer and Tech Lead.
- Q3: For contributions over a threshold, does AML screening fire
  automatically? Compliance Lead.