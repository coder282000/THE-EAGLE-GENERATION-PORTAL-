# SCREEN SPEC: [ADM-093] Check-in (QR scan, mobile)

## 1. Identification
- **Screen ID:** ADM-093
- **Route:** `/admin/events/[id]/check-in`
- **Layer:** Admin Console
- **Panel:** PNL-08 Events
- **Module:** Commerce / Events (Charter §16.8, FR-8.2)
- **Release:** R3
- **Priority:** P0
- **Related requirements:** FR-8.2
- **Panel overview:** docs/panels/PNL-08-events.md
- **Design note:** This screen is designed for a phone held at a door. Mobile
  is the primary form factor, not an adaptation of a desktop layout. Desktop
  support exists but is not the design target.

## 2. Purpose

Check attendees into an event, fast, at the door, one-handed, on a phone,
often on poor connectivity, with a queue of people waiting.

It does one thing well: confirm that a person is entitled to enter, record
that they entered, and never let a duplicate or invalid ticket through
silently. Everything else on the screen exists to support that single action.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Any event |
| SUPER_ADMIN | Full | As ADMIN, plus undo of any check-in |
| CHAPTER_LEADER | Scoped | Own chapter's events only |
| FINANCE_OFFICER | Read-only | May view check-in count; cannot scan |
| Others | Denied | Permission-denied card rendered |

Scoping is enforced by `canCheckIn(user, event)` in `lib/mock/events.ts`.
A CHAPTER_LEADER opening another chapter's event sees the permission-denied
state, not an empty camera.

## 4. Entry & exit points

- **Reached from:**
  - ADM-090 event list -> row action "Check in"
  - ADM-092 registrations -> header action "Open check-in"
  - Direct URL shared with door staff
- **Leads to:**
  - ADM-092 registrations (attendee list, manual lookup fallback)
  - ADM-090 event list (via back)
- **Deep-linkable:** yes. Query parameters: `?mode=scan|lookup`
- **Session scope:** the check-in session is bound to a single event. Switching
  events requires returning to the list. This is deliberate — it prevents a
  door volunteer from accidentally checking people into the wrong event.

## 5. Layout & regions

Single-column, full-height, mobile-first. Portrait orientation.
+-------------------------------------+
| <- Founders Gala 2026 ... * | Header
| 142 of 200 checked in | Running counter
+-------------------------------------+
| |
| |
| +---------------+ | Camera viewport
| | | | (square QR frame
| | [ QR frame ]| | with corner guides)
| | | |
| +---------------+ |
| |
| Point at the QR code | Instruction line
| |
+-------------------------------------+
| |
| +-----------------------------+ | Result card
| | v Grace Wanjiru | | (slides up on scan)
| | Standard . KU | |
| | Checked in 14:32 | |
| +-----------------------------+ |
| |
+-------------------------------------+
| [ Search by name or reference ] | Fallback CTA
+-------------------------------------+
| Recent: | Recent list
| v Grace W. 14:32 |
| v David O. 14:31 |
| ! Peter M. 14:30 (duplicate) |
+-------------------------------------+

### Regions

1. **Header** — back arrow, event title, overflow menu (...), torch toggle (*).
2. **Running counter** — "142 of 200 checked in". Updates live. Denominator is
   the count of CONFIRMED + CHECKED_IN registrations.
3. **Camera viewport** — full width, square QR frame with corner guides. The
   frame is the scan target. Outside the frame is dimmed.
4. **Instruction line** — "Point at the QR code".
5. **Result card** — appears after each scan. Slides up. Auto-dismisses after
   3 seconds on success; stays until dismissed on warning or error.
6. **Fallback CTA** — "Search by name or reference". Opens manual lookup sheet.
7. **Recent list** — last 5 scans in this session, with status icon. Tapping a
   row opens a detail sheet with an "Undo check-in" action.

