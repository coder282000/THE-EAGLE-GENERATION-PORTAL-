# SCREEN SPEC: [ADM-240] Ticket queue

## 1. Identification
- **Screen ID:** ADM-240
- **Route:** `/admin/support`
- **Layer:** Admin Console
- **Panel:** PNL-20 Support Desk
- **Module:** Support (member SCR-032)
- **Release:** R1
- **Priority:** P0
- **Panel overview:** docs/panels/PNL-20-support-desk.md

## 2. Purpose

The operational queue of open support tickets. It answers three
questions: what is new, what is mine, and what is overdue. It is the
entry point to every ticket and the screen an agent leaves open all
day.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All tickets |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Scoped | Tickets from their chapter's members |
| FINANCE_OFFICER | Scoped | Tickets with category BILLING |
| Others | Denied | Permission-denied card |

Helpers: `getTickets(user, filters)`, `getTicketStats(user)`,
`canAssignTicket(user)`, `canResolveTicket(user)` in `lib/mock/support.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Support), PNL-01 dashboard queue
  widget ("New tickets").
- **Leads to:**
  - ADM-241 ticket detail (`/admin/support/[id]`)
  - PNL-03 member detail
  - PNL-09 order detail (for billing tickets)
- **Deep-linkable:** yes. `?status=NEW&priority=HIGH&assignee=me&q=&page=2`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Support", subtitle, primary action "New ticket"
   (for phone-in support), secondary "Export".
2. **Stats row** — four StatTiles: New, Unassigned, Assigned to me,
   Oldest open (age in hours).
3. **Filter tabs** — All / New / Open / Pending member / Resolved.
4. **Filter bar** — search, priority, category, assignee.
5. **Data table** — columns: Reference, Subject, Member, Category,
   Priority, Assignee, Age, Status.
6. **Pagination** — cursor-friendly.

Mobile (xs/sm):
- Stats 2-up.
- Filters in a Sheet.
- Table → card list.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatTile | Local | derived | Label + value |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | Select | Atom | static | Priority, category, assignee |
| 5 | DataTable | Pattern | `getTickets()` | Manual markup |
| 6 | StatusBadge | Atom | mapped | Priority and status → StatusKey |
| 7 | Pagination | Molecule | cursor | xs fallback |
| 8 | EmptyState | Molecule | — | First-use and filtered-empty |

No new design-system components required.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Reference | ticket.reference | string | yes | — | read | internal |
| Subject | ticket.subject | string | yes | — | read | internal |
| Member | member.name | string | yes | — | read | PII |
| Category | ticket.category | enum | yes | — | read | internal |
| Priority | ticket.priority | enum | yes | — | read | internal |
| Assignee | user.name | string | no | — | read | internal |
| Age | derived (now - created) | duration | yes | — | read | internal |
| Status | ticket.status | enum | yes | — | read | internal |

Age is displayed as "2h", "3d", etc. Colour shifts to warn at SLA
thresholds.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Open ticket | Row click | as read | none | — | Navigate to ADM-241 | — | no |
| 2 | Assign to me | Row action | ADMIN, CHAPTER_LEADER | none | `assignTicket(id, user.id)` | Row updates | Toast error | yes |
| 3 | Mark resolved | Row action | ADMIN | ConfirmDialog | `resolveTicket(id)` | Row updates | Toast error | yes |
| 4 | Filter | FilterBar | as read | none | `getTickets(filters)` | Table updates | — | no |

## 9. States

| State | Design |
|---|---|
| Empty (first use) | "No tickets yet. Quiet day." |
| Empty (filtered) | "No tickets match these filters." + "Clear filters" |
| Loading | Skeleton stats ×4, skeleton rows ×6 |
| Populated | Default render |
| Populated, extreme | Pagination at 25 |
| Partial | Stats load, table error → inline retry |
| Error | error.tsx boundary |
| Permission denied | "You don't have access to support." |
| Success | Toast on assign, resolve |

## 10. Validation & error handling

- **Assign to self when already assigned** — button hidden.
- **Resolve a ticket with no agent reply** — allowed, with a warning
  in the confirm dialog.
- **Filter combination with no results** — filtered-empty state.

Error codes: `SUPPORT_TICKET_NOT_FOUND`, `SUPPORT_ASSIGN_FAILED`,
`SUPPORT_RESOLVE_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table → cards |
| sm >=640 | Stacked | As xs |
| md >=768 | Table | Table returns; stats 4-up |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable columns |

## 12. Accessibility

- Table: `<caption>`, `<th scope="col">`, `aria-sort` on age.
- Priority badge text, not colour alone.
- Row click is a `<button>` or `<Link>`, not a click handler on `<tr>`.
- Age uses `<time datetime>`.

## 13. Performance

- Table page payload ≤ 40 KB for 25 rows.
- Default filter: open tickets (not resolved or closed).
- Search debounce 300ms.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.support.queue_viewed` | role, filter_count |
| `admin.support.ticket_opened` | ticket_id, status |
| `admin.support.assigned` | ticket_id, assignee_is_self |
| `admin.support.resolved` | ticket_id, had_reply |

## 15. Copy

- Page title: "Support"
- Subtitle: "Member help requests."
- Primary action: "New ticket"
- Filters: "All statuses", "All priorities", "All categories", "All assignees", "Assigned to me"
- Stats labels: "New", "Unassigned", "Assigned to me", "Oldest open"
- Column headers: Reference, Subject, Member, Category, Priority, Assignee, Age, Status
- Row actions: "Assign to me", "Resolve"
- Priority labels: Low, Normal, High, Urgent
- Status labels: New, Open, Pending member, Resolved, Closed
- Empty (first use): "No tickets yet. Quiet day."
- Empty (filtered): "No tickets match these filters." / "Clear filters"
- Permission denied: "You don't have access to support."
- i18n keys: `admin.support.*`, `admin.support.priority.*`, `admin.support.status.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should the queue default to New + Open, or all statuses? Proposed: New + Open + Pending. | Product Lead |
| 2 | Is "Assign to me" one-click, or does it open a picker? Proposed: one-click for speed; the detail page has a full picker. | Product Lead |
| 3 | Are URGENT tickets visually distinguished in the list, or is the priority badge sufficient? Proposed: subtle left border on the row. | Product Lead |
| 4 | What is the "Oldest open" stat — hours since creation, or hours since last agent touch? Proposed: since creation. | Product Lead |
| 5 | Can a CHAPTER_LEADER resolve tickets, or only respond? Proposed: respond and resolve for their chapter. | Product Lead |