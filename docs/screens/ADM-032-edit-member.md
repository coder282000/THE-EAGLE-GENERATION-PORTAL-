# Screen Spec: ADM-032 Edit Member

**Document ID:** D3.6-ADM-032
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-032
- **Route:** /admin/members/[id]/edit
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R1
- **Priority:** P1
- **Requirements:** FR-1.3, DPA-4

## 2. Purpose

Correct member record fields on the member's behalf. Every field edit is audited with before/after values.

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | Full |
| Others | 403 |

## 4. Entry and exit points

- Reached from: ADM-031 header "Edit" button
- Leads to: ADM-031 on save
- Deep-linkable: yes

## 5. Layout and regions

- PageHeader: back link, title "Edit member"
- Form: single column, grouped sections
- Sections: Identity (name, DOB, email, phone), Chapter, Tier, Pillars, Bio
- Footer: Cancel, Save changes
- Inline diff banner after save: "3 fields changed" with link to audit

## 6. Data

Editable: firstName, lastName, email, phone, tier, chapterCode, pillarInterest[], bio
Read-only: memberNumber, joinedAt, createdAt

## 7. Actions

| # | Action | Permission | Validation | API | Audited |
|---|--------|-----------|------------|-----|---------|
| 1 | Save | ADMIN, SUPER_ADMIN | required fields, email format | PATCH /admin/members/:id | yes (before/after) |
| 2 | Cancel | - | - | - | no |

## 8. States

- Loading: form skeleton
- Populated: pre-filled form
- Validation error: field-level messages
- Success: toast + redirect to ADM-031
- Error: banner with retry
- Permission denied: 403

## 9. Accessibility

- Each input has associated label, aria-describedby on error
- Error summary at top of form with role="alert" on submit

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Can a member's tier be manually overridden, or only changed through approval? | Product Lead | OPEN |
| 2 | Should email change trigger re-verification? | Tech Lead | OPEN |