# SCREEN SPEC: [ADM-075] Mentor Vetting Queue

## 1. Identification
- Screen ID: ADM-075
- Route: /admin/moderation/mentor-vetting
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P0
- Related requirements: FR-5.1 (mentor profiles), FR-5.2 (capacity), G-2
- Related panel: PNL-06
- Related gates: G-2 (mentor vetting, code of conduct)

## 2. Purpose
Vet mentors before they can receive any mentee. A mentor who has not been
vetted and has not accepted the code of conduct must not appear in the
mentorship finder and must not be able to accept a mentee. This screen is
the operational control that makes that rule true.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All applications |
| SUPER_ADMIN | Full | All applications |
| COMPLIANCE_LEAD | Full, read-only on decisions | Can annotate, cannot approve |
| CHAPTER_LEADER | Denied | 403 card |
| MENTOR / MEMBER / GUEST | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Moderation), dashboard alert, notification
- Leads to: ADM-031 (member 360), ADM-091 (mentor profile public view),
  audit trail for the application
- Deep-linkable: yes. URL params: ?status, ?stage, ?category

## 5. Layout and regions
- Page header: title, subtitle
- KPI row: four cards - Pending, In review, Approved (30d), Rejected (30d)
- Filter bar: search, status filter, focus-category filter, date range
- Data table: reference, applicant, focus categories, submitted, stage,
  background check, code of conduct, status
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable columns, row click |
| Pagination | Cursor-based |
| StatusBadge | Application status |
| StageStepper | Compact vetting-stage indicator |
| EmptyState | No results |
| VetCheckRow | Background-check status line |

StageStepper reuses the horizontal stepper visual from the applications
module, but with four stages: Submitted, Background check, Code of conduct,
Decision.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Reference | Application.reference | string | Y | Read | Internal |
| Applicant | Application.userId | ref | Y | Read | PII |
| Focus categories | Application.focusCategories | list | Y | Read | Internal |
| Submitted at | Application.submittedAt | timestamp | Y | Read | Internal |
| Stage | Application.stage | enum | Y | Read | Internal |
| Background check | Application.backgroundCheck | enum | Y | Read | Sensitive |
| Code of conduct | Application.codeAccepted | bool | Y | Read | Internal |
| Status | Application.status | enum | Y | Read | Internal |
| Notes | Application.notes | list | N | Read | Sensitive |

Stage: SUBMITTED, BACKGROUND_CHECK, CODE_OF_CONDUCT, DECISION.
Background check: NOT_STARTED, IN_PROGRESS, CLEAR, ADVERSE, INCONCLUSIVE.
Status: PENDING, APPROVED, REJECTED, WITHDRAWN.

## 8. Actions
| Action | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|
| Open application | ADMIN+ | No | GET /mentor-applications/:id | No |
| Start background check | ADMIN+ | No | POST /mentor-applications/:id/checks | Yes |
| Record check result | ADMIN+ | Yes | PATCH /mentor-applications/:id/checks | Yes |
| Approve mentor | ADMIN+ | Yes | POST /mentor-applications/:id/approve | Yes |
| Reject | ADMIN+ | Yes (reason) | POST /mentor-applications/:id/reject | Yes |
| Request more info | ADMIN+ | No | POST /mentor-applications/:id/request-info | Yes |
| Export list | ADMIN+ | No | GET /mentor-applications.csv | Yes |

Approval requires: background check CLEAR, code of conduct accepted.
Approval grants the MENTOR role. Rejection does not.

## 9. States
- Empty (no pending): "No mentors awaiting vetting." 
- Loading: skeleton rows.
- Populated: typical 5-30 applications.
- Populated extreme: pagination caps at 25.
- Partial: background check provider unreachable; rows show
  "Check unavailable" and actions requiring CLEAR are disabled.
- Error: full-page error card with Retry.
- Permission denied: 403 card for MENTOR / MEMBER / GUEST / CHAPTER_LEADER.
- Offline: cached list visible; actions disabled.
- Success: toast confirms; row updates in place.
- Destructive confirmation: reject only.

## 10. Validation and error handling
- Reject requires a reason from a fixed list plus free text (min 20 chars).
- Cannot approve without CLEAR background check and accepted code of conduct.
  Buttons are disabled with a tooltip explaining why.
- Cannot start a background check if one is already IN_PROGRESS or CLEAR.
- Server errors surface as a toast with a request ID.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Stage shown as a compact stepper. |
| md (>=768) | Full table, first six columns. |
| xl (>=1280) | Full table, all columns. |

## 12. Accessibility
- Semantic table with aria-sort on sortable columns
- Stage stepper uses nav/ol with aria-current
- Row navigation via Enter
- Approval-disabled reasons are exposed via aria-describedby on the button
- Background-check status uses colour and text

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 25 per page
- Background-check status polled at most once every 60 seconds
- Search debounced at 300 ms

## 14. Analytics
- moderation.vetting.viewed
- moderation.vetting.check_started
- moderation.vetting.approved
- moderation.vetting.rejected
- moderation.vetting.info_requested

## 15. Copy
- Title: "Mentor vetting"
- Subtitle: "Approve mentors only after background checks and code-of-conduct acceptance."
- Empty: "No mentors awaiting vetting."
- Approval disabled (no check): "Background check must be CLEAR before approval."
- Approval disabled (no CoC): "Applicant has not accepted the code of conduct."
- Reject confirmation: "Reject this application? Provide a reason (min 20 chars). The applicant is notified without the internal reason."
- Toast approve: "Mentor approved. MENTOR role granted."
- Toast reject: "Application rejected. Applicant notified."

## 16. Open questions
- Q1: Which background check provider, and what is the threshold for
  ADVERSE vs INCONCLUSIVE? Compliance Lead.
- Q2: Does approval notify the applicant immediately, or wait for a batch?
  Content and Community Lead.
- Q3: Can an applicant reapply after rejection, and after how long?
  Product Lead.