# Screen Spec: ADM-037 Segments and Saved Cohorts

**Document ID:** D3.6-ADM-037
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-037
- **Route:** /admin/members/segments
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R2
- **Priority:** P2
- **Requirements:** FR-10.1

## 2. Purpose

Define and save reusable member segments for comms targeting and analytics. A segment is a named set of filter rules.

## 3. Users and permissions

| Role | Access |
|------|------|
| ADMIN, SUPER_ADMIN | Full |
| CHAPTER_LEADER | Own segments only |
| Others | 403 |

## 4. Entry and exit points

- Reached from: sidebar, ADM-030 "Save as segment"
- Leads to: PNL-07 Communications (as audience), PNL-17 Analytics

## 5. Layout and regions

- PageHeader: title, "New segment"
- Segments list: name, definition summary, member count, last used, actions (Edit, Duplicate, Delete)
- New/edit segment: rule builder (field, operator, value) + name + description

## 6. Data

- Segment: id, name, description, rules[], createdBy, createdAt, lastUsedAt
- Rule: field, operator (eq, neq, in, gt, lt, contains), value
- Rule fields: status, tier, chapterCode, pillarInterest, joinedAt, lastActiveAt

## 7. Actions

| # | Action | Permission | API | Audited |
|---|--------|-----------|-----|---------|
| 1 | Create | ADMIN, SUPER_ADMIN, CHAPTER_LEADER | POST /admin/members/segments | yes |
| 2 | Edit | owner or ADMIN | PATCH /admin/members/segments/:id | yes |
| 3 | Duplicate | ADMIN, SUPER_ADMIN | POST /admin/members/segments/:id/duplicate | yes |
| 4 | Delete | owner or ADMIN | DELETE /admin/members/segments/:id | yes |

## 8. States

- Empty: "No segments yet. Create one to target comms."
- Loading: list skeleton
- Populated: default
- Error: banner
- Permission denied: 403

## 9. Accessibility

- Rule builder: field/operator/value are labelled selects
- Duplicate names: inline validation

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Can segments be shared across admins? | Product Lead | OPEN |
| 2 | Max rules per segment? | Tech Lead | OPEN |