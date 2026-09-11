# SCREEN SPEC: [ADM-105] Daily Reconciliation Dashboard

## 1. Identification
- Screen ID: ADM-105
- Route: /admin/finance/reconciliation
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P0
- Related requirements: FR-8.10 (daily automated reconciliation with
  exception reporting), RO-5, RO-6
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Prove, every day, that the platform's ledger matches what the licensed PSP
and bank actually processed. This is the control that gate G-4 depends on.
A reconciliation that does not run, or that has unresolved exceptions, is a
P0 incident and blocks new refund approvals until it clears.

This screen answers three questions:
1. Did last night's reconciliation run?
2. Did it balance, or are there exceptions?
3. How many consecutive days have been clean?

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All data, can run manual reconciliation |
| FINANCE_OFFICER | Full | All data, can run manual reconciliation |
| ADMIN | Read-only | Monitoring |
| COMPLIANCE_LEAD | Full, read-only | Regulator-facing evidence |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance > Reconciliation), dashboard critical
  alert if exceptions exist, ADM-214 financial analytics cross-link
- Leads to: ADM-106 (exception handling queue), ADM-100 (transaction list
  filtered to mismatched entries), ADM-104 (settlements), ADM-111 (ledger
  explorer)
- Deep-linkable: yes. URL params: ?date, ?status

## 5. Layout and regions
- Page header: title, subtitle, "Last reconciled" timestamp
- Alert banner: shown prominently if any exception exists; red tone with
  count and link to the exception queue
- KPI row: five cards
  - Last run status (Balanced / N exceptions / Incomplete)
  - Last run at (relative time)
  - Days clean (consecutive balanced days)
  - Matched transactions (n, last run) - denominator: transactions in
    last run
  - Unmatched (n, last run)
- Chart row 1: daily matched vs unmatched (stacked bar, last 30 days)
- Chart row 2: exception count over time (line, last 30 days)
- Table: recent reconciliation runs - date, run at, source (nightly /
  manual), matched, unmatched, exceptions, duration, status
- Table: current exceptions - reference, type, amount, currency, age,
  assigned to, status
- Pagination on both tables

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards with denominators |
| AlertBanner | Prominent exception notice |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | Runs and exceptions tables |
| Pagination | Cursor-based |
| StatusPill | Balanced / Exceptions / Incomplete |
| MoneyCell | Integer minor units + currency |
| EmptyState | No runs yet |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Run id | ReconciliationRun.id | string | Y | Read | Internal |
| Date | ReconciliationRun.date | date | Y | Read | Internal |
| Run at | ReconciliationRun.runAt | timestamp | Y | Read | Internal |
| Source | ReconciliationRun.source | enum | Y | Read | Internal |
| Matched | ReconciliationRun.matched | int | Y | Read | Internal |
| Unmatched | ReconciliationRun.unmatched | int | Y | Read | Internal |
| Exceptions | ReconciliationRun.exceptions | int | Y | Read | Internal |
| Duration seconds | ReconciliationRun.durationSeconds | int | Y | Read | Internal |
| Status | ReconciliationRun.status | enum | Y | Read | Internal |
| Exception id | ReconciliationException.id | string | Y | Read | Internal |
| Exception reference | ReconciliationException.reference | string | Y | Read | Internal |
| Exception type | ReconciliationException.type | enum | Y | Read | Internal |
| Amount minor | ReconciliationException.amountMinor | int | Y | Read | Financial |
| Currency | ReconciliationException.currency | char(3) | Y | Read | Internal |
| Age hours | ReconciliationException.ageHours | int | Y | Read | Internal |
| Assigned to | ReconciliationException.assignedTo | user | N | Read | Internal |
| Status | ReconciliationException.status | enum | Y | Read | Internal |

