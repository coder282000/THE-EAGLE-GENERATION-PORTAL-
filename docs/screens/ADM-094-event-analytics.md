# SCREEN SPEC: [ADM-094] Event analytics

## 1. Identification
- **Screen ID:** ADM-094
- **Route:** `/admin/events/[id]/analytics`
- **Layer:** Admin Console
- **Panel:** PNL-08 Events
- **Module:** Commerce / Events (Charter §16.8, FR-8.2; Analytics FR-10.1 to FR-10.7)
- **Release:** R2 (attendance), R3 (sales and revenue)
- **Priority:** P1
- **Related requirements:** FR-8.2, FR-10.1, FR-10.5, FR-10.6
- **Panel overview:** docs/panels/PNL-08-events.md

## 2. Purpose

Post-event analysis for a single event. It answers three questions a chapter
leader or admin actually asks after a gathering: how many came, how much did
we sell, and who did not show up. It also feeds the org-wide analytics in
PNL-17.

Every rate on this screen displays its denominator. This is a deliberate
requirement from Charter FR-10.6: a rate without its denominator is a claim,
not a measurement. The screen enforces this at the component level, not by
convention.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All events |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Scoped | Own chapter's events only; revenue masked unless explicitly granted |
| FINANCE_OFFICER | Full revenue view | All events; no create/edit |
| Others | Denied | Permission-denied card |

Helpers: `getEventAnalytics(eventId, user)`, `canViewEventRevenue(user)`,
`canExportEventAnalytics(user)` in `lib/mock/events.ts`. Revenue masking is
enforced in the helper, not the UI.

## 4. Entry & exit points

- **Reached from:**
  - ADM-090 event list -> row action "Analytics"
  - ADM-092 registrations -> header action "Analytics"
  - PNL-01 dashboard -> Chapter performance queue widget (aggregated)
- **Leads to:**
  - ADM-090 event list (back)
  - ADM-092 registrations (drill into a segment)
  - PNL-17 Analytics & Reporting (roll-up)
- **Deep-linkable:** yes. Query parameters: `?range=30d` (default: full event
  lifetime up to `ends_at + 30d`)

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — event title, date range chip (event lifetime), status
   badge, breadcrumb back to ADM-090. Actions: "Export report", "Compare to
   previous event" (P1, deferred).
2. **KPI row** — six StatCards. Each has a value, a denominator, and a trend
   indicator where a comparison exists. See §6.1.
3. **Sales over time** — line chart. Tickets sold per day from sales_open to
   ends_at. One line: cumulative sold. Toggle to show daily delta.
4. **Attendance funnel** — horizontal funnel chart. Registered -> Confirmed ->
   Checked in -> Attended full session (if session tracking exists).
5. **Tier performance** — bar chart. Sold per tier, with unsold remaining shown
   as a stacked segment.
6. **Chapter breakdown** — table. Registrations and attendance rate per chapter.
   Only shown for organisation-wide events.
7. **Insights panel** — auto-generated observations with denominators. See §6.3.
8. **Empty/partial states** — when there is not enough data to plot.

Mobile (xs/sm):
- KPIs stack 2-up.
- Charts stack vertically; each chart is full width at native aspect ratio.
- The chapter table becomes a card list.
- Insights panel remains visible; it is the most useful part on a phone.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps charts and tables |
| 2 | StatCard | Molecule | `getEventAnalytics()` | Extended with denominator prop. See §6.1 |
| 3 | LineChart | Chart | salesOverTime | Recharts, lazy-loaded |
| 4 | FunnelChart | Chart | attendanceFunnel | Recharts, lazy-loaded. See §6.2 |
| 5 | BarChart | Chart | tierPerformance | Recharts, lazy-loaded |
| 6 | DataTable | Organism | chapterBreakdown | Read-only on this screen |
| 7 | EmptyState | Molecule | — | Not enough data |
| 8 | Toast | Molecule | — | Export |
| 9 | InsightCard | **New** | insights | See §6.3 |
| 10 | ChartSkeleton | **New** | — | Loading placeholder sized to chart |

Recharts is loaded via `dynamic()` and only on this route. It is not in the
shared bundle.

### 6.1 StatCard with denominator (extended)

The existing `StatCard` is extended with an optional `denominator` prop. When
present, the card renders "value / denominator" as the primary number and the
rate as a secondary line.

Examples on this screen:

