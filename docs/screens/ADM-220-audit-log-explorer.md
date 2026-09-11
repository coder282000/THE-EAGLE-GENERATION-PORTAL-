# SCREEN SPEC: [ADM-220] Audit log explorer

## 1. Identification
- **Screen ID:** ADM-220
- **Route:** `/admin/audit`
- **Layer:** Admin Console
- **Panel:** PNL-18 Audit and Security
- **Module:** Audit (Charter RO-9, §22.5)
- **Release:** R1
- **Priority:** P0
- **Related requirements:** RO-9, section 22.5
- **Panel overview:** docs/panels/PNL-18-audit-security.md

## 2. Purpose

The primary interface to the append-only audit log. Every privileged
action taken on the platform is recorded here: who did it, what they
did, to which entity, when, and with what before/after values. It is
the artefact auditors ask for first and the record that lets TEG
demonstrate that controls were designed and operated.

The screen is read-only. Nothing on it can modify an entry.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All entries |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Scoped | Entries where the actor or target belongs to their chapter |
| FINANCE_OFFICER | Scoped | Entries whose action prefix is financial (refund, payout, transaction, ledger) |
| Others | Denied | Permission-denied card |

Helpers: `getAuditEntries(user, filters)`, `canExportAudit(user)` in
`lib/mock/audit.ts`. The scoping rules above are enforced in the helper,
not the UI.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Audit), PNL-01 dashboard ("Recent
  admin activity"), any "View audit trail" link in other panels.
- **Leads to:**
  - ADM-221 entity trail (`/admin/audit/entity/[type]/[id]`)
  - PNL-03 member detail
  - Any entity's detail screen via the entity_id link
- **Deep-linkable:** yes. Query parameters:
  `?actorId=&action=&entityType=&from=&to=&q=&page=2`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Audit log" title, subtitle explaining immutability,
   secondary "Export" action.
2. **Filter bar** — free-text search, actor picker, action prefix picker,
   entity type picker, date range. All filters persist to URL.
3. **Stats row** — four StatTiles: Entries (24h), Distinct actors (24h),
   Failed actions (24h), Rate of change vs prior period.
4. **Data table** — columns: Time, Actor, Action, Entity, IP, Result,
   Link.
5. **Pagination** — cursor-friendly.

Mobile (xs/sm):
- Filters in a Sheet.
- Table becomes a card list: time, actor, action summary, link.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatTile | Local | derived | Label + value + change |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | Select | Atom | static + dynamic | Action prefix, entity type, actor |
| 5 | DataTable | Pattern | `getAuditEntries()` | Manual markup, sortable time only |
| 6 | Pagination | Molecule | cursor | xs fallback |
| 7 | EmptyState | Molecule | — | Filtered-empty and first-use |
| 8 | AuditDetailDrawer | **New** | — | See §6.1 |

### 6.1 AuditDetailDrawer (new component)

Right-hand drawer showing the full entry: actor, action, entity, before
snapshot, after snapshot, IP, user agent, timestamp.

- The `before` and `after` JSON objects render as syntax-highlighted
  diff-style blocks (red for removed keys, green for added or changed).
- Sensitive fields (identity document numbers, passwords if ever
  audited) are masked with `••••` and a "reveal" toggle visible only to
  SUPER_ADMIN.
- A link at the bottom opens the entity's trail (ADM-221).
- Focus trap; ESC closes.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Time | entry.created_at | timestamptz | yes | — | read | internal |
| Actor name | user.name | string | yes | — | read | internal |
| Actor role | entry.actor_role | string | yes | — | read | internal |
| Action | entry.action | string | yes | — | read | internal |
| Entity type | entry.entity_type | string | yes | — | read | internal |
| Entity id | entry.entity_id | uuid | no | — | read | internal |
| Before | entry.before | jsonb | no | — | read | sensitive |
| After | entry.after | jsonb | no | — | read | sensitive |
| IP address | entry.ip_address | inet | no | — | read | PII |
| User agent | entry.user_agent | text | no | — | read | internal |

The `before` and `after` objects may contain PII; they are treated as
restricted for chapter-scoped readers.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Filter | FilterBar | as read | none | `getAuditEntries(filters)` | Table updates | — | no |
| 2 | Open detail | Row click | as read | none | `getAuditEntryById(id)` | Drawer opens | — | no |
| 3 | View entity trail | Drawer link | as read | none | — | Navigate to ADM-221 | — | no |
| 4 | Export filtered | Header action | ADMIN, SUPER_ADMIN, FINANCE_OFFICER | ConfirmDialog if rows > 500 | `exportAuditEntries(filters)` | CSV download | Toast error | yes |
| 5 | Copy entry id | Drawer action | as read | none | — | Clipboard + toast | — | no |

Every export is itself audited. This is deliberate: the fact that the
audit log was read is part of the audit trail.

## 9. States

| State | Design |
|---|---|
| Empty (first use) | "No audit entries yet." |
| Empty (filtered) | "No entries match these filters." + "Clear filters" |
| Loading | Skeleton stats ×4, skeleton rows ×6 |
| Populated | Default render |
| Populated, extreme | Default range is last 7 days to avoid loading millions |
| Partial | Stats load, table error -> inline retry |
| Error | error.tsx boundary + inline retry |
| Permission denied | "You don't have access to the audit log." |
| Success | Toast on export and copy |

## 10. Validation & error handling

- **Date range > 90 days** -> warning banner "Exporting more than 90 days
  may be slow. Narrow the range or continue." with confirm.
- **Filters combined to zero results** -> filtered-empty state.
- **Export with 0 rows** -> button disabled.
- **Export large** -> progress indicator; the mock generates instantly,
  the real backend streams.
- **Drawer open on missing entry** (deleted between click and open) ->
  toast "This entry is no longer available." and close.

Error codes: `AUDIT_ENTRY_NOT_FOUND`, `AUDIT_EXPORT_FAILED`,
`AUDIT_PERMISSION_RESTRICTED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table → card list; drawer → full-screen |
| sm >=640 | Stacked | Stats 2-up |
| md >=768 | Table | Table returns; stats 4-up |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable columns |

## 12. Accessibility

- Table: `<caption>`, `<th scope="col">`, time column `aria-sort`.
- Row click is a keyboard-reachable button in the first cell, not a
  click handler on `<tr>`.
- Drawer: `role="dialog"`, `aria-modal="true"`, focus trap, ESC.
- The before/after diff has a screen-reader-friendly text summary
  alternative above the diff blocks.
- Colour alone is never the signal for a change; `+` and `−` markers
  and text labels accompany the diff colours.

## 13. Performance

- Default filter: last 7 days.
- Table page payload <= 80 KB for 25 rows (before/after blobs are only
  loaded on the row click, not in the list).
- Export streams server-side for large ranges.
- `useMemo` on the filtered list; URL sync via `useSearchParams`.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.audit.viewed` | role, range_days |
| `admin.audit.filtered` | actor, action_prefix, entity_type, has_query |
| `admin.audit.detail_opened` | entry_id, action |
| `admin.audit.exported` | row_count, range_days, filters_applied |
| `admin.audit.entity_trail_opened` | entity_type |

## 15. Copy

- Page title: "Audit log"
- Subtitle: "An immutable record of privileged actions. Entries cannot be edited or deleted."
- Filters: "All actors", "All actions", "All entity types", "Last 7 days"
- Stats labels: "Entries (24h)", "Distinct actors (24h)", "Failed actions (24h)", "Change vs prior 24h"
- Column headers: Time, Actor, Action, Entity, IP, Result, Link
- Empty (first use): "No audit entries yet."
- Empty (filtered): "No entries match these filters." / "Clear filters"
- Drawer title: the action label
- Diff section: "Before" / "After"
- Drawer link: "View full entity trail"
- Export dialog: "Export N entries?" / "The export itself is audited." / "Export"
- Permission denied: "You don't have access to the audit log."
- i18n keys: `admin.audit.*`, `admin.audit.action.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should the before/after diff be shown inline in the table, or only in the drawer? Proposed: drawer only, to keep the list fast. | Tech Lead |
| 2 | How is an audit entry's "result" defined — success/failure, or a status? Proposed: success/failure plus optional message. | Tech Lead |
| 3 | Should the action prefix picker be a fixed list or free text with autocomplete? Proposed: fixed list of known prefixes plus "Other". | Product Lead |
| 4 | Is export itself audited as a distinct action, or does it reuse a generic "read" entry? Proposed: distinct action `audit.exported`. | Compliance Lead |
| 5 | For chapter-scoped readers, are entries whose actor is org-level but whose target is their chapter visible? Proposed: yes. | Compliance Lead |
| 6 | Is the IP address displayed in full, or masked for non-SUPER_ADMIN? Proposed: full for ADMIN and above, masked otherwise. | Compliance Lead |