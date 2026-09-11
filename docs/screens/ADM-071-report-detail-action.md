# SCREEN SPEC: [ADM-071] Report Detail and Action

## 1. Identification
- Screen ID: ADM-071
- Route: /admin/moderation/[id]
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P0
- Related requirements: FR-4.6 (report), FR-4.7 (moderation)
- Related panel: PNL-06
- Related gates: G-2 (safeguarding)

## 2. Purpose
Full workspace for a single report. Shows the reported content in context,
the reporter, the target, prior history, and every action available to the
moderator.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All reports |
| SUPER_ADMIN | Full | All reports |
| COMPLIANCE_LEAD | Read-only | All reports |
| CHAPTER_LEADER | Own chapter only | Escalate only, no remove/suspend |
| Others | Denied | 403 card |

Safeguarding escalation moves the case to ADM-074 and removes it from the
general queue. Once escalated, only assigned handlers can view.

## 4. Entry and exit points
- Reached from: ADM-070 row click, notification, member 360 activity tab
- Leads to: ADM-074 (safeguarding), ADM-031 (member 360), ADM-221 (audit),
  content permalink if public
- Deep-linkable: yes. URL params: none (id is in the path).

## 5. Layout and regions
- Header: reference, type, priority pill, status pill, SLA countdown, action bar
- Left column (2/3 width):
  - Reported content card: the exact post/comment/message, with surrounding
    context (thread parent, author, timestamp)
  - Reporter card: who reported, when, any prior reports by this reporter
  - Target card: the member whose content is reported, with quick link to 360
- Right column (1/3 width):
  - Actions panel: remove, warn, suspend, escalate, dismiss, block
  - Prior reports on same target
  - Timeline of this report (triage -> action -> close)
  - Audit trail (last 10 entries)

## 6. Components
| Component | Purpose |
|---|---|
| ContentPreview | Renders post/comment/message |
| MemberCard | Small card for reporter and target |
| ActionPanel | Buttons with confirmation for irreversible actions |
| Timeline | Reuses AuditTrail from applications module |
| NoteComposer | Add internal note to the case |
| PriorityPill | Same as queue |
| ConfirmDialog | Existing design-system dialog |

ContentPreview must handle all content types (text, image, link) and be
read-only, styled distinctly from the live feed.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Reference | Report.reference | string | Y | Read | Internal |
| Type | Report.type | enum | Y | Read | Internal |
| Priority | Report.priority | enum | Y | Read | Internal |
| Status | Report.status | enum | Y | Read | Internal |
| Target content | Report.targetContent | object | Y | Read | Internal |
| Target author | Report.targetAuthor | user | Y | Read | PII |
| Reporter | Report.reportedBy | user | Y | Read | PII |
| Reporter comment | Report.reporterNote | text | N | Read | Internal |
| Prior reports | Report.priorCount | int | Y | Read | Internal |
| SLA deadline | Report.slaDeadlineAt | timestamp | Y | Read | Internal |
| Assigned to | Report.assignedTo | user | N | Read | Internal |
| Case notes | Report.notes | list | N | Read | Internal |

## 8. Actions
| Action | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|
| Remove content | ADMIN+ | Yes | POST /moderation/remove | Yes |
| Warn member | ADMIN+ | Yes (template) | POST /moderation/warn | Yes |
| Suspend member | ADMIN+ | Yes (typed reason) | POST /members/:id/suspend | Yes |
| Escalate to safeguarding | ADMIN+, CL | Yes (reason) | POST /safeguarding | Yes |
| Dismiss report | ADMIN+ | Yes (reason) | PATCH /reports/:id | Yes |
| Block target | ADMIN+ | Yes | POST /members/:id/block | Yes |
| Add internal note | ADMIN+, CL read-only | No | POST /reports/:id/notes | Yes |

Every action writes to audit_log. Suspend also notifies the member per
Charter 16.4 business rules.

## 9. States
- Empty: n/a — route requires a valid id.
- Loading: skeleton for header, content card, action panel.
- Populated: full render.
- Populated extreme: content can be long. Content card scrolls at max-height
  with a "show full" toggle.
- Partial: if target's 360 fails to load, that card shows an inline retry.
- Error: not-found card if the id does not exist. Server error card with Retry.
- Permission denied: 403 card for MEMBER / MENTOR / GUEST. Chapter leader
  viewing another chapter's report also gets 403.
- Offline: read-only. All action buttons disabled with an offline banner.
- Success: each action shows a toast and updates the timeline in place.
- Destructive confirmation: every action in the Actions panel except Add note.

## 10. Validation and error handling
- Suspend requires a reason (dropdown + free text, min 20 chars).
- Escalate requires a reason (min 20 chars) and shows a warning that the
  reporter is not notified of escalation.
- Dismiss requires a reason (min 10 chars).
- Warn uses a template with merge fields; moderator can edit before sending.
- Remove content requires a reason from a fixed list plus optional free text.
- All confirmation dialogs focus the Cancel button by default.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. Content first, then reporter, then actions. Action panel becomes a sticky bottom sheet. |
| md (>=768) | Single column, wider. Actions inline above content. |
| lg (>=1024) | Two columns: content left (2/3), actions and history right (1/3). |
| xl (>=1280) | Same two-column, wider margins. |

## 12. Accessibility
- Page heading is `<h1>`, region headings are `<h2>`.
- Action buttons have aria-labels including the target name.
- Confirmation dialog is a focus trap; Escape closes it.
- Timeline entries announce with `aria-live="polite"` when new entries land.
- ContentPreview exposes the original author and timestamp via
  `<dl>` semantics; screen readers can announce them from the article.
- Colour is never the only signal: priority and status pills always carry text.

## 13. Performance
- Payload budget: 250 KB
- Content card lazy-loads images
- 360 card fetches concurrently, does not block the page
- Timeline and audit trail paginate at 20 entries each

## 14. Analytics
- `moderation.report.viewed`
- `moderation.report.content_removed`
- `moderation.report.warned`
- `moderation.report.member_suspended`
- `moderation.report.escalated`
- `moderation.report.dismissed`
- `moderation.report.note_added`

## 15. Copy
- Title: "{reference} — {Type} report"
- SLA banner when overdue: "SLA exceeded by {n} hours."
- Remove confirmation: "Remove this content? The author will be notified."
- Warn confirmation: "Send a warning to {name}? They will see your message."
- Suspend confirmation: "Suspend {name}? They will be locked out immediately. A reason is required and audited."
- Escalate confirmation: "Escalate to safeguarding? The case moves to restricted handling. The reporter is not notified."
- Dismiss confirmation: "Dismiss this report? No action will be taken."
- Empty notes: "No internal notes yet."
- Toast templates: "{Action} recorded. {Member} notified." (when applicable)

## 16. Open questions
- Q1: When a report is dismissed, should the reporter receive a courtesy
  notification? Currently no. Product Lead to confirm.
- Q2: Does "warn" ever need a member-facing acknowledgement of receipt, or is
  a delivered message enough? Compliance Lead.
- Q3: When a target is suspended, do we auto-dismiss all open reports against
  them, or leave them for manual review? Product Lead.