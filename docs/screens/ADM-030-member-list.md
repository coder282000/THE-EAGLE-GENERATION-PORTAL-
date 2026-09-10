# Screen Spec: ADM-030 Member List

**Document ID:** D3.6-ADM-030
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-030
- **Route:** /admin/members
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R1
- **Priority:** P0
- **Requirements:** FR-1.3, FR-10.1
- **RTM:** FR-1.3 -> ADM-030 -> T-030

## 2. Purpose

Browse, filter, segment and export the full member list. Entry point to every other member action (detail, edit, suspend, roles, merge, impersonate).

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN | Full |
| SUPER_ADMIN | Full |
| CHAPTER_LEADER | Own-chapter roster only (RLS-scoped) |
| FINANCE_OFFICER | Read-only |
| Others | 403 |

## 4. Entry and exit points

- Reached from: sidebar "Members", PNL-01 dashboard stat card
- Leads to: ADM-031 (detail), ADM-037 (segments)
- Deep-linkable: yes. Query params: status, tier, chapter, pillar, search, cursor

## 5. Layout and regions

- PageHeader: title, total count, "Add member" (ADMIN+), "Export CSV"
- FilterBar: SearchInput, status dropdown, tier dropdown, chapter dropdown, pillar dropdown
- BulkActionBar (conditional on selection): Suspend, Assign to chapter, Export
- DataTable: name, member #, tier, chapter, status, joined
- Pagination: cursor-based, 25 per page
- Row click: navigate to ADM-031

## 6. Data

- Entity: Member (see components/mock/data.ts:80)
- Display: memberNumber, firstName, lastName, email, tier, chapter, status, joinedAt
- Scoping: CHAPTER_LEADER filtered by chapterCode (RLS simulation)

## 7. Actions

| # | Action | Permission | Confirmation | API | Audited |
|---|--------|-----------|--------------|-----|---------|
| 1 | Filter | view | none | GET /admin/members | no |
| 2 | Export CSV | ADMIN, SUPER_ADMIN | none | GET /admin/members/export | yes |
| 3 | Bulk suspend | ADMIN, SUPER_ADMIN | ConfirmDialog | POST /admin/members/bulk-suspend | yes |
| 4 | Row click | view | none | - | no |

## 8. States

- Empty: "No members match your filters."
- Loading: skeleton rows
- Populated: default
- Error: retry card
- Permission denied: 403 card
- Partial: some rows missing optional data render with "-"

## 9. Accessibility

- Table uses <caption class="sr-only">, aria-sort on sortable columns
- Row click: keyboard-focusable row with role="link"
- BulkActionBar announces via aria-live="polite"

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Add chapterCode to Member interface? | Tech Lead | RESOLVED - yes |
| 2 | Row click vs checkbox: split affordance? | Product Lead | OPEN |