# Screen Spec: ADM-044 Chapter Performance Dashboard

**Document ID:** D3.6-ADM-044
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-04 Chapters

## 1. Identification

- **Screen ID:** ADM-044
- **Route:** /admin/chapters/[code]/performance
- **Layer:** Admin Console
- **Module:** Chapters
- **Release:** R1
- **Priority:** P1
- **Requirements:** FR-2.5, FR-10.4

## 2. Purpose

Chapter-scoped performance metrics: engagement, learning, events. Enables the chapter league table referenced in FR-10.4.

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | All chapters |
| CHAPTER_LEADER | Own chapter only (RLS) |
| FINANCE_OFFICER | Read-only |

## 4. Entry and exit points

- Reached from: ADM-041 tab "Performance", PNL-17 analytics
- Leads to: ADM-041, PNL-03 member filters
- Deep-linkable: yes

## 5. Layout and regions

- PageHeader: chapter name, date range picker (default YTD)
- KPI row: members, active members (30d), course completions, event attendance rate
- Charts:
  - Membership growth (line, weekly)
  - Learning completion by pillar (bar)
  - Event attendance trend (line)
  - Chapter league position (single number + trend)
- Denominators displayed under every KPI (FR-10.6)
- Export CSV button

## 6. Data

Aggregations from member, enrollment, event tables scoped to chapterCode:

| Metric | Denominator |
|--------|-------------|
| Active members | total members |
| Course completions | enrolled members |
| Event attendance rate | registered |
| League position | chapters with > 10 members |

## 7. Actions

| # | Action | Permission | API | Audited |
|---|--------|-----------|-----|---------|
| 1 | Change range | view | GET /admin/chapters/:code/performance?from=&to= | no |
| 2 | Export | ADMIN, SUPER_ADMIN | GET .../export | yes |

## 8. States

- Empty: "No data for this chapter yet."
- Loading: chart skeletons
- Populated: default
- Error: per-chart retry button

## 9. Accessibility

- Each chart has aria-label summary + visually-hidden data table
- Colour not sole carrier of information
- Focus order: date range → KPIs → charts → export

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Recharts (as PNL-02) or a lighter lib? | Tech Lead | RESOLVED — Recharts lazy-loaded |