On desktop (lg+), the camera viewport is centred and capped at 480px wide;
the recent list moves to a right-hand column. The screen is still single-purpose.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps recent list on desktop |
| 2 | StatusBadge | Atom | registration.status | CONFIRMED / CHECKED_IN / DUPLICATE / INVALID |
| 3 | SearchInput | Atom | — | Manual lookup; 300ms debounce |
| 4 | Sheet | Dialog | — | Manual lookup panel; result detail panel |
| 5 | ConfirmDialog | Dialog | — | Undo check-in confirmation |
| 6 | Toast | Molecule | — | "Undone", "Offline - queued" |
| 7 | EmptyState | Molecule | — | No scans yet in this session |
| 8 | QrScanner | **New** | camera stream | See §6.1 |
| 9 | ScanResultCard | **New** | scan outcome | See §6.2 |
| 10 | CheckInCounter | **New** | derived | "N of M checked in" |

### 6.1 QrScanner (new component)

Wraps a camera stream and a QR decoder. Requirements:

- Requests `environment` facing camera by default.
- Renders the stream full-bleed inside the viewport region.
- Overlays a square frame with corner guides; dims everything outside.
- Decodes QR payloads; payload is an opaque signed token, never a raw ID.
- Debounces decode events: the same token within 5 seconds is treated as one
  scan, to prevent double-fire from a moving hand.
- Emits `onScan(token)` once per distinct decode.
- Handles camera permission denied, no camera, and camera-in-use errors with
  a clear message and a route to manual lookup.
- Torch toggle where the device supports it (`MediaTrackCapabilities.torch`).

Implementation note: use a maintained QR library (e.g. `@zxing/browser` or
`qr-scanner`). Do not hand-roll decoding. Verify the library is in the approved
dependency list; it is not a chain, wallet, or custody library, so it is
permitted.

### 6.2 ScanResultCard (new component)

Renders one of four outcomes:

| Outcome | Icon | Title | Body | Auto-dismiss |
|---|---|---|---|---|
| Valid | v green | Attendee name | Tier . Chapter . "Checked in HH:mm" | 3s |
| Already checked in | ! amber | Attendee name | "Already checked in at HH:mm by <staff>" | stays |
| Invalid | x red | "Ticket not recognised" | "This code is not valid for this event." | stays |
| Wrong event | x red | "Wrong event" | "This ticket is for <other event>." | stays |

Each outcome has an optional "View details" link opening the detail sheet.

Accessibility: the result is announced via `aria-live="assertive"` so a
screen-reader user hears the outcome without needing to look. Haptics fire on
valid (short) and invalid (double) scans.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Event title | event.title | string | yes | — | read | public |
| Event capacity | event.capacity | int | no | — | read | internal |
| Checked-in count | derived | int | yes | — | read | internal |
| Registration reference | registration.reference | string | yes | — | read | internal |
| Attendee name | member.first_name + last_name | string | yes | — | read | PII |
| Tier | tier.name | string | yes | — | read | internal |
| Chapter | chapter.code | string | yes | — | read | internal |
| QR token | registration.qr_token | string | yes | signed, single-use for check-in | read | internal |
| Status | registration.status | enum | yes | — | read | internal |
| Checked in at | registration.checked_in_at | timestamptz | no | — | read | internal |
| Checked in by | registration.checked_in_by | uuid | no | — | read | internal |

No money is handled on this screen. Revenue appears only in ADM-094.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Scan QR | Camera | ADMIN, CHAPTER_LEADER | none | `checkInByToken(token, eventId)` | Result card + counter +1 | Result card (error) | yes |
| 2 | Manual lookup | Search CTA | ADMIN, CHAPTER_LEADER | none | `searchRegistrations(query, eventId)` | Sheet with results | Sheet empty state | no |
| 3 | Check in from lookup | Result row | ADMIN, CHAPTER_LEADER | none | `checkInByRegistration(id)` | Result card + counter +1 | Toast error | yes |
| 4 | Undo check-in | Recent row -> detail sheet | ADMIN, CHAPTER_LEADER (own chapter), SUPER_ADMIN | ConfirmDialog | `undoCheckIn(registrationId)` | Toast + counter -1 | Toast error | yes |
| 5 | Toggle torch | Header * | as scan | none | — | — | — | no |
| 6 | Switch to manual | Search CTA | as scan | none | — | Sheet opens | — | no |

