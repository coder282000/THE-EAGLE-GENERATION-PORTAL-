# SCREEN SPEC: [ADM-092] Registrations and attendee list

## 1. Identification
- **Screen ID:** ADM-092
- **Route:** `/admin/events/[id]/registrations`
- **Layer:** Admin Console
- **Panel:** PNL-08 Events
- **Module:** Commerce / Events (Charter §16.8, FR-8.2)
- **Release:** R2 (listing), R3 (paid registrations, refund entry)
- **Priority:** P0
- **Related requirements:** FR-8.2, FR-8.9
- **Panel overview:** docs/panels/PNL-08-events.md

## 2. Purpose

The attendee register for a single event. It answers: who is coming, who has
paid, who has been checked in, and who has cancelled or been refunded. It is
the operational source of truth for the door and the reconciliation source for
finance.

It is also the entry point for the refund request flow, which is a four-eyes
action. The refund itself is processed in PNL-09 Commerce and Finance; this
screen only raises the request and shows its status.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All registrations, all events |
| SUPER_ADMIN | Full | As ADMIN, plus force-refund of CHECKED_IN |
| CHAPTER_LEADER | Scoped | Own chapter's events only; read-only; cannot request refunds |
| FINANCE_OFFICER | Read + refund request | Can raise refund requests, cannot approve (four-eyes) |
| Others | Denied | Permission-denied card |

Helpers: `getEventRegistrations(eventId, user)`, `canExportRegistrations(user)`,
`canRequestRefund(user, registration)` in `lib/mock/events.ts`.

## 4. Entry & exit points

- **Reached from:**
  - ADM-090 event list -> row action "Registrations"
  - ADM-091 create/edit -> after publish, "View registrations"
  - ADM-093 check-in -> header action "View full list"
  - PNL-01 dashboard queue widget (refunds pending approval)
- **Leads to:**
  - ADM-093 check-in
  - ADM-091 edit event
  - Member detail (PNL-03, `/admin/members/[id]`)
  - Refund request modal (this screen)
  - PNL-09 refund approval queue (cross-panel)
- **Deep-linkable:** yes. Query parameters: `?status=CONFIRMED&tier=&q=&page=2&sort=-registered_at`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — event title, date, status badge, breadcrumb back to
   ADM-090. Actions: "Edit event", "Open check-in", "Export".
2. **Stats row** — four StatCards: Registered, Checked in, Cancelled,
   Revenue. Each with its denominator where meaningful.
3. **Capacity bar** — visual: sold / capacity, with percentage. Hidden when
   capacity is unlimited.
4. **Filter bar** — search, status filter, tier filter, chapter filter (only
   for ADMIN and above when the event spans chapters), saved views.
5. **Data table** — sortable columns: Attendee, Tier, Chapter, Status,
   Registered, Checked in, Amount, Actions.
6. **Bulk action bar** — appears on selection. Available actions: Export
   selected, Mark as NO_SHOW (post-event, ADMIN only).
7. **Pagination** — cursor-friendly.

Mobile (xs/sm):
- Stats 2-up.
- Filters in a Sheet.
- Table becomes a card list below `md`: name, tier, status badge, registered
  date, amount, and a "Details" chevron opening a Sheet with full record.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats, capacity bar, table |
| 2 | StatCard | Molecule | `getEventStats()` | Value, denominator, link |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | Select | Atom | static | Status, tier, chapter filters |
| 5 | BulkActionBar | Molecule | selection | Conditional on >=1 selected |
| 6 | DataTable | Organism | `getEventRegistrations()` | Sortable, selectable |
| 7 | StatusBadge | Atom | registration.status | PENDING / CONFIRMED / CHECKED_IN / CANCELLED / REFUNDED / NO_SHOW |
| 8 | Pagination | Molecule | cursor | xs fallback |
| 9 | EmptyState | Molecule | — | No registrations, or no filter matches |
| 10 | ConfirmDialog | Dialog | — | Bulk NO_SHOW; refund confirm |
| 11 | Toast | Molecule | — | Export, refund request |
| 12 | Sheet | Dialog | — | Mobile row detail; refund request form |
| 13 | Avatar | Atom | member.photo | Fallback to initials |
| 14 | CapacityBar | **New** | derived | See §6.1 |
| 15 | RefundRequestForm | **New** | — | See §6.2 |

### 6.1 CapacityBar (new component)

Horizontal progress bar showing sold vs capacity, with a percentage label and
a colour that shifts as the event approaches or exceeds capacity.

- Props: `sold`, `capacity`, `waitlistCount`.
- Accessible label: "142 of 200 tickets sold, 71 percent".
- Colour tone: ink below 70%, clay 70-99%, danger at or above 100%.
- Hidden when `capacity` is null (unlimited).
- Waitlist count appears as a small chip to the right when > 0.

