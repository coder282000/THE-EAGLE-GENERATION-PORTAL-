# Screen Spec: ADM-026 Application Analytics

**Document ID:** D3.6-ADM-026
**Version:** 1.0.0
**Status:** Baselined
**Panel:** PNL-02

---

## 1. Identification

- **Screen ID:** ADM-026
- **Route:** `/admin/applications/analytics`
- **Layer:** Admin Console
- **Module:** Applications
- **Release:** R1
- **Priority:** P1
- **Related requirements:** FR-1.3, FR-10.1

## 2. Purpose

Funnel, conversion, time-to-decision, and source analytics. Every metric displays its denominator (Charter §16.10, FR-10.6).

## 3. Users & permissions

| Role | Access | Notes |
|------|--------|-------|
| ADMIN | Full | Global analytics |
| SUPER_ADMIN | Full | Global analytics |
| FINANCE_OFFICER | Read-only | Global analytics |
| CHAPTER_LEADER | Scoped (read-only) | Own-chapter analytics only |

## 4. Entry & exit points

- **Reached from:** ADM-020 "Analytics" button
- **Leads to:** ADM-020
- **Deep-linkable:** yes. URL params: `?from=2026-01-01&to=2026-12-31`

## 5. Layout & regions
+------------------------------------------------------------------+
| ← Back Application analytics [ 01 Jan – 10 Sep 2026 ▾ ] |
+------------------------------------------------------------------+
| [Total 247] [Conversion 34%] [Avg time 12.4d] [Reject 18%] |
+------------------------------------------------------------------+
| | |
| Conversion funnel | Applications over time |
| Submitted 247 | [line chart] |
| Under review 198 | |
| Interviewed 112 | |
| Approved 84 | |
| | |
+------------------------------------------------------------------+
| | |
| By source | By tier |
| [horizontal bar chart] | [pie chart] |
| Chapter referral 89 | Student 142 |
| Social media 62 | Professional 78 |
| Word of mouth 54 | Associate 27 |
| Event 28 | |
| Other 14 | |
+------------------------------------------------------------------+
| [Export CSV] |
+------------------------------------------------------------------+

## 6. Components

| # | Component | Source | Behaviour |
|---|-----------|--------|-----------|
| 1 | PageHeader | — | Back + title + date range picker |
| 2 | StatCard | `components/admin/StatCard` | KPI with denominator hint |
| 3 | FunnelChart | new (Recharts) | Bar-funnel 4 stages |
| 4 | LineChart | new (Recharts) | Applications/week |
| 5 | HorizontalBarChart | new (Recharts) | Source distribution |
| 6 | PieChart | new (Recharts) | Tier distribution |
| 7 | DateRangePicker | new | From/To; default YTD |
| 8 | Button | `components/button` | Export CSV |

All charts lazy-loaded via `dynamic(() => import(...), { ssr: false })`.

## 7. Data

Aggregations from `application` table:

| Metric | Calculation | Denominator |
|--------|-------------|-------------|
| Total | `COUNT(*)` where `status != 'DRAFT'` | — |
| Conversion | `COUNT(APPROVED) / COUNT(status != DRAFT)` | submitted |
| Avg time-to-decision | `AVG(decided_at - created_at)` | decided applications |
| Rejection rate | `COUNT(REJECTED) / COUNT(status != DRAFT)` | submitted |
| Funnel | `COUNT` at each stage | submitted |
| By source | `COUNT(*) GROUP BY referral_source` | total |
| By tier | `COUNT(*) GROUP BY tier` | total |
| Time series | `COUNT(*) GROUP BY date_trunc('week', created_at)` | — |

Charter §16.10: "every metric displays its denominator."

## 8. Actions

| # | Action | Permission | API | Success | Audited |
|---|--------|------------|-----|---------|---------|
| 1 | Change date range | view | `GET /admin/applications/analytics?from=&to=` | charts refresh | no |
| 2 | Export CSV | ADMIN, SUPER_ADMIN | `GET /admin/applications/analytics/export` | download | **yes** |

## 9. States

| State | Handling |
|-------|----------|
| Empty | "No data for the selected period." + suggest wider range |
| Loading | Skeleton chart placeholders (bar shapes matching final size) |
| Populated | Default |
| Partial | Some charts loaded, others failed; show per-chart error "Retry" button |
| Error | Error boundary |
| Permission denied | 403 |
| Offline | Read-only cached view |

## 10. Validation

- Date range max 12 months
- `from` <= `to`
- Range cannot extend into the future

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| xs | Single column | Charts full width, stacked |
| sm | Single column | Same |
| md | Two columns | KPI row 4, charts 2x2 |
| lg+ | Two columns | Same, taller charts |

## 12. Accessibility

- Charts: each has `aria-label` describing the data summary, plus a visually-hidden `<table>` alternative for screen readers
- Colour: never sole carrier of information — labels + percentages always present
- KPI cards: readable as plain text
- Focus order: date range -> KPIs -> charts -> export

## 13. Performance

- Payload: <150 KB
- Charts lazy-loaded
- Server aggregates; client renders only summary data
- Cache: 5 minutes

## 14. Analytics

- `application_analytics_viewed` (from, to)
- `application_analytics_exported` (from, to, rowCount)

## 15. Copy

- **Title:** "Application analytics"
- **Subtitle:** "Conversion, time-to-decision, and source distribution."
- **KPI labels:** "Total applications", "Conversion rate", "Avg time-to-decision", "Rejection rate"
- **Denominator hints** (small text under each KPI):
  - Total: "all non-draft"
  - Conversion: "of submitted"
  - Avg time: "of decided"
  - Rejection: "of submitted"
- **Empty:** "No applications in the selected period."
- **Chart titles:** "Conversion funnel", "Applications over time", "By source", "By tier"

## 16. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Chart library? | Tech Lead | RESOLVED — Recharts, lazy-loaded |
| 2 | Cache duration? | Tech Lead | OPEN — 5 min default |