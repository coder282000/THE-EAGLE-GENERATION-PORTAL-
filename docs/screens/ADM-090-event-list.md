# SCREEN SPEC: [ADM-090] Event list

## 1. Identification
- **Screen ID:** ADM-090
- **Route:** `/admin/events`
- **Layer:** Admin Console
- **Panel:** PNL-08 Events
- **Module:** Commerce / Events (Charter §16.8, FR-8.2)
- **Release:** R2 (listing), R3 (ticketing columns)
- **Priority:** P0
- **Related requirements:** FR-8.2
- **Panel overview:** docs/panels/PNL-08-events.md

## 2. Purpose

The operational index of every event TEG runs. It answers three questions
quickly: what is coming up, what has sold, and what needs attention. It is the
entry point to creation, registrations, check-in and analytics.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All events, all chapters |
| SUPER_ADMIN | Full | As ADMIN, plus override of locked events |
| CHAPTER_LEADER | Scoped | Own chapter's events only |
| FINANCE_OFFICER | Read-only | Revenue columns and export; no create/edit |
| Others | Denied | Permission-denied card rendered |

Scoping is enforced by `getEvents()` in `lib/mock/events.ts`. The helper filters
by the current mock user's chapter unless the role is ADMIN or SUPER_ADMIN.
Hiding a row in the UI is not the control; the helper is.

## 4. Entry & exit points

- **Reached from:** sidebar (Content -> Events), PNL-01 dashboard queue widget,
  PNL-01 global search, chapter detail (PNL-04).
- **Leads to:**
  - ADM-091 create (`/admin/events/new`)
  - ADM-091 edit (`/admin/events/[id]/edit`)
  - ADM-092 registrations (`/admin/events/[id]/registrations`)
  - ADM-093 check-in (`/admin/events/[id]/check-in`)
  - ADM-094 analytics (`/admin/events/[id]/analytics`)
  - Member-facing preview (SCR-101)
- **Deep-linkable:** yes. Query parameters: `?status=PUBLISHED&type=WEBINAR&chapter=KU&q=&page=2&sort=-starts_at`

## 5. Layout & regions

Desktop (lg+):
1. **Page header** — title "Events", count of upcoming, primary action
   "Create event", secondary "Export".
2. **Stats row** — four StatCards: Upcoming, Published, Tickets sold (this
   month), Revenue (this month). Each links to a pre-filtered view.
3. **Filter bar** — search, status filter, type filter, chapter filter, date
   range, saved views, refresh.
4. **Data table** — sortable columns: Event, Type, Chapter, Starts, Capacity,
   Sold, Status, Actions.
5. **Bulk action bar** — appears on selection. Available actions: Publish,
   Unpublish, Cancel, Export selected.
6. **Pagination** — cursor-friendly; on xs falls back to "n of m".

Mobile (xs/sm):
- Same header and stats, stats stack two-up.
- Filter bar collapses into a **Filters** button opening a Sheet.
- Table becomes a card list below `md`: title, type badge, chapter, date,
  capacity progress, status badge.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatCard | Molecule | `getEventStats()` | Value, % change, trend colour, link |
| 3 | SearchInput | Atom | — | 300ms debounce, clear button, loading |
| 4 | Select | Atom | static options | Status, type, chapter filters |
| 5 | BulkActionBar | Molecule | selection state | Conditional on >=1 row selected |
| 6 | DataTable | Organism | `getEvents()` | Sortable, selectable, row click |
| 7 | StatusBadge | Atom | `status` | DRAFT/PUBLISHED/SOLD_OUT/ONGOING/COMPLETED/CANCELLED |
| 8 | Pagination | Molecule | cursor | xs fallback "n of m" |
| 9 | EmptyState | Molecule | — | Icon, title, description, action |
| 10 | ConfirmDialog | Dialog | — | Cancel-event confirmation |
| 11 | Toast | Molecule | — | Publish/cancel confirmation |
| 12 | Sheet | Dialog | — | Mobile filter panel |

No new design-system components required.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Event title | event.title | string | yes | 3-120 chars | read | public |
| Slug | event.slug | string | yes | URL-safe, unique | read | public |
| Type | event.type | enum | yes | in enum | read | public |
| Chapter | chapter.name | string | no | — | read | internal |
| Starts | event.starts_at | timestamptz | yes | — | read | public |
| Ends | event.ends_at | timestamptz | yes | after starts_at | read | public |
| Capacity | event.capacity | int | no | >=1 or null | read | internal |
| Sold | count(registrations CONFIRMED+CHECKED_IN) | int | derived | — | read | internal |
| Status | event.status | enum | yes | — | read | internal |
| Revenue | sum(amount_minor) | bigint | derived | — | read | finance-restricted |

Money is integer minor units plus an explicit currency code. Never a float.
The table formats via `formatCurrency()`; it never does arithmetic on floats.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Create event | Primary button | ADMIN, CHAPTER_LEADER | none | — | Navigate to ADM-091 | — | no |
| 2 | Row click | Row | as read | none | — | Navigate to ADM-092 | — | no |
| 3 | Publish | Row action / bulk | ADMIN, CHAPTER_LEADER | none | `publishEvent()` | Toast + badge update | Toast error | yes |
| 4 | Unpublish | Row action | ADMIN | ConfirmDialog | `unpublishEvent()` | Toast + badge update | Toast error | yes |
| 5 | Cancel event | Row action | ADMIN | ConfirmDialog, reason required | `cancelEvent()` | Toast + badge update | Toast error | yes |
| 6 | Export | Header / bulk | ADMIN, FINANCE_OFFICER | none | `exportEvents()` | CSV download | Toast error | yes |
| 7 | Filter | FilterBar | as read | none | `getEvents(filters)` | Table updates | — | no |
| 8 | Sort | Column header | as read | none | `getEvents(sort)` | Table updates | — | no |

