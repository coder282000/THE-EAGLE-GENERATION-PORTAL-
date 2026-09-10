# Screen Spec: ADM-021 Application Detail

**Document ID:** D3.6-ADM-021
**Version:** 1.0.0
**Status:** Baselined
**Panel:** PNL-02

---

## 1. Identification

- **Screen ID:** ADM-021
- **Route:** `/admin/applications/[id]`
- **Layer:** Admin Console
- **Module:** Applications (Charter §16.1)
- **Release:** R1
- **Priority:** P0
- **Related requirements:** FR-1.2, FR-1.3, FR-1.4, FR-1.5, J1

## 2. Purpose

Full submission view with history, notes, and decision controls. The workspace where an admin takes an application from SUBMITTED to APPROVED or REJECTED.

## 3. Users & permissions

| Role | Access | Notes |
|------|--------|-------|
| ADMIN | Full | All applications |
| SUPER_ADMIN | Full | All applications + reversal |
| CHAPTER_LEADER | Scoped (read + note) | Own chapter only |
| FINANCE_OFFICER | None | 403 |

## 4. Entry & exit points

- **Reached from:** ADM-020 row click; PNL-01 My Tasks; command palette
- **Leads to:** ADM-022 (schedule), ADM-023 (record outcome), ADM-024 (decide), back to ADM-020
- **Deep-linkable:** yes. URL: `/admin/applications/[id]` where `[id]` is the application UUID

## 5. Layout & regions
+------------------------------------------------------------------+
| ← Back APP-26-100004 [Status: Interviewed] [Schedule] [Decide] |
+------------------------------------------------------------------+
| | |
| Personal details | [Status Stepper] |
| First name: Dennis | |
| Last name: Kimani | Submitted |
| Email: dennis.k@example.com | Under review |
| Phone: +254 712 345 004 | Interview scheduled |
| Date of birth: 2003-07-15 | ● Interviewed |
| | Approved |
| Chapter & pillar | |
| Chapter: Kenyatta University (KU) | Metadata |
| Pillar interest: Governance | Submitted: 4d ago |
| | Expires: 70d |
| Motivation | |
| Interested in policy and civic... | Audit trail |
| | ... (last 5) |
| Interview | |
| Scheduled: 3d ago | Internal notes |
| Notes: Strong communicator... | [Add note] |
| Outcome: Yes (4/5) | |
+------------------------------------------------------------------+

Regions:
1. **Header** — back link, reference, status badge, primary action buttons
2. **Left column (2/3)** — DetailSections: Personal, Chapter & Pillar, Motivation, Interview
3. **Right column (1/3)** — ApplicationStatusStepper, metadata, AuditTrail (last 5), NotesPanel

## 6. Components

| # | Component | Type | Source | Behaviour |
|---|-----------|------|--------|-----------|
| 1 | PageHeader | layout | — | Back, reference, status, actions |
| 2 | ApplicationStatusStepper | organism | PNL-02 new | 9-status visual state machine |
| 3 | DetailSection | molecule | new | Titled section with fields |
| 4 | StatusBadge | atom | `components/admin` | Colour per status |
| 5 | AuditTrail | molecule | new | Timeline, last 5 entries |
| 6 | NotesPanel | molecule | new | Notes list + add form |
| 7 | ConfirmDialog | molecule | `components/ui/confirm-dialog` | Approve/reject/withdraw |
| 8 | Button | atom | `components/button` | Actions |
| 9 | Toast | molecule | `components/ui/toast` | Success feedback |

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|-------|------------------|------|----------|------------|------------|-------------|
| Reference | `application.reference` | string | yes | — | view | internal |
| First name | `application.firstName` | string | yes | — | view | PII |
| Last name | `application.lastName` | string | yes | — | view | PII |
| Email | `application.email` | string | yes | email | view | PII |
| Phone | `application.phone` | string | no | E.164 | view | PII |
| DOB | `application.dateOfBirth` | date | yes | age >=18 | view | PII |
| Tier | `application.tier` | enum | yes | — | view | internal |
| Chapter | `application.chapter` | string | yes | — | view | internal |
| Pillar interest | `application.pillarInterest` | enum[] | yes | 1-3 items | view | internal |
| Motivation | `application.motivation` | text | yes | max 2000 | view | PII-adjacent |
| Referral source | `application.referralSource` | string | no | — | view | internal |
| Interview at | `application.interviewAt` | timestamp | no | future | view | internal |
| Interview notes | `application.interviewNotes` | text | no | — | view | PII-adjacent |
| Outcome | `application.outcome` | object | no | — | view | internal |
| Status | `application.status` | enum | yes | — | view | internal |
| Decision reason | `application.decisionReason` | text | conditional | required for REJECTED | view | internal |
| Created | `application.createdAt` | timestamp | yes | — | view | internal |
| Expires | `application.expiresAt` | timestamp | yes | — | view | internal |
| Notes | `applicationNotes[appId]` | array | no | — | view + add | internal |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | API | Success | Failure | Audited |
|---|--------|---------|------------|--------------|-----|---------|---------|---------|
| 1 | Schedule interview | Header button | ADMIN, SUPER_ADMIN | none (opens ADM-022) | — | navigate | — | no |
| 2 | Record outcome | Header button | ADMIN, SUPER_ADMIN | none (opens ADM-023) | — | navigate | — | no |
| 3 | Decide | Header button | ADMIN, SUPER_ADMIN | opens ADM-024 | — | navigate | — | no |
| 4 | Add note | NotesPanel | view | none | `POST /admin/applications/:id/notes` | note appended | error | **yes** |
| 5 | Withdraw | Header overflow | ADMIN, SUPER_ADMIN | ConfirmDialog | `POST /admin/applications/:id/withdraw` | status → WITHDRAWN | error | **yes** |
| 6 | Reverse decision | Header overflow | SUPER_ADMIN only | ConfirmDialog + reason | `POST /admin/applications/:id/reopen` | status → UNDER_REVIEW | error | **yes** |

