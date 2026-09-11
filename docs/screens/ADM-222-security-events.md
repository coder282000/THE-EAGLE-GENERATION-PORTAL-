# SCREEN SPEC: [ADM-222] Security events

## 1. Identification
- **Screen ID:** ADM-222
- **Route:** `/admin/security/events`
- **Layer:** Admin Console
- **Panel:** PNL-18 Audit and Security
- **Module:** Audit / Security (Charter §22.1, §22.6)
- **Release:** R2
- **Priority:** P1
- **Related requirements:** section 22.5, 22.6
- **Panel overview:** docs/panels/PNL-18-audit-security.md

## 2. Purpose

The operational queue of security events: failed logins, lockouts,
privilege changes, forced logouts, and anomalies detected by the platform.
Not every event is a threat. The screen exists so the security owner can
see what is happening, triage, and record a resolution.

Unlike ADM-220 (audit log), this screen is action-oriented: events can be
marked resolved, assigned, or escalated.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Read + resolve | All events |
| SUPER_ADMIN | Read + resolve + escalate | As ADMIN |
| CHAPTER_LEADER | Read own chapter | Events where the actor or target belongs to their chapter |
| FINANCE_OFFICER | Denied | |
| Others | Denied | Permission-denied card |

Helpers: `getSecurityEvents(user, filters)`, `resolveSecurityEvent(user, id)`,
`escalateSecurityEvent(user, id)` in `lib/mock/audit.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Security events), PNL-01 dashboard
  critical alert banner, ADM-220 audit drawer (link from certain actions).
- **Leads to:**
  - ADM-223 active sessions (for session-related events)
  - ADM-220 audit log filtered by the actor
  - PNL-03 member detail
- **Deep-linkable:** yes. `?severity=HIGH&type=LOGIN_FAILED&resolved=false&from=&to=&page=2`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — title "Security events", subtitle, no primary action.
2. **Stats row** — four StatTiles: Open events, Critical unresolved, Resolved (24h), Median time to resolve.
3. **Filter bar** — search, severity, type, resolution state, date range.
4. **Data table** — columns: Time, Severity, Type, Actor, Target, Details, State, Actions.
5. **Bulk action bar** — appears on selection: Mark resolved, Escalate (SUPER_ADMIN).
6. **Pagination** — cursor-friendly.

Mobile (xs/sm):
- Stats 2-up.
- Filters in a Sheet.
- Table → card list.
- Bulk actions docked at the bottom.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatTile | Local | derived | Label + value |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | Select | Atom | static | Severity, type, state |
| 5 | DataTable | Pattern | `getSecurityEvents()` | Manual markup |
| 6 | StatusBadge | Atom | mapped | Severity → StatusKey |
| 7 | Pagination | Molecule | cursor | xs fallback |
| 8 | EmptyState | Molecule | — | First-use and filtered-empty |
| 9 | ConfirmDialog | Dialog | — | Bulk resolve; escalate |
| 10 | Toast | Molecule | — | Resolve, escalate |
| 11 | SecurityEventDrawer | **New** | — | See §6.1 |

### 6.1 SecurityEventDrawer (new component)

Right-hand drawer with the full record of one event.

- Header: severity badge + event type + timestamp.
- Body: actor, target, metadata (structured render of `metadata` jsonb),
  and an audit trail of every action taken on the event itself.
- Footer actions: Resolve (with an optional note), Escalate
  (SUPER_ADMIN only), and a link to the actor's other events.
- Focus trap; ESC closes.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Time | event.created_at | timestamptz | yes | — | read | internal |
| Severity | event.severity | enum | yes | — | read | internal |
| Type | event.type | enum | yes | — | read | internal |
| Actor | user.name | string | no | — | read | internal |
| Target | user.name | string | no | — | read | internal |
| Metadata | event.metadata | jsonb | no | — | read | sensitive |
| Resolved | event.resolved | boolean | yes | — | read | internal |
| Resolved by | event.resolved_by | uuid | cond | required if resolved | read | internal |
| Resolved at | event.resolved_at | timestamptz | cond | required if resolved | read | internal |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Open detail | Row click | as read | none | `getSecurityEventById(id)` | Drawer opens | — | no |
| 2 | Resolve | Row action / drawer | ADMIN, SUPER_ADMIN | none | `resolveSecurityEvent(id, note?)` | Toast + row update | Toast error | yes |
| 3 | Bulk resolve | Bulk bar | ADMIN, SUPER_ADMIN | ConfirmDialog | `resolveSecurityEvent` × N | Toast + rows update | Toast error | yes |
| 4 | Escalate | Drawer | SUPER_ADMIN | ConfirmDialog | `escalateSecurityEvent(id)` | Toast + badge | Toast error | yes |
| 5 | View actor's events | Drawer link | as read | none | — | Navigate to filtered view | — | no |
| 6 | View session | Drawer link | ADMIN, SUPER_ADMIN | none | — | Navigate to ADM-223 | — | no |

## 9. States

| State | Design |
|---|---|
| Empty (first use) | "No security events. That is good news." |
| Empty (filtered) | "No events match these filters." + "Clear filters" |
| Loading | Skeleton stats ×4, skeleton rows ×6 |
| Populated | Default render |
| Populated, extreme | Default range: last 30 days |
| Partial | Stats load, table error → inline retry |
| Error | error.tsx boundary |
| Permission denied | "You don't have access to security events." |
| Success | Toast on resolve, escalate |

## 10. Validation & error handling

- **Resolve without note** — allowed; note is optional.
- **Resolve an already-resolved event** — blocked with tooltip
  "Already resolved."
- **Bulk resolve with mixed eligibility** — summary "3 will be skipped
  (already resolved). Resolve 5 of 8?"
- **Escalate a resolved event** — blocked; must reopen first (open
  question, see §16).
- **Export with 0 rows** — button disabled.

Error codes: `SECURITY_EVENT_NOT_FOUND`, `SECURITY_EVENT_ALREADY_RESOLVED`,
`SECURITY_EVENT_ESCALATE_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table → cards; drawer full-screen |
| sm >=640 | Stacked | As xs |
| md >=768 | Table | Table returns; stats 4-up |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable columns |

