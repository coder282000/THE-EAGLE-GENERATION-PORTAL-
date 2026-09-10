# Screen Spec: ADM-033 Suspend / Reinstate

**Document ID:** D3.6-ADM-033
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-033
- **Route:** Modal on ADM-031
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R1
- **Priority:** P1
- **Requirements:** FR-1.3

## 2. Purpose

Suspend a member (blocking access at the API) or reinstate them. Reason required. Member is notified.

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | Suspend, reinstate |
| Others | Not visible |

## 4. Entry and exit points

- Triggered from: ADM-031 header "Suspend" or "Reinstate" button
- On success: modal closes, ADM-031 status refreshes

## 5. Layout and regions

Modal:
- Title: "Suspend member?" / "Reinstate member?"
- Body: summary of member (name, member #, current status)
- Reason textarea (required for suspend, optional for reinstate)
- Warning: "Suspended members are denied at the API, not just in the UI. They cannot log in."
- Footer: Cancel, Suspend / Reinstate (destructive variant)

## 6. Data

- Input: reason (10-500 chars for suspend)
- Writes: member.status, member.statusReason, member.statusChangedAt

## 7. Actions

| # | Action | Permission | Confirmation | API | Audited |
|---|--------|-----------|--------------|-----|---------|
| 1 | Suspend | ADMIN, SUPER_ADMIN | inline modal | POST /admin/members/:id/suspend | yes |
| 2 | Reinstate | ADMIN, SUPER_ADMIN | inline modal | POST /admin/members/:id/reinstate | yes |

## 8. States

- Form idle
- Submitting: button spinner
- Success: toast, close modal
- Validation error: field highlight
- Error: banner inside modal

## 9. Accessibility

- Modal: role="dialog", aria-modal, focus trap, ESC closes, focus returns to trigger
- Destructive button last in tab order

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Does suspension cancel upcoming sessions and events automatically? | Product Lead | OPEN |