# SCREEN SPEC: [ADM-221] Audit trail for a single entity

## 1. Identification
- **Screen ID:** ADM-221
- **Route:** `/admin/audit/entity/[type]/[id]`
- **Layer:** Admin Console
- **Panel:** PNL-18 Audit and Security
- **Module:** Audit (Charter RO-9, §22.5)
- **Release:** R1
- **Priority:** P0
- **Related requirements:** RO-9, section 22.5
- **Panel overview:** docs/panels/PNL-18-audit-security.md

## 2. Purpose

Answers a single question: *what has ever happened to this record?* The
screen shows the complete chronological history of one entity — an
application, a member, an order, a loan, an event, a transaction — with
every state transition, every note, every approval, and every reversal
preserved.

Where ADM-220 is search across the whole log, ADM-221 is the timeline of
one thing. Together they serve the audit workflow: the explorer finds
the entry, the entity trail explains its context.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Any entity type |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Scoped | Only entities belonging to their chapter |
| FINANCE_OFFICER | Scoped | Only financial entity types: order, transaction, refund, payout, ledger |
| Others | Denied | Permission-denied card |

Helpers: `getEntityAuditTrail(type, id, user)` in `lib/mock/audit.ts`.
The helper enforces the scoping rules; the UI hides what the user cannot
see but is not the control.

## 4. Entry & exit points

- **Reached from:**
  - ADM-220 audit log drawer -> "View full entity trail"
  - Any entity's detail screen -> "Audit trail" tab or link (e.g. PNL-02
    application detail, PNL-03 member detail)
- **Leads to:**
  - The entity's own detail screen (via a prominent "Open entity" action)
  - ADM-220 filtered to this entity type
- **Deep-linkable:** yes. The route is complete on its own.
- **Entity types supported:** application, member, order, transaction,
  refund, loan, circle, event, campaign, template, announcement, role.

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — entity label ("Application APP-26-100001"), type
   badge, breadcrumb back to ADM-220 or the source screen. Primary
   action "Open entity".
2. **Entity summary card** — a compact rendering of the entity's current
   state: name, current status, created date, last modified. Uses the
   same fields as the entity's own detail screen but read-only.
3. **Timeline** — chronological, newest first. Each entry shows:
   - Timestamp (relative for <24h, absolute beyond)
   - Actor (name + role)
   - Action (human label)
   - Short summary
   - Expand control for before/after diff
4. **Filter chips** — "All actions", "State changes", "Notes",
   "Approvals", "Financial".
5. **Empty state** — if no entries exist for the entity (possible only
   for entities created before auditing was enforced).

Mobile (xs/sm):
- Timeline only; summary collapses to a single line.
- Filters in a horizontal chip scroller.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps summary and timeline |
| 2 | StatusBadge | Atom | mapped | Entity status |
| 3 | Timeline | **New** | — | See §6.1 |
| 4 | DiffBlock | **New** | — | See §6.2 |
| 5 | FilterChip | **New** | — | See §6.3 |

### 6.1 Timeline (new component)

A vertical chronological list of audit entries.

- Each entry has a left-hand icon column colour-coded by category
  (status change, note, approval, financial, reversal).
- Timestamps use relative format ("2m ago", "3h ago") with absolute
  dates shown on hover and in the expanded view.
- The most recent entry is visually emphasised with a subtle ring.
- If there are more than 50 entries, the list paginates at 50 with a
  "Load older entries" button.
- Accessibility: `<ol>` with `<li>` per entry; each entry's heading is
  an `<h3>`.

### 6.2 DiffBlock (new component)

Expands to show the before/after snapshot of a single action.

- Renders two columns on `md+`, stacked on mobile.
- Colours: additions in green, removals in red, changed values with
  both sides shown.
- A `+` and `−` prefix marker accompanies every coloured line.
- Falls back to a plain text "no changes recorded" note when both
  snapshots are identical.

### 6.3 FilterChip (new component)

A small toggleable chip used to filter the timeline.

- Props: `label`, `active`, `count`, `onToggle`.
- Displays the count of entries that match this filter when inactive
  (`Notes (3)`) and hides the count when active.