Every check-in and every undo writes an audit row: actor, action, event_id,
registration_id, timestamp, source (scan | lookup), device hint (user agent).
Undo does not delete the original check-in row; it writes a reversing entry,
matching the append-only principle used for ledger and audit.

## 9. States

| State | Design |
|---|---|
| Empty (first use) | Camera active; recent list shows "No scans yet this session." |
| Empty (no registrations) | "No one has registered for this event yet." + link to ADM-092 |
| Loading | Camera initialising: "Starting camera..." with a skeleton frame |
| Populated | Default render with live counter and recent list |
| Populated, extreme | 500 registrations: counter still reads "N of 500"; recent list capped at 5 |
| Partial | Camera active, counter failed to load: counter shows "-"; scanning still works |
| Error - camera | "Camera unavailable" + reason + "Use manual lookup" button |
| Error - network | Inline banner "Offline - check-ins will queue" (see §11) |
| Permission denied | "You can't check in for this event." + support link |
| Offline | See §11 |
| Success | Result card slides up; haptic; counter increments |
| Destructive confirmation | Undo check-in: "Undo check-in for <name>?" |

## 10. Validation & error handling

| Situation | Behaviour |
|---|---|
| QR payload malformed | Invalid outcome: "Ticket not recognised." |
| QR token signature invalid | Invalid outcome. Do not reveal why. |
| QR token belongs to another event | Wrong-event outcome, naming the other event |
| Registration already CHECKED_IN | Duplicate outcome, showing time and staff name |
| Registration is CANCELLED or REFUNDED | Invalid outcome: "This ticket has been cancelled." |
| Registration is PENDING (payment not confirmed) | Invalid outcome: "Payment for this ticket has not been confirmed." |
| Registration is NO_SHOW | Invalid outcome with an "Allow entry?" override for ADMIN only, audited |
| Manual lookup with no results | Empty state: "No matching registration." + "Check the spelling or scan the QR." |
| Network failure mid-check-in | Optimistic local record; queued; see §11 |

Error codes used on this screen: `CHECKIN_INVALID_TOKEN`,
`CHECKIN_WRONG_EVENT`, `CHECKIN_ALREADY_CHECKED_IN`, `CHECKIN_CANCELLED`,
`CHECKIN_PAYMENT_PENDING`, `CHECKIN_NETWORK_QUEUED`, `CHECKIN_CAMERA_DENIED`.

## 11. Offline behaviour

Check-in is not a financial write. PWA-7 forbids queuing or replaying money
endpoints offline; it does not forbid queuing check-ins.

Design:

- If the network is unavailable, scanning continues against a locally cached
  copy of the registration list for this event, downloaded when the screen
  opens and refreshed on reconnect.
- A check-in taken offline is recorded locally with a client timestamp and a
  generated idempotency key, shown in the result card as
  "Checked in HH:mm (queued)".
- The counter increments locally and shows a small "queued" badge.
- On reconnect, queued check-ins are replayed in order. Duplicates are
  rejected by the server via the idempotency key. The screen shows a brief
  "N check-ins synced" toast.
- If the cached list is stale and a scanned token is not found locally, the
  result is "Not found locally - will verify when online" rather than a hard
  rejection. This is the only outcome that is ambiguous offline; the design
  prefers a soft warning to a false rejection at the door.
- Undo is not available offline. The detail sheet shows "Undo is available
  when online."

This behaviour is the answer to panel open question Q3. It is recorded here
and reflected back into `docs/panels/PNL-08-events.md`.

## 12. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Single column | Primary. Camera full width, 1:1 frame, recent list below |
| sm >=640 | Single column | As xs; camera capped at 480px and centred |
| md >=768 | Two column | Camera left, recent list right |
| lg >=1024 | Two column | Camera 480px, recent list wider, detail sheet becomes side panel |
| xl >=1280 | Two column | Comfortable spacing; no behavioural change |

Landscape on a phone: camera shrinks to fit height; recent list moves to a
scrollable column on the right. The screen must remain usable one-handed in
portrait, which is the design target.

Touch targets: every control >=48x48px. The search CTA is full width and at
least 56px tall — it is the most-tapped control after the scan itself.

