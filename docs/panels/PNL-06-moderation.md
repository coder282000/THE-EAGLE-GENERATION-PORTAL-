# PANEL SPEC: PNL-06 Moderation

## 1. Identification
- Panel ID: PNL-06
- Layer: Admin Console
- Owner: Content and Community Lead (day-to-day), Compliance Lead (safeguarding)
- Release: R2 onward
- Related charter sections: 16.4 (Community, safeguarding), 9.3 (gate G-2),
  22.5 (audit), 12.2 (permission matrix)
- Related gates: G-2 (safeguarding policy, mentor vetting, code of conduct,
  reporting channel). Direct messaging does not ship until G-2 passes.

## 2. Purpose
Moderate member-generated content, resolve reports, manage groups, handle
safeguarding escalations, vet mentors before they receive mentees, and maintain
the blocked/banned register. This is the panel that keeps the community safe.

## 3. Users and permissions
| Role | Access |
|---|---|
| ADMIN | Full, except safeguarding cases which are read-only unless assigned |
| SUPER_ADMIN | Full |
| COMPLIANCE_LEAD | Read-only on safeguarding cases only |
| CHAPTER_LEADER | Own-chapter reports only, no action buttons except escalate |
| MENTOR / MEMBER / GUEST | Denied (403 card) |

Scoping rules: chapter leaders see only reports whose content belongs to their
chapter. Safeguarding cases are restricted to ADMIN, SUPER_ADMIN, and the
assigned case handler.

## 4. Screens
| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-070 | Moderation queue | /admin/moderation | P0 |
| ADM-071 | Report detail and action | /admin/moderation/[id] | P0 |
| ADM-072 | Content search and removal | /admin/moderation/content | P1 |
| ADM-073 | Group management | /admin/moderation/groups | P1 |
| ADM-074 | Safeguarding case management | /admin/moderation/safeguarding | P0 |
| ADM-075 | Mentor vetting queue | /admin/moderation/mentor-vetting | P0 |
| ADM-076 | Moderation analytics | /admin/moderation/analytics | P1 |
| ADM-077 | Blocked / banned register | /admin/moderation/blocked | P1 |

## 5. Core workflows
- W1 Triage a report: queue -> detail -> action (remove, warn, suspend,
  escalate, dismiss) -> close
- W2 Safeguarding escalation: report -> safeguarding case -> assigned handler
  -> restricted access -> full audit
- W3 Mentor vetting: application -> background checks -> code-of-conduct
  acceptance -> approve or reject
- W4 Block and ban: block (member-driven) -> ban (admin-driven) -> register
- W5 Content removal: search across content -> view -> remove with reason

## 6. Entity model
Report, ReportAction, ContentItem (post, comment, message), Group,
SafeguardingCase, MentorApplication, BanRecord, BlockRecord.

## 7. Non-negotiables (from Charter)
- Direct messaging does not ship until G-2 passes. This panel implements the
  mechanisms that gate depends on.
- Every moderation action is audited: actor, action, target, before, after,
  reason, timestamp.
- Safeguarding cases have restricted access and full audit. The panel enforces
  who can see them.
- Mentors must be vetted and have accepted the code of conduct before
  receiving any mentee.
- Reported threads are accessible to moderators. This is stated in the
  privacy notice.

## 8. Related panels
PNL-03 (Members) for suspend/reinstate. PNL-07 (Communications) for
announcements to affected cohorts. PNL-15 (Compliance) for AML-adjacent
escalations. PNL-18 (Audit & Security) for audit trail.

## 9. Acceptance criteria
- A moderator can triage, action, and close a report unaided
- Safeguarding cases are visible only to assigned handlers
- Mentor vetting blocks an unvetted mentor from receiving mentees
- Every action writes to the audit log
- The blocked/banned register is filterable and exportable

## 10. Open questions
- Q1: Which safeguarding external authority is the escalation path (Children's
  Officer, DCI, other) — Compliance Lead
- Q2: Whether moderators can view private messages when a thread is reported,
  or only the specific message reported — Compliance Lead
- Q3: Mentor background check provider and thresholds — Compliance Lead