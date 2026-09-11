# SCREEN SPEC: [ADM-106] Exception Handling Queue

## 1. Identification
- Screen ID: ADM-106
- Route: /admin/finance/exceptions
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P0
- Related requirements: FR-8.10, RO-5
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Investigate and resolve the exceptions raised by the daily reconciliation.
Each exception is a specific mismatch between the ledger and the PSP: a
missing entry, an amount mismatch, a duplicate, or an orphan. The Finance
Officer works this queue until it is empty.

Resolution of an exception is what makes the day's reconciliation clean.
Exceptions are never silently deleted; they are resolved with a reason.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | Can resolve, escalate |
| FINANCE_OFFICER | Full | Can resolve, escalate |
| ADMIN | Read-only | Monitoring |
| COMPLIANCE_LEAD | Read-only | All exceptions |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance > Exceptions), ADM-105 exception link,
  dashboard critical alert if exceptions exist
- Leads to: ADM-101 (transaction detail), ADM-105 (reconciliation run),
  member 360, audit trail
- Deep-linkable: yes. URL params: ?status, ?type, ?assigned

## 5. Layout and regions
- Page header: title, subtitle
- KPI row: five cards
  - Open (n)
  - High age (n, > 7 days)
  - Escalated (n)
  - Resolved (30d) (n)
  - Median time to resolve (hours) - denominator: resolved in range
- Filter bar: search reference or amount, type filter, status filter,
  assigned filter
- Data table: reference, type, amount, currency, opened at, age, assigned
  to, status
- Row click opens a side panel with the exception detail, the reconciliation
  run that raised it, the related transaction (if any), the PSP evidence,
  and the resolve / escalate actions

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| ExceptionDetailPanel | Side panel with full detail |
| RelatedRecords | Linked transactions, orders, PSP evidence |
| MoneyCell | Integer minor units + currency |
| StatusBadge | Exception status and type |
| ConfirmDialog | Resolve, escalate |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Exception id | ReconciliationException.id | string | Y | Read | Internal |
| Reference | ReconciliationException.reference | string | Y | Read | Internal |
| Type | ReconciliationException.type | enum | Y | Read | Internal |
| Reconciliation run | ReconciliationException.runId | string | Y | Read | Internal |
| Amount minor | ReconciliationException.amountMinor | int | N | Read | Financial |
| Currency | ReconciliationException.currency | char(3) | N | Read | Internal |
| Opened at | ReconciliationException.createdAt | timestamp | Y | Read | Internal |
| Age hours | ReconciliationException.ageHours | int | Y | Read | Internal |
| Assigned to | ReconciliationException.assignedTo | user | N | Read | Internal |
| Status | ReconciliationException.status | enum | Y | Read | Internal |
| Related transaction | ReconciliationException.transactionId | string | N | Read | Financial |
| Related order | ReconciliationException.orderId | string | N | Read | Internal |
| PSP reference | ReconciliationException.pspReference | string | N | Read | Internal |
| PSP evidence | ReconciliationException.pspEvidence | string | N | Read | Internal |
| Resolution | ReconciliationException.resolution | text | N | Read | Internal |
| Resolved at | ReconciliationException.resolvedAt | timestamp | N | Read | Internal |
| Resolved by | ReconciliationException.resolvedBy | user | N | Read | Internal |

Type: MISSING_IN_LEDGER, MISSING_IN_PSP, AMOUNT_MISMATCH, DUPLICATE,
ORPHANED.
Status: OPEN, INVESTIGATING, RESOLVED, ESCALATED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Assign | Panel | FINANCE+ | No | PATCH /finance/exceptions/:id | Yes |
| Mark investigating | Panel | FINANCE+ | No | PATCH /finance/exceptions/:id | Yes |
| Resolve | Panel | FINANCE+ | Yes (reason + typed confirm) | POST /finance/exceptions/:id/resolve | Yes |
| Escalate to compliance | Panel | FINANCE+ | Yes (reason) | POST /finance/exceptions/:id/escalate | Yes |
| Open transaction | Panel link | FINANCE+ | No | navigates to ADM-101 | No |
| Open run | Panel link | FINANCE+ | No | navigates to ADM-105 | No |
| Export queue | Toolbar | FINANCE+ | No | GET /finance/exceptions.csv | Yes |

Resolving an exception does not modify the ledger. If the resolution
requires a compensating entry, a separate adjustment request is created
under four-eyes. The exception resolution references that adjustment.

## 9. States
- Empty: "No exceptions. Reconciliation is clean."
- Loading: skeleton rows.
- Populated: typical 0-15 open exceptions.
- Populated extreme: pagination caps at 25.
- Partial: if the related transaction is missing, the panel shows the
  exception with a "No matching transaction found" note.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached list visible; resolve and escalate disabled.
- Success: toast confirms; row updates; if this was the last open
  exception, the run status flips to BALANCED.
- Destructive confirmation: resolve, escalate.

## 10. Validation and error handling
- Resolve requires a resolution type from a fixed list (matched manually,
  created adjustment, PSP error, false positive, other) plus free text
  (min 30 chars). Typed confirmation of the exception reference is
  required.
- Escalate requires a reason (min 30 chars) and routes the case to the
  Compliance Lead.
- If an exception has been open for more than 7 days, the age column shows
  a critical indicator.
- All amounts are integer minor units with the explicit currency. Never
  floats.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Reference, type, amount, age. |
| md (>=768) | Table, first six columns. Panel as side drawer. |
| xl (>=1280) | Table with all columns. Panel as side drawer, wider. |

## 12. Accessibility
- Semantic table with `<caption>` "Reconciliation exceptions"
- `aria-sort` on sortable columns
- Money values read with currency
- Age column indicates over-7-days with both colour and text
- Exception detail panel is a `<section>` with `<header>` and labelled
  sections
- Confirmation dialogs are focus traps
- Focus order: filters, KPIs, table, panel

## 13. Performance
- Payload budget: 220 KB
- Cursor pagination, 25 per page
- Panel detail lazy-loads on row click
- PSP evidence (statements, screenshots) loaded on demand

## 14. Analytics
- finance.exceptions.viewed (properties: filters_count)
- finance.exception.assigned
- finance.exception.resolved (properties: resolution_type, age_hours)
- finance.exception.escalated
- finance.exceptions.exported

## 15. Copy
- Title: "Exception queue"
- Subtitle: "Resolve mismatches between the ledger and the PSP."
- Empty: "No exceptions. Reconciliation is clean."
- KPI denominators:
  - "median over {n} exceptions resolved in range"
- Resolve confirmation: "Resolve this exception? Type the reference to confirm. Resolution is audited."
- Escalate confirmation: "Escalate to compliance? Reason required (min 30 chars). The Compliance Lead will be notified."
- Aged note: "Open for {n} days. Escalate if no resolution within 48 hours."
- Toast resolved: "Exception resolved. Run status updated."
- Toast escalated: "Exception escalated to compliance."

## 16. Open questions
- Q1: When a resolution requires a compensating ledger entry, should that
  adjustment be initiated from this screen or from ADM-101? The spec
  assumes this screen links to the adjustment workflow but does not create
  the adjustment inline. Confirm with Finance Officer and Tech Lead.
- Q2: Should the exception queue be shared across PNL-09 (fiat) and PNL-11
  (savings)? Savings has its own segregation dashboard today. A unified
  queue might be cleaner. Product Lead.
- Q3: Do we allow bulk resolution of false-positive exceptions, or is each
  one resolved individually? Finance Officer and Compliance Lead.