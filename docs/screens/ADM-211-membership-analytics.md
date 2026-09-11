# SCREEN SPEC: [ADM-211] Membership Analytics

## 1. Identification
- Screen ID: ADM-211
- Route: /admin/analytics/membership
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R2
- Priority: P0
- Related requirements: FR-10.1 (membership growth, retention, funnel), FR-10.6
- Related panel: PNL-17

## 2. Purpose
Understand the membership pipeline and how the vetted-membership model is
performing: applications received, conversion to members, retention by
cohort, chapter distribution, and tier mix. Every rate carries its
denominator.

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
- Reached from: sidebar (Analytics), PNL-01 "Full Analytics", ADM-210 KPI drill
- Leads to: ADM-030 (member list, filtered), ADM-215 (chapter performance),
  ADM-216 (impact report)
- Deep-linkable: yes. URL params: ?from, ?to, ?chapter, ?tier

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default last 90 days),
  filter by chapter and tier
- KPI row: five cards
  - Members onboarded (n)
  - Application conversion rate (%) - denominator: applications received
  - Time to decision (median hours) - denominator: decisions in range
  - 30-day retention (%) - denominator: members onboarded 30d ago
  - Attrition (%) - denominator: active members at period start
- Chart row 1: Application funnel (bar) - submitted, under review,
  interviewed, approved, rejected, lapsed
- Chart row 2: Membership growth over time (line, monthly) with target
  overlay (target as dashed, clearly labelled)
- Chart row 3: Distribution by chapter (bar) and by tier (pie)
- Table: Chapter summary - chapter, members, growth, retention

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI with denominator |
| DateRangePicker | From/to filter |
| ChapterFilter | Multi-select chapter filter |
| TierFilter | Multi-select tier filter |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | Chapter summary |
| SegmentedControl | Monthly / quarterly granularity |
| EmptyState | No data in range |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Members onboarded | Metric.membersOnboarded | int | Y | Read | Internal |
| Applications received | Metric.applicationsReceived | int | Y | Read | Internal |
| Conversion rate | Metric.conversionRate | number | Y | Read | Internal |
| Median time to decision | Metric.medianDecisionHours | number | Y | Read | Internal |
| 30-day retention | Metric.retention30d | number | Y | Read | Internal |
| Attrition | Metric.attritionRate | number | Y | Read | Internal |
| Funnel stages | Metric.applicationFunnel | map | Y | Read | Internal |
| Growth series | Metric.membershipByMonth | list | Y | Read | Internal |
| Target series | Metric.membershipTargetByMonth | list | Y | Read | Internal |
| Distribution by chapter | Metric.byChapter | list | Y | Read | Internal |
| Distribution by tier | Metric.byTier | map | Y | Read | Internal |

No member names or member numbers appear in any metric. Chapter summary
rows reference chapters by code, not by leader name.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | ADMIN+ | No | GET /analytics/membership | No |
| Change filter | Chapter/tier | ADMIN+ | No | GET /analytics/membership | No |
| Drill to member list | KPI / funnel stage | ADMIN+ | No | navigates to ADM-030 | No |
| Drill to chapter | Table row | ADMIN+ | No | navigates to ADM-215 | No |
| Export report | Toolbar | ADMIN+ | No | GET /analytics/membership.csv | Yes |

## 9. States
- Empty: "No membership activity in this period."
- Loading: skeleton KPIs and charts.
- Populated: full dashboard.
- Populated extreme: 365-day range. Series aggregate monthly.
- Partial: chapter table fails; KPI and charts still render.
- Error: full-page error card with Retry.
- Permission denied: 403 card for FINANCE_OFFICER; redirect for
  CHAPTER_LEADER to ADM-215.
- Offline: cached summary visible; charts and exports disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 365 days.
- Chapter filter limited to chapters the caller can see.
- Target overlay only shown if target data is available for the range.
- Export is watermarked with actor, range, filters, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack. Charts full width, 220px. Table becomes cards. |
| md (>=768) | Two-column KPIs. Charts full width, 260px. |
| xl (>=1280) | Five-column KPI row. Charts in two-column grid. |

## 12. Accessibility
- KPIs use `<dl>` with value, trend, denominator
- Charts have text alternatives describing trend in words
- Target overlay is labelled in the legend and in the text alternative
- Chapter table uses `<caption>` and `<th scope="col">`
- Focus order: date range, filters, KPIs, charts, table

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Server-side aggregation
- Chapter table paginated at 20
- CSV export streams

## 14. Analytics
- analytics.membership.viewed (properties: range_days, filters_count)
- analytics.membership.drilled (properties: metric_key, drill_target)
- analytics.membership.exported

## 15. Copy
- Title: "Membership analytics"
- Subtitle: "Applications, admissions, and retention."
- Empty: "No membership activity in this period."
- KPI denominators:
  - "of {n} applications received"
  - "median over {n} decisions"
  - "of {n} members onboarded 30d ago"
  - "of {n} active members at period start"
- Funnel labels: Submitted, Under review, Interviewed, Approved, Rejected,
  Lapsed
- Target legend: "Target (not achieved)"
- Toast export: "Export ready. Chapter codes only; no member identifiers."

## 16. Open questions
- Q1: Should the funnel count applicants (one row per application) or
  transitions (a single applicant may appear at multiple stages)? Product Lead.
- Q2: Do we need retention by tier (Student/Professional/Associate) as well
  as overall? Content and Community Lead.
- Q3: Is the "target overlay" sourced from Charter section 6, or a live
  editable target set? TEG Leadership.