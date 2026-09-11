# SCREEN SPEC: [ADM-215] Chapter Performance

## 1. Identification
- Screen ID: ADM-215
- Route: /admin/analytics/chapters
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R1 (basic roster counts), R2 (full performance)
- Priority: P1
- Related requirements: FR-10.4 (chapter league table), FR-10.6
- Related panel: PNL-17

## 2. Purpose
Compare chapters on the metrics that matter: member count, retention,
learning completion, event attendance, engagement, and growth. This is the
league table, but every metric carries its denominator and the scoping rule
is strict: a chapter leader sees only their own chapter.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All chapters |
| ADMIN | Full | All chapters |
| COMPLIANCE_LEAD | Read-only | All chapters |
| CHAPTER_LEADER | Own chapter only | RLS enforced, admin layout adapts |
| FINANCE_OFFICER | Denied | 403 card |
| Others | Denied | 403 card |

The chapter leader view of this screen is the chapter leader's home
analytics screen. The layout in that case collapses the league table to a
single row with a focus on their own chapter's metrics.

## 4. Entry and exit points
- Reached from: sidebar (Analytics, hidden for chapter leaders other than
  via redirect from ADM-210), ADM-210 KPI drill, ADM-041 chapter detail
  link "View performance"
- Leads to: ADM-041 (chapter detail and roster), ADM-211 (membership
  analytics filtered to chapter), ADM-216 (impact report)
- Deep-linkable: yes. URL params: ?from, ?to, ?region, ?type

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default last 90 days),
  filter by chapter type (CAMPUS / PROFESSIONAL / REGIONAL) and region
- (Chapter leader only) own-chapter summary card with the metrics that
  matter to them
- KPI row: five cards
  - Active chapters (n)
  - Average members per chapter
  - Median retention (%) - denominator: members at period start
  - Median learning completion (%) - denominator: chapter enrolments
  - Median event attendance (%) - denominator: registrations per chapter
- Chart row 1: Growth by chapter over time (multi-line, top 10 chapters)
  or single line for chapter leader
- Chart row 2: Chapter performance scatter - x: members, y: engagement
  score, bubble size: events held. Chapter leaders see only their own point.
- Chart row 3: Learning completion by chapter (horizontal bar, top 10)
- League table: chapter, region, type, members, growth, retention,
  learning completion, event attendance, engagement score
- Chapter leader version of league table shows only their own row.

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI with denominator |
| DateRangePicker | From/to filter |
| ChapterTypeFilter | CAMPUS / PROFESSIONAL / REGIONAL |
| RegionFilter | Multi-select region |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | League table |
| ScatterPlot | New wrapper for chapter performance |
| SegmentedControl | Monthly / quarterly granularity |
| EmptyState | No data in range |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Active chapters | Metric.activeChapters | int | Y | Read | Internal |
| Average members | Metric.avgMembers | number | Y | Read | Internal |
| Median retention | Metric.medianRetention | number | Y | Read | Internal |
| Median completion | Metric.medianCompletion | number | Y | Read | Internal |
| Median event attendance | Metric.medianEventAttendance | number | Y | Read | Internal |
| Growth series | Metric.growthByChapter | list | Y | Read | Internal |
| Scatter data | Metric.chapterScatter | list | Y | Read | Internal |
| Completion by chapter | Metric.completionByChapter | list | Y | Read | Internal |
| League table | Metric.chapterLeague | list | Y | Read | Internal |

Chapter identifiers are chapter codes (KU, UON, STRATH). No member names or
member numbers.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | ADMIN+, CL | No | GET /analytics/chapters | No |
| Change filter | Type/region | ADMIN+ | No | GET /analytics/chapters | No |
| Drill to chapter | Table row | ADMIN+, CL own-chapter | No | navigates to ADM-041 | No |
| Drill to membership | Chart element | ADMIN+ | No | navigates to ADM-211 with chapter filter | No |
| Export report | Toolbar | ADMIN+ | No | GET /analytics/chapters.csv | Yes |

Chapter leaders can export only their own chapter's row. RLS enforced at the
API, not just the UI.

## 9. States
- Empty: "No chapter activity in this period."
- Loading: skeleton KPIs and charts.
- Populated: full dashboard.
- Populated extreme: 365-day range. Series aggregate monthly.
- Partial: scatter fails; league table renders.
- Error: full-page error card with Retry.
- Permission denied: 403 card for FINANCE_OFFICER; chapter leaders see the
  scoped own-chapter view.
- Offline: cached summary visible; charts and exports disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 365 days.
- Chapter type filter limited to CAMPUS, PROFESSIONAL, REGIONAL.
- If a chapter has fewer than 5 members, its row is shown but marked
  "insufficient data" and excluded from medians.
- Export is watermarked with actor, range, filters, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack. Charts full width, 220px. League table becomes cards. |
| md (>=768) | Two-column KPIs. Charts full width, 260px. |
| xl (>=1280) | Five-column KPI row. Charts in two-column grid. League table full width. |

## 12. Accessibility
- KPIs use `<dl>` with value, trend, denominator
- Scatter plot has a text alternative summarising the spread and outliers
- League table uses `<caption>` and `<th scope="col">`
- Chapter leader sees an "own chapter only" notice, `role="note"`
- Focus order: date range, filters, KPIs, charts, league table

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- League table paginated at 30 (typical 50+ chapters)
- Scatter limited to top 30 chapters by activity to keep payload small
- CSV export streams

## 14. Analytics
- analytics.chapters.viewed (properties: range_days, filters_count, scope)
- analytics.chapters.drilled (properties: drill_target)
- analytics.chapters.exported

## 15. Copy
- Title: "Chapter performance"
- Subtitle: "How each chapter is doing against the same measures."
- Own-chapter notice (for chapter leaders): "You are seeing your own
  chapter only. Contact an administrator for cross-chapter comparisons."
- Empty: "No chapter activity in this period."
- Insufficient data: "Insufficient data (fewer than 5 members)"
- KPI denominators:
  - "across {n} active chapters"
  - "median across chapters"
  - "of {n} members at period start"
- Toast export: "Export ready. Chapter codes only; no member identifiers."

## 16. Open questions
- Q1: Should chapters with fewer than 5 members appear in the league table
  at all, or be hidden behind a "show small chapters" toggle? Product Lead.
- Q2: What is the "engagement score" formula? Needs a documented definition
  before shipping. Product Lead and Tech Lead.
- Q3: Does the chapter leader see the full league table ranked (with all
  other chapters anonymised), or only their own row? TEG Leadership.