| KPI | Value | Denominator | Secondary |
|---|---|---|---|
| Tickets sold | 142 | 200 capacity | 71% of capacity |
| Checked in | 128 | 142 confirmed | 90% attendance rate |
| No-shows | 14 | 142 confirmed | 10% no-show rate |
| Revenue | KES 213,000 | — | vs KES 180,000 target |
| Refunded | 3 | 142 sold | 2.1% refund rate |
| Average ticket | KES 1,500 | 142 sold | — |

If a denominator is null or zero, the rate is not shown. Never divide by zero
and never display a rate without its base.

### 6.2 FunnelChart (new component)

Renders a horizontal funnel with named stages, counts, and drop-off
percentages between stages. Each stage's percentage is relative to the previous
stage, not the top of the funnel. The accessible label states both.

Stages on this screen:
1. Registered (all statuses except DRAFT)
2. Confirmed (paid and not cancelled)
3. Checked in
4. (Optional) Attended full session — hidden until session tracking exists

### 6.3 InsightCard (new component)

A short, auto-generated observation with a clear denominator. Generated
client-side from the analytics payload, not by an ML model. Examples:

- "Attendance rate was 90% (128 of 142 confirmed)."
- "Student tier outsold Standard by 18 tickets (74 of 142)."
- "Three registrations were refunded (2.1% of 142 sold)."
- "14 no-shows (10% of 142 confirmed), all from the KU chapter."

Each insight must include its denominator or its comparison base. Insights
that cannot state a denominator are not rendered.

The component is designed to be reused in PNL-17.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Event title | event.title | string | yes | — | read | public |
| Event capacity | event.capacity | int | no | — | read | internal |
| Tickets sold | derived | int | yes | — | read | finance |
| Confirmed | derived | int | yes | — | read | finance |
| Checked in | derived | int | yes | — | read | finance |
| No-shows | derived | int | yes | — | read | finance |
| Cancelled | derived | int | yes | — | read | finance |
| Refunded | derived | int | yes | — | read | finance |
| Revenue | derived | bigint | yes | — | read | finance |
| Average ticket | derived | bigint | yes | — | read | finance |
| Sales over time | derived | series | yes | — | read | finance |
| Tier performance | derived | series | yes | — | read | finance |
| Chapter breakdown | derived | series | cond | org-wide only | read | internal |
| Insight strings | derived | string[] | yes | each has a denominator | read | internal |

All money values are integer minor units. The chart formatters use
`formatCurrency()` for axis labels and tooltips.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Export report | Header | ADMIN, FINANCE_OFFICER | none | `exportEventAnalytics(eventId)` | CSV or PDF download | Toast error | yes |
| 2 | Toggle cumulative/delta | Chart control | as read | none | — | Chart redraws | — | no |
| 3 | Drill into a tier | Bar click | as read | none | — | Navigate to ADM-092 filtered by tier | — | no |
| 4 | Drill into a chapter | Table row | as read | none | — | Navigate to ADM-092 filtered by chapter | — | no |
| 5 | Compare to previous event | Header (P1) | ADMIN | none | `getEventAnalyticsComparison(id)` | Comparison overlay | Toast error | no |
| 6 | Change date range | Range chip | as read | none | `getEventAnalytics(id, range)` | Charts redraw | — | no |

## 9. States

| State | Design |
|---|---|
| Empty (no registrations) | "No data yet" / "Once people register, analytics will appear here." |
| Loading | ChartSkeletons sized to final charts; KPI skeletons ×6 |
| Populated | Default render |
| Partial | Some charts error, others render. Each chart region handles its own error with a retry link. |
| Insufficient data | A chart with <2 data points shows "Not enough data to plot" instead of a broken line |
| Error | error.tsx boundary + inline retry |
| Permission denied (revenue) | Revenue StatCard shows "Restricted" instead of the amount; other cards render normally |
| Offline | Banner: "You are offline. Analytics may be out of date." |
| Success | Toast on export |

## 10. Validation & error handling

- **Export with no data** → button disabled, tooltip: "Nothing to export."
- **Revenue masked** → card renders "Restricted" and hides the amount; the
  export excludes revenue columns.
- **Comparison with no prior event** → "This is the first event of this type."
  Comparison toggle disabled.
- **Chart with a single data point** → renders as a dot, not a line, with the
  point labelled. No misleading trend.
- **All-zero data** → "No sales recorded for this event." No flat line at zero.

