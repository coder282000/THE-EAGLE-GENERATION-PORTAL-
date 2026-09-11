# SCREEN SPEC: [ADM-110] Revenue Analytics

## 1. Identification
- Screen ID: ADM-110
- Route: /admin/finance/revenue
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P1
- Related requirements: FR-8.8, FR-10.5
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Revenue drill-down by surface, product, and chapter. This is the commerce
view of revenue. ADM-214 (PNL-17) is the org-wide financial dashboard;
ADM-110 is the drill-down the Finance Officer uses when they need to know
which product or which chapter is driving revenue.

Every figure carries its denominator. Every export is audited.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All data |
| FINANCE_OFFICER | Full | All data |
| ADMIN | Read-only | All data |
| COMPLIANCE_LEAD | Read-only | All data |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance > Revenue), ADM-214 revenue chart drill,
  ADM-104 settlement drill
- Leads to: ADM-100 (transaction list filtered to the slice), ADM-102
  (order list), ADM-107 (product detail), ADM-215 (chapter performance)
- Deep-linkable: yes. URL params: ?surface, ?product, ?chapter, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default current month)
- KPI row: five cards
  - Revenue (money, KES) - denominator: transactions in range
  - Transactions (n)
  - Average value (money)
  - Refunds (money) - denominator: revenue in range
  - Net revenue (money)
- Chart row 1: revenue over time (line, daily or monthly depending on range)
  with target overlay for the monthly KES 900,000 target
- Chart row 2: revenue by surface (bar, horizontal)
- Chart row 3: revenue by chapter (bar, horizontal, top 10)
- Chart row 4: revenue by product (table, top 10 products)
- Table: monthly summary - month, revenue, transactions, refunds, net,
  growth %
- All charts and tables respect the surface and chapter filters.

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards with denominators |
| DateRangePicker | From/to filter |
| SurfaceFilter | Multi-select surface |
| ChapterFilter | Multi-select chapter |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | Product and monthly tables |
| Pagination | Cursor-based |
| SegmentedControl | Daily / monthly granularity |
| MoneyCell | Integer minor units + currency |
| EmptyState | No data in range |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Revenue minor | Metric.revenueMinor | int | Y | Read | Financial |
| Currency | Metric.currency | char(3) | Y | Read | Internal |
| Transactions | Metric.transactions | int | Y | Read | Internal |
| Average value | Metric.avgTransactionMinor | int | Y | Read | Financial |
| Refunds minor | Metric.refundsMinor | int | Y | Read | Financial |
| Net revenue | Metric.netRevenueMinor | int | Y | Read | Financial |
| Revenue series | Metric.revenueByDay | list | Y | Read | Financial |
| By surface | Metric.bySurface | map | Y | Read | Financial |
| By chapter | Metric.byChapter | list | Y | Read | Internal |
| By product | Metric.byProduct | list | Y | Read | Internal |
| Monthly summary | Metric.monthlySummary | list | Y | Read | Financial |
| Target series | Metric.targetByMonth | list | Y | Read | Internal |

All amounts are integer minor units with explicit currency. Chapter
references are chapter codes, never member names. Products are named, but
revenue is aggregated; no member identifiers appear in any chart or export.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | FINANCE+ | No | GET /finance/revenue | No |
| Change filter | Surface/chapter | FINANCE+ | No | GET /finance/revenue | No |
| Drill to transactions | KPI or chart element | FINANCE+ | No | navigates to ADM-100 with filter | No |
| Drill to product | Table row | FINANCE+ | No | navigates to ADM-107 | No |
| Drill to chapter | Chart element | FINANCE+ | No | navigates to ADM-215 | No |
| Export report | Toolbar | FINANCE+ | No | GET /finance/revenue.csv | Yes |

## 9. States
- Empty: "No revenue in this period."
- Loading: skeleton KPIs and charts.
- Populated: full dashboard.
- Populated extreme: 24-month range. Series aggregate monthly.
- Partial: if one chart fails, its panel shows an inline retry; the rest
  of the page renders.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached summary visible; charts and exports disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 24 months.
- Surface filter limited to the five canonical surfaces.
- Chapter filter limited to active chapters.
- Target overlay shown only if the range includes one or more full months.
- Export is watermarked with actor, range, filters, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack. Charts full width, 220px. Tables become cards. |
| md (>=768) | Two-column KPIs. Charts full width, 260px. |
| xl (>=1280) | Five-column KPI row. Charts in two-column grid. |

## 12. Accessibility
- KPI cards use `<dl>` with value and denominator
- Charts have text alternatives describing trend and top segment
- Target overlay is labelled in legend and in the text alternative
- Tables use `<caption>` and `<th scope="col">`
- Money values read with currency
- Focus order: date range, filters, KPIs, charts, tables

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Server-side aggregation
- Monthly summary paginated at 24
- Product table limited to top 10
- Export streamed server-side

## 14. Analytics
- finance.revenue.viewed (properties: range_days, filters_count)
- finance.revenue.drilled (properties: metric_key, drill_target)
- finance.revenue.exported

## 15. Copy
- Title: "Revenue analytics"
- Subtitle: "Revenue by surface, chapter, and product."
- Empty: "No revenue in this period."
- KPI denominators:
  - "across {n} transactions"
  - "of {n} total revenue in range"
- Target legend: "Target KES 900,000 per month (Charter S6)"
- Surface labels: Events, Shop, Courses, Subscriptions, Donations
- Toast export: "Export ready. Chapter codes and product names only; no member identifiers."

## 16. Open questions
- Q1: This screen overlaps with ADM-214 (Financial Analytics in PNL-17).
  The distinction in the spec is: ADM-214 is org-wide including
  reconciliation and settlement health; ADM-110 is commerce revenue
  drill-down by surface, product, and chapter. Is that distinction
  sufficient, or should the two be merged? Product Lead and Finance
  Officer.
- Q2: Should revenue by chapter show chapter names or chapter codes? The
  spec uses codes for consistency with ADM-215. Finance Officer and
  Content Lead.
- Q3: Do we show refunds as a separate KPI, or fold them into net revenue
  only? Currently both are shown. Finance Officer.