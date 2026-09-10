# Screen Spec: ADM-020 Review Queue

**Document ID:** D3.6-ADM-020
**Version:** 1.0.0
**Status:** Baselined
**Panel:** PNL-02

---

## 1. Identification

- **Screen ID:** ADM-020
- **Route:** `/admin/applications`
- **Layer:** Admin Console
- **Module:** Applications (Charter §16.1)
- **Release:** R1
- **Priority:** P0
- **Related requirements:** FR-1.3, J1

## 2. Purpose

The primary triage surface for membership applications. Admins filter, sort, bulk-act, and navigate to individual applications. This is the highest-traffic admin screen in the system.

## 3. Users & permissions

| Role | Access | Notes |
|------|--------|-------|
| ADMIN | Full | All applications |
| SUPER_ADMIN | Full | All applications |
| CHAPTER_LEADER | Scoped (read + note) | Own chapter only — enforced by RLS + app-layer |
| FINANCE_OFFICER | None | Redirect to 403 |

Scoping enforced in PostgreSQL RLS via `chapter_id = current_setting('app.user_chapter_id')`, plus an app-layer check. Defence in depth.

## 4. Entry & exit points

- **Reached from:** Sidebar "Applications"; PNL-01 dashboard queue widget; PNL-01 My Tasks; global command palette
- **Leads to:** ADM-021 (row click), ADM-025 (Bulk Import button), ADM-026 (Analytics button)
- **Deep-linkable:** yes. URL params: `?status=SUBMITTED&tier=STUDENT&chapter=KU&cursor=<opaque>`
- **Back behaviour:** browser back preserves filters via URL state

## 5. Layout & regions
+------------------------------------------------------------------+
| [Search input] [Status ▾] [Tier ▾] [Chapter ▾] [Views ▾] |
+------------------------------------------------------------------+
| 3 selected [Schedule] [Approve] [Reject] [Clear] | <- BulkActionBar (conditional)
+------------------------------------------------------------------+

Ref    Name / Email    Tier    Chapter    Status    ⋯
...    ...    ...    ...    ...    →
+------------------------------------------------------------------+                    
Showing 1-25 of 247 [« ‹ 1 2 3 … 10 › »]                    
+------------------------------------------------------------------+        

Regions:
1. **Header strip** — title "Applications", count, "Bulk Import" + "Analytics" CTAs
2. **FilterBar** — search input + 3 dropdowns + Saved Views dropdown + Refresh + Export
3. **BulkActionBar** — appears when ≥1 row selected
4. **DataTable** — sortable columns; row click opens ADM-021
5. **Pagination** — cursor-based

## 6. Components

| # | Component | Type | Source | Behaviour |
|---|-----------|------|--------|-----------|
| 1 | PageHeader | layout | — | Title, count, CTAs |
| 2 | SearchInput | atom | `components/ui/search-input` | Debounced 300ms |
| 3 | FilterBar | molecule | `components/ui/filter-bar` (new) | 3 dropdowns + saved views |
| 4 | BulkActionBar | molecule | `components/ui/bulk-action-bar` | Appears on selection |
| 5 | DataTable | organism | D3.1b Part 3 | Sortable, selectable, cursor-paginated |
| 6 | StatusBadge | atom | `components/admin/StatusBadge` | Colour per status |
| 7 | Pagination | molecule | `components/ui/pagination` | Cursor-based |
| 8 | EmptyState | atom | `components/admin/EmptyState` | No results |
| 9 | ConfirmDialog | molecule | `components/ui/confirm-dialog` | Bulk approve/reject |

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|-------|------------------|------|----------|------------|------------|-------------|
| Reference | `application.reference` | string | yes | — | view | internal |
| Full name | `application.name` | string | yes | — | view | PII |
| Email | `application.email` | string | yes | — | view | PII |
| Tier | `application.tier` | enum | yes | STUDENT/PROFESSIONAL/ASSOCIATE | view | internal |
| Chapter | `application.chapter` | string | yes | — | view | internal |
| Status | `application.status` | enum | yes | 9-state machine | view | internal |
| Submitted | `application.createdAt` | timestamp | yes | — | view | internal |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | API | Success | Failure | Audited |
|---|--------|---------|------------|--------------|-----|---------|---------|---------|
| 1 | Filter | Dropdown change | view | none | `GET /admin/applications` | refresh | error toast | no |
| 2 | Sort | Column click | view | none | client-side | refresh | — | no |
| 3 | Select row | Checkbox | view | none | — | BulkActionBar appears | — | no |
| 4 | Select all | Header checkbox | view | none | — | all visible selected | — | no |
| 5 | Bulk approve | BulkActionBar | ADMIN, SUPER_ADMIN | ConfirmDialog | `POST /admin/applications/bulk/approve` | toast + refresh | error toast | **yes** |
| 6 | Bulk reject | BulkActionBar | ADMIN, SUPER_ADMIN | ConfirmDialog + reason | `POST /admin/applications/bulk/reject` | toast + refresh | error toast | **yes** |
| 7 | Export CSV | FilterBar | ADMIN, SUPER_ADMIN, CHAPTER_LEADER | none | `GET /admin/applications/export` | download | error toast | **yes** |
| 8 | Open detail | Row click | view | none | — | navigate ADM-021 | — | no |
| 9 | Save view | Saved Views | view | prompt name | localStorage | saved | error | no |
| 10 | Refresh | FilterBar | view | none | `GET /admin/applications` | refresh | error toast | no |

