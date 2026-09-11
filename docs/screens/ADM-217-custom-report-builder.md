# SCREEN SPEC: [ADM-217] Custom Report Builder

## 1. Identification
- Screen ID: ADM-217
- Route: /admin/analytics/reports
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R2 (MVP), R3 (scheduled reports)
- Priority: P1
- Related requirements: FR-10.1 to FR-10.7, FR-10.6
- Related panel: PNL-17

## 2. Purpose
Build ad-hoc reports without engineering involvement. Select a metric, a
dimension, a filter set, and an output format. Save the definition and,
optionally, schedule it for delivery. This is the pressure-relief valve for
one-off questions from Leadership, funders, and the Steering Committee.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All metrics, all dimensions |
| ADMIN | Full | All metrics, all dimensions |
| COMPLIANCE_LEAD | Read-only | Cannot run reports that include financial metrics |
| FINANCE_OFFICER | Financial metrics only | Cannot include member or learning metrics |
| CHAPTER_LEADER | Own chapter scope only | One chapter dimension, own chapter |
| Others | Denied | 403 card |

Role scoping is enforced at the metric and dimension level, not just at the
report level. A chapter leader cannot construct a report that includes
org-wide membership counts.

## 4. Entry and exit points
- Reached from: sidebar (Analytics, "Custom reports"), ADM-210 toolbar
  "Advanced"
- Leads to: report output preview, saved report definitions, scheduled
  delivery list
- Deep-linkable: yes. URL params: ?definition (id), ?run (id)

## 5. Layout and regions
- Page header: title, subtitle
- Tabs: Builder / Saved definitions / Scheduled deliveries
- Builder tab
  - Left column (2/3):
    - Metric selector (single or multiple, role-filtered)
    - Dimension selector (group by: chapter, tier, month, surface, cohort,
      pillar)
    - Filter row builder (field, operator, value)
    - Date range picker
    - Limit / top-N control
  - Right column (1/3):
    - Output format: table, bar chart, line chart
    - Preview panel (renders live)
    - Save definition (name, description, visibility)
    - Schedule (frequency, recipients, format)
    - Run now
- Saved definitions tab: name, owner, last run, action (run, duplicate,
  delete)
- Scheduled deliveries tab: name, schedule, recipients, last delivery,
  status, action (pause, resume, delete)

## 6. Components
| Component | Purpose |
|---|---|
| MetricSelector | Role-filtered metric picker |
| DimensionSelector | Group-by picker |
| FilterBuilder | Row builder (field, operator, value) |
| DateRangePicker | From/to filter |
| Chart | Recharts wrapper, lazy-loaded |
| DataTable | Output table |
| DefinitionList | Saved definitions |
| DeliveryList | Scheduled deliveries |
| EmptyState | No definitions yet |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Definition id | ReportDefinition.id | string | Y | Read | Internal |
| Name | ReportDefinition.name | string | Y | Read | Internal |
| Description | ReportDefinition.description | string | N | Read | Internal |
| Metrics | ReportDefinition.metrics | list | Y | Read | Internal |
| Dimensions | ReportDefinition.dimensions | list | Y | Read | Internal |
| Filters | ReportDefinition.filters | list | Y | Read | Internal |
| Date range | ReportDefinition.from, .to | date | Y | Read | Internal |
| Limit | ReportDefinition.limit | int | N | Read | Internal |
| Output format | ReportDefinition.format | enum | Y | Read | Internal |
| Owner | ReportDefinition.ownerId | user | Y | Read | Internal |
| Visibility | ReportDefinition.visibility | enum | Y | Read | Internal |
| Schedule | ReportDefinition.schedule | object | N | Read | Internal |
| Recipients | ReportDefinition.recipients | list | N | Read | PII |
| Last run at | ReportDefinition.lastRunAt | timestamp | N | Read | Internal |
| Last run status | ReportDefinition.lastRunStatus | enum | N | Read | Internal |

