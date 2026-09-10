# PNL-08 — Events

**Panel ID:** PNL-08
**Layer:** Layer 3 — Admin Console
**Release:** R2 (listing), R3 (commerce, ticketing, check-in)
**Gate:** FEATURE_COMMERCE behind G-4 for paid events
**Screens:** 5 (ADM-090 to ADM-094)
**Status:** Spec baselined, build pending

---

## 1. Purpose

PNL-08 is the operational home for every event TEG runs — campus gatherings,
professional chapter meetups, regional conferences, webinars, trainings and
fundraisers. It carries the event from creation through publication, ticketing,
attendance and post-event analysis.

It serves two audiences at once:

- **Administrators and chapter leaders** who create and run events.
- **Finance officers** who reconcile ticket revenue and process refunds.

Every event is chapter-scoped or organisation-wide. A CHAPTER_LEADER sees and
manages only their own chapter's events. An ADMIN sees all events.

---

## 2. Users and permissions

| Role | Scope within PNL-08 |
|---|---|
| ADMIN | Full CRUD on all events; publish; cancel; export; view analytics |
| SUPER_ADMIN | As ADMIN, plus override of locked/completed events |
| CHAPTER_LEADER | Create and manage events for own chapter only; check-in; view own analytics |
| FINANCE_OFFICER | View all registrations and revenue; issue refunds (four-eyes) |
| MENTOR | No access |
| MEMBER | No access (member-facing screens are SCR-100 to SCR-103) |

Scoping is enforced by `lib/mock/events.ts` helpers, mirroring the RLS pattern
used in `lib/mock/chapters.ts`. The UI hides what a role cannot do; the helper
rejects it independently.

---

## 3. Workflows

### 3.1 Create and publish an event
1. Admin opens `/admin/events` -> **Create event**.
2. Fills ADM-091: title, description, type, chapter, venue or online link,
   start/end, capacity, ticket tiers and pricing.
3. Saves as DRAFT. Optionally previews the member-facing detail page (SCR-101).
4. Publishes. Status moves DRAFT -> PUBLISHED. The event appears on `/events`.

### 3.2 Sell and check in
1. Member purchases a ticket (SCR-101, R3, gated on G-4).
2. Webhook confirms; registration moves PENDING -> CONFIRMED; QR ticket issued.
3. On the day, staff open ADM-093 on a phone and scan tickets at the door.
4. Registration moves CONFIRMED -> CHECKED_IN. A running counter updates live.
5. After the event, un-scanned registrations become NO_SHOW.

### 3.3 Refund
1. Finance officer opens ADM-092, selects a registration, requests a refund.
2. Refund creates an `approval_request` of type REFUND.
3. A second finance officer or admin approves. Initiator is not the approver.
4. Registration moves CONFIRMED -> REFUNDED; ledger receives a reversing entry.

### 3.4 Analyse
1. Admin or chapter leader opens ADM-094.
2. Views sales, attendance and no-show rate for the event.
3. Every rate displays its denominator.

---

## 4. Screen inventory

| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-090 | Event list | `/admin/events` | P0 |
| ADM-091 | Create / edit event | `/admin/events/new`, `/admin/events/[id]/edit` | P0 |
| ADM-092 | Registrations and attendee list | `/admin/events/[id]/registrations` | P0 |
| ADM-093 | Check-in (QR scan, mobile) | `/admin/events/[id]/check-in` | P0 |
| ADM-094 | Event analytics | `/admin/events/[id]/analytics` | P1 |

---

## 5. Entities

### 5.1 Event
id uuid
slug string unique, URL-safe
title string
description text
type enum CONFERENCE | WEBINAR | MEETUP | TRAINING | FUNDRAISER
chapter_id uuid | null null = organisation-wide
venue_name string | null
venue_address string | null
online_url string | null required when type = WEBINAR
starts_at timestamptz
ends_at timestamptz
capacity int | null null = unlimited
status enum DRAFT | PUBLISHED | SOLD_OUT | ONGOING | COMPLETED | CANCELLED
cover_image string | null
created_by uuid
created_at timestamptz
updated_at timestamptz

### 5.2 Ticket tier
id uuid
event_id uuid
name string e.g. "Standard", "Student", "VIP"
price_minor bigint integer minor units. Never a float.
currency char(3) ISO 4217, e.g. KES
quantity int | null null = unlimited within event capacity
sold int derived, read-only
sales_open timestamptz
sales_close timestamptz

### 5.3 Registration
id uuid
event_id uuid
tier_id uuid
member_id uuid
status enum PENDING | CONFIRMED | CHECKED_IN | CANCELLED | REFUNDED | NO_SHOW
reference string unique, e.g. "EVT-26-0042"
qr_token string opaque, signed, single-use for check-in
amount_minor bigint
currency char(3)
payment_id uuid | null
registered_at timestamptz
checked_in_at timestamptz | null
checked_in_by uuid | null

---

## 6. Related panels

| Panel | Relationship |
|---|---|
| PNL-04 Chapters | Events belong to a chapter; chapter detail links to its events |
| PNL-09 Commerce and Finance | Ticket revenue, settlements, refunds, reconciliation |
| PNL-07 Communications | Event announcements and reminders |
| PNL-17 Analytics and Reporting | Event metrics roll up to engagement analytics |
| PNL-02 Applications | No direct link; both surface in global search |

---

## 7. Acceptance criteria

- An admin creates, publishes, and cancels an event unaided.
- A CHAPTER_LEADER can create an event for their chapter and cannot see or edit
  another chapter's event through the UI or the helper layer.
- A member can register for a published event and receive a QR ticket.
- Check-in works on a 360px phone, one-handed, at a door, with a visible
  running count and a manual lookup fallback.
- A refund is requested by one user and cannot be approved by the same user.
- ADM-094 shows sales, attendance and no-show rate, each with its denominator.
- All five screens implement loading, empty, error, populated and
  permission-denied states.
- Zero P1 defects; WCAG 2.2 AA on all five screens; responsive at 360/768/1280.

---

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Confirm the event `type` enum. Proposed: CONFERENCE, WEBINAR, MEETUP, TRAINING, FUNDRAISER. | Product Lead |
| Q2 | Can an event belong to more than one chapter (joint events)? | Product Lead |
| Q3 | Is check-in available offline with queued sync, or live-connectivity only? PWA-7 forbids queuing *financial* writes; check-in is not financial. | Tech Lead |
| Q4 | Recurring events: single event with multiple dates, or one event per occurrence? | Product Lead |
| Q5 | Refund window — automatic before event, manual after? | Finance |
| Q6 | Does a no-show consume the ticket, or can it be transferred? | Product Lead |

**Q3 answered:** check-in is queued offline and replayed on reconnect. See
ADM-093 §11 for the behaviour and constraints. The financial-write prohibition
in PWA-7 does not apply.