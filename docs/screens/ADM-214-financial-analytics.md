# SCREEN SPEC: [ADM-214] Financial Analytics

## 1. Identification
- Screen ID: ADM-214
- Route: /admin/analytics/financial
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R3
- Priority: P0
- Related requirements: FR-10.5 (revenue by surface), FR-10.6, FR-8.8, FR-8.10
- Related panel: PNL-17
- Related gates: G-4 (PSP certification, reconciliation proven)

## 2. Purpose
Revenue, settlement, and reconciliation health across every commerce surface.
Supports Charter S6 (monthly revenue processed at least KES 900,000). This
screen is one of the places the Finance Officer and Steering Committee judge
whether the platform is financially healthy. Every rate and total carries its
denominator or scope.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All data |
| ADMIN | Full | All data |
| FINANCE_OFFICER | Full | This is the one analytics screen they see |
| COMPLIANCE_LEAD | Read-only | All data |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Analytics), ADM-210 KPI drill, ADM-105 (Daily
  reconciliation dashboard) link, ADM-214 is also the target of the
  FINANCE_OFFICER redirect from ADM-210
- Leads to: ADM-100 (transaction list, filtered), ADM-101 (transaction
  detail), ADM-104 (settlement reports), ADM-105 (reconciliation), ADM-106
  (exceptions), ADM-110 (revenue analytics drill)
- Deep-linkable: yes. URL params: ?from, ?to, ?surface

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default current month),
  surface filter (Events, Shop, Courses, Subscriptions, Donations)
- KPI row: five cards
  - Revenue processed (minor units, formatted with explicit currency)
  - Transactions count
  - Average transaction value
  - Reconciliation rate (%) - denominator: transactions in range
  - Failed or reversed rate (%) - denominator: transactions in range
- Chart row 1: Revenue over time (line, daily or monthly depending on range)
  with target overlay (Charter S6 target: KES 900,000 per month)
- Chart row 2: Revenue by surface (bar, horizontal)
- Chart row 3: Payment method mix (pie) - M-Pesa, card, bank, other
- Chart row 4: Settlement aging (bar) - settled, pending, overdue
- Table: Monthly summary - month, revenue, transactions, reconciliation rate,
  failed rate, settlement status

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI with denominator |
| MoneyDisplay | Formats integer minor units + ISO 4217 code |
| DateRangePicker | From/to filter |
| SurfaceFilter | Multi-select commerce surface |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | Monthly summary |
| SegmentedControl | Daily / monthly granularity |
| EmptyState | No data in range |

MoneyDisplay is the canonical money renderer for the whole admin console.
It takes integer minor units plus a currency code and renders "KES 1,500.00".
Never floats. Never a bare number.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Revenue minor units | Metric.revenueMinor | int | Y | Read | Financial |
| Currency | Metric.currency | char(3) | Y | Read | Internal |
| Transactions count | Metric.transactions | int | Y | Read | Internal |
| Average transaction | Metric.avgTransactionMinor | int | Y | Read | Financial |
| Reconciliation rate | Metric.reconciliationRate | number | Y | Read | Internal |
| Failed rate | Metric.failedRate | number | Y | Read | Internal |
| Revenue series | Metric.revenueByDay | list | Y | Read | Financial |
| Revenue by surface | Metric.bySurface | map | Y | Read | Financial |
| Payment method mix | Metric.byMethod | map | Y | Read | Internal |
| Settlement aging | Metric.settlementAging | map | Y | Read | Internal |
| Monthly summary | Metric.monthlySummary | list | Y | Read | Financial |

All amounts are integer minor units with an explicit currency. No floats
anywhere. No member identifiers in exports.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | FINANCE+ | No | GET /analytics/financial | No |
| Change filter | Surface | FINANCE+ | No | GET /analytics/financial | No |
| Drill to transactions | KPI / table row | FINANCE+ | No | navigates to ADM-100 | No |
| Drill to settlement | Table row | FINANCE+ | No | navigates to ADM-104 | No |
| Drill to reconciliation | KPI | FINANCE+ | No | navigates to ADM-105 | No |
| Export report | Toolbar | FINANCE+ | No | GET /analytics/financial.csv | Yes |

Exports include: revenue, transactions, reconciliation rate, failed rate.
Exports do not include member names or member numbers.

## 9. States
- Empty: "No financial activity in this period."
- Loading: skeleton KPIs and charts.
- Populated: full dashboard.
- Populated extreme: 365-day range. Series aggregate monthly.
- Partial: settlement aging fails; KPI and revenue charts render.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and other non-financial
  roles.
- Offline: cached summary visible; charts and exports disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 365 days.
- Surface filter limited to the five canonical surfaces.
- Currency is always displayed with the amount. Never a bare number.
- Reconciliation rate is derived from daily reconciliation runs in the
  period; if any day has no reconciliation run, the KPI shows
  "incomplete" instead of a partial figure.
- Export is watermarked with actor, range, filters, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack. Charts full width, 220px. Table becomes cards. |
| md (>=768) | Two-column KPIs. Charts full width, 260px. |
| xl (>=1280) | Five-column KPI row. Charts in two-column grid. |

## 12. Accessibility
- KPIs use `<dl>` with value, trend, denominator
- Money amounts are read as text with the currency, not as a number alone
- Charts have text alternatives describing trend
- Target overlay is labelled in legend and text alternative
- Table uses `<caption>` and `<th scope="col">`
- Focus order: date range, filter, KPIs, charts, table

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Server-side aggregation; never sends raw transactions to the browser
- CSV export streams
- Money formatting cached per currency

## 14. Analytics
- analytics.financial.viewed (properties: range_days, surface_filter)
- analytics.financial.drilled (properties: metric_key, drill_target)
- analytics.financial.exported

## 15. Copy
- Title: "Financial analytics"
- Subtitle: "Revenue, settlement, and reconciliation across every surface."
- Empty: "No financial activity in this period."
- KPI denominators:
  - "of {n} transactions in range"
  - "across {n} daily reconciliation runs"
- Target legend: "Target KES 900,000 per month (Charter S6)"
- Reconciliation incomplete: "Incomplete: {n} day(s) without a reconciliation
  run in this period."
- Surface labels: Events, Shop, Courses, Subscriptions, Donations
- Method labels: M-Pesa, Card, Bank, Other
- Toast export: "Export ready. Amounts in KES minor units; no member
  identifiers."

## 16. Open questions
- Q1: Should monthly revenue target be editable here, or fixed from Charter
  section 6? TEG Leadership.
- Q2: If the platform operates in multiple currencies (Kiswahili/French
  markets), does this screen show a combined figure or filter by currency?
  Finance Officer.
- Q3: Should the settlement aging chart respect the actual PSP cut-off
  schedule per surface, or use a generic T+2? Finance Officer.