# Screen Spec: ADM-043 Assign Chapter Leaders

**Document ID:** D3.6-ADM-043
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-04 Chapters

## 1. Identification

- **Screen ID:** ADM-043
- **Route:** /admin/chapters/[code]/leaders
- **Layer:** Admin Console
- **Module:** Chapters
- **Release:** R1
- **Priority:** P0
- **Requirements:** FR-2.2

## 2. Purpose

Assign one or more members as chapter leaders. The member gains CHAPTER_LEADER role (if not held), scoped to this chapter.

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | Full |
| Others | 403 |

## 4. Entry and exit points

- Reached from: ADM-041 "Assign leader"
- Leads to: ADM-041 on save
- Deep-linkable: yes

## 5. Layout and regions

- PageHeader: chapter name, back link
- Current leaders list: name, member #, since date, Remove button
- Add leader section: SearchInput over all members, dropdown results, select
- Warning: "Removing the last leader leaves the chapter unmanaged."
- Footer: Done

## 6. Data

- Entity: Chapter, Member
- Writes: chapter.leaders[] (multi), member roles += CHAPTER_LEADER
- Constraint: member must be active; must not already be a leader of another chapter (unless explicitly allowed)

## 7. Actions

| # | Action | Permission | API | Audited |
|---|--------|-----------|-----|---------|
| 1 | Add leader | ADMIN, SUPER_ADMIN | POST /admin/chapters/:code/leaders | yes |
| 2 | Remove leader | ADMIN, SUPER_ADMIN | DELETE /admin/chapters/:code/leaders/:memberId | yes |

## 8. States

- Loading: skeleton
- Populated: leaders + search
- Empty: "No leaders assigned. Assign at least one."
- Error: banner
- Warn on removing last leader

## 9. Accessibility

- Search results: aria-live="polite" as they update
- Each current leader row: labelled Remove button

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Max leaders per chapter? | Product Lead | OPEN |
| 2 | Auto-remove CHAPTER_LEADER role when unassigned? | Tech Lead | OPEN |