## 9. States

| State | Handling |
|-------|----------|
| Empty (no filters) | EmptyState: "No applications yet. New ones appear here as they arrive." |
| Empty (with filters) | EmptyState: "No applications match your filters." + "Clear filters" button |
| Loading | Skeleton table rows (5 rows), skeleton header |
| Populated | Default |
| Populated, extreme | 10,000+ rows — cursor pagination, 25 per page; no virtualisation needed |
| Partial | Show populated rows + inline banner "Some data could not be loaded. Refresh to retry." |
| Error | Error boundary: reload + retry buttons |
| Permission denied | CHAPTER_LEADER without chapter assignment: 403 screen |
| Offline | Read-only cached view; writes queued with offline indicator |
| Success | Toast on bulk action |
| Destructive confirmation | ConfirmDialog on bulk approve/reject |

## 10. Validation & error handling

- Bulk actions require ≥1 row selected — BulkActionBar hidden otherwise
- Bulk reject requires reason ≥10 chars — confirmDisabled while invalid
- Export max 10,000 rows; beyond that, async job with email link
- Search debounced 300ms
- Filter combinations producing 0 results render EmptyState, not error

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| xs <640 | Card list | Each application renders as a card: Reference, Name, Status. Tap opens detail |
| sm 640-767 | Card list | Same, wider padding |
| md 768-1023 | Table | Full table, horizontal scroll if column count exceeds viewport |
| lg 1024+ | Table + filter row | Full layout, no scroll |
| xl 1280+ | Table + filter row + saved views | Full layout |

Rationale: Charter §21.2 — "Never horizontally scroll a data table on a phone."

## 12. Accessibility

- **Heading structure:** `<h1>` page title, `<h2>` for BulkActionBar region
- **Landmarks:** `<nav aria-label="Pagination">`, `<region aria-label="Bulk actions">`, `<table>` with `<caption class="sr-only">`
- **Focus order:** Search → Filters → Bulk actions (if visible) → Table header → Rows → Pagination
- **Keyboard:** Tab through; Space selects checkbox; Enter on row opens detail
- **ARIA:**
  - `aria-sort` on sortable column headers
  - `aria-selected` on selected rows
  - `aria-live="polite"` on "N selected" count
  - `aria-current="page"` on active pagination
- **Contrast:** all verified in Storybook a11y panel
- **Touch targets:** row height 44px at xs; checkboxes 44×44 hit area

## 13. Performance

- **Payload budget:** <150 KB gzipped initial
- **Pagination:** cursor-based, 25 default, max 100
- **Search:** debounced 300ms
- **Export:** streamed CSV, not buffered
- **Cache:** React Query caches page 1 for 30s; subsequent filters fetch fresh

## 14. Analytics

Events emitted:
- `applications_queue_viewed` (filterCount, resultCount)
- `applications_filtered` (filterKey, filterValue)
- `applications_bulk_action` (action, count)
- `applications_exported` (rowCount, filters)

## 15. Copy

- **Title:** "Applications"
- **Subtitle:** "Review and manage membership applications."
- **Empty (no filters):** "No applications yet. New ones appear here as they arrive."
- **Empty (filtered):** "No applications match your filters."
- **Bulk approve confirm:** "Approve {n} application{s}? Each applicant will receive a welcome email." — Confirm: "Approve {n}"
- **Bulk reject confirm:** "Reject {n} application{s}? Each applicant will be notified. This cannot be undone." — Confirm: "Reject {n}"
- **Reject reason label:** "Internal reason (not shared)"
- **Success toasts:**
  - `{n} application{s} approved. Welcome email{s} sent.`
  - `{n} application{s} rejected. Notifications sent.`
- **Error:** "Something went wrong. Try again in a moment."
- **i18n keys:** `applications.queue.title`, `applications.queue.empty.*`, `applications.bulk.approve.confirm`, etc.

## 16. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should CHAPTER_LEADER see own-chapter queue from SUBMITTED, or only after admin triage? | Product Lead | OPEN — defaulting to full own-chapter visibility |
| 2 | Bulk approve four-eyes? | Compliance Lead | RESOLVED — no (single admin, audited) |
| 3 | Saved views: per-user or shared? | Product Lead | OPEN — defaulting per-user (localStorage) |