Source: NIGHTLY, MANUAL.
Run status: BALANCED, EXCEPTIONS, INCOMPLETE, FAILED.
Exception type: MISSING_IN_LEDGER, MISSING_IN_PSP, AMOUNT_MISMATCH,
DUPLICATE, ORPHANED.
Exception status: OPEN, INVESTIGATING, RESOLVED, ESCALATED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Run reconciliation now | Toolbar | FINANCE+ | Yes (reason) | POST /finance/reconciliation/run | Yes |
| Investigate exception | Row action | FINANCE+ | No | navigates to ADM-106 | No |
| Open related transaction | Row link | FINANCE+ | No | navigates to ADM-101 | No |
| Export run history | Toolbar | FINANCE+ | No | GET /finance/reconciliation/runs.csv | Yes |
| Export exceptions | Toolbar | FINANCE+ | No | GET /finance/reconciliation/exceptions.csv | Yes |

Manual runs are available but never the primary path. The nightly job runs
at 02:00 local time. Manual runs are audited with actor and reason.

## 9. States
- Empty (no runs yet): "Reconciliation has not run yet. It runs nightly at 02:00."
- Loading: skeleton KPIs and tables.
- Populated (balanced): green status, no alert banner.
- Populated (exceptions): red alert banner at the top with count and links.
- Populated extreme: 30 days of runs, pagination caps at 30.
- Partial: if PSP data is unreachable, status is INCOMPLETE and the banner
  explains why.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached last-known state visible; manual reconciliation disabled.
- Success: after a manual run, KPIs and tables refresh; run appears in
  history.
- Destructive confirmation: manual reconciliation.

## 10. Validation and error handling
- Manual reconciliation requires a reason from a fixed list (routine
  check, post-incident verification, regulator request, other).
- If PSP data is stale (older than 24h), the run is flagged INCOMPLETE and
  the reason shown.
- If any exception is older than 7 days, the run status is escalated to
  "Exceptions (aged)" with a critical indicator.
- All amounts are integer minor units with the explicit currency.
- Exports are watermarked with actor, timestamp, and run id.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. KPIs stack. Tables become cards. |
| md (>=768) | Two-column KPIs. Full tables. |
| xl (>=1280) | Five-column KPI row. Charts side by side. Full tables. |

## 12. Accessibility
- Alert banner uses `role="alert"` when a new exception is detected
- KPI cards use `<dl>` with value and denominator
- Charts have text alternatives describing the trend in words
- Status pills combine colour and text ("Balanced" / "N exceptions")
- Table uses `<caption>` and `<th scope="col">`
- Focus order: alert banner, KPIs, charts, runs table, exceptions table

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Runs table paginated at 30, exceptions at 25
- Server-side aggregation
- Manual reconciliation is a background job with progress shown inline

## 14. Analytics
- finance.reconciliation.viewed
- finance.reconciliation.manual_run (properties: reason)
- finance.reconciliation.exception_clicked
- finance.reconciliation.exported (properties: table)

## 15. Copy
- Title: "Daily reconciliation"
- Subtitle: "Proof that the ledger matches the PSP and the bank."
- Last reconciled: "Last reconciled {relative time} ({date})"
- Empty: "Reconciliation has not run yet. It runs nightly at 02:00."
- Balanced: "Balanced. Zero exceptions across {n} transactions."
- Exceptions: "{n} exception(s) detected. Investigate before further refunds."
- Incomplete: "PSP data unavailable. Reconciliation incomplete."
- Aged exceptions: "{n} exceptions older than 7 days. Escalated to Compliance Lead."
- Run confirmation: "Run reconciliation now? A new run will be recorded and audited. Reason required."
- Toast complete: "Reconciliation complete. {n} matched, {m} exceptions."

## 16. Open questions
- Q1: How often should this screen refresh automatically? Currently
  refreshes on view. Should it poll every 60 seconds during business hours?
  Product Lead and Tech Lead.
- Q2: Do we notify the Finance Officer by email when exceptions are
  detected, or is the in-app alert sufficient? Finance Officer.
- Q3: When a manual run is triggered during the day, does it replace the
  nightly run in the history, or appear as an additional run? The spec
  assumes additional. Finance Officer and Tech Lead.
- Q4: Do we expose reconciliation status to ADM-214 (Financial Analytics)
  as a KPI, or is this screen the only place it appears? Product Lead.