# PNL-20 — Support Desk

**Panel ID:** PNL-20
**Layer:** Layer 3 — Admin Console
**Release:** R1
**Gate:** Not gated.
**Screens:** 4 (ADM-240 to ADM-243)
**Status:** Spec baselined, build pending

---

## 1. Purpose

The internal helpdesk for members who need assistance. Support handles
the daily papercuts — password issues, order problems, verification
questions, appeals — and routes anything more serious to the right
panel. It is the last panel in the admin console and the one most
members will actually interact with indirectly.

The screen is deliberately lightweight. It is not Zendesk. It captures
a ticket, tracks its state through to resolution, and gives agents a
small set of reusable canned responses for the common cases.

---

## 2. Users and permissions

| Role | Scope within PNL-20 |
|---|---|
| ADMIN | Full: triage, respond, resolve, close, assign |
| SUPER_ADMIN | As ADMIN, plus deletion of spam and reopening of closed tickets |
| CHAPTER_LEADER | Read own chapter's tickets; may respond but not assign |
| FINANCE_OFFICER | Read tickets whose subject is financial |
| MENTOR | No access |
| MEMBER | No access (member-facing support form is SCR-032) |

Helpers in `lib/mock/support.ts`. RLS scoping matches the pattern used
in earlier panels.

---

## 3. Workflows

### 3.1 Triage a new ticket
1. Member submits a support request (SCR-032).
2. Ticket appears in the queue with status NEW.
3. An agent opens the ticket, reads the message, and either responds
   directly, requests more information, or routes it to another panel
   by linking the ticket to an entity (order, application, etc.).
4. When resolved, the agent marks it RESOLVED. If the member replies,
   it reopens.

### 3.2 Use a canned response
1. In the reply composer, click "Insert canned response".
2. A searchable list of pre-written replies appears.
3. Selecting one inserts it into the composer.
4. The agent edits as needed and sends.

### 3.3 Review support performance
1. Admin opens ADM-243.
2. Sees volume, median time to first response, resolution rate by
   category, and the oldest open ticket.
3. Exports a summary for the monthly review.

---

## 4. Screen inventory

| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-240 | Ticket queue | `/admin/support` | P0 |
| ADM-241 | Ticket detail and member context | `/admin/support/[id]` | P0 |
| ADM-242 | Canned responses and knowledge base | `/admin/support/canned` | P1 |
| ADM-243 | Support analytics | `/admin/support/analytics` | P1 |

---

## 5. Entities

### 5.1 Ticket
id uuid
reference string e.g. "SUP-26-0042"
subject string
body text
status enum NEW | OPEN | PENDING_MEMBER | RESOLVED | CLOSED
priority enum LOW | NORMAL | HIGH | URGENT
category enum ACCOUNT | BILLING | VERIFICATION | TECHNICAL | OTHER
member_id uuid
member_email string
assigned_to uuid | null
linked_entity_type string | null application, order, etc.
linked_entity_id uuid | null
created_at timestamptz
updated_at timestamptz
first_response_at timestamptz | null
resolved_at timestamptz | null
closed_at timestamptz | null

### 5.2 Ticket message
id uuid
ticket_id uuid
author_id uuid
author_type enum MEMBER | AGENT
body text
is_internal_note boolean
created_at timestamptz

### 5.3 Canned response
id uuid
title string
category enum
body text
tags string[]
created_by uuid
created_at timestamptz
updated_at timestamptz

---

## 6. Related panels

| Panel | Relationship |
|---|---|
| PNL-02 Applications | Tickets can link to applications |
| PNL-03 Members | Ticket detail shows member context |
| PNL-09 Commerce | Billing tickets link to orders and refunds |
| PNL-15 Compliance | Verification tickets link to KYC queue |
| PNL-17 Analytics | Support metrics roll into engagement analytics |

---

## 7. Acceptance criteria

- A new ticket appears in the queue within 60 seconds of submission.
- An agent can reply, add an internal note, and mark resolved.
- A member reply on a resolved ticket reopens it.
- Canned responses are searchable and insert into the composer.
- The queue filters by status, priority, category, and assignee.
- Every state transition and reply is audited.
- All four screens implement loading, empty, error, populated and
  permission-denied states.
- Zero P1 defects; WCAG 2.2 AA; responsive at 360/768/1280.

---

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Is there an SLA target per priority? Proposed: URGENT 4h, HIGH 24h, NORMAL 72h, LOW 7d. | Product Lead |
| Q2 | Do members get an email acknowledgement on ticket creation? Proposed: yes, with the reference and a link. | Product Lead |
| Q3 | Should tickets auto-close after N days of inactivity? Proposed: 14 days after RESOLVED with no reply. | Product Lead |
| Q4 | Can an agent merge two tickets from the same member about the same issue? Proposed: yes, in R2. | Product Lead |
| Q5 | Are internal notes visible in the audit trail, or only the state changes? Proposed: state changes only in the audit trail; note bodies stay in the ticket. | Compliance Lead |
| Q6 | Should satisfaction survey be sent on close? Proposed: R2. | Product Lead |