## 12. Accessibility

- Table: `<caption>`, `<th scope="col">`, `aria-sort` on time.
- Severity badge uses text; not colour alone.
- Row selection checkbox labelled by event type + actor.
- Drawer: focus trap; ESC closes.
- Bulk action bar uses `aria-live="polite"`.

## 13. Performance

- Default filter: last 30 days.
- Table page payload ≤ 40 KB for 25 rows.
- Metadata is loaded on drawer open, not in the table.
- Search debounce 300ms.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.security_events.viewed` | role, filters_count |
| `admin.security_events.filtered` | severity, type, resolved |
| `admin.security_events.resolved` | event_id, was_bulk, note_provided |
| `admin.security_events.escalated` | event_id |

## 15. Copy

- Page title: "Security events"
- Subtitle: "Failed logins, privilege changes and anomalies."
- Filters: "All severities", "All types", "All states", "Last 30 days"
- Stats labels: "Open events", "Critical unresolved", "Resolved (24h)", "Median time to resolve"
- Column headers: Time, Severity, Type, Actor, Target, Details, State, Actions
- Row actions: "Resolve", "View"
- Severity labels: Info, Low, Medium, High, Critical
- Event type labels: "Login failed", "Account locked", "Privilege granted", "Privilege revoked", "Session revoked", "Anomaly detected"
- Empty (first use): "No security events. That is good news."
- Empty (filtered): "No events match these filters." / "Clear filters"
- Resolve dialog: "Mark as resolved?" / "This is recorded in the audit log." / "Resolve"
- Escalate dialog: "Escalate this event?" / "It will be flagged for compliance review." / "Escalate"
- Permission denied: "You don't have access to security events."
- i18n keys: `admin.security_events.*`, `admin.security_events.type.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Can a resolved event be reopened? Proposed: yes, by ADMIN and above, audited. | Tech Lead |
| 2 | Is there an SLA target (e.g. resolve HIGH within 24h)? Proposed: yes, and the median tile shows the rolling 30-day figure. | Compliance Lead |
| 3 | Should anomaly detection rules be configurable in this screen, or in PNL-19 System Settings? Proposed: PNL-19. | Product Lead |
| 4 | Do escalation notifications go to the Compliance Lead automatically? Proposed: yes, email to the registered compliance address. | Compliance Lead |
| 5 | What is the retention for resolved events? Proposed: 24 months, then archived. | Compliance Lead |