# PNL-07 — Communications

**Panel ID:** PNL-07
**Layer:** Layer 3 — Admin Console
**Release:** R1 (announcements), R2 (notification templates), R3 (campaigns, delivery log)
**Gate:** Not gated. Marketing consent governed by DPA-1.
**Screens:** 5 (ADM-080 to ADM-084)
**Status:** Spec baselined, build pending

---

## 1. Purpose

PNL-07 is how TEG talks to its members. It covers three modes of
communication:

1. **Announcements** — scheduled, targeted, priority-tagged messages
   that appear in-app and optionally trigger email or push.
2. **Templates** — versioned, reusable message bodies for transactional
   and lifecycle notifications (welcome, approval, refund, event
   reminder).
3. **Campaigns** — segment-targeted bulk messages, consent-aware, with
   a delivery log that records every attempt.

The panel is deliberately narrow. It does not attempt to be a marketing
automation platform. It sends messages through the configured providers
(Postmark/SES for email, Africa's Talking for SMS, Web Push for browser
notifications) and records what happened.

---

## 2. Users and permissions

| Role | Scope within PNL-07 |
|---|---|
| ADMIN | Full: compose announcements, manage templates, run campaigns |
| SUPER_ADMIN | As ADMIN |
| CHAPTER_LEADER | Compose chapter-scoped announcements only; no templates; no campaigns |
| FINANCE_OFFICER | Read-only on delivery log; no authoring |
| MENTOR | No access |
| MEMBER | No access (member-facing screens are SCR-044, SCR-045, SCR-029) |

Scoping is enforced by helpers in `lib/mock/communications.ts`, mirroring
the pattern used in PNL-04 and PNL-08. A CHAPTER_LEADER can only target
their own chapter; the audience selector in ADM-080 is fixed to their
chapter.

---

## 3. Workflows

### 3.1 Publish an announcement
1. Admin opens `/admin/announcements` -> **New announcement**.
2. Fills ADM-080: title, body, audience, priority, schedule.
3. Saves as draft or publishes immediately.
4. On publish, the announcement appears at `/announcements` for the
   targeted audience. Email and push are dispatched per the delivery
   preferences of each recipient.

### 3.2 Read receipts
1. Members who open an announcement are recorded in `readBy`.
2. ADM-081 shows the aggregate reach and per-announcement read count.
3. Priority HIGH announcements surface in the member dashboard until read.

### 3.3 Template lifecycle
1. Admin opens ADM-082, chooses a template, edits subject and body.
2. Saving creates a new version. The old version is retained.
3. Only one version is active per template key.
4. Preview renders with sample merge fields.

### 3.4 Campaign
1. Admin opens ADM-083, selects a segment (from PNL-03 saved cohorts).
2. Chooses channel: email, SMS, or both.
3. Composes or selects a template.
4. Confirms recipient count and estimated cost.
5. Schedules or sends. Delivery is queued and logged.

### 3.5 Investigate a failure
1. Admin opens ADM-084.
2. Filters by status = failed, provider = SMS.
3. Opens an attempt to see provider error, retry count, and next retry.
4. Can manually retry one or many.

---

## 4. Screen inventory

| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-080 | Announcement composer | `/admin/announcements/new`, `/admin/announcements/[id]/edit` | P0 |
| ADM-081 | Announcement list and performance | `/admin/announcements` | P0 |
| ADM-082 | Notification template management | `/admin/notifications/templates` | P1 |
| ADM-083 | Campaign / bulk messaging | `/admin/notifications/campaigns` | P1 |
| ADM-084 | Delivery log and failures | `/admin/notifications/deliveries` | P1 |

---

## 5. Entities

### 5.1 Announcement
id uuid
title string
body text
audience enum ALL | CHAPTER | TIER | COHORT
audience_ref string | null chapter code, tier key, or cohort id
priority enum LOW | MEDIUM | HIGH
status enum DRAFT | SCHEDULED | PUBLISHED | EXPIRED
publish_at timestamptz | null
expires_at timestamptz | null
created_by uuid
created_at timestamptz
read_by uuid[] members who have opened it

### 5.2 Notification template
key string e.g. "member.welcome"
version int
channel enum EMAIL | SMS | PUSH
subject string | null email only
body text
merge_fields string[] e.g. ["first_name", "chapter"]
active boolean
updated_by uuid
updated_at timestamptz

### 5.3 Campaign
id uuid
name string
segment_id uuid reference to PNL-03 segment
channels enum[] EMAIL, SMS
template_key string | null
subject string | null
body text
status enum DRAFT | SCHEDULED | SENDING | SENT | PAUSED | CANCELLED
scheduled_at timestamptz | null
sent_at timestamptz | null
recipient_count int
created_by uuid

### 5.4 Delivery attempt
id uuid
campaign_id uuid | null
announcement_id uuid | null
recipient_id uuid
channel enum EMAIL | SMS | PUSH
status enum QUEUED | SENT | DELIVERED | BOUNCED | FAILED | OPTED_OUT
provider string e.g. "postmark", "africastalking"
provider_ref string | null
error_code string | null
attempts int
last_attempt_at timestamptz
created_at timestamptz

---

## 6. Related panels

| Panel | Relationship |
|---|---|
| PNL-03 Members | Segments used by ADM-083 for targeting |
| PNL-04 Chapters | Chapter-scoped announcements |
| PNL-15 Compliance | Consent register (DPA-1); do-not-contact list |
| PNL-16 Data Protection | Opt-out and consent state |
| PNL-17 Analytics | Campaign and announcement reach rollups |

---

## 7. Acceptance criteria

- An admin composes and publishes an announcement to all members.
- A CHAPTER_LEADER can compose an announcement for their own chapter and
  cannot target another chapter.
- Members in the target audience see the announcement; others do not.
- Read receipts are recorded when a member opens an announcement.
- Editing a template creates a new version; the old version remains.
- A campaign to a segment shows the recipient count before sending and
  respects opt-outs.
- Every delivery attempt is recorded with provider, status and error.
- All five screens implement loading, empty, error, populated and
  permission-denied states.
- Zero P1 defects; WCAG 2.2 AA; responsive at 360/768/1280.

---

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Can announcements be edited after publishing, or are corrections a new announcement? Proposed: no editing after publish; use an "update" announcement. | Product Lead |
| Q2 | Is SMS a first-class channel in R1, or email + in-app only? | Product Lead |
| Q3 | Are read receipts mandatory on HIGH priority only, or tracked for all? Proposed: all, but only HIGH surfaces the count on the member dashboard. | Product Lead |
| Q4 | Should the delivery log retain provider payloads for debugging, or just error codes? DPA-7 minimisation suggests codes only. | Compliance Lead |
| Q5 | Is there a rate cap per member per day, to prevent fatigue? | Product Lead |
| Q6 | Does the campaign sender need a preview of the actual rendered email before send? | Product Lead |