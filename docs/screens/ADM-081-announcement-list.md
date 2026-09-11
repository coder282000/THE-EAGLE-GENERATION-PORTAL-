# SCREEN SPEC: [ADM-081] Announcement list and performance

## 1. Identification
- **Screen ID:** ADM-081
- **Route:** `/admin/announcements`
- **Layer:** Admin Console
- **Panel:** PNL-07 Communications
- **Module:** Announcements and Governance (Charter §16.7, FR-7.1 to FR-7.3)
- **Release:** R1 (list), R3 (performance columns)
- **Priority:** P0
- **Related requirements:** FR-7.1, FR-7.2, FR-7.3
- **Panel overview:** docs/panels/PNL-07-communications.md

## 2. Purpose

The index of every announcement TEG has drafted, scheduled, published or
expired. It answers three questions quickly: what is going out, what
went out, and how was it received. It is the entry point to composing,
editing drafts, and reading the performance of a published announcement.

For a CHAPTER_LEADER the list is chapter-scoped. For an ADMIN it spans
the whole organisation.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All announcements |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Scoped | Own chapter's announcements only |
| FINANCE_OFFICER | Read-only | Cannot author; can see the list |
| Others | Denied | Permission-denied card |

Helpers: `getAnnouncements(user, filters)`, `canCreateAnnouncement(user)`,
`canEditAnnouncement(user, item)` in `lib/mock/communications.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (Content -> Announcements), PNL-01 dashboard
  queue widget, PNL-01 global search.
- **Leads to:**
  - ADM-080 create (`/admin/announcements/new`)
  - ADM-080 edit (`/admin/announcements/[id]/edit`) — drafts only
  - Announcement performance (`/admin/announcements/[id]`)
  - Member-facing view (SCR-045) preview
- **Deep-linkable:** yes. Query parameters:
  `?status=PUBLISHED&priority=HIGH&audience=CHAPTER&q=&page=2`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — title "Announcements", subtitle, primary action
   "New announcement" (hidden for FINANCE_OFFICER), secondary "Export".
2. **Stats row** — four StatTiles: Published this month, Scheduled,
   Drafts, Average read rate.
3. **Filter bar** — search, status filter, priority filter, audience
   filter, reset.
4. **Data table** — columns: Title, Audience, Priority, Status, Published,
   Read rate, Actions.
5. **Pagination** — cursor-friendly.

Mobile (xs/sm):
- Stats stack 2-up.
- Filters in a Sheet.
- Table becomes a card list below `md`.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatTile | Local | derived | Simple label + value tile |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | Select | Atom | static | Status, priority, audience |
| 5 | DataTable | Pattern | `getAnnouncements()` | Manual table markup |
| 6 | StatusBadge | Atom | mapped | Map priority/status to StatusKey |
| 7 | Pagination | Molecule | cursor | xs fallback |
| 8 | EmptyState | Molecule | — | First-use and filtered-empty |
| 9 | ConfirmDialog | Dialog | — | Archive (soft delete) |

No new design-system components required.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Title | announcement.title | string | yes | — | read | public |
| Body | announcement.body | text | yes | — | read | public |
| Audience | announcement.audience | enum | yes | — | read | internal |
| Audience ref | announcement.audience_ref | string | no | — | read | internal |
| Priority | announcement.priority | enum | yes | — | read | internal |
| Status | announcement.status | enum | yes | — | read | internal |
| Publish at | announcement.publish_at | timestamptz | no | — | read | internal |
| Read count | len(announcement.read_by) | int | derived | — | read | internal |
| Total targeted | derived | int | derived | — | read | internal |

Read rate = read count / total targeted, displayed as a percentage with
its denominator. FR-10.6 applies: no rate without a base.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Create announcement | Primary | ADMIN, CHAPTER_LEADER | none | — | Navigate to ADM-080 | — | no |
| 2 | Row click | Row | as read | none | — | Navigate to performance | — | no |
| 3 | Edit draft | Row action | ADMIN, CHAPTER_LEADER (own) | none | — | Navigate to ADM-080 | — | no |
| 4 | Duplicate | Row action | ADMIN, CHAPTER_LEADER | none | `duplicateAnnouncement(id)` | Navigate to new draft | — | yes |
| 5 | Archive | Row action | ADMIN | ConfirmDialog | `archiveAnnouncement(id)` | Row hidden + toast | Toast error | yes |
| 6 | Export | Header | ADMIN | none | `exportAnnouncements(filters)` | CSV download | Toast error | yes |

## 9. States

| State | Design |
|---|---|
| Empty (first use) | "No announcements yet" + "Compose the first one" |
| Empty (filtered) | "No announcements match these filters" + "Clear filters" |
| Loading | Skeleton rows and stat tiles |
| Populated | Default render |
| Populated, extreme | 500 rows via pagination; longest title truncates with tooltip |
| Partial | Stats load, table error -> inline retry on table only |
| Error | error.tsx boundary + inline retry |
| Permission denied | "You don't have access to announcements." |
| Offline | Global offline banner (admin console is desktop-first) |
| Success | Toast on archive/duplicate |
| Destructive confirmation | Archive confirmation |

## 10. Validation & error handling

- **Editing a published announcement** -> row action not shown; instead
  a "Duplicate" action creates a new draft.
- **Archive with no reason** -> reason is optional; the confirm dialog
  text warns that archiving hides the announcement from all lists.
- **Export with no rows** -> button disabled, tooltip "Nothing to export."
- **Read rate when total targeted = 0** -> shows "—", never "0%".

Error codes: `ANNOUNCEMENT_NOT_FOUND`, `ANNOUNCEMENT_ARCHIVE_FAILED`,
`ANNOUNCEMENT_EXPORT_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table -> card list |
| sm >=640 | Stacked | Stats 2-up; filters inline |
| md >=768 | Table | Table returns; stats 4-up |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable column widths |

