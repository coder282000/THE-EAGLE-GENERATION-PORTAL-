# Screen Spec: ADM-041 Chapter Detail and Roster

**Document ID:** D3.6-ADM-041
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-04 Chapters

## 1. Identification

- **Screen ID:** ADM-041
- **Route:** /admin/chapters/[code]
- **Layer:** Admin Console
- **Module:** Chapters
- **Release:** R1
- **Priority:** P0
- **Requirements:** FR-2.3, FR-2.5

## 2. Purpose

Chapter overview with roster, leader, stats and quick actions. Hub for chapter-scoped administration.

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | Full |
| CHAPTER_LEADER | Own chapter only |
| FINANCE_OFFICER | Read-only |

## 4. Entry and exit points

- Reached from: ADM-040 row click
- Leads to: ADM-042 (edit), ADM-043 (leaders), ADM-044 (performance), ADM-031 (member detail)
- Deep-linkable: yes

## 5. Layout and regions

- Header: chapter name, code badge, type badge, Edit / Assign leader / Performance buttons
- Stats row: members, active events, learning completion avg, join rate last 90 days
- Tabs:
  - Overview — description, location, leader card, MOU institution (if any)
  - Roster — sortable table of members (name, member #, tier, status, joined)
  - Activity — chapter-scoped activity feed
- Footer: soft delete button (destructive, ADMIN only)

## 6. Data

- Entity: Chapter
- Roster: getMembers({ chapterCode: chapter.code })
- Activity: mockChapterActivity filtered by chapterCode

## 7. Actions

| # | Action | Permission | API | Audited |
|---|--------|-----------|-----|---------|
| 1 | Edit chapter | ADMIN, SUPER_ADMIN | PATCH /admin/chapters/:code | yes |
| 2 | Assign leaders | ADMIN, SUPER_ADMIN | - | no |
| 3 | View performance | view | - | no |
| 4 | Soft delete | ADMIN, SUPER_ADMIN | DELETE /admin/chapters/:code | yes |

## 8. States

- Loading: skeleton tabs
- Populated: default
- Empty roster: "No members assigned yet."
- Not found: 404 card
- Permission denied: 403 for CHAPTER_LEADER viewing another chapter

## 9. Accessibility

- Tabs: role="tablist", arrow-key navigation
- Roster table: aria-sort on sortable columns

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Can CHAPTER_LEADER edit their own chapter description? | Product Lead | OPEN |
| 2 | Chapter deletion — immediate or scheduled? | Product Lead | OPEN