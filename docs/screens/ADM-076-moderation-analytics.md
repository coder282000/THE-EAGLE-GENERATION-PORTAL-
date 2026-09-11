# SCREEN SPEC: [ADM-076] Moderation Analytics

## 1. Identification
- Screen ID: ADM-076
- Route: /admin/moderation/analytics
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P1
- Related requirements: FR-4.7 (moderation), FR-10.6 (every metric shows its denominator)
- Related panel: PNL-06

## 2. Purpose
Understand moderation load and outcomes: volume, response time, resolution mix,
repeat reporters, repeat offenders, and safeguarding case trends. Every rate
displays its denominator, per Charter 16.10.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All data |
| SUPER_ADMIN | Full | All data |
| COMPLIANCE_LEAD | Full, read-only | All data |
| CHAPTER_LEADER | Own chapter only | Own chapter scoped |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Moderation), ADM-070 toolbar link
- Leads to: ADM-070 filtered by the clicked metric
- Deep-linkable: yes. URL params: ?from, ?to, ?chapter

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default: last 30 days)
- KPI row: five cards, each with value, trend, and denominator line
  - Reports received (n)
  - Median first response (hours) - denominator: reports actioned
  - Median time to resolution (hours) - denominator: reports resolved
  - Resolution rate (%) - denominator: reports received in range
  - Repeat reporter rate (%) - denominator: unique reporters in range
- Chart row 1: Reports over time (line, daily) with resolved overlay
- Chart row 2: Resolution mix (donut) - removed, warned, suspended, escalated,
  dismissed
- Chart row 3: Response time distribution (histogram, buckets of 4h)
- Table: Top reported members (repeat offenders) - member, reports, actions
- Table: Top reporters - member, reports submitted, dismissed ratio
- Table: Top chapters by reports - chapter, reports, per 100 members

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI with denominator |
| DateRangePicker | From/to filter |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | For the three top-N tables |
| EmptyState | No data in range |
| SegmentedControl | Time granularity: daily / weekly / monthly |

Charts use the same lazy dynamic import pattern as ADM-026 and ADM-044.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Metric window | Metric.from, Metric.to | date | Y | Read | Internal |
| Reports received | Metric.reportsReceived | int | Y | Read | Internal |
| Median first response | Metric.medianFirstResponseH | number | Y | Read | Internal |
| Median resolution | Metric.medianResolutionH | number | Y | Read | Internal |
| Resolution rate | Metric.resolutionRate | number | Y | Read | Internal |
| Repeat reporter rate | Metric.repeatReporterRate | number | Y | Read | Internal |
| Resolution mix | Metric.resolutionMix | map | Y | Read | Internal |
| Response distribution | Metric.responseBuckets | list | Y | Read | Internal |
| Top offenders | Metric.topOffenders | list | Y | Read | PII |
| Top reporters | Metric.topReporters | list | Y | Read | PII |
| Top chapters | Metric.topChapters | list | Y | Read | Internal |

No content bodies or message text is included. Only counts and member
references.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | ADMIN+ | No | GET /moderation/analytics | No |
| Change granularity | Segmented | ADMIN+ | No | GET /moderation/analytics | No |
| Drill into metric | KPI card click | ADMIN+ | No | - (navigates) | No |
| Export report | Toolbar | ADMIN+ | No | GET /moderation/analytics.csv | Yes |

Exports contain counts only, no member names. Member references are replaced
by member numbers.

## 9. States
- Empty (no data in range): "No moderation activity in this period."
- Loading: skeleton for KPIs and charts.
- Populated: full dashboard.
- Populated extreme: 90-day range with daily granularity. Charts aggregate
  to keep payload under budget.
- Partial: if one chart fails, its panel shows an inline retry; the rest of
  the page renders.
- Error: full-page error card with Retry.
- Permission denied: 403 card for MENTOR / MEMBER / GUEST.
- Offline: cached summary visible with a banner; charts disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range is 365 days.
- If granularity is daily and range exceeds 90 days, suggest weekly.
- Export is watermarked with actor, range, and timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPI cards stack. Charts full width, 220px tall. Tables become cards. |
| md (>=768) | Two-column KPI grid. Charts full width, 260px tall. |
| xl (>=1280) | Five-column KPI row. Charts side by side. |

## 12. Accessibility
- Charts have a text summary immediately below the canvas, describing the
  trend in words
- KPI cards use `<dl>` semantics: value, trend, denominator
- Colour never conveys alone: charts use pattern + colour for category
- Focus order: date picker, granularity, KPIs, charts, tables
- Screen reader can read the CSV alternative via a "View as table" toggle

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded via dynamic()
- Server-side aggregation; no raw events sent to the browser
- CSV export streams; not built client-side
- Recharts import scoped per chart component

## 14. Analytics
- moderation.analytics.viewed (properties: range_days, granularity)
- moderation.analytics.drilled (properties: metric_key)
- moderation.analytics.exported (properties: range_days)

## 15. Copy
- Title: "Moderation analytics"
- Subtitle: "Volume, response time, and resolution across reports."
- Empty: "No moderation activity in this period."
- KPI denominator line: "of {n} reports received"
- Median response: "median over {n} reports actioned"
- Median resolution: "median over {n} reports resolved"
- Resolution rate: "{n} resolved of {m} received"
- Repeat reporters: "{n} submitted 2+ reports of {m} unique reporters"
- Toast export: "Export ready. Downloads contain counts and member numbers only."

## 16. Open questions
- Q1: Should repeat offenders be listed by member number or by a pseudonymous
  key, given DPA-7 (data minimisation)? DPO.
- Q2: Retention of analytics aggregates: rolling 24 months, or indefinite?
  DPO and Compliance Lead.
- Q3: Should the drill-through from a KPI pass the exact filter set into
  ADM-070, or only the date range? Product Lead.