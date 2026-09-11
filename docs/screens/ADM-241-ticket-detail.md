# SCREEN SPEC: [ADM-241] Ticket detail and member context

## 1. Identification
- **Screen ID:** ADM-241
- **Route:** `/admin/support/[id]`
- **Layer:** Admin Console
- **Panel:** PNL-20 Support Desk
- **Module:** Support (member SCR-032)
- **Release:** R1
- **Priority:** P0
- **Panel overview:** docs/panels/PNL-20-support-desk.md

## 2. Purpose

The working screen for a single support ticket. It shows the full
conversation, gives the agent the member's context at a glance, and
provides the reply composer with canned response insertion. It is where
support actually happens.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Reply, note, assign, resolve, close, reopen |
| SUPER_ADMIN | Full | As ADMIN, plus delete spam |
| CHAPTER_LEADER | Scoped | Reply + resolve for own chapter; cannot assign |
| FINANCE_OFFICER | Scoped | Billing tickets read-only |
| Others | Denied | Permission-denied card |

Helpers: `getTicketById(user, id)`, `getTicketMessages(user, id)`,
`addTicketMessage(user, id, body, isNote)`, `assignTicket`,
`resolveTicket`, `closeTicket`, `reopenTicket` in `lib/mock/support.ts`.

## 4. Entry & exit points

- **Reached from:** ADM-240 queue, PNL-03 member detail, PNL-01 task queue.
- **Leads to:**
  - PNL-03 member detail
  - The linked entity's detail screen (application, order, etc.)
  - ADM-220 audit log filtered by this ticket id
- **Deep-linkable:** yes.

## 5. Layout & regions

Desktop (lg+):

Two-column layout on `lg`, three on `xl`:

1. **Left column (main):**
   - Ticket header: reference, subject, status badge, priority badge.
   - Conversation: chronological message thread with member and agent
     messages distinguished by avatar and alignment. Internal notes are
     visually distinct and marked "Internal note".
   - Reply composer: textarea, "Insert canned response" button,
     "Internal note" toggle, Send button.
2. **Right column (context):**
   - Member card: name, email, member number, chapter, tier, KYC level.
     Links to PNL-03.
   - Ticket metadata: category, assignee, created, first response,
     resolved.
   - Linked entity card: if the ticket is linked to an order,
     application or other entity, show a compact card with a link.
   - Actions: Assign, Resolve, Close, Reopen (state-dependent).
3. **Internal notes** are visually distinguished (yellow left border)
   and never appear in the member-facing view.

Mobile (xs/sm):
- Single column: context card collapses to a header strip.
- Composer is docked at the bottom.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps context panels |
| 2 | StatusBadge | Atom | mapped | Priority and status |
| 3 | Button | Atom | — | Send, Assign, Resolve, Close |
| 4 | Textarea | Atom | — | Reply body |
| 5 | Avatar | Atom | — | Member and agent avatars |
| 6 | ConfirmDialog | Dialog | — | Resolve, close, reopen |
| 7 | Toast | Molecule | — | Reply sent, state changes |
| 8 | CannedResponsePicker | **New** | — | See §6.1 |
| 9 | TicketThread | **New** | — | See §6.2 |

### 6.1 CannedResponsePicker (new component)

A dropdown/modal for finding and inserting a canned response.

- Search across title, body, tags.
- Group by category.
- Selecting one inserts the body into the reply composer at the cursor.
- Keyboard navigable: arrow keys to select, Enter to insert, Escape to close.
- Accessibility: `role="dialog"`, `aria-modal="true"`.

### 6.2 TicketThread (new component)

Renders the message thread.

- Member messages left-aligned, agent messages right-aligned.
- Internal notes appear inline with a distinct style (yellow left
  border, "Internal note" label, `aria-label="internal note"`).
