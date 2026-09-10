# Screen Spec: ADM-022 Interview Scheduling

**Document ID:** D3.6-ADM-022
**Version:** 1.0.0
**Status:** Baselined
**Panel:** PNL-02

---

## 1. Identification

- **Screen ID:** ADM-022
- **Route:** `/admin/applications/[id]/schedule`
- **Layer:** Admin Console
- **Module:** Applications
- **Release:** R1
- **Priority:** P0
- **Related requirements:** FR-1.4, J1

## 2. Purpose

Schedule a vision-alignment interview with the applicant. Sends calendar invite and reminders (24h and 1h before). Transitions application to INTERVIEW_SCHEDULED.

## 3. Users & permissions

| Role | Access | Notes |
|------|--------|-------|
| ADMIN | Full | — |
| SUPER_ADMIN | Full | — |
| CHAPTER_LEADER | None | 403 |
| FINANCE_OFFICER | None | 403 |

## 4. Entry & exit points

- **Reached from:** ADM-021 "Schedule Interview" button
- **Leads to:** ADM-021 on success
- **Deep-linkable:** no

## 5. Layout & regions
+------------------------------------------------------------------+
| ← Back to application |
+------------------------------------------------------------------+
| | |
| Schedule interview | Applicant |
| | Dennis Kimani |
| Date * | Student |
| [ 15 / 09 / 2026 ] | KU |
| | Governance |
| Time * | |
| [ 14:00 ▾ ] | |
| | |
| Duration * | |
| ( ) 30 min (•) 45 min ( ) 60 min | |
| | |
| Interviewer * | |
| [ Solomon A. ▾ ] | |
| | |
| Location | |
| [ Nairobi HQ, Room 3 ] | |
| | |
| Meeting link | |
| [ https://meet.google.com/... ] | |
| | |
| Internal notes | |
| [ ... ] | |
+------------------------------------------------------------------+
| [Cancel] [Schedule interview] |
+------------------------------------------------------------------+

## 6. Components

| # | Component | Source | Behaviour |
|---|-----------|--------|-----------|
| 1 | PageHeader | — | Back link + title |
| 2 | DatePicker | `components/ui/date-picker` | fromDate = today |
| 3 | Select | `components/select` | Time, duration, interviewer |
| 4 | Input | `components/ui/input` | Location, meeting link |
| 5 | Textarea | `components/textarea` | Notes |
| 6 | FormField | `components/ui/form-field` | Wraps all fields |
| 7 | ApplicantSidebar | new | Read-only summary |
| 8 | Button | `components/button` | Cancel, Schedule |

## 7. Data

| Field | Type | Required | Validation | Permission | Sensitivity |
|-------|------|----------|------------|------------|-------------|
| Date | date | yes | >= today | schedule | internal |
| Time | time | yes | HH:MM | schedule | internal |
| Duration | enum | yes | 30 / 45 / 60 min | schedule | internal |
| Interviewer | uuid | yes | must be ADMIN or SUPER_ADMIN | schedule | internal |
| Location | string | no | max 200 | schedule | internal |
| Meeting link | url | no | valid URL | schedule | internal |
| Notes | text | no | max 1000 | schedule | internal |

## 8. Actions

| # | Action | Permission | Confirmation | API | Success | Audited |
|---|--------|------------|--------------|-----|---------|---------|
| 1 | Schedule | ADMIN, SUPER_ADMIN | none | `POST /admin/applications/:id/schedule-interview` | status -> INTERVIEW_SCHEDULED, toast, redirect ADM-021 | yes |
| 2 | Cancel | schedule | none | — | navigate back | no |

## 9. States

| State | Handling |
|-------|----------|
| Empty | N/A |
| Loading | Skeleton form |
| Populated | Default |
| Partial | N/A |
| Error | Inline field errors |
| Permission denied | 403 |
| Offline | Form disabled, "You are offline" banner |
| Success | Toast "Interview scheduled for {date} at {time}. SMS + email sent." |
| Destructive confirmation | N/A |

## 10. Validation & error handling

- Date must be today or later: "Please choose a future date."
- Interviewer must hold ADMIN or SUPER_ADMIN: dropdown filtered accordingly
- Meeting link must be valid URL: "Enter a valid meeting link."
- If applicant has no phone on record, warn: "Applicant has no phone number. SMS reminder cannot be sent."

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| xs | Single column | Sidebar collapses below form |
| sm | Single column | Same |
| md+ | Two column | Sidebar on right |

## 12. Accessibility

- **Focus on mount:** first field (Date)
- **Labels:** all fields have visible labels + `aria-required`
- **Errors:** announced via `role="alert"`
- **DatePicker:** keyboard-navigable; `Esc` closes popover
- **Radio group:** arrow-key navigation between duration options
- **Focus trap:** if any (e.g. date picker popover), releases on close

## 13. Performance

- Payload: <80 KB
- No chart or heavy component

## 14. Analytics

- `interview_scheduled` (applicationId, duration, interviewerId)

## 15. Copy

- **Title:** "Schedule interview"
- **Subtitle:** "Send a calendar invite to the applicant."
- **Labels:** "Date", "Time", "Duration", "Interviewer", "Location", "Meeting link", "Internal notes"
- **Hint on date:** "Must be today or later"
- **Success:** "Interview scheduled for {date} at {time}. SMS and email sent."
- **Error:** "We could not schedule the interview. Try again."

## 16. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Reminders configurable per admin? | Product Lead | RESOLVED — no, hardcoded 24h + 1h in R1 |
| 2 | Timezone handling? | Tech Lead | OPEN — render in admin's local tz, store UTC |