# Screen Spec: ADM-042 Create / Edit Chapter

**Document ID:** D3.6-ADM-042
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-04 Chapters

## 1. Identification

- **Screen ID:** ADM-042
- **Route:** /admin/chapters/new, /admin/chapters/[code]/edit
- **Layer:** Admin Console
- **Module:** Chapters
- **Release:** R1
- **Priority:** P0
- **Requirements:** FR-2.1

## 2. Purpose

Create a new chapter or edit an existing one. Chapter code is immutable after creation because it is embedded in member numbers (e.g. TEG-26-KU-0042).

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | Full |
| CHAPTER_LEADER | None |
| Others | 403 |

## 4. Entry and exit points

- Reached from: ADM-040 "New chapter", ADM-041 "Edit"
- Leads to: ADM-041 on save
- Deep-linkable: yes

## 5. Layout and regions

- PageHeader: back link, title
- Form sections: Identity, Location, Type, Description
  - Identity: code (disabled in edit mode), name
  - Location: region, country, city
  - Type: CAMPUS | PROFESSIONAL | REGIONAL (radio)
  - Description: textarea, max 500
- Footer: Cancel, Save
- Edit mode: audit notice "Every field change is logged"

## 6. Data

- Editable (create): code, name, type, region, country, city, description
- Editable (edit): all except code
- Read-only (edit): code, memberCount, createdAt
- Validation: code unique, uppercase, 2-12 chars, alphanumeric + hyphens; name required; region required

## 7. Actions

| # | Action | Permission | Validation | API | Audited |
|---|--------|-----------|------------|-----|---------|
| 1 | Save | ADMIN, SUPER_ADMIN | see §6 | POST /admin/chapters or PATCH /admin/chapters/:code | yes |

## 8. States

- Loading: form skeleton
- Populated (edit): prefilled
- Validation error: inline + error summary
- Success: toast, redirect to ADM-041
- Conflict: "Chapter code already exists" (create only)
- Permission denied: 403

## 9. Accessibility

- Each input labelled, aria-describedby on error
- Error summary role="alert" at form top on submit
- Code field has aria-describedby explaining immutability

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Who can create chapters — ADMIN or SUPER_ADMIN only? | Product Lead | OPEN |