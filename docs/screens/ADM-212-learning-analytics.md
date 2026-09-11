# SCREEN SPEC: [ADM-212] Learning Analytics

## 1. Identification
- Screen ID: ADM-212
- Route: /admin/analytics/learning
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R2
- Priority: P0
- Related requirements: FR-10.2 (enrolment, completion, time-to-complete by
  pillar and cohort), FR-10.6
- Related panel: PNL-17

## 2. Purpose
Measure the LMS against Charter success criteria S3 (cohorts delivered) and
S4 (course completion rate at least 65%). Show enrolment, completion, and
drop-off by pillar, cohort, and lesson. Every rate carries its denominator.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All data |
| ADMIN | Full | All data |
| COMPLIANCE_LEAD | Read-only | All data |
| FINANCE_OFFICER | Denied | 403 card |
| CHAPTER_LEADER | Denied | Redirect to ADM-215 |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Analytics), ADM-210 KPI drill, ADM-050 course detail
  link "view analytics"
- Leads to: ADM-056 (cohort detail), ADM-079 (course detail), ADM-216 (impact
  report)
- Deep-linkable: yes. URL params: ?from, ?to, ?pillar, ?cohort

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default last 90 days),
  pillar filter, cohort filter
- KPI row: five cards
  - Cohorts delivered (n) - target from Charter S3
  - Enrolment (n) - denominator: active cohorts in range
  - Completion rate (%) - denominator: enrolments that reached Phase 3
  - Median time to complete (days) - denominator: completed enrolments
  - Drop-off rate (%) - denominator: enrolments that started Phase 1
- Chart row 1: Enrolment over time (line, weekly) with completion overlay
- Chart row 2: Completion rate by pillar (bar) - Marketplace, Governance,
  Technology
- Chart row 3: Phase drop-off (funnel) - Phase 1 started, Phase 1 complete,
  Phase 2 complete, Phase 3 complete, Certified
- Table: Cohort summary - cohort, course, pillar, start, capacity, enrolled,
  completed, completion rate
- Table: Lesson drop-off (top 10 lessons by abandonment)

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI with denominator |
| DateRangePicker | From/to filter |
| PillarFilter | Multi-select pillar |
| CohortFilter | Multi-select cohort |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | Cohort and lesson tables |
| SegmentedControl | Weekly / monthly granularity |
| EmptyState | No data in range |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Cohorts delivered | Metric.cohortsDelivered | int | Y | Read | Internal |
| Enrolments | Metric.enrolments | int | Y | Read | Internal |
| Completion rate | Metric.completionRate | number | Y | Read | Internal |
| Median time to complete | Metric.medianCompleteDays | number | Y | Read | Internal |
| Drop-off rate | Metric.dropOffRate | number | Y | Read | Internal |
| Enrolment series | Metric.enrolmentByWeek | list | Y | Read | Internal |
| Completion by pillar | Metric.completionByPillar | map | Y | Read | Internal |
| Phase funnel | Metric.phaseFunnel | map | Y | Read | Internal |
| Cohort summary | Metric.cohorts | list | Y | Read | Internal |
| Lesson drop-off | Metric.lessons | list | Y | Read | Internal |

No member names or member numbers appear in any metric. Lesson drop-off
references lessons by title, not by member.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | ADMIN+ | No | GET /analytics/learning | No |
| Change filter | Pillar/cohort | ADMIN+ | No | GET /analytics/learning | No |
| Drill to cohort | Table row | ADMIN+ | No | navigates to ADM-056 | No |
| Drill to course | Table row | ADMIN+ | No | navigates to ADM-079 | No |
| Export report | Toolbar | ADMIN+ | No | GET /analytics/learning.csv | Yes |

## 9. States
- Empty: "No learning activity in this period."
- Loading: skeleton KPIs and charts.
- Populated: full dashboard.
- Populated extreme: 365-day range. Series aggregate monthly.
- Partial: lesson table fails; KPI and charts render.
- Error: full-page error card with Retry.
- Permission denied: 403 card for FINANCE_OFFICER; redirect for
  CHAPTER_LEADER to ADM-215.
- Offline: cached summary visible; charts and exports disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 365 days.
- Pillar filter limited to the three canonical pillars.
- Cohort filter limited to cohorts with activity in the range.
- Export is watermarked with actor, range, filters, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack. Charts full width, 220px. Tables become cards. |
| md (>=768) | Two-column KPIs. Charts full width, 260px. |
| xl (>=1280) | Five-column KPI row. Charts in two-column grid. |

## 12. Accessibility
- KPIs use `<dl>` with value, trend, denominator
- Charts have text alternatives
- Funnel is described in words below the chart
- Tables use `<caption>` and `<th scope="col">`
- Focus order: date range, filters, KPIs, charts, tables

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Server-side aggregation
- Cohort table paginated at 20; lesson table top-10 only
- CSV export streams

## 14. Analytics
- analytics.learning.viewed (properties: range_days, pillar_filter)
- analytics.learning.drilled (properties: metric_key, drill_target)
- analytics.learning.exported

## 15. Copy
- Title: "Learning analytics"
- Subtitle: "Enrolment, completion, and drop-off across the three pillars."
- Empty: "No learning activity in this period."
- KPI denominators:
  - "target: at least 4 (Charter S3)"
  - "across {n} active cohorts"
  - "of {n} enrolments that reached Phase 3"
  - "median over {n} completed enrolments"
  - "of {n} enrolments that started Phase 1"
- Pillar labels: Marketplace, Governance, Technology
- Phase labels: Phase 1 Foundation, Phase 2 Specialisation, Phase 3 Application
- Toast export: "Export ready. Cohort and lesson titles only; no member
  identifiers."

## 16. Open questions
- Q1: Should we compute completion rate against enrolments that finished all
  three phases, or against all enrolments? Charter S4 implies the former, but
  the exact denominator matters. Product Lead and Content Lead.
- Q2: Should the lesson drop-off table show only lessons with at least 10
  enrolments, to avoid noise? Content Lead.
- Q3: Do we surface a per-cohort facilitator performance view here, or leave
  that to PNL-05 (Learning)? Product Lead.