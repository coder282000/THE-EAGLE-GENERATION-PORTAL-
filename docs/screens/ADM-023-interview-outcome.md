# Screen Spec: ADM-023 Interview Outcome

**Document ID:** D3.6-ADM-023
**Version:** 1.0.0
**Status:** Baselined
**Panel:** PNL-02

---

## 1. Identification

- **Screen ID:** ADM-023
- **Route:** `/admin/applications/[id]/outcome`
- **Layer:** Admin Console
- **Module:** Applications
- **Release:** R1
- **Priority:** P0
- **Related requirements:** FR-1.2, J1

## 2. Purpose

Record structured interview notes and a recommendation after the interview. Transitions application to INTERVIEWED.

## 3. Users & permissions

| Role | Access | Notes |
|------|--------|-------|
| ADMIN | Full | — |
| SUPER_ADMIN | Full | — |
| CHAPTER_LEADER | None | 403 |
| FINANCE_OFFICER | None | 403 |

## 4. Entry & exit points

- **Reached from:** ADM-021 "Record outcome" button (visible only when status = INTERVIEW_SCHEDULED)
- **Leads to:** ADM-021 on success
- **Deep-linkable:** no

## 5. Layout & regions
+------------------------------------------------------------------+
| ← Back to application |
+------------------------------------------------------------------+
| | |
| Record interview outcome | Applicant |
| | Dennis Kimani |
| Strengths * | Interviewed 3d ago |
| [ 20+ characters ... ] | |
| | |
| Concerns | |
| [ ... ] | |
| | |
| Recommendation * | |
| ( ) Strong yes (•) Yes | |
| ( ) No ( ) Strong no | |
| | |
| Overall score * | |
| [ 4 / 5 ▾ ] | |
+------------------------------------------------------------------+
| [Cancel] [Save outcome] |
+------------------------------------------------------------------+

## 6. Components

| # | Component | Source | Behaviour |
|---|-----------|--------|-----------|
| 1 | PageHeader | — | Back + title |
| 2 | Textarea | `components/textarea` | Strengths, concerns |
| 3 | RadioGroup | new (Radix) | Recommendation |
| 4 | Select | `components/select` | Score 1-5 |
| 5 | Button | `components/button` | Cancel, Save |
| 6 | FormField | `components/ui/form-field` | Wraps all fields |

## 7. Data

| Field | Type | Required | Validation | Sensitivity |
|-------|------|----------|------------|-------------|
| Strengths | text | yes | min 20, max 1000 | PII-adjacent |
| Concerns | text | no | max 1000 | PII-adjacent |
| Recommendation | enum | yes | STRONG_YES / YES / NO / STRONG_NO | internal |
| Overall score | int | yes | 1-5 | internal |

## 8. Actions

| # | Action | Permission | Confirmation | API | Success | Audited |
|---|--------|------------|--------------|-----|---------|---------|
| 1 | Save outcome | ADMIN, SUPER_ADMIN | none | `POST /admin/applications/:id/interview-outcome` | status -> INTERVIEWED, redirect ADM-021 | yes |
| 2 | Cancel | — | none | — | navigate back | no |

## 9. States

| State | Handling |
|-------|----------|
| Loading | Skeleton |
| Populated | Default |
| Error | Inline field errors |
| Permission denied | 403 |
| Success | Toast "Outcome recorded." |
| Destructive confirmation | N/A |

## 10. Validation

- Strengths: required, min 20 chars
- Recommendation: required (one of four)
- Score: required, 1-5
- No validation blocks saving concerns blank

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| xs | Single column | Sidebar below |
| md+ | Two column | Sidebar right |

## 12. Accessibility

- Radio group: `role="radiogroup"` + `aria-required`
- Field errors: `role="alert"` on error message
- Focus on mount: Strengths field
- Focus ring visible on all radio options

## 13. Performance

- Payload: <70 KB

## 14. Analytics

- `interview_outcome_recorded` (applicationId, recommendation, score)

## 15. Copy

- **Title:** "Record interview outcome"
- **Labels:** "Strengths", "Concerns", "Recommendation", "Overall score"
- **Hints:**
  - Strengths: "Minimum 20 characters. Be specific."
  - Concerns: "Optional. Record only what you observed."
- **Recommendation options:** "Strong yes", "Yes", "No", "Strong no"
- **Success:** "Outcome recorded."
- **Error:** "We could not save the outcome. Try again."

## 16. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Should recommendation be visible to all admins or only decision-makers? | Product Lead | OPEN — defaulting visible to all admins with application access |