## 13. Accessibility

- The camera viewport is not the only path. Manual lookup is always visible
  and reachable by keyboard.
- Result announcements use `aria-live="assertive"`; the card is also focusable
  so a keyboard user can reach "View details".
- Colour is never the sole signal. Each outcome has an icon and a text label.
- Haptics are an enhancement, not a requirement. Sound is optional and off by
  default (a door may be noisy; a phone may be muted).
- The running counter has an accessible label: "142 of 200 attendees checked in."
- Torch toggle has `aria-pressed` state.
- Focus order: header -> counter -> camera (skip) -> result card -> search CTA ->
  recent list.
- Reduced-motion: the result card slides without animation.

## 14. Performance

- The QR library loads lazily on this route only; it is not in the shared
  bundle. This protects the <200 KB initial JS budget.
- The event's registration list is fetched once on open and cached for the
  session. It is not refetched per scan.
- Scan decode is debounced at the library level; the screen does not re-render
  on every frame.
- Counter updates are optimistic and reconciled on the next server response.
- The recent list is capped at 5 items to keep the DOM small on a mid-range
  Android device.

## 15. Analytics

| Event | Properties |
|---|---|
| `admin.checkin.opened` | event_id, role, mode |
| `admin.checkin.scanned` | event_id, outcome, source=scan |
| `admin.checkin.manual_lookup` | event_id, result_count |
| `admin.checkin.manual_selected` | event_id, outcome |
| `admin.checkin.undone` | event_id, reason_provided |
| `admin.checkin.camera_denied` | event_id |
| `admin.checkin.offline_queued` | event_id |
| `admin.checkin.offline_synced` | event_id, count |
| `admin.checkin.session_ended` | event_id, scans, duration_seconds |

No attendee names or tokens are sent to analytics.

## 16. Copy

- Header title: event title (truncated with ellipsis if long)
- Counter: "142 of 200 checked in"
- Instruction: "Point at the QR code"
- Valid: "<Name>" / "<Tier> . <Chapter>" / "Checked in HH:mm"
- Duplicate: "<Name>" / "Already checked in at HH:mm by <staff>"
- Invalid: "Ticket not recognised" / "This code is not valid for this event."
- Wrong event: "Wrong event" / "This ticket is for <other event>."
- Cancelled: "This ticket has been cancelled."
- Payment pending: "Payment for this ticket has not been confirmed."
- Offline banner: "Offline - check-ins will queue and sync automatically."
- Offline result: "Checked in HH:mm (queued)"
- Offline not found: "Not found locally - will verify when online."
- Camera denied: "Camera unavailable" / "Allow camera access or use manual lookup."
- No registrations: "No one has registered for this event yet."
- Recent empty: "No scans yet this session."
- Search CTA: "Search by name or reference"
- Search placeholder: "Name, email or reference"
- Search empty: "No matching registration." / "Check the spelling or scan the QR."
- Undo dialog title: "Undo check-in?"
- Undo dialog body: "Undo check-in for <name>? This will be recorded in the audit log."
- Undo confirm: "Undo check-in"
- Undo offline: "Undo is available when online."
- Synced toast: "<N> check-ins synced."
- Permission denied: "You can't check in for this event." / "Contact support"
- i18n keys: `admin.checkin.*`, `admin.checkin.outcome.*`, `admin.checkin.offline.*`

## 17. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Is offline queuing confirmed for check-in? The design above assumes yes. Panel Q3 is now answered in §11 and should be closed. | Tech Lead |
| 2 | Does a NO_SHOW override require a reason, or is a single audited tap sufficient? | Compliance Lead |
| 3 | Should the recent list include failed scans, or only successful check-ins? Proposed: both, distinguished by icon. | Product Lead |
| 4 | Is there a "close check-in" action that marks remaining CONFIRMED registrations as NO_SHOW, or does that run automatically after `ends_at`? | Product Lead |
| 5 | Should door staff be able to check in a walk-in with no prior registration? Proposed: no for R3; a walk-in registration flow is a separate screen. | Product Lead |
| 6 | Does the signed QR token expire, and if so, when? | Tech Lead |