### 6.2 RefundRequestForm (new component)

Raises a refund request for one registration. It does not process the refund.

- Inputs: reason (select: Member requested, Event cancelled, Duplicate purchase,
  Other), note (optional, 0-500 chars), refund amount (default full, no partial
  refunds in R3).
- On submit, calls `requestRefund(registrationId, reason, note)`.
- Response creates an `approval_request` of type REFUND, status PENDING, with
  the current user as initiator.
- The UI shows the registration status as REFUND_PENDING while a request is
  open.
- The form is not shown to the initiator again while a request is open; it
  shows "Refund requested by <name> on <date> — awaiting approval" instead.
- A FINANCE_OFFICER who initiated the request cannot approve it. The approval
  action is not rendered on this screen; it lives in PNL-09.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Attendee name | member.first_name + last_name | string | yes | — | read | PII |
| Member number | member.member_number | string | yes | — | read | internal |
| Email | member.email | string | yes | — | read | PII |
| Tier | tier.name | string | yes | — | read | internal |
| Chapter | chapter.code | string | yes | — | read | internal |
| Registration status | registration.status | enum | yes | — | read | internal |
| Reference | registration.reference | string | yes | unique | read | internal |
| Registered at | registration.registered_at | timestamptz | yes | — | read | internal |
| Checked in at | registration.checked_in_at | timestamptz | no | — | read | internal |
| Amount paid | registration.amount_minor | bigint | yes | >=0 | read | finance |
| Currency | registration.currency | char(3) | yes | ISO 4217 | read | finance |
| Payment reference | payment.reference | string | no | — | read | finance |
| Refund status | approval_request.status | enum | no | — | read | finance |
| Refund reason | approval_request.reason | string | cond | required to raise | write | internal |

Money is integer minor units plus explicit currency. `formatCurrency()` is the
only path from minor units to display.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Open check-in | Header | ADMIN, CHAPTER_LEADER | none | — | Navigate to ADM-093 | — | no |
| 2 | Edit event | Header | ADMIN, CHAPTER_LEADER | none | — | Navigate to ADM-091 | — | no |
| 3 | Export all | Header | ADMIN, FINANCE_OFFICER | none | `exportRegistrations(eventId, filters)` | CSV download | Toast error | yes |
| 4 | Export selected | Bulk bar | ADMIN, FINANCE_OFFICER | none | `exportRegistrations(eventId, selection)` | CSV download | Toast error | yes |
| 5 | Mark NO_SHOW | Bulk bar | ADMIN | ConfirmDialog | `markNoShow(ids)` | Toast + status update | Toast error | yes |
| 6 | Request refund | Row action / Sheet | FINANCE_OFFICER | ConfirmDialog | `requestRefund(id, reason, note)` | Toast + status REFUND_PENDING | Toast error | yes |
| 7 | View member | Row action | ADMIN, FINANCE_OFFICER | none | — | Navigate to PNL-03 member detail | — | no |
| 8 | Filter | FilterBar | as read | none | `getEventRegistrations(filters)` | Table updates | — | no |
| 9 | Sort | Column header | as read | none | `getEventRegistrations(sort)` | Table updates | — | no |

The API column lists mock helpers today; the real endpoints replace them
without changing this table's shape.

## 9. States

| State | Design |
|---|---|
| Empty (no registrations) | "No one has registered yet." + link to preview member page |
| Empty (filtered) | "No registrations match these filters." + "Clear filters" |
| Loading | Skeleton stats ×4, skeleton table rows ×6 |
| Populated | Default render |
| Populated, extreme | 5000 rows via pagination; longest name truncates with tooltip |
| Partial | Stats load, table errors → inline retry; stats stay |
| Error | error.tsx boundary + inline retry |
| Permission denied | "You do not have access to this event's registrations." |
| Offline | Banner: "You are offline. Actions are unavailable." |
| Success | Toast on export, NO_SHOW, refund request |
| Destructive confirmation | Bulk NO_SHOW; refund request |
| Refund pending | Row shows "Refund pending" chip; row action replaced by info panel |

## 10. Validation & error handling

- **Refund request with no reason** → inline error: "Choose a reason for the refund."
- **Refund request on a CANCELLED registration** → blocked: "This registration is already cancelled."
- **Refund request on a REFUNDED registration** → blocked: "This registration has already been refunded."
- **Refund request on a PENDING registration** → blocked: "Payment has not been confirmed for this registration."
- **Bulk NO_SHOW on a CHECKED_IN registration** → skipped with a summary: "3 skipped — already checked in."
- **Bulk NO_SHOW before the event ends** → ConfirmDialog warns: "This event has not finished yet. Mark selected as NO_SHOW anyway?"
- **Export with no rows** → button disabled.
- **Export failure** → toast: "Export failed. Try again."

