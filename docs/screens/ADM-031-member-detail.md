# Screen Spec: ADM-031 Member Detail (360 view)

**Document ID:** D3.6-ADM-031
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-031
- **Route:** /admin/members/[id]
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R1
- **Priority:** P0
- **Requirements:** FR-1.3, FR-10.1

## 2. Purpose

Single-page 360 view of a member: profile, chapter, learning, orders, financial, activity, audit. Hub for all member actions.

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | Full |
| CHAPTER_LEADER | Own-chapter members only |
| FINANCE_OFFICER | Read-only (financial tabs emphasised) |
| Others | 403 |

## 4. Entry and exit points

- Reached from: ADM-030 row, PNL-01 search, PNL-01 dashboard activity
- Leads to: ADM-032 (edit), ADM-033 (suspend), ADM-034 (roles), ADM-035 (merge), ADM-036 (impersonate), audit explorer (ADM-221)
- Deep-linkable: yes

## 5. Layout and regions

- Header: avatar, name, member #, tier badge, status badge, action buttons (Edit, Suspend, Roles, Impersonate)
- Tabs: Overview, Chapter, Learning, Orders, Financial, Activity, Audit
- Overview tab: profile fields, pillar interests, bio
- Chapter tab: current chapter, chapter history, roles held
- Learning tab: enrolments, progress, certificates
- Orders tab: order history, giving history
- Financial tab: transaction list (gated on FINANCE_OFFICER/SUPER_ADMIN)
- Activity tab: feed posts, comments, mentorship sessions
- Audit tab: filterable audit log for this entity (uses AuditTrail)

## 6. Data

- Entity: Member
- Aggregations: from mock enrolments, orders, transactions, audit log
- PII: dateOfBirth, phone, email (field-level encrypted at rest; masked in some views)

## 7. Actions

| # | Action | Permission | API | Audited |
|---|--------|-----------|-----|---------|
| 1 | Edit | ADMIN, SUPER_ADMIN | PATCH /admin/members/:id | yes |
| 2 | Suspend | ADMIN, SUPER_ADMIN | POST /admin/members/:id/suspend | yes |
| 3 | Assign roles | SUPER_ADMIN | POST /admin/users/:id/roles | yes |
| 4 | Impersonate | SUPER_ADMIN | POST /admin/users/:id/impersonate | yes |
| 5 | View audit | ADMIN | GET /admin/audit?entity=member&id=:id | no |

## 8. States

- Loading: skeleton tabs
- Populated: default
- Empty tabs: "No learning activity yet."
- Permission denied: individual tabs hide when role lacks access
- Not found: card with back link

## 9. Accessibility

- Tabs use role="tablist" with arrow-key navigation
- Avatar alt: "Avatar of [name]"
- Status badges have aria-label with full text

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Financial tab visible to FINANCE_OFFICER only or also ADMIN? | Product Lead | OPEN |
| 2 | Impersonate consent model? | Compliance Lead | OPEN |