Format: TABLE, BAR, LINE.
Visibility: PRIVATE, ADMIN_ONLY, SHARED.
Schedule frequency: DAILY, WEEKLY, MONTHLY.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Add metric | Selector | ADMIN+ | No | local state | No |
| Add filter | Builder | ADMIN+ | No | local state | No |
| Preview | Auto on change | ADMIN+ | No | POST /reports/preview | No |
| Run now | Button | ADMIN+ | No | POST /reports/run | Yes |
| Save definition | Button | ADMIN+ | Yes | POST /reports/definitions | Yes |
| Schedule delivery | Button | ADMIN+ | Yes | POST /reports/definitions/:id/schedule | Yes |
| Pause / resume | Row action | ADMIN+ | No | PATCH /reports/definitions/:id | Yes |
| Delete definition | Row action | ADMIN+ | Yes | DELETE /reports/definitions/:id | Yes |

Every run and every scheduled delivery is audited. Recipients are recorded
with each delivery.

## 9. States
- Empty (no definitions): "No saved reports yet. Build one above."
- Empty (preview): "Add a metric to see a preview."
- Loading: skeleton preview.
- Populated: live preview updates as the user builds.
- Populated extreme: top-100 output. Beyond that, downloads are recommended.
- Partial: one metric fails; others render with an inline error for the
  failed one.
- Error: full-page error card with Retry.
- Permission denied: metric or dimension not available to the role is
  hidden with a tooltip "Not available for your role".
- Offline: read-only. Running reports is disabled.
- Success: preview refreshes; toast confirms save or schedule.
- Destructive confirmation: delete definition, schedule delivery.

## 10. Validation and error handling
- At least one metric required to preview or run.
- At least one dimension required for grouped output. Single-value output
  is allowed (one number, with denominator).
- Date range must have from <= to. Max range 24 months.
- Top-N limit between 1 and 100.
- Recipients for scheduled deliveries must be current admin users, selected
  from a directory. Never free-text email.
- CSV export is watermarked with actor, definition, range, timestamp.
- Member identifiers are never included; only member numbers, and only when
  a member-level output is explicitly requested and the role permits it.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. Preview collapses under the builder. |
| md (>=768) | Single column, wider. Preview below builder. |
| lg (>=1024) | Two columns: builder left (2/3), preview and options right (1/3). |
| xl (>=1280) | Same two-column, wider margins. |

## 12. Accessibility
- All selectors and filters keyboard operable
- Filter rows have add/remove buttons reachable by keyboard
- Preview table uses `<caption>` and `<th scope="col">`
- Charts have text alternatives
- Tab control uses role=tablist, role=tab, role=tabpanel
- Focus order: tabs, builder, preview, save/schedule actions

## 13. Performance
- Payload budget: 300 KB
- Preview debounced at 500 ms; runs server-side
- Charts lazy-loaded
- Saved definitions list paginated at 20
- Scheduled deliveries list paginated at 20
- CSV export streams

## 14. Analytics
- analytics.reports.builder_viewed
- analytics.reports.previewed (properties: metrics_count, filters_count)
- analytics.reports.definition_saved
- analytics.reports.schedule_created
- analytics.reports.run_now
- analytics.reports.definition_deleted

## 15. Copy
- Title: "Custom reports"
- Subtitle: "Build, save, and schedule reports from the platform's metrics."
- Empty (definitions): "No saved reports yet. Build one above."
- Empty (preview): "Add a metric to see a preview."
- Restricted metric tooltip: "Not available for your role."
- Save confirmation: "Save this report definition?"
- Schedule confirmation: "Schedule this report for delivery? Recipients will
  receive it at the specified cadence. Every delivery is audited."
- Delete confirmation: "Delete this report definition? Scheduled deliveries
  will also be removed."
- Toast run: "Report generated. Download link is ready."
- Toast schedule: "Delivery scheduled."

## 16. Open questions
- Q1: At R2, is scheduling available, or only on-demand runs? R3 is the
  natural fit; the spec assumes R3. Product Lead and Tech Lead.
- Q2: Should metric definitions be catalogued somewhere the user can read,
  or is a tooltip enough? Product Lead.
- Q3: When a scheduled report fails (delivery error), how are recipients
  notified? Product Lead and Compliance Lead.
- Q4: Do we need version history on saved definitions, or is overwrite
  acceptable? Tech Lead.