- Each message shows author, timestamp, and body.
- Long threads collapse older messages behind a "Show earlier" control.
- Accessibility: `<ol>` with `<li>` per message.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Reference | ticket.reference | string | yes | — | read | internal |
| Subject | ticket.subject | string | yes | — | read | internal |
| Status | ticket.status | enum | yes | — | read | internal |
| Priority | ticket.priority | enum | yes | — | read | internal |
| Category | ticket.category | enum | yes | — | read | internal |
| Member | member.* | object | yes | — | read | PII |
| Body | message.body | text | yes | 1–4000 chars | read | internal |
| Internal note | message.is_internal_note | boolean | yes | — | read | internal |
| Linked entity | ticket.linked_entity_* | mixed | no | — | read | internal |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Send reply | Composer | ADMIN, CHAPTER_LEADER | none | `addTicketMessage(id, body, false)` | Thread updates | Toast error | yes |
| 2 | Add internal note | Composer (note mode) | ADMIN, CHAPTER_LEADER | none | `addTicketMessage(id, body, true)` | Thread updates | Toast error | yes |
| 3 | Insert canned | Picker | as screen | none | — | Body inserted | — | no |
| 4 | Assign | Context action | ADMIN | Picker modal | `assignTicket(id, userId)` | Badge updates | Toast error | yes |
| 5 | Resolve | Context action | ADMIN, CHAPTER_LEADER | ConfirmDialog | `resolveTicket(id)` | Status updates | Toast error | yes |
| 6 | Close | Context action | ADMIN | ConfirmDialog | `closeTicket(id)` | Status updates | Toast error | yes |
| 7 | Reopen | Context action | SUPER_ADMIN | ConfirmDialog | `reopenTicket(id)` | Status updates | Toast error | yes |
| 8 | View member | Context card | as read | none | — | Navigate to PNL-03 | — | no |
| 9 | View linked entity | Context card | as read | none | — | Navigate to entity | — | no |

## 9. States

| State | Design |
|---|---|
| Loading | Skeleton header, skeleton thread (4 messages), skeleton context cards |
| Populated | Default render |
| Empty thread | "No messages yet." (possible only for imported tickets) |
| Error | error.tsx boundary |
| Permission denied | "You don't have access to this ticket." |
| Ticket not found | "Ticket not found." |
| Sending | Send button disabled, loading indicator |
| Send error | Inline error: "Message could not be sent." + Retry |
| Success | Thread updates immediately (optimistic) |

## 10. Validation & error handling

- **Empty message body** — Send disabled.
- **Message over 4000 chars** — inline error.
- **Resolve without an agent reply** — warning in confirm dialog,
  allowed.
- **Reopen a ticket that is not resolved or closed** — hidden action.
- **Assign to a user who is not an agent** — picker only lists agents.

Error codes: `SUPPORT_MESSAGE_EMPTY`, `SUPPORT_MESSAGE_TOO_LONG`,
`SUPPORT_TICKET_NOT_FOUND`, `SUPPORT_STATE_INVALID`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Single column | Context card collapses; composer docks bottom |
| sm >=640 | Single column | As xs |
| md >=768 | Two column | Context sidebar 300px |
| lg >=1024 | Two column | Context sidebar 360px |
| xl >=1280 | Two column | Comfortable spacing |

## 12. Accessibility

- Thread uses `<ol>` with `<li>` per message.
- Internal notes have `aria-label` marking them as internal.
- Reply composer has a visible label and `aria-describedby` for hints.
- Canned response picker traps focus, ESC closes.
- State-change confirmations use `role="dialog"` with a focus trap.
- Focus returns to the reply composer after sending.

## 13. Performance

- Thread initially renders last 20 messages; older messages load on demand.
- Payload per page ≤ 60 KB.
- Canned response list is fetched once and cached in memory.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.support.ticket_viewed` | ticket_id, status, is_mine |
| `admin.support.replied` | ticket_id, is_internal_note, used_canned |
| `admin.support.state_changed` | ticket_id, from_status, to_status |
| `admin.support.assigned` | ticket_id, assignee_is_self |
| `admin.support.entity_opened` | entity_type |

## 15. Copy

- Page title: ticket reference
- Subtitle: subject
- Context labels: "Member", "Category", "Assignee", "Created", "First response", "Resolved"
- Composer placeholder: "Write a reply…"
- Composer buttons: "Insert canned response", "Internal note", "Send"
- Internal note warning: "This note is only visible to agents."
- Assign dialog: "Assign to…"
- Resolve dialog: "Mark as resolved?" / "The member will be notified." / "Resolve"
- Close dialog: "Close this ticket?" / "It will no longer appear in the open queue." / "Close"
- Reopen dialog: "Reopen this ticket?" / "It will return to Open." / "Reopen"
- Empty thread: "No messages yet."
- Permission denied: "You don't have access to this ticket."
- Not found: "Ticket not found."
- i18n keys: `admin.support.detail.*`, `admin.support.composer.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Are internal notes rendered in the same thread as replies, or in a separate "Notes" tab? Proposed: same thread with distinct styling. | Product Lead |
| 2 | Can an agent edit a message after sending? Proposed: no; corrections are new messages. | Compliance Lead |
| 3 | Should the reply trigger an email to the member immediately, or batch? Proposed: immediate. | Product Lead |
| 4 | Is there a "Transfer to another agent" action, or only re-assign? Proposed: re-assign only. | Product Lead |
| 5 | Does resolving a ticket require a resolution code? Proposed: no in R1. | Product Lead |