## 9. States

| State | Handling |
|-------|----------|
| Empty | N/A (always has data) |
| Loading | Skeleton header + 2-column skeleton |
| Populated | Default |
| Populated, extreme | Long motivation text (>500 chars) collapsible with "Show more" |
| Partial | Missing optional fields render "Not provided" |
| Error | Error boundary |
| Permission denied | 403 screen with back-to-queue link |
| Offline | Read-only; note input disabled with tooltip |
| Success | Toast on state transition |
| Destructive confirmation | ConfirmDialog for withdraw / reverse |

## 10. Validation & error handling

- Add note: minimum 1 char, max 2000 chars
- Withdraw: reason optional (internal)
- Reverse decision: reason required, min 20 chars
- Actions hidden if precondition unmet (e.g. "Record outcome" hidden if status != INTERVIEW_SCHEDULED)
- Interview date read-only here; editable via ADM-022

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| xs <640 | Single column | Stepper first, sections stacked, notes collapsed by default |
| sm 640-767 | Single column | Same |
| md 768-1023 | Two column (1/3 + 2/3) | Stepper + metadata right |
| lg 1024+ | Two column | Same as md, wider |
| xl 1280+ | Two column | Sticky right column |

## 12. Accessibility

- **Headings:** `<h1>` reference, `<h2>` for each DetailSection
- **Landmarks:** `<main>`, `<aside aria-label="Application status and history">`
- **Focus order:** Back → Header actions → Left sections → Right (Stepper → Audit → Notes)
- **Stepper:** `aria-current="step"` on active step, `role="list"`
- **Status badge:** text carries meaning — colour is secondary
- **Notes:** each note has `role="article"` with `aria-label` "Note from {author} on {date}"
- **Focus management:** after adding a note, focus returns to the note input

## 13. Performance

- **Payload budget:** <120 KB gzipped
- **Audit trail:** lazy-load full list on "Show all"
- **Notes:** paginate after 20, infinite scroll below

## 14. Analytics

- `application_detail_viewed` (id, status)
- `application_note_added` (id)
- `application_action_initiated` (action: withdraw | reopen)

## 15. Copy

- **Title:** "Application {reference}"
- **Sections:** "Personal details", "Chapter & pillar", "Motivation", "Interview", "Internal notes"
- **Missing field:** "Not provided"
- **Withdraw confirm:** "Withdraw this application? The applicant will be notified."
- **Reopen confirm:** "Reopen this application? It will return to Under review. The applicant will not be notified."
- **Success:** "Application withdrawn." / "Application reopened."
- **i18n keys:** `applications.detail.*`

## 16. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Can rejection be reversed? | Product Lead | RESOLVED — yes, SUPER_ADMIN, 30 days |
| 2 | Interview notes editable after submission? | Product Lead | OPEN — defaulting no |