Error codes: `ANALYTICS_NOT_FOUND`, `ANALYTICS_INSUFFICIENT_DATA`,
`ANALYTICS_PERMISSION_RESTRICTED`, `ANALYTICS_EXPORT_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | KPIs 2-up; charts full width; chapter table → card list |
| sm >=640 | Stacked | KPIs 2-up |
| md >=768 | Hybrid | KPIs 3-up; charts 2-column for line + funnel |
| lg >=1024 | Full | Sidebar visible; 3-column layout for charts |
| xl >=1280 | Full | Comfortable spacing; charts gain tooltips on hover |

Charts render at native aspect ratios; no fixed heights that break on mobile.

## 12. Accessibility

- Every chart has a `<figure>` with `<figcaption>`, and an adjacent data table
  or screen-reader summary that conveys the same information. Colour alone is
  never the only channel.
- Recharts SVG output has `role="img"` and an `aria-label` summarising the
  chart in one sentence including its denominators.
- The StatCard denominator is part of the accessible name, not a tooltip only.
- Line and bar colours meet WCAG 2.2 AA contrast against the card background.
- Focus order: header → KPI row → charts → insights → table.
- Keyboard users can reach the "Toggle cumulative/delta" control and the
  export button without pointer input.
- Insight cards are ordered text, not decorative images.

## 13. Performance

- Recharts is lazy-loaded via `dynamic(() => import(...), { ssr: false })`.
  It is not in the initial bundle.
- Analytics payload is computed once per event and cached for the session.
- Charts render at most 90 data points for a 90-day event; longer series are
  bucketed by week.
- Insights are generated from the payload in O(n) with no extra fetches.
- The chapter table paginates at 25 by default.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.event_analytics.viewed` | event_id, role, has_revenue |
| `admin.event_analytics.range_changed` | event_id, range |
| `admin.event_analytics.toggled` | event_id, series (cumulative/delta) |
| `admin.event_analytics.tier_drilled` | event_id, tier_id |
| `admin.event_analytics.chapter_drilled` | event_id, chapter_id |
| `admin.event_analytics.exported` | event_id, format, includes_revenue |
| `admin.event_analytics.insight_shown` | event_id, insight_code |

No attendee names or PII in analytics events.

## 15. Copy

- Page title: event title
- Subtitle: "<date range> · <status>"
- Range chip: "Full event lifetime"
- Actions: "Export report", "Compare to previous event"
- KPI labels: "Tickets sold", "Checked in", "No-shows", "Revenue", "Refunded", "Average ticket"
- Capacity line: "71% of capacity"
- Attendance rate: "90% attendance rate"
- No-show rate: "10% no-show rate"
- Refund rate: "2.1% refund rate"
- Charts titles: "Sales over time", "Attendance funnel", "Tier performance", "Chapter breakdown"
- Toggle: "Cumulative" / "Daily"
- Funnel stages: "Registered", "Confirmed", "Checked in", "Attended full session"
- Empty: "No data yet" / "Once people register, analytics will appear here."
- Insufficient data: "Not enough data to plot."
- No prior event: "This is the first event of this type."
- Revenue restricted: "Restricted"
- Export toast: "Report exported."
- Export empty tooltip: "Nothing to export."
- Offline banner: "You are offline. Analytics may be out of date."
- Permission denied: "You do not have access to this event's analytics."
- i18n keys: `admin.event_analytics.*`, `admin.event_analytics.kpi.*`, `admin.event_analytics.insight.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should CHAPTER_LEADER see revenue for their own chapter's events by default, or must it be granted per user? | Finance |
| 2 | Is session tracking (attended full session) required for R3, or deferred? Proposed: deferred; funnel shows three stages in R3. | Product Lead |
| 3 | Export format: CSV, PDF, or both? Proposed: CSV for finance, PDF for funder reporting. PDF deferred to PNL-17. | Product Lead |
| 4 | How many prior events back should "Compare to previous event" look? Proposed: most recent same-type event in the same chapter, or same-type org-wide if none. | Product Lead |
| 5 | Should insights be generated server-side (so they can be cached and audited) or client-side (simpler, no extra call)? Proposed: client-side for R3, revisit if PNL-17 needs consistency. | Tech Lead |
| 6 | Does the chapter breakdown include chapters with zero registrations, or only chapters that appear in the event? Proposed: only appearing chapters, with an "Others" bucket if >20 chapters. | Product Lead |
| 7 | Timezone for the "per day" bucket on the sales chart: event timezone, or UTC? Proposed: event timezone, matching the member-facing display. | Tech Lead |