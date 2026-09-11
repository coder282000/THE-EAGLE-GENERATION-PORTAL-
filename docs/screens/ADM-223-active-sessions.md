# SCREEN SPEC: [ADM-223] Active sessions and forced logout

## 1. Identification
- **Screen ID:** ADM-223
- **Route:** `/admin/security/sessions`
- **Layer:** Admin Console
- **Panel:** PNL-18 Audit and Security
- **Module:** Audit / Security (Charter §22.1)
- **Release:** R2
- **Priority:** P1
- **Related requirements:** section 22.1
- **Panel overview:** docs/panels/PNL-18-audit-security.md

## 2. Purpose

A live view of every authenticated session currently open on the
platform. Session management is one of the strongest controls against
account takeover: if a device is lost or a session is suspected of being
compromised, the admin can terminate it here, and the revoke is
immediate.

The screen is also the place to see when a user last did something —
useful for confirming whether a stale account is genuinely unused.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Read + revoke sessions | Any session except their own via this screen |
| SUPER_ADMIN | Read + revoke | Any session including their own |
| CHAPTER_LEADER | Read own chapter | Sessions of their chapter's members |
| FINANCE_OFFICER | Denied | |
| Others | Denied | Permission-denied card |

Helpers: `getActiveSessions(user, filters)`, `revokeSession(user, id)`,
`revokeAllForUser(user, memberId)` in `lib/mock/audit.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Sessions), ADM-222 security events
  drawer link, PNL-03 member detail.
- **Leads to:**
  - PNL-03 member detail ("Sessions" tab)
  - ADM-222 security events filtered to this actor
- **Deep-linkable:** yes. `?memberId=&ip=&q=&page=2`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Active sessions", subtitle, refresh indicator.
2. **Stats row** — four StatTiles: Total sessions, Unique users, Sessions on mobile, Longest idle.
3. **Filter bar** — search (name, email, IP, user agent), member filter.
4. **Data table** — columns: Member, IP, Device, Started, Last seen, Expires, Actions.
5. **Bulk action bar** — appears on selection: Revoke selected (SUPER_ADMIN).

Mobile (xs/sm):
- Stats 2-up.
- Filters in a Sheet.
- Table → card list.
- Revoke action per card.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatTile | Local | derived | Label + value |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | DataTable | Pattern | `getActiveSessions()` | Manual markup |
| 5 | Pagination | Molecule | cursor | xs fallback |
| 6 | EmptyState | Molecule | — | First-use and filtered-empty |
| 7 | ConfirmDialog | Dialog | — | Revoke; revoke all for user |
| 8 | Toast | Molecule | — | Revoke |
| 9 | DeviceIcon | **New** | — | See §6.1 |

### 6.1 DeviceIcon (new component)

A small icon derived from the user agent string: phone, tablet, desktop
or unknown. Pure presentation, with an `aria-label` describing the
detected platform.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Member name | user.name | string | yes | — | read | internal |
| Member email | user.email | string | yes | — | read | PII |
| IP address | session.ip_address | inet | yes | — | read | PII |
| User agent | session.user_agent | text | yes | — | read | internal |
| Started | session.started_at | timestamptz | yes | — | read | internal |
| Last seen | session.last_seen_at | timestamptz | yes | — | read | internal |
| Expires | session.expires_at | timestamptz | yes | — | read | internal |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Revoke session | Row action | ADMIN, SUPER_ADMIN | ConfirmDialog | `revokeSession(id)` | Toast + row removed | Toast error | yes |
| 2 | Bulk revoke | Bulk bar | SUPER_ADMIN | ConfirmDialog with count | `revokeSession` × N | Toast + rows removed | Toast error | yes |
| 3 | Revoke all for a member | Row action | SUPER_ADMIN | ConfirmDialog | `revokeAllForUser(memberId)` | Toast + rows removed | Toast error | yes |
| 4 | Refresh | Header | as read | none | `getActiveSessions()` | Table refreshes | Toast error | no |
| 5 | View member | Row link | as read | none | — | Navigate to PNL-03 | — | no |

Revoking a session is a privileged action; every revocation writes an
audit entry with the session id, the target member, and the reason if
one is provided.

## 9. States

| State | Design |
|---|---|
| Empty (no sessions) | "No active sessions." |
| Empty (filtered) | "No sessions match these filters." + "Clear filters" |
| Loading | Skeleton stats ×4, skeleton rows ×6 |
| Populated | Default render |
| Populated, extreme | Pagination at 25; total refreshed at most every 30s |
| Partial | Stats load, table error → inline retry |
| Error | error.tsx boundary |
| Permission denied | "You don't have access to active sessions." |
| Success | Toast on revoke |

## 10. Validation & error handling

- **Revoke own current session** — allowed; the admin is signed out and
  redirected to login. Deliberate; the confirm dialog says so explicitly.
- **Revoke a session that already expired** — treated as success
  ("Session already ended.")
- **Bulk revoke with mixed existence** — summary "2 sessions already
  ended."
- **Refresh during revoke** — the revoke wins; the row is not shown again.

Error codes: `SESSION_NOT_FOUND`, `SESSION_ALREADY_ENDED`,
`SESSION_REVOKE_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table → cards |
| sm >=640 | Stacked | As xs |
| md >=768 | Table | Table returns; stats 4-up |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable columns |

## 12. Accessibility

- Table: `<caption>`, `<th scope="col">`.
- Device column has text description in addition to the icon.
- Confirm dialogs use `role="dialog"`, trap focus, and default to Cancel.
- Row selection checkboxes have accessible names including the member
  and the IP.

## 13. Performance

- Table page payload ≤ 40 KB for 25 rows.
- The list is refreshed on demand, not auto-polled more often than 30s.
- Search debounce 300ms.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.sessions.viewed` | role, has_filters |
| `admin.sessions.filtered` | has_member, has_query |
| `admin.sessions.revoked` | session_id |
| `admin.sessions.revoked_bulk` | count |
| `admin.sessions.revoked_all_for_user` | member_id |

## 15. Copy

- Page title: "Active sessions"
- Subtitle: "Every authenticated session currently open on the platform."
- Primary action: none on header; "Refresh" as secondary.
- Filters: "All members", "Search name, email, IP or device"
- Stats labels: "Total sessions", "Unique users", "On mobile", "Longest idle"
- Column headers: Member, IP, Device, Started, Last seen, Expires, Actions
- Row actions: "Revoke", "View member"
- Bulk action: "Revoke selected"
- Revoke dialog: "Revoke this session?" / "The user will be signed out immediately." / "Revoke"
- Revoke self dialog: "This is your own session. You will be signed out." / "Sign out"
- Empty: "No active sessions." / "No sessions match these filters."
- Permission denied: "You don't have access to active sessions."
- i18n keys: `admin.sessions.*`, `admin.sessions.device.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should the list auto-refresh? Proposed: manual refresh plus a visible "Last refreshed at" timestamp. | Tech Lead |
| 2 | Is there a "session reason" field when an admin revokes (e.g. "suspected compromise")? Proposed: optional note, stored in the audit entry. | Compliance Lead |
| 3 | Are sessions from the mobile PWA treated distinctly from the desktop app for filtering? Proposed: yes, by user agent detection. | Product Lead |
| 4 | If a session is currently streaming WebSocket events (messaging), is it disconnected immediately on revoke? Proposed: yes, via auth provider. | Tech Lead |
| 5 | Do long-lived service accounts appear here, or are they excluded? Proposed: excluded; they are managed in PNL-19. | Tech Lead |