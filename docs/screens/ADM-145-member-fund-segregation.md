# SCREEN SPEC: [ADM-145] Member-Fund Segregation Dashboard

## 1. Identification
- Screen ID: ADM-145
- Route: /admin/savings/segregation
- Layer: Admin Console
- Module: Savings and SACCO
- Release: R4
- Priority: P0
- Related requirements: FR-9.9, RO-5, Charter 5.3 (pooled member funds
  without segregation: never)
- Related panel: PNL-11
- Related gates: G-5

## 2. Purpose
Prove, every day, that member funds are ring-fenced from operating funds.
This is the daily reconciliation view that closes the loop on the SACCO's
most important control. A non-zero exception here is a P1 incident and
blocks further payouts on the affected circle.

Charter 5.3 states: "Pooled member funds without segregation: Never. Member
funds are ring-fenced and reconciled daily, see RO-5."

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All circles |
| FINANCE_OFFICER | Full | All circles |
| COMPLIANCE_LEAD | Full, read-only | Regulator-facing evidence |
| ADMIN | Read-only | Monitoring only |
| CIRCLE_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Savings > Segregation), dashboard critical alert
  if exceptions exist, ADM-105 (daily reconciliation) cross-link
- Leads to: ADM-141 (circle detail), ADM-106 (exceptions, PNL-09),
  audit trail
- Deep-linkable: yes. URL params: ?date, ?circle

## 5. Layout and regions
- Page header: title, subtitle, "Last reconciled" timestamp
- Alert banner: shown prominently if any exception exists; red tone with
  count and link to the affected circles
- KPI row: five cards
  - Total member funds held (money, KES)
  - Total operating funds held (money, KES)
  - Last reconciliation status (Balanced / N exceptions)
  - Last reconciliation at (relative time)
  - Days clean (consecutive balanced days)
- Chart row 1: member funds vs operating funds over time (line, last 90
  days)
- Chart row 2: daily reconciliation exceptions count (bar, last 30 days)
- Table: current segregation snapshot - circle, member funds, ledger-
  derived balance, external account balance, drift, last reconciled, status
- Table: recent reconciliation runs - date, run at, source, matched,
  unmatched, exceptions

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| AlertBanner | Prominent exception notice |
| Chart | Recharts wrapper, lazy-loaded |
| SnapshotTable | Per-circle snapshot with drift |
| RunHistoryTable | Recent reconciliation runs |
| MoneyCell | Consistent money rendering |
| StatusPill | Balanced / Exceptions |
| EmptyState | No runs yet |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Snapshot date | SegregationSnapshot.date | date | Y | Read | Internal |
| Circle id | SegregationSnapshot.circleId | string | Y | Read | Internal |
| Circle name | SegregationSnapshot.circleName | string | Y | Read | Internal |
| Member funds (ledger) | SegregationSnapshot.memberFundsMinor | int | Y | Read | Financial |
| External balance | SegregationSnapshot.externalBalanceMinor | int | Y | Read | Financial |
| Drift | SegregationSnapshot.driftMinor | int | Y | Read | Financial |
| Currency | SegregationSnapshot.currency | char(3) | Y | Read | Internal |
| Last reconciled | SegregationSnapshot.reconciledAt | timestamp | Y | Read | Internal |
| Status | SegregationSnapshot.status | enum | Y | Read | Internal |
| Run date | ReconciliationRun.date | date | Y | Read | Internal |
| Matched count | ReconciliationRun.matched | int | Y | Read | Internal |
| Unmatched count | ReconciliationRun.unmatched | int | Y | Read | Internal |
| Exceptions | ReconciliationRun.exceptions | int | Y | Read | Internal |
| Operating funds | SegregationSnapshot.operatingFundsMinor | int | Y | Read | Financial |

Status: BALANCED, EXCEPTIONS, INCOMPLETE.
Drift is computed: externalBalanceMinor - memberFundsMinor. Never stored;
always computed from the two source values.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Run reconciliation now | Toolbar | FINANCE+ | Yes | POST /savings/segregation/run | Yes |
| Investigate exception | Row action | FINANCE+ | No | navigates to ADM-106 | No |
| Open circle | Row click | FINANCE+ | No | navigates to ADM-141 | No |
| Export snapshot | Toolbar | FINANCE+ | No | GET /savings/segregation.csv | Yes |
| Export run history | Toolbar | FINANCE+ | No | GET /savings/segregation/runs.csv | Yes |

Manual reconciliation is available but never the primary path. The primary
path is the nightly scheduled job. Manual runs are audited with the actor.

## 9. States
- Empty (no runs yet): "Reconciliation has not run yet. It runs nightly at 02:00."
- Loading: skeleton KPIs and tables.
- Populated (balanced): green status, no alert banner.
- Populated (exceptions): red alert banner at the top with count and links.
- Populated extreme: 90 days of history, paginated runs list.
- Partial: external account data unreachable; banner states "External data
  unavailable" and status is INCOMPLETE.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER, CIRCLE_LEADER, and non-
  financial roles.
- Offline: cached last-known state visible; reconciliation disabled.
- Success: after manual run, the KPIs and tables refresh; the run appears in
  run history.
- Destructive confirmation: manual reconciliation (because it writes a
  snapshot and could affect downstream processes).

## 10. Validation and error handling
- Manual reconciliation requires a reason from a fixed list.
- If external account data is stale (older than 24h), the run is flagged
  INCOMPLETE.
- If drift is non-zero for any circle, that circle's payouts are blocked at
  the API level, not just the UI.
- All amounts are integer minor units with explicit currency. Never floats.
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
- Drift is expressed as a money amount with currency, not colour only
- Status pills combine colour and text ("Balanced" / "Exceptions")
- Table uses `<caption>` and `<th scope="col">`
- Focus order: alert banner, KPIs, charts, snapshot table, run history

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Run history paginated at 30
- Snapshot table refreshed on demand, cached at most 5 minutes
- Server-side aggregation

## 14. Analytics
- savings.segregation.viewed
- savings.segregation.manual_run (properties: reason)
- savings.segregation.exception_clicked
- savings.segregation.exported

## 15. Copy
- Title: "Member-fund segregation"
- Subtitle: "Daily proof that member funds are ring-fenced from operating funds."
- Last reconciled: "Last reconciled {relative time} ({date})"
- Empty: "Reconciliation has not run yet. It runs nightly at 02:00."
- Balanced: "Balanced. Zero drift across {n} circles."
- Exceptions: "{n} exception(s) detected. Investigate before further payouts on the affected circles."
- Incomplete: "External account data unavailable. Reconciliation incomplete."
- Run confirmation: "Run reconciliation now? A snapshot will be recorded and audited. Reason required."
- Toast run complete: "Reconciliation complete. {n} circles balanced, {m} with exceptions."

## 16. Open questions
- Q1: How often should the member funds vs operating funds chart refresh?
  Nightly from the reconciliation run, or intraday from ledger entries?
  Finance Officer and Tech Lead.
- Q2: Do we email the Finance Officer when exceptions exceed a threshold, or
  is the in-app alert sufficient? Finance Officer.
- Q3: When a manual reconciliation is run mid-day, does it replace the
  nightly snapshot or create an additional snapshot? Finance Officer and
  Tech Lead.