# SCREEN SPEC: [ADM-213] Engagement Analytics

## 1. Identification
- Screen ID: ADM-213
- Route: /admin/analytics/engagement
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R2
- Priority: P1
- Related requirements: FR-10.3 (DAU, WAU, MAU, feature adoption), FR-10.6
- Related panel: PNL-17

## 2. Purpose
Measure how members actually use the platform: daily, weekly and monthly
active rates, feature adoption, session depth, and where engagement is
growing or falling. Supports Charter S5 (weekly active member rate at least
40%). Every rate carries its denominator.

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
- Reached from: sidebar (Analytics), ADM-210 KPI drill
- Leads to: ADM-214 (financial), ADM-215 (chapter performance), ADM-216
  (impact report)
- Deep-linkable: yes. URL params: ?from, ?to, ?chapter, ?tier

## 5. Layout and regions
- Page header: title, subtitle, date range picker (default last 30 days),
  filter by chapter and tier
- KPI row: five cards
  - DAU (rolling 7d average) - denominator: active members in period
  - WAU - denominator: active members in period
  - MAU - denominator: active members in period
  - Stickiness (DAU/MAU, %) - denominator: MAU
  - Median session depth (screens per session) - denominator: sessions in range
- Chart row 1: Active members over time (line, daily) with DAU, WAU, MAU
  overlay
- Chart row 2: Feature adoption (bar, top 10 features) - each bar shows
  unique users, denominator line shows active members
- Chart row 3: Engagement heatmap (day of week x hour bucket), collapsible
- Table: Feature adoption detail - feature, unique users, sessions, average
  time on feature

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI with denominator |
| DateRangePicker | From/to filter |
| ChapterFilter | Multi-select chapter |
| TierFilter | Multi-select tier |
| Chart | Recharts wrapper, lazy-loaded |
| Heatmap | New component, engagement grid |
| DataTable | Feature adoption |
| SegmentedControl | Daily / weekly granularity |
| EmptyState | No data in range |

Heatmap is a lightweight new component. Cells are coloured by intensity and
each cell has an `aria-label` describing day, hour, and value.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Active members | Metric.activeMembers | int | Y | Read | Internal |
| DAU average | Metric.dauAvg | number | Y | Read | Internal |
| WAU | Metric.wau | int | Y | Read | Internal |
| MAU | Metric.mau | int | Y | Read | Internal |
| Stickiness | Metric.stickiness | number | Y | Read | Internal |
| Median session depth | Metric.medianSessionDepth | number | Y | Read | Internal |
| Active series | Metric.activeByDay | list | Y | Read | Internal |
| Feature adoption | Metric.features | list | Y | Read | Internal |
| Heatmap | Metric.heatmap | matrix | Y | Read | Internal |

No member names or member numbers appear in any metric. All metrics are
aggregated.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Change range | Date picker | ADMIN+ | No | GET /analytics/engagement | No |
| Change filter | Chapter/tier | ADMIN+ | No | GET /analytics/engagement | No |
| Change granularity | Segmented | ADMIN+ | No | GET /analytics/engagement | No |
| Drill into feature | Table row | ADMIN+ | No | navigates to feature-specific report | No |
| Export report | Toolbar | ADMIN+ | No | GET /analytics/engagement.csv | Yes |

## 9. States
- Empty: "No engagement activity in this period."
- Loading: skeleton KPIs, skeleton charts, skeleton heatmap grid.
- Populated: full dashboard.
- Populated extreme: 90-day range. Series aggregate weekly.
- Partial: heatmap fails to load; rest renders.
- Error: full-page error card with Retry.
- Permission denied: 403 card for FINANCE_OFFICER; redirect for
  CHAPTER_LEADER to ADM-215.
- Offline: cached summary visible; charts and heatmap disabled.
- Success: n/a (read-only except export).

## 10. Validation and error handling
- Date range must have from <= to. Max range 90 days on this screen.
- Chapter filter limited to chapters the caller can see.
- Heatmap collapses to a table view for screen readers automatically.
- Export is watermarked with actor, range, filters, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack. Charts full width, 220px. Heatmap collapses to text list. |
| md (>=768) | Two-column KPIs. Charts full width, 260px. Heatmap scaled down. |
| xl (>=1280) | Five-column KPI row. Charts in two-column grid. Heatmap full width. |

## 12. Accessibility
- KPIs use `<dl>` with value, trend, denominator
- Charts have text alternatives describing trend
- Heatmap cells have `aria-label` with day, hour, value; a table-view toggle
  is available for screen readers
- Feature adoption table uses `<caption>` and `<th scope="col">`
- Focus order: date range, filters, KPIs, charts, heatmap, table

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Heatmap renders after charts; not blocking
- Server-side aggregation
- CSV export streams

## 14. Analytics
- analytics.engagement.viewed (properties: range_days, filters_count)
- analytics.engagement.heatmap_toggled (properties: new_state)
- analytics.engagement.exported

## 15. Copy
- Title: "Engagement analytics"
- Subtitle: "How members use the platform day to day."
- Empty: "No engagement activity in this period."
- KPI denominators:
  - "of {n} active members in period"
  - "of {n} MAU"
  - "over {n} sessions in range"
- Feature labels: Feed, Messages, Courses, Mentorship, Events, Groups,
  Directory, Announcements, Notifications, Search
- Heatmap legend: "Lower engagement -> Higher engagement"
- Toast export: "Export ready. Aggregated counts only."

## 16. Open questions
- Q1: Should DAU average be over 7 days, 14 days, or the whole selected
  range? Product Lead.
- Q2: Which features count as "adopted"? Number of unique users, sessions,
  or a threshold like "used once in the period"? Product Lead.
- Q3: Does the heatmap serve TEG's actual need, or is a simpler "hour of day"
  distribution more useful? TEG Leadership.