Touch targets >=44x44. No horizontal scroll.

## 12. Accessibility

- Heading structure: `h1` page, `h2` regions.
- Table uses `<caption>`, `<th scope="col">`, `aria-sort` on sortable
  headers.
- Status badges are text, not colour alone.
- Read rate cell includes a visually-hidden denominator for screen
  readers: "45 percent (9 of 20)".
- Focus returns to the acted-on row after archive/duplicate.

## 13. Performance

- Table page payload <= 40 KB for 25 rows.
- `useMemo` for filtered list; `useCallback` for handlers.
- Search debounced 300ms.
- Pagination default 25, max 100.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.announcements.list_viewed` | role, status_filter |
| `admin.announcements.filtered` | status, priority, audience, has_query |
| `admin.announcements.duplicated` | source_id |
| `admin.announcements.archived` | announcement_id |
| `admin.announcements.exported` | row_count |

## 15. Copy

- Page title: "Announcements"
- Subtitle: "Compose, schedule and review messages for members."
- Primary action: "New announcement"
- Secondary action: "Export"
- Stats labels: "Published this month", "Scheduled", "Drafts", "Average read rate"
- Filters: "All statuses", "All priorities", "All audiences"
- Status labels: Draft, Scheduled, Published, Expired
- Priority labels: Low, Medium, High
- Column headers: Title, Audience, Priority, Status, Published, Read rate, Actions
- Row actions: "Edit", "Duplicate", "Archive"
- Empty (first use): "No announcements yet" / "Compose the first one"
- Empty (filtered): "No announcements match these filters." / "Clear filters"
- Archive dialog: "Archive this announcement?" / "It will be hidden from all lists but retained for audit."
- Permission denied: "You don't have access to announcements."
- i18n keys: `admin.announcements.list.*`, `admin.announcements.priority.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Is "archive" a status transition or a separate flag? Proposed: separate flag `archived_at`, status becomes read-only. | Tech Lead |
| 2 | Should the list default to `status != DRAFT` or show drafts first? Proposed: all statuses, sorted by publish_at descending. | Product Lead |
| 3 | Is duplicate available for drafts, or only published? Proposed: both. | Product Lead |
| 4 | Does the chapter leader see organisation-wide announcements in their list, or only their own? Proposed: only their own. | Product Lead |
| 5 | What does "average read rate" average over? Proposed: published announcements in the last 90 days. | Product Lead |
| 6 | Can an admin export more than 1,000 rows in one go, or is it paginated? Proposed: server-side export, no cap. | Tech Lead |