Error codes: `REGISTRATION_NOT_FOUND`, `REFUND_ALREADY_OPEN`,
`REFUND_NOT_ELIGIBLE`, `BULK_NO_SHOW_PARTIAL`, `EXPORT_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table → card list; refund in Sheet |
| sm >=640 | Stacked | Stats 2-up; filters inline |
| md >=768 | Table | Table returns; stats 4-up |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable column widths |

Touch targets >=44x44. No horizontal scroll on the table at any breakpoint.

## 12. Accessibility

- Heading structure: `h1` page title, `h2` per region.
- Landmarks: `<main>`, `<nav>` for pagination, `<section>` per region.
- Table: `<caption>` (visually hidden), `<th scope="col">`, `aria-sort` on
  sortable headers.
- Each row checkbox has an accessible name including the attendee name and
  reference.
- Bulk action bar `role="region"`, `aria-live="polite"`: "N registrations selected."
- Capacity bar has `role="progressbar"` with `aria-valuenow`,
  `aria-valuemin`, `aria-valuemax`, and an accessible label.
- Refund form: labels for every field; reason is a required field with
  `aria-required="true"`.
- After a successful refund request, focus returns to the acted-on row.
- Status badges are text, not colour alone.

## 13. Performance

- Table page payload <= 60 KB for 25 rows.
- `useMemo` for filtered/sorted list.
- Search debounced 300ms.
- Pagination default 25, max 100.
- Stats derived from the same helper call as the table's first page to avoid
  duplicate fetches.
- Export streams server-side for large events (mock: generates on client).

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.registrations.viewed` | event_id, role, status_filter |
| `admin.registrations.filtered` | status, tier, chapter, has_query |
| `admin.registrations.sorted` | column, direction |
| `admin.registrations.exported` | row_count, scope (all/selected) |
| `admin.registrations.no_show_marked` | count |
| `admin.registrations.refund_requested` | reason, amount_minor |
| `admin.registrations.member_opened` | registration_id |

No attendee email or PII sent to analytics.

## 15. Copy

- Page title: event title
- Subtitle: "<date> · <chapter or 'Organisation-wide'>"
- Primary actions: "Edit event", "Open check-in", "Export"
- Stats labels: "Registered", "Checked in", "Cancelled", "Revenue"
- Capacity: "142 of 200 sold" / "71 percent full"
- Waitlist chip: "12 on waitlist"
- Filters: "All statuses", "All tiers", "All chapters"
- Column headers: Attendee, Tier, Chapter, Status, Registered, Checked in, Amount, Actions
- Status labels: Pending, Confirmed, Checked in, Cancelled, Refunded, No-show
- Bulk bar: "N registrations selected"
- Bulk actions: "Export selected", "Mark as NO_SHOW"
- Refund button: "Request refund"
- Refund dialog title: "Request a refund?"
- Refund dialog body: "This creates a request for approval. Another officer must approve it before money moves."
- Refund reason label: "Reason"
- Refund reasons: "Member requested", "Event cancelled", "Duplicate purchase", "Other"
- Refund note label: "Note (optional)"
- Refund confirm: "Request refund"
- Refund pending message: "Refund requested by <name> on <date> — awaiting approval."
- Empty (no registrations): "No one has registered yet." / "Share the event page to start selling tickets."
- Empty (filtered): "No registrations match these filters." / "Clear filters"
- Permission denied: "You do not have access to this event's registrations."
- Export toast: "Export ready."
- NO_SHOW toast: "Marked N as no-show."
- Offline banner: "You are offline. Actions are unavailable."
- i18n keys: `admin.registrations.*`, `admin.registrations.status.*`, `admin.registrations.refund.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Can FINANCE_OFFICER raise a refund on any event, or only their assigned chapters? | Finance |
| 2 | Should partial refunds be supported in R3, or is full-only acceptable? Proposed: full-only. | Finance |
| 3 | Who can approve a refund? FINANCE_OFFICER and ADMIN, or FINANCE_OFFICER only? | Compliance Lead |
| 4 | Should a refunded registration be re-purchasable, or does it require a fresh registration? | Product Lead |
| 5 | Is NO_SHOW marked automatically at `ends_at`, or only manually? Proposed: automatic at `ends_at + 24h`, overridable manually. | Product Lead |
| 6 | Should the attendee list show the member number, or is that PII reserved for member detail only? | Compliance Lead |
| 7 | Does the CSV export include email and phone, and does that require a higher role than ADMIN? | Compliance Lead |