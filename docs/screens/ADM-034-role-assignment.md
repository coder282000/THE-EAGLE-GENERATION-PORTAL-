# Screen Spec: ADM-034 Role Assignment

**Document ID:** D3.6-ADM-034
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-034
- **Route:** /admin/members/[id]/roles
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R1
- **Priority:** P0 (security-relevant)
- **Requirements:** FR-1.9, section 12.2

## 2. Purpose

Assign or revoke roles on a member. SUPER_ADMIN only. Every change audited.

## 3. Users and permissions

| Role | Access |
|------|--------|
| SUPER_ADMIN | Full |
| ADMIN | Read-only |
| Others | 403 |

## 4. Entry and exit points

- Reached from: ADM-031 header "Roles" button, or PNL-01
- Leads to: ADM-031 on save

## 5. Layout and regions

- PageHeader: member name, member #
- Current roles list with revoke buttons
- Available roles list with assign buttons
- Warning banner: "Role changes take effect on next request. The user must re-authenticate for MFA changes."
- Footer: Done

## 6. Data

- Roles (8): GUEST, MEMBER, MENTOR, CIRCLE_LEADER, CHAPTER_LEADER, FINANCE_OFFICER, ADMIN, SUPER_ADMIN
- Rules: cannot revoke own SUPER_ADMIN; must have at least one role

## 7. Actions

| # | Action | Permission | API | Audited |
|---|--------|-----------|-----|---------|
| 1 | Assign role | SUPER_ADMIN | POST /admin/users/:id/roles | yes |
| 2 | Revoke role | SUPER_ADMIN | DELETE /admin/users/:id/roles/:role | yes |

## 8. States

- Loading: skeleton rows
- Populated: current + available
- Empty: "This member has no roles." (should not happen)
- Error: banner
- Permission denied: 403 for non-SUPER_ADMIN

## 9. Accessibility

- Role rows use aria-label with full role name and status
- Confirm dialog announces role name

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Force-logout on privilege change? | Tech Lead | OPEN |