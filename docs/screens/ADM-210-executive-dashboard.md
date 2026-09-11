# SCREEN SPEC: [ADM-210] Executive Dashboard

## 1. Identification
- Screen ID: ADM-210
- Route: /admin/analytics
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R2
- Priority: P0
- Related requirements: FR-10.1, FR-10.6, FR-10.7
- Related panel: PNL-17

## 2. Purpose
One page for TEG Leadership and the Steering Committee to see what has
actually been achieved, not what was planned. Every KPI carries its
denominator. Targets are visually distinct from actuals. This screen is the
canonical view for the monthly steering report.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All data |
| ADMIN | Full | All data |
| COMPLIANCE_LEAD | Read-only | All data |
| FINANCE_OFFICER | Denied | Redirect to ADM-214 |
| CHAPTER_LEADER | Denied | Redirect to ADM-215 |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Analytics), PNL-01 "Full Analytics" action, notification
- Leads to: each drill-down screen (ADM-211 to ADM-215), ADM-216 impact report
- Deep-linkable: yes. URL params: ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default last 30 days)
- Success criteria strip: ten Charter S1-S10 criteria, each as a compact card
  with actual, target, and status pill. Explicitly labelled "Targets, not
  achieved figures" per G-3.
- KPI row: five cards - Members onboarded, Active chapters, Cohorts delivered,
  Monthly revenue processed, Weekly active rate. Each shows value, trend,
  denominator line.
- Chart: membership growth (line, monthly)
- Chart: revenue processed (bar, monthly, fiat currency)
- Chart: learning completion rate (line, weekly)
- Chart: engagement heatmap (DAU by day-of-week x hour-bucket) - optional,
  collapsible
- "Generate impact report" call to action (link to ADM-216)

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI with denominator |
| CriteriaCard | One success criterion (actual / target / status) |
| DateRangePicker | From/to filter |
| Chart | Recharts wrapper, lazy-loaded |
| SegmentedControl | Granularity: monthly / quarterly |
| EmptyState | No data in range |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Members onboarded | Metric.membersOnboarded | int | Y | Read | Internal |
| Active chapters | Metric.activeChapters | int | Y | Read | Internal |
| Cohorts delivered | Metric.cohortsDelivered | int | Y | Read | Internal |
| Monthly revenue | Metric.revenueProcessedMinor | int (minor units) | Y | Read | Financial |
| Currency | Metric.currency | char(3) | Y | Read | Internal |
| Weekly active rate | Metric.weeklyActiveRate | number | Y | Read | Internal |
| Success criteria | Criteria.[S1..S10] | map | Y | Read | Internal |
| Growth series | Metric.membershipByMonth | list | Y | Read | Internal |
| Revenue series | Metric.revenueByMonth | list | Y | Read | Financial |
| Completion series | Metric.completionByWeek | list | Y | Read | Internal |

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | ADMIN+ | No | GET /analytics/executive | No |
| Change granularity | Segmented | ADMIN+ | No | GET /analytics/executive | No |
| Drill into metric | KPI card | ADMIN+ | No | navigates | No |
| Generate impact report | CTA | ADMIN+ | No | navigates to ADM-216 | No |
| Export dashboard | Toolbar | ADMIN+ | No | GET /analytics/executive.csv | Yes |

## 9. States
- Empty (no data): "No activity in this period."
- Loading: skeleton KPIs, skeleton charts.
- Populated: full dashboard.
- Populated extreme: 365-day range. Series aggregate to weekly or monthly
  automatically.
- Partial: if one chart fails, its panel shows inline retry; rest renders.
- Error: full-page error card with Retry.
- Permission denied: 403 card for other roles; FINANCE_OFFICER redirect to
  ADM-214; CHAPTER_LEADER redirect to ADM-215.
- Offline: cached summary visible, charts disabled, exports disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 365 days.
- If range > 90 days and granularity is monthly, series auto-aggregate.
- Export is watermarked with actor, range, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack one per row. Charts full width, 220px tall. Criteria strip becomes horizontal scroll. |
| md (>=768) | Two-column KPI grid. Charts full width, 260px tall. |
| xl (>=1280) | Five-column KPI row. Charts side by side. |

## 12. Accessibility
- KPIs use `<dl>` semantics: value, trend, denominator
- Charts have text alternative immediately below, describing the trend in
  words
- Success criteria strip uses `<section aria-labelledby="criteria-heading">`
- Targets vs actuals distinguished by text label, not just colour
- Focus order: date picker, granularity, criteria, KPIs, charts, CTA

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded via dynamic()
- Server-side aggregation
- CSV export streams, not built client-side
- Recharts import scoped per chart

## 14. Analytics
- analytics.executive.viewed (properties: range_days, granularity)
- analytics.executive.drilled (properties: metric_key)
- analytics.executive.exported

## 15. Copy
- Title: "Executive dashboard"
- Subtitle: "Progress against the movement's objectives."
- Targets notice: "Targets are labelled as such. Actuals are shown separately."
- Empty: "No activity in this period."
- KPI denominator examples: "of 1,000 target"; "over 30 days";
  "of 35 chapters targeted"
- Criteria labels: S1 Members onboarded, S2 Active chapters, S3 Cohorts
  delivered, S4 Course completion rate, S5 Weekly active rate, S6 Monthly
  revenue processed, S7 Compliance gates, S8 Security findings, S9 Uptime,
  S10 Impact metrics published
- CTA: "Generate impact report"
- Toast export: "Export ready. Counts only; no member identifiers."

## 16. Open questions
- Q1: Should the criteria strip be collapsible when the funder hasn't asked
  for it, or always visible? Product Lead.
- Q2: Do we show the actual baseline figures alongside targets once Charter
  Q-5 is closed? TEG Leadership.
- Q3: Should the impact report CTA be enabled before ADM-216 is live, or
  hidden until then? Product Lead.