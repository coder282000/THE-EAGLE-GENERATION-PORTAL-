# Screen Spec: ADM-036 Impersonate (Support)

**Document ID:** D3.6-ADM-036
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-036
- **Route:** Modal on ADM-031
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R2
- **Priority:** P2 (heavily audited)
- **Requirements:** FR-1.3, security section 22

## 2. Purpose

Allow SUPER_ADMIN to view the platform as a member for support. Time-boxed, consent-gated, heavily audited.

## 3. Users and permissions

| Role | Access |
|------|--------|
| SUPER_ADMIN | Full |
| Others | Not visible |

## 4. Entry and exit points

- Triggered from: ADM-031 header "Impersonate"
- On success: banner appears on every page, "Viewing as [name]"
- Exit: click "End impersonation" in banner

## 5. Layout and regions

Modal:
- Title: "Impersonate [name]?"
- Consent checkbox: "I confirm the member has been notified and consented to this support session."
- Duration selector: 15 / 30 / 60 min
- Reason textarea (required)
- Warning: "Every action taken while impersonating is logged against your admin account, not the member's. Read-only mode is enforced."
- Footer: Cancel, Start session

## 6. Data

- Session writes: impersonation_session with actor, target, startedAt, expiresAt, reason
- Banner component: globally mounted on any page during session

## 7. Actions

| # | Action | Permission | Confirmation | API | Audited |
|---|--------|-----------|--------------|-----|---------|
| 1 | Start | SUPER_ADMIN | consent checkbox + reason | POST /admin/users/:id/impersonate | yes |
| 2 | End | SUPER_ADMIN | none | POST /admin/impersonate/end | yes |
| 3 | Auto-expire | system | - | - | yes |

## 8. States

- Modal idle
- Active session: banner
- Expired: banner disappears, toast "Impersonation session ended"
- Error: modal banner

## 9. Accessibility

- Banner: aria-live="assertive" when session starts
- Modal: focus trap, ESC blocked (must click End)

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Read-only enforced or full impersonation? | Compliance Lead | RESOLVED - read-only |
| 2 | Consent recorded how? | Compliance Lead | OPEN |