# SCREEN SPEC: [ADM-070] Moderation Queue

## 1. Identification
- Screen ID: ADM-070
- Route: /admin/moderation
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P0
- Related requirements: FR-4.7 (moderation queue)
- Related panel: PNL-06
- Related gates: G-2 (safeguarding)

## 2. Purpose
Single queue of every content or user report awaiting moderation. The
moderator's home screen. Triage, prioritise, assign, and act.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All reports |
| SUPER_ADMIN | Full | All reports |
| COMPLIANCE_LEAD | Read-only | All reports |
| CHAPTER_LEADER | Own chapter only | Can escalate, cannot remove or suspend |
| MENTOR / MEMBER / GUEST | Denied | 403 card |

Scoping: chapter leaders see only reports whose target content belongs to
their own chapter. Enforced server-side, mirrored in the mock accessor.

## 4. Entry and exit points
- Reached from: sidebar (Moderation), dashboard critical alert, notification
- Leads to: ADM-071 (report detail), ADM-031 (member 360), ADM-221 (audit)
- Deep-linkable: yes. URL params: ?status, ?priority, ?type, ?chapter, ?assigned

## 5. Layout and regions
- Page header: title, subtitle, SLA summary
- KPI row: four cards — Open, High priority, Approaching SLA, Resolved (7d)
- Filter bar: search, status filter, priority filter, type filter, assigned-to
- Bulk action bar (conditional): assign, mark in-review, escalate, dismiss
- Data table: reference, type, target summary, reported by, priority, age,
  assigned to, status
- Pagination (cursor-based)

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI card, four across |
| FilterBar | Search + dropdowns |
| DataTable | Sortable columns, row click |
| Pagination | Cursor-based |
| BulkActionBar | Conditional on selection |
| StatusBadge | Report status |
| EmptyState | No results |
| PriorityPill | Critical / High / Medium / Low |

No new design-system components required. PriorityPill may be a thin wrapper
around StatusBadge with a tone map.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Reference | Report.reference | string | Y | Read | Internal |
| Type | Report.type | enum | Y | Read | Internal |
| Target summary | Report.targetSummary | string | Y | Read | Internal |
| Reported by | Report.reportedBy | user | Y | Read | PII |
| Priority | Report.priority | enum | Y | Read | Internal |
| Age | Report.createdAt | timestamp | Y | Read | Internal |
| SLA deadline | Report.slaDeadlineAt | timestamp | Y | Read | Internal |
| Assigned to | Report.assignedTo | user | N | Read | Internal |
| Status | Report.status | enum | Y | Read | Internal |

Report type: POST, COMMENT, MESSAGE, USER, GROUP.
Priority: CRITICAL, HIGH, MEDIUM, LOW.
Status: OPEN, IN_REVIEW, ESCALATED, RESOLVED, DISMISSED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open report | Row click | ADMIN+ | No | GET /reports/:id | No |
| Assign | Bulk / row | ADMIN+ | No | PATCH /reports/:id | Yes |
| Mark in review | Bulk | ADMIN+ | No | PATCH /reports/:id | Yes |
| Escalate to safeguarding | Bulk | ADMIN+, CL escalate only | Yes | POST /safeguarding | Yes |
| Dismiss | Bulk | ADMIN+ | Yes | PATCH /reports/:id | Yes |
| Export list | Toolbar | ADMIN+ | No | GET /reports.csv | Yes |

## 9. States
- Empty: "No reports. Community is quiet." with a small illustration.
- Loading: skeleton rows, six placeholder rows.
- Populated: typical 30–60 reports.
- Populated extreme: 10,000 reports; pagination caps at 25 per page.
- Partial: some rows loaded, next page failed. Retry inline.
- Error: full-page error card with Retry.
- Permission denied: 403 card for MENTOR / MEMBER / GUEST.
- Offline: cached list visible, actions disabled with a banner.
- Success: toast confirms the action ("Report assigned", "Report dismissed").
- Destructive confirmation: dismiss and escalate both require confirmation.

## 10. Validation and error handling
- Assign requires at least one row selected.
- Escalate requires a reason from a dropdown plus free text.
- Dismiss requires a reason (free text, minimum 10 characters).
- Server errors surface as a toast with a request ID.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards, one per report, priority shown as a colour bar |
| md (>=768) | Full table, first five columns visible |
| xl (>=1280) | Full table, all columns visible |

Tables become cards below md, per Charter 21.2.

## 12. Accessibility
- Semantic `<table>` with `<caption>` "Moderation reports"
- `aria-sort` on sortable columns
- Row click reachable via Enter key; visible focus ring
- Status pill uses both colour and text
- Bulk action bar announces via `aria-live="polite"`
- Column headers are `<th scope="col">`

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 25 per page
- Filters applied server-side; client-side debounced search (300 ms)
- Virtualisation not required at 25 per page

## 14. Analytics
- `moderation.queue.viewed`
- `moderation.queue.filtered` (properties: filter_type, filter_value)
- `moderation.report.assigned`
- `moderation.report.dismissed`

## 15. Copy
- Title: "Moderation queue"
- Subtitle: "Review reports, action content, and protect members."
- Empty: "No reports. Community is quiet."
- Bulk bar: "{n} selected"
- Confirm dismiss: "Dismiss this report? The reporter will not be notified."
- Confirm escalate: "Escalate to safeguarding? This is audited and routed to the assigned handler."
- Toast assign: "Report assigned to {name}."

## 16. Open questions
- Whether to surface a "watch list" of repeat reporters on this screen or in
  analytics only — Product Lead
- Whether bulk dismiss should require a single shared reason or per-row
  reasons — Compliance Lead