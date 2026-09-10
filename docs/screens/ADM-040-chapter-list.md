# Screen Spec: ADM-040 Chapter List

**Document ID:** D3.6-ADM-040
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-04 Chapters

## 1. Identification

- **Screen ID:** ADM-040
- **Route:** /admin/chapters
- **Layer:** Admin Console
- **Module:** Chapters
- **Release:** R1
- **Priority:** P0
- **Requirements:** FR-2.1, FR-2.5, FR-10.4

## 2. Purpose

Browse all chapters with type, region, member count and current leader. Entry point to chapter detail, edit, and leader assignment.

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | All chapters |
| CHAPTER_LEADER | Own chapter only (RLS) |
| FINANCE_OFFICER | Read-only |

## 4. Entry and exit points

- Reached from: sidebar "Chapters", PNL-01 stats
- Leads to: ADM-041 (detail), ADM-042 (create), ADM-045 (institutions)
- Deep-linkable: yes. Query params: type, region, search

## 5. Layout and regions

- PageHeader: title, total count, "New chapter" button (ADMIN+)
- FilterBar: SearchInput, type dropdown (CAMPUS / PROFESSIONAL), region dropdown
- DataTable columns: code (mono), name, type badge, region, members (count), leader, action
- Pagination: 25 rows per page
- Empty state: "No chapters match your filters."

## 6. Data

- Entity: Chapter
- Display: code, name, type, location, memberCount, leader
- Derived: member count from mockMembers filtered by chapter code
- Scoping: CHAPTER_LEADER RLS filters to own chapterCode

## 7. Actions

| # | Action | Permission | Confirmation | API | Audited |
|---|--------|-----------|--------------|-----|---------|
| 1 | Filter | view | none | GET /admin/chapters | no |
| 2 | New chapter | ADMIN, SUPER_ADMIN | none | - | no |
| 3 | Row click | view | none | - | no |
| 4 | Export | ADMIN, SUPER_ADMIN | none | GET /admin/chapters/export | yes |

## 8. States

- Empty: guidance + New chapter CTA
- Loading: skeleton rows
- Populated: default
- Error: retry card
- Permission denied: 403 card

## 9. Accessibility

- Table uses <caption class="sr-only">, sortable column aria-sort
- Type badges have aria-label with full text
- Row click keyboard-focusable with role="link"

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Region taxonomy — free text or enum? | Product Lead | OPEN |
| 2 | Show soft-deleted chapters with a filter? | Product Lead | OPEN |