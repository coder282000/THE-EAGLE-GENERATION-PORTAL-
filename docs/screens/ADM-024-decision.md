# Screen Spec: ADM-024 Decision

**Document ID:** D3.6-ADM-024
**Version:** 1.0.0
**Status:** Baselined
**Panel:** PNL-02

---

## 1. Identification

- **Screen ID:** ADM-024
- **Route:** `/admin/applications/[id]/decide`
- **Layer:** Admin Console
- **Module:** Applications
- **Release:** R1
- **Priority:** P0
- **Related requirements:** FR-1.5, J1

## 2. Purpose

Final decision on an application. Approving generates an immutable member number and creates the user account. Rejecting sends a courteous notification without reason.

## 3. Users & permissions

| Role | Access | Notes |
|------|--------|-------|
| ADMIN | Full | — |
| SUPER_ADMIN | Full | — |
| CHAPTER_LEADER | None | 403 |
| FINANCE_OFFICER | None | 403 |

## 4. Entry & exit points

- **Reached from:** ADM-021 "Decide" button (visible when status = INTERVIEWED)
- **Leads to:** ADM-020 on success; ADM-021 if cancelled
- **Deep-linkable:** no

## 5. Layout & regions
+------------------------------------------------------------------+
| ← Back to application |
+------------------------------------------------------------------+
| |
| Decide on Dennis Kimani |
| |
| +---------------------------+ +-----------------------------+ |
| | (•) Approve | | ( ) Reject | |
| +---------------------------+ +-----------------------------+ |
| |
| -- Approve panel (default) -- |
| Chapter * |
| [ Kenyatta University (KU) ▾ ] |
| |
| Member number preview |
| [ TEG-26-KU-____ ] |
| Hint: Sequence assigned at confirmation time |
| |
| -- Reject panel (when selected) -- |
| Internal reason * (not shared with applicant) |
| [ ... ]|
| |
+------------------------------------------------------------------+
| [Cancel] [Confirm decision] |
+------------------------------------------------------------------+

## 6. Components

| # | Component | Source | Behaviour |
|---|-----------|--------|-----------|
| 1 | PageHeader | — | Back + title |
| 2 | DecisionToggle | new | Radio: Approve / Reject |
| 3 | Select | `components/select` | Chapter assignment |
| 4 | Textarea | `components/textarea` | Rejection reason |
| 5 | ConfirmDialog | `components/ui/confirm-dialog` | Final confirmation |
| 6 | Button | `components/button` | Cancel, Confirm |
| 7 | FormField | `components/ui/form-field` | Wraps fields |

## 7. Data

| Field | Type | Required | Validation | Sensitivity |
|-------|------|----------|------------|-------------|
| Decision type | enum | yes | APPROVE / REJECT | internal |
| Chapter | uuid | yes (approve) | must be active | internal |
| Member number | string | auto | format TEG-{YY}-{CH}-{SEQ} | internal |
| Rejection reason | text | yes (reject) | min 10, max 500 | internal |

## 8. Actions

| # | Action | Permission | Confirmation | API | Success | Audited |
|---|--------|------------|--------------|-----|---------|---------|
| 1 | Approve | ADMIN, SUPER_ADMIN | ConfirmDialog | `POST /admin/applications/:id/decide {APPROVE}` | member created, welcome email, redirect ADM-020 | yes |
| 2 | Reject | ADMIN, SUPER_ADMIN | ConfirmDialog + reason | `POST /admin/applications/:id/decide {REJECT, reason}` | notification sent, redirect ADM-020 | yes |
| 3 | Cancel | — | none | — | navigate back | no |

## 9. States

| State | Handling |
|-------|----------|
| Loading | Skeleton |
| Populated | Default; Approve selected |
| Error | Inline field errors |
| Permission denied | 403 |
| Offline | Form disabled |
| Success | Toast "Approved. Welcome email sent to {email}." |
| Destructive confirmation | ConfirmDialog for both approve and reject |

## 10. Validation

- Approval requires chapter selection
- Rejection requires reason, min 10 chars
- Cannot approve if interview outcome not recorded (unless SUPER_ADMIN override, audited)
- Cannot decide on LAPSED, WITHDRAWN, or already-decided applications (server-side guard)

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| xs | Single column | Decision toggle top, panel below |
| md+ | Two column | Toggle left, panel right |

## 12. Accessibility

- Decision toggle: `role="radiogroup"`, arrow-key navigation
- ConfirmDialog: focus on Cancel button initially
- Member number preview: `aria-live="polite"` so SR announces changes
- Rejection reason: `aria-required="true"`, error announced

## 13. Performance

- Payload: <70 KB
- Member number preview via lightweight debounced API call

## 14. Analytics

- `application_approved` (applicationId, chapterId)
- `application_rejected` (applicationId, reasonLength)

## 15. Copy

- **Title:** "Decide on {name}"
- **Approve panel:**
  - "Chapter" label with hint "Applicant will be assigned here"
  - "Member number preview" — "TEG-{YY}-{CH}-{SEQ}"
  - Hint: "Final sequence assigned on confirmation"
- **Reject panel:**
  - "Internal reason (not shared)" — required, min 10 chars
  - Hint: "Explain the decision for the record. The applicant will not see this."
- **Approve confirm:** "Approve {name}? Member number will be issued and a welcome email sent." — "Approve"
- **Reject confirm:** "Reject {name}? The applicant will be notified without reason." — "Reject"
- **Success:** "Approved. Welcome email sent to {email}." / "Rejected. Notification sent."

## 16. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Require four-eyes (second admin) for approval? | Compliance Lead | RESOLVED — no, single admin, audited |
| 2 | Preview member number before confirm? | Product Lead | RESOLVED — yes, with `{SEQ}` placeholder |