The API column lists the mock helper used today; the real endpoint replaces it
without changing this table's shape.

## 9. States

| State | Design |
|---|---|
| Empty (first use) | EmptyState: "No events yet" + "Create the first event" CTA |
| Empty (filtered) | "No events match these filters" + "Clear filters" |
| Loading | Skeleton rows x6, skeleton StatCards x4, disabled filter bar |
| Populated | Default render |
| Populated, extreme | 1 row; 500 rows via pagination; longest title wraps to 2 lines and truncates with tooltip |
| Partial | Stats load, table errors -> table shows inline error with retry; stats stay |
| Error | error.tsx boundary + inline retry |
| Permission denied | Card: "You do not have access to events" + support link |
| Offline | Admin console is desktop-first; offline not supported. Global offline banner shows. |
| Success | Toast on publish/unpublish/cancel |
| Destructive confirmation | ConfirmDialog for cancel, with mandatory reason |

## 10. Validation & error handling

- **Filter combination with no results** -> empty-filtered state, not an error.
- **Cancel without reason** -> inline error: "A reason is required to cancel an event."
- **Publish an event with no ticket tier** -> allowed for free events; blocked
  for paid events with: "Add at least one ticket tier before publishing."
- **Publish an event whose start date has passed** -> blocked: "This event's
  start date has passed. Update the date before publishing."
- **Export with no rows** -> button disabled, tooltip: "Nothing to export."
- Exact error codes are defined in the shared error catalogue; this screen uses
  `EVENT_NOT_FOUND`, `EVENT_PUBLISH_BLOCKED`, `EVENT_CANCEL_REASON_REQUIRED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table -> card list; bulk bar docked bottom |
| sm >=640 | Stacked | Stats 2-up; filters inline (wraps) |
| md >=768 | Hybrid | Table returns; stats 4-up |
| lg >=1024 | Full | Sidebar visible; table full width |
| xl >=1280 | Full | Comfortable column widths; no change in behaviour |

Touch targets >=44x44px throughout. No horizontal scroll on any data table.

## 12. Accessibility

- Heading structure: `h1` page title, `h2` for each region (Stats, Filters, Events).
- Landmarks: `<main>`, `<nav>` for pagination, `<section>` per region.
- Data table: `<table>` with `<caption>` (visually hidden), `<th scope="col">`,
  `aria-sort` on sortable headers.
- Selection: each row checkbox has an accessible name including the event title.
- Bulk action bar: `role="region"` with `aria-live="polite"` announcing
  "N events selected".
- Focus order: header -> stats -> filters -> table -> pagination.
- After publish/cancel, focus returns to the acted-on row.
- Status badges are text, not colour alone.
- Capacity progress bar has an accessible label: "45 of 100 sold".

## 13. Performance

- Payload budget: table page <= 50 KB JSON for 25 rows.
- `useMemo` for filtered/sorted lists; `useCallback` for handlers.
- Search debounced 300ms.
- Pagination default 25, max 100.
- StatCards computed from the same helper call to avoid duplicate queries.
- Recharts not loaded on this screen.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.events.viewed` | role, filter_count |
| `admin.events.filtered` | status, type, chapter, has_query |
| `admin.events.sorted` | column, direction |
| `admin.events.published` | event_id, type, chapter_id |
| `admin.events.cancelled` | event_id, reason_length |
| `admin.events.exported` | row_count, filters_applied |

## 15. Copy

- Page title: "Events"
- Subtitle: "Create, publish and run events across chapters."
- Primary action: "Create event"
- Secondary action: "Export"
- Empty (first use): "No events yet" / "Events you create will appear here." / "Create the first event"
- Empty (filtered): "No events match these filters." / "Clear filters"
- Permission denied: "You do not have access to events." / "Contact support"
- Cancel dialog title: "Cancel this event?"
- Cancel dialog body: "Members who have registered will be notified and refunded. This cannot be undone."
- Cancel reason label: "Reason for cancellation"
- Cancel confirm: "Cancel event"
- Publish toast: "Event published."
- Cancel toast: "Event cancelled. Registrants have been notified."
- Loading: "Loading events..."
- Error: "We couldn't load events." / "Try again"
- Column headers: Event, Type, Chapter, Starts, Capacity, Sold, Status, Actions
- Status labels: Draft, Published, Sold out, Ongoing, Completed, Cancelled
- i18n keys: `admin.events.*`, `admin.events.status.*`, `admin.events.empty.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should CHAPTER_LEADER see organisation-wide events read-only, or not at all? | Product Lead |
| 2 | Is revenue visible to CHAPTER_LEADER for their own chapter's events? | Finance |
| 3 | Default sort: soonest upcoming first, or most recently created? Proposed: soonest upcoming. | Product Lead |
| 4 | Saved views — per user, or shared per role? | Tech Lead |
| 5 | Bulk publish vs one-at-a-time — confirm bulk publish is required for R2. | Product Lead |