# SCREEN SPEC: [ADM-074] Safeguarding Case Management

## 1. Identification
- Screen ID: ADM-074
- Route: /admin/moderation/safeguarding
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P0
- Related requirements: FR-4.6 (report), FR-4.7 (moderation), G-2
- Related panel: PNL-06
- Related gates: G-2 (safeguarding policy, mentor vetting, code of conduct,
  reporting channel)

## 2. Purpose
Manage safeguarding cases: reports involving minors, grooming, harassment,
coercion, or any situation where a member is at risk. This panel enforces the
restricted access, full audit, and escalation mechanisms that gate G-2
depends on. Direct messaging cannot ship until G-2 passes, and G-2 passes
when this panel is operational.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Assigned cases only | Cannot see unassigned cases unless given SAFEGUARDING_HANDLER capability |
| SUPER_ADMIN | Full | Can assign handlers |
| COMPLIANCE_LEAD | Full, read-only on actions | Can view all cases, cannot action |
| SAFEGUARDING_HANDLER | Assigned cases only | A capability on top of ADMIN or SUPER_ADMIN |
| CHAPTER_LEADER | Denied | 403 card |
| MENTOR / MEMBER / GUEST | Denied | 403 card |

Every view of a case is written to audit_log with actor, case id, and
timestamp. There is no list view for unassigned cases except for
SUPER_ADMIN and COMPLIANCE_LEAD.

## 4. Entry and exit points
- Reached from: sidebar (Moderation, "Safeguarding cases"), ADM-071
  (escalate action), notification
- Leads to: ADM-031 (member 360), ADM-071 (parent report), ADM-221 (audit),
  external authority contact form (in-platform, not a mailto link)
- Deep-linkable: yes. URL params: ?status, ?assigned

## 5. Layout and regions
- Page header: title, subtitle, notice about restricted access
- KPI row (visible to SUPER_ADMIN and COMPLIANCE_LEAD only):
  Open, Under investigation, Awaiting authority, Closed (30d)
- Filter bar (SUPER_ADMIN and COMPLIANCE_LEAD only): status, assigned,
  date range
- Assigned cases list (all handlers see only their assigned cases)
- Case detail view opens in the same route as a full-width workspace:
  - Header: reference, severity, status, assigned handler, age
  - Left column (2/3):
    - Case summary
    - Reported content and context (read-only ContentPreview)
    - Person at risk (if minor, identity further restricted)
    - Reporter (if different from person at risk)
    - Safeguarding narrative (structured free-text entries)
  - Right column (1/3):
    - Actions panel
    - External authority contact log
    - Case timeline (every action, every view, every note)
    - Audit trail (last 20 entries, link to full trail)

## 6. Components
| Component | Purpose |
|---|---|
| CaseHeader | Reference, severity, status, handler |
| RestrictedNotice | Persistent notice: "Restricted case. Every view is audited." |
| ContentPreview | Read-only content render (reused from ADM-071) |
| NarrativeComposer | Structured entries with categories (observation, action, outcome) |
| AuthorityContactLog | Timestamped log of external communications |
| ActionPanel | Buttons gated by role |
| CaseTimeline | Every action and every view |
| ConfirmDialog | Reused |

RestrictedNotice is a new component. It is sticky at the top of the case
workspace and cannot be dismissed.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Case id | Case.id | string | Y | Read (assigned) | Special category |
| Reference | Case.reference | string | Y | Read (assigned) | Internal |
| Severity | Case.severity | enum | Y | Read (assigned) | Internal |
| Status | Case.status | enum | Y | Read (assigned) | Internal |
| Source report | Case.reportId | ref | N | Read (assigned) | Internal |
| Person at risk | Case.subjectId | ref | Y | Read (assigned) | PII, special category |
| Is minor | Case.isMinor | bool | Y | Read (assigned) | Special category |
| Reporter | Case.reporterId | ref | N | Read (assigned) | PII |
| Narrative entries | Case.narrative | list | N | Read (assigned) | Special category |
| External authority | Case.authorityLog | list | N | Read (assigned) | Special category |
| Handler | Case.assignedTo | user | N | Read (assigned) | Internal |
| External reference | Case.externalReference | string | N | Read (assigned) | Sensitive |
| Closed reason | Case.closedReason | text | N | Read (assigned) | Sensitive |

Severity: CRITICAL, HIGH, MEDIUM, LOW. Severity CRITICAL triggers immediate
notification to Compliance Lead and SUPER_ADMIN.
Status: OPEN, INVESTIGATING, AWAITING_AUTHORITY, CLOSED.