- Multiple chips compose with OR.
- Accessibility: `role="button"`, `aria-pressed`.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Entity type | entry.entity_type | string | yes | in supported list | read | internal |
| Entity id | entry.entity_id | uuid | yes | — | read | internal |
| Entity label | derived from entity | string | yes | — | read | internal |
| Current status | derived from entity | string | yes | — | read | internal |
| Timeline entries | `getEntityAuditTrail()` | array | yes | — | read | internal |
| Before / after | entry.before / entry.after | jsonb | no | — | read | sensitive |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Open entity | Header action | as read | none | — | Navigate to entity detail | — | no |
| 2 | Filter timeline | Filter chips | as read | none | `getEntityAuditTrail(type, id, filters)` | List updates | — | no |
| 3 | Expand entry | Timeline row | as read | none | — | Diff appears | — | no |
| 4 | Load older entries | Bottom action | as read | none | `getEntityAuditTrail(type, id, { before: cursor })` | Appends | Toast error | no |
| 5 | Copy entity id | Header action | as read | none | — | Clipboard + toast | — | no |
| 6 | Back to explorer | Breadcrumb | as read | none | — | Navigate to ADM-220 | — | no |

## 9. States

| State | Design |
|---|---|
| Empty (no entries) | "No audit entries for this entity." |
| Loading | Skeleton header, skeleton summary card, skeleton timeline entries ×8 |
| Populated | Default render |
| Populated, extreme | Pagination at 50; timestamps remain relative |
| Partial | Header loads, timeline errors -> inline retry |
| Error | error.tsx boundary |
| Permission denied | "You don't have access to this entity's audit trail." |
| Entity not found | "Entity not found. It may have been deleted." |
| Success | Toast on copy |

## 10. Validation & error handling

- **Unknown entity type in URL** -> 404 state: "That entity type is not
  supported by the audit trail."
- **Entity id exists but has no entries** -> empty state with
  explanation.
- **Cursor pagination error** -> "We couldn't load older entries." with
  retry.
- **Expand error** -> "Could not load the change details."

Error codes: `AUDIT_ENTITY_NOT_FOUND`, `AUDIT_ENTITY_TYPE_INVALID`,
`AUDIT_CURSOR_INVALID`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Single column | Summary collapses to one line; timeline full width; diff stacks |
| sm >=640 | Single column | As xs |
| md >=768 | Two columns for diff | Timeline wider |
| lg >=1024 | Two columns for diff | Sidebar visible; comfortable spacing |
| xl >=1280 | Same | No behavioural change |

## 12. Accessibility

- `<ol>` for the timeline; each entry has an `<h3>`.
- Diff uses text labels `+` and `−` in addition to colour.
- FilterChip uses `aria-pressed`.
- Focus order: header -> summary -> filters -> timeline -> load older.
- Relative timestamps have absolute times in `<time datetime="...">`.
- Expand control uses `aria-expanded`.

## 13. Performance

- Timeline page payload <= 60 KB for 50 entries (diffs excluded).
- Diff snapshots load only when the entry is expanded.
- Cursor pagination for older entries; default 50 per load.
- No charts or heavy libraries on this route.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.entity_trail.viewed` | entity_type, entry_count |
| `admin.entity_trail.filtered` | filter_name, active |
| `admin.entity_trail.entry_expanded` | action |
| `admin.entity_trail.loaded_older` | cursor_present |
| `admin.entity_trail.entity_opened` | entity_type |

## 15. Copy

- Page title: entity label (e.g. "Application APP-26-100001")
- Subtitle: "Complete history of this {entity type}."
- Primary action: "Open entity"
- Breadcrumb: "Audit log / {entity type} / {label}"
- Filter chips: "All actions", "State changes", "Notes", "Approvals", "Financial"
- Timeline heading: nothing; it is a plain list
- Entry format: "**{actor}** {action summary} at {relative time}"
- Load older: "Load older entries"
- Empty (no entries): "No audit entries for this entity."
- Entity not found: "Entity not found. It may have been deleted."
- Permission denied: "You don't have access to this entity's audit trail."
- Invalid type: "That entity type is not supported by the audit trail."
- i18n keys: `admin.entity_trail.*`, `admin.entity_trail.action.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should the summary card link to the entity's own screen, or is the header "Open entity" button sufficient? Proposed: both. | Product Lead |
| 2 | Are relative timestamps desirable in an audit context, or should everything be absolute? Proposed: relative for recent, absolute for older, with `<time>` for both. | Compliance Lead |
| 3 | When an entity is soft-deleted, is its trail still visible? Proposed: yes, and the summary shows "Deleted on {date}". | Compliance Lead |
| 4 | Is there a "Print" or "Save as PDF" action for a regulatory file? Proposed: yes in R3, deferred from R1. | Compliance Lead |
| 5 | For financial entities, should the diff highlight ledger entries inline, or link to the ledger explorer? Proposed: link to PNL-09 ledger explorer. | Finance |
| 6 | How is the "Newest first" ordering enforced when entries share the same timestamp (e.g. bulk import)? Proposed: `id` descending as tiebreaker. | Tech Lead |