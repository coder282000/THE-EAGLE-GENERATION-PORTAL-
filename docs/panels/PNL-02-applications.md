# PNL-02 — Applications Panel

**Panel ID:** PNL-02
**Version:** 1.0.0
**Status:** Baselined
**Source:** Developer Instructions §7 (Panel inventory)
**Screens:** ADM-020 through ADM-026

---

## 1. Purpose

Manages the full membership application lifecycle from public submission through to decision. Every new member enters the system through this panel, making it the highest-traffic admin surface in the platform.

## 2. Users

| Role | Access | Primary actions |
|------|--------|-----------------|
| ADMIN | Full | Review, schedule, record outcome, decide, bulk import, analytics |
| SUPER_ADMIN | Full | Same as ADMIN + override capabilities (audited) |
| CHAPTER_LEADER | Scoped (own chapter only) | View own-chapter applications, add notes |
| FINANCE_OFFICER | Read-only | View analytics (funnel, conversion) |
| MEMBER, MENTOR, CIRCLE_LEADER | None | — |

## 3. Workflows

### J1 — Application to admission (the defining journey, from Charter §15)

GUEST SYSTEM ADMIN
| | |
|-- opens /apply ------>| |
|-- completes form ---->| |
| |-- validates, dedupes -------->|
| |-- creates Application |
| | (SUBMITTED) |
| |-- emails ack + reference ---->|
| |-- adds to queue ------------->|
| | |-- opens queue
| | |-- reviews detail
|<-- interview invite ---|<------------------------------|
| | |-- records outcome
| |<------ APPROVE ---------------|
| |-- generates member number |
| |-- creates User + MEMBER role |
|<-- welcome + set pw ---|<------------------------------|
|-- sets password ------>| |
|-- completes onboarding>| |
|-- lands on /dashboard->| |

### State machine
DRAFT -> SUBMITTED -> UNDER_REVIEW -> INTERVIEW_SCHEDULED -> INTERVIEWED
|
+----------------------+----------------------+
v v v
APPROVED REJECTED WITHDRAWN
|
v
(SUPER_ADMIN only,
within 30 days)
|
v
UNDER_REVIEW

### Transitions

| From | To | Guard | Side effects |
|------|-----|-------|--------------|
| SUBMITTED | UNDER_REVIEW | Admin opens detail | Audit log |
| UNDER_REVIEW | INTERVIEW_SCHEDULED | Interview time set | Calendar invite, SMS + email |
| INTERVIEW_SCHEDULED | INTERVIEWED | Outcome recorded | Audit log |
| INTERVIEWED | APPROVED | Decision made | Member number issued, User created, welcome email |
| INTERVIEWED | REJECTED | Internal reason required | Courteous email (no reason) |
| SUBMITTED | LAPSED | 90 days elapsed | Notification, audit log |
| Any | WITHDRAWN | Applicant requests | Audit log |
| REJECTED | UNDER_REVIEW | SUPER_ADMIN only, within 30 days, reason | Reopened flag set |

## 4. Relationships to other panels

| Panel | Relationship |
|-------|--------------|
| PNL-01 (Overview) | Dashboard shows application queue depth; My Tasks includes application tasks |
| PNL-03 (Members) | Approved applications create member records |
| PNL-04 (Chapters) | Applications carry chapter preference; approval assigns to chapter |
| PNL-07 (Communications) | Interview invites, welcome emails, rejection notices |
| PNL-15 (Compliance) | Rejected/withdrawn applications retained for audit |

## 5. Panel acceptance criteria

- 50 real members onboarded end-to-end through J1 (Charter §29)
- An admin completes a full application cycle unaided
- All 8 roles enforced server-side, negative tests pass
- Zero P1 defects
- WCAG 2.2 AA on all 7 screens
- Audit log capturing every state transition

## 6. Screens in this panel

| # | Screen | Route | Priority |
|---|--------|-------|:---:|
| ADM-020 | Review Queue | `/admin/applications` | P0 |
| ADM-021 | Application Detail | `/admin/applications/[id]` | P0 |
| ADM-022 | Interview Scheduling | `/admin/applications/[id]/schedule` | P0 |
| ADM-023 | Interview Outcome | `/admin/applications/[id]/outcome` | P0 |
| ADM-024 | Decision | `/admin/applications/[id]/decide` | P0 |
| ADM-025 | Bulk Import | `/admin/applications/import` | P1 |
| ADM-026 | Application Analytics | `/admin/applications/analytics` | P1 |

## 7. Changelog

| Version | Date | Change | Author |
|---------|------|--------|--------|
| 1.0.0 | 2026-09-10 | Initial baseline | Tech Lead |