## 8. Actions
| Action | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|
| Assign handler | SUPER_ADMIN | No | PATCH /safeguarding/:id | Yes |
| Reassign | SUPER_ADMIN | Yes | PATCH /safeguarding/:id | Yes |
| Add narrative entry | Assigned handler | No | POST /safeguarding/:id/narrative | Yes |
| Log authority contact | Assigned handler | No | POST /safeguarding/:id/authority | Yes |
| Escalate severity | Assigned handler | Yes | PATCH /safeguarding/:id/severity | Yes |
| Restrict member | Assigned handler | Yes (typed reason) | POST /members/:id/suspend | Yes |
| Notify Compliance Lead | Assigned handler | No | POST /safeguarding/:id/notify | Yes |
| Close case | Assigned handler + Compliance Lead sign-off | Yes (typed reason) | PATCH /safeguarding/:id | Yes |
| Export case | SUPER_ADMIN, COMPLIANCE_LEAD | Yes | GET /safeguarding/:id/export | Yes |

Close requires two-person sign-off: assigned handler proposes closure,
Compliance Lead confirms. Recorded in the audit trail.

## 9. States
- Empty (no assigned cases): "No cases assigned to you." with link to
  request assignment (SUPER_ADMIN only).
- Empty (no cases at all): only visible to SUPER_ADMIN and COMPLIANCE_LEAD:
  "No open safeguarding cases."
- Loading: skeleton for header, narrative, action panel.
- Populated: full case workspace.
- Populated extreme: narrative can be long; scrolls with a max-height and
  internal sticky subheader showing the case reference.
- Partial: if the source report fails to load, that card shows an inline
  retry; the rest of the case renders.
- Error: not-found card, or server error card with Retry.
- Permission denied: 403 card for MENTOR / MEMBER / GUEST / CHAPTER_LEADER.
  Also 403 for ADMIN viewing a case not assigned to them.
- Offline: read-only. Actions disabled. A banner states that offline access
  is limited because the case is restricted.
- Success: toast confirms each action; timeline updates in place.
- Destructive confirmation: reassign, escalate severity, restrict member,
  close case, export.

## 10. Validation and error handling
- Every narrative entry requires a category and body (min 20 chars).
- Authority contact log requires: authority name, contact method, summary,
  outcome. Timestamp is automatic.
- Escalate severity requires a reason (min 30 chars).
- Restrict member requires typed confirmation of the member number.
- Close case requires typed confirmation plus a reason (min 50 chars).
- Export requires a reason and is watermarked with the actor, timestamp, and
  case reference.
- If a case is CRITICAL, close is blocked until Compliance Lead sign-off is
  recorded.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. Restricted notice sticky at top. Actions become a bottom sheet. |
| md (>=768) | Single column, wider. Actions inline. |
| lg (>=1024) | Two columns: case left (2/3), actions and timeline right (1/3). |
| xl (>=1280) | Same two-column, wider margins. |

## 12. Accessibility
- Restricted notice is `role="alert"` on first render, then `role="note"`
  for the persistent display.
- Case reference is an `<h1>`, region headings `<h2>`.
- Narrative entries are `<article>` with a `<header>` showing category,
  author, and timestamp.
- All dialogs are focus traps; Escape cancels.
- Colour never conveys severity alone; severity text is always present.
- Screens are not cached to local storage when offline (special-category
  content).

## 13. Performance
- Payload budget: 250 KB
- Narrative paginated at 20 entries
- Audit trail paginated at 20 entries
- No prefetch of content in adjacent cases
- Images in ContentPreview lazy-load

## 14. Analytics
Only non-identifying events:
- `safeguarding.case.viewed` (no case id, no reference)
- `safeguarding.case.action` (properties: action_type, severity)
- `safeguarding.case.closed` (properties: closed_reason_category)
- `safeguarding.case.exported` (properties: actor_role)

No names, member numbers, or case references are included in analytics events.

## 15. Copy
- Title: "Safeguarding cases"
- Subtitle: "Restricted handling for member safety. Every view is audited."
- Restricted notice: "Restricted case. Every action and every view is logged. Do not share case details outside the assigned handler team."
- Empty (assigned): "No cases assigned to you."
- Narrative empty: "No narrative entries yet."
- Add entry placeholder: "Observation, action taken, or outcome..."
- Escalate confirmation: "Escalate severity to {level}? This notifies the Compliance Lead immediately."
- Restrict confirmation: "Restrict {member}? Type the member number to confirm. This is immediate and audited."
- Close confirmation: "Close this case? Type a reason (min 50 chars). Compliance Lead sign-off is required. The case is retained for audit."
- Export confirmation: "Export this case? The export is watermarked with your identity and the timestamp. It is audited."
- Toast: "Case updated." / "Handler reassigned." / "Compliance Lead notified."

## 16. Open questions
- Q1: External authority contact information: which authority (Children's
  Officer, DCI, or another) is the default escalation path in Kenya, and what
  are the contact details to embed? Compliance Lead.
- Q2: When the person at risk is a minor, do we require parental or guardian
  notification, and if so, at what point? Compliance Lead and TEG leadership.
- Q3: Does a closed case ever get reopened? If so, what is the mechanism and
  who has authority? Compliance Lead.
- Q4: Retention period for safeguarding cases: is it longer than the standard
  7 years given the special-category content? DPO and Compliance Lead.
- Q5: Should the export include the full narrative or a redacted version?
  Compliance Lead.
