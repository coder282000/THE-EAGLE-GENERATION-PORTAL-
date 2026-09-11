# SCREEN SPEC: [ADM-243] Support analytics

## 1. Identification
- **Screen ID:** ADM-243
- **Route:** `/admin/support/analytics`
- **Layer:** Admin Console
- **Panel:** PNL-20 Support Desk
- **Module:** Support
- **Release:** R2
- **Priority:** P1
- **Related requirements:** FR-10.1, FR-10.6
- **Panel overview:** docs/panels/PNL-20-support-desk.md

## 2. Purpose

The monthly view of support performance. It answers: how many tickets
came in, how quickly did we respond, and what were the common issues.
It is the input to the monthly operations review and to any conversation
about staffing or process.

Every rate displays its denominator (Charter FR-10.6).

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | |
| SUPER_ADMIN | Full | |
| CHAPTER_LEADER | Denied | Roll-up is cross-chapter; no access |
| FINANCE_OFFICER | Denied | |
| Others | Denied | Permission-denied card |

Helpers: `getSupportAnalytics(user, range)` in `lib/mock/support.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Support analytics), ADM-240
  header link.
- **Leads to:**
  - ADM-240 filtered by a category or priority
- **Deep-linkable:** yes. `?range=30d`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Support analytics", range selector (7d / 30d /
   90d / quarter), primary action "Export report".
2. **KPI row** — six tiles:
   - Tickets created
   - Tickets resolved
   - Median time to first response (with its denominator: "over N tickets")
   - Median time to resolve
   - Backlog at end of period
   - Reopened count and rate (with denominator)
3. **Volume over time** — line chart, tickets created and resolved per day.
4. **Category breakdown** — horizontal bar chart, tickets per category,
   with the share of total.
5. **Priority mix** — donut or stacked bar, tickets by priority.
6. **Top issues** — table of ticket subjects (or the top recurring
   subject patterns) with counts.

Mobile (xs/sm):
- KPIs 2-up.
- Charts stack.
- Table → card list.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps KPIs and charts |
| 2 | KpiTile | Local | derived | Value + denominator |
| 3 | LineChart | Chart | Recharts | Volume over time |
| 4 | BarChart | Chart | Recharts | Category breakdown |
| 5 | DataTable | Pattern | top issues | Manual markup |
| 6 | EmptyState | Molecule | — | Insufficient data |
| 7 | Button | Atom | — | Export |

Recharts is loaded lazily via route-level code splitting (client-only).

## 7. Data

| Field | Source | Type | Permission | Sensitivity |
|---|---|---|---|---|
| Tickets created | derived | int | read | internal |
| Tickets resolved | derived | int | read | internal |
| Median first response | derived | duration | read | internal |
| Median resolve | derived | duration | read | internal |
| Backlog | derived | int | read | internal |
| Reopened count | derived | int | read | internal |
| Category breakdown | derived | series | read | internal |
| Priority mix | derived | series | read | internal |
| Top issues | derived | array | read | internal |

All values computed in the lib. The page renders; it does not compute.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Change range | Selector | ADMIN | none | `getSupportAnalytics(range)` | Charts redraw | — | no |
| 2 | Export report | Header | ADMIN | none | `exportSupportAnalytics(range)` | CSV download | Toast error | yes |
| 3 | Drill into category | Bar click | ADMIN | none | — | Navigate to ADM-240 filtered | — | no |
| 4 | Drill into priority | Bar click | ADMIN | none | — | Navigate to ADM-240 filtered | — | no |

## 9. States

| State | Design |
|---|---|
| Insufficient data | "Not enough data for this range." |
| Loading | Skeleton KPIs ×6, skeleton charts |
| Populated | Default render |
| Error | error.tsx boundary |
| Permission denied | "Support analytics is administrator-only." |
| Success | Toast on export |

## 10. Validation & error handling

- **Range with 0 tickets** — "No tickets in this range." instead of empty charts.
- **Export with 0 rows** — button disabled.
- **Charts with <2 data points** — "Not enough data to plot" instead of a broken line.
- **Category bar click with 0 rows** — no navigation.

Error codes: `SUPPORT_ANALYTICS_EMPTY`, `SUPPORT_ANALYTICS_EXPORT_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | KPIs 2-up; charts full-width |
| sm >=640 | Stacked | KPIs 2-up |
| md >=768 | Hybrid | KPIs 3-up; charts 2-column |
| lg >=1024 | Full | Sidebar visible; 2-column charts |
| xl >=1280 | Full | Comfortable spacing |

## 12. Accessibility

- Every chart has a `<figure>` with `<figcaption>` and an adjacent data table or screen-reader summary.
- Recharts SVGs have `aria-label` summarising each chart.
- KPI tile denominators are part of the accessible name.
- Colour is not the only channel for priority or category distinctions.

## 13. Performance

- Recharts lazy-loaded (route-level code splitting).
- Payload ≤ 40 KB for a quarter of tickets.
- Charts capped at 90 data points; longer ranges bucket by week.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.support_analytics.viewed` | role, range |
| `admin.support_analytics.range_changed` | from, to |
| `admin.support_analytics.exported` | range, row_count |
| `admin.support_analytics.drilled` | dimension, value |

## 15. Copy

- Page title: "Support analytics"
- Subtitle: "Volume, response times and common issues."
- Range labels: "Last 7 days", "Last 30 days", "Last 90 days", "This quarter"
- KPI labels: "Tickets created", "Tickets resolved", "Median first response", "Median resolve", "Backlog", "Reopened"
- Chart titles: "Volume over time", "Category breakdown", "Priority mix", "Top issues"
- Insufficient data: "Not enough data for this range."
- No tickets: "No tickets in this range."
- Export toast: "Report exported."
- Permission denied: "Support analytics is administrator-only."
- i18n keys: `admin.support_analytics.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Is "top issues" a manual summary, or auto-clustered by subject keywords? Proposed: auto by subject similarity, refined in R3. | Product Lead |
| 2 | Does the median first response measure calendar or business hours? Proposed: business hours for the SLA view; calendar for the raw metric. | Product Lead |
| 3 | Is there a target line on the volume chart for SLA compliance? Proposed: yes, configurable in PNL-19. | Product Lead |
| 4 | Should this roll into PNL-17, or stand alone? Proposed: stand alone; PNL-17 shows only summary numbers. | Product Lead |
| 5 | Export format: CSV or PDF? Proposed: CSV in R2, PDF deferred. | Product Lead |