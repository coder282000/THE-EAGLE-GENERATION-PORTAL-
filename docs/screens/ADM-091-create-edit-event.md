# SCREEN SPEC: [ADM-091] Create / edit event

## 1. Identification
- **Screen ID:** ADM-091
- **Routes:** `/admin/events/new` (create), `/admin/events/[id]/edit` (edit)
- **Layer:** Admin Console
- **Panel:** PNL-08 Events
- **Module:** Commerce / Events (Charter §16.8, FR-8.2)
- **Release:** R2 (listing), R3 (ticketing tiers, paid events)
- **Priority:** P0
- **Related requirements:** FR-8.2
- **Panel overview:** docs/panels/PNL-08-events.md

## 2. Purpose

The single form for creating and editing an event. It captures everything the
member-facing detail page (SCR-101) needs to render, and everything the
ticketing and check-in screens need to operate. It is used by administrators
and chapter leaders, on desktop, usually before an event is announced.

The form is the same for create and edit. On edit, fields are pre-filled and
the slug is locked. On create, the slug is derived from the title and can be
overridden before first save.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Any event, any chapter |
| SUPER_ADMIN | Full | As ADMIN, plus edit of locked/completed events |
| CHAPTER_LEADER | Scoped | Create and edit own chapter's events only; chapter field fixed |
| FINANCE_OFFICER | Denied | Redirected to ADM-090 with permission-denied toast |
| Others | Denied | Permission-denied card |

Permission helpers: `canCreateEvent(user)` and `canEditEvent(user, event)` in
`lib/mock/events.ts`. Hiding the "Create event" button in ADM-090 is not the
control; the helper is.

## 4. Entry & exit points

- **Reached from:**
  - ADM-090 event list -> "Create event" primary action
  - ADM-090 event list -> row action "Edit"
  - ADM-092 registrations -> header action "Edit event"
- **Leads to:**
  - ADM-090 on Save draft, Publish, or Cancel
  - ADM-092 with a success toast on "View registrations" after publish
  - Member-facing preview (SCR-101) in a new tab
- **Deep-linkable:** edit only, `/admin/events/[id]/edit`. Create has no
  pre-filled state.
- **Unsaved changes guard:** navigating away with unsaved edits triggers a
  ConfirmDialog with "Discard changes?", "Keep editing", "Discard".

## 5. Layout & regions

Single-column form, max-width 720px, centred on desktop. Sectioned into cards.

Desktop (lg+):

1. **Page header** — title ("Create event" / "Edit event"), slug preview,
   primary actions on the right: "Save draft" (secondary), "Publish" or
   "Save changes" (primary).
2. **Section 1 — Basics:** title, slug, description, type, cover image.
3. **Section 2 — Where and when:** chapter, venue vs online (radio),
   venue name and address, or online URL; starts_at, ends_at, timezone.
4. **Section 3 — Capacity:** total capacity (blank = unlimited).
5. **Section 4 — Ticket tiers:** toggle for "Free event" vs "Paid event".
   Paid shows a tier repeater. Each tier is a collapsible row.
6. **Section 5 — Visibility:** Save as draft or publish, with publish
   requirements shown inline.
7. **Sticky footer bar:** Cancel, Save draft, Publish / Save changes. Sticks
   to the bottom of the viewport on scroll.

Mobile (xs/sm):
- Same sections, stacked.
- Sticky footer becomes a fixed bottom action bar with safe-area padding.
- Tier repeater collapses each tier to an accordion row showing name + price.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps each section |
| 2 | FormField | Atom | — | Label, hint, error, required asterisk |
| 3 | Input | Atom | — | Text, number, url variants |
| 4 | Textarea | Atom | — | Description, autosize |
| 5 | Select | Atom | static | Type, timezone, currency |
| 6 | RadioGroup | Atom | static | Venue vs online |
| 7 | DatePicker | Atom | — | Start and end, with time |
| 8 | Switch | Atom | — | Free vs paid event |
| 9 | Button | Atom | — | Primary, secondary, ghost, destructive |
| 10 | ConfirmDialog | Dialog | — | Discard changes, remove tier |
| 11 | Toast | Molecule | — | Save, publish, error |
| 12 | EmptyState | Molecule | — | "No tiers yet" inside the tier repeater |
| 13 | FileUploadZone | Molecule | — | Cover image; type allow-list, size cap |
| 14 | TierRepeater | **New** | — | See §6.1 |
| 15 | SlugInput | **New** | — | See §6.2 |

### 6.1 TierRepeater (new component)

Manages an ordered list of ticket tiers. Requirements:

- Add tier appends a collapsed row at the bottom and expands it.
- Each tier row has: name, price (minor units input with currency prefix),
  quantity (blank = unlimited), sales_open, sales_close.
- Reorder via drag handle or up/down buttons (accessible).
- Remove tier requires ConfirmDialog when the tier has sales.
- The first tier is expanded by default on create.
- At least one tier is required to publish a paid event.
- Free events hide the repeater entirely.

### 6.2 SlugInput (new component)

Derives a URL-safe slug from the title as the user types, until the user edits
the slug field manually. After manual edit, the derived value is not
re-derived. On edit of an existing event, the slug is shown read-only with a
"Regenerate" action that requires ConfirmDialog, because the slug appears in
member-facing URLs and in QR tokens.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Title | event.title | string | yes | 3-120 chars | write | public |
| Slug | event.slug | string | yes | URL-safe, unique, 3-80 chars | write | public |
| Description | event.description | text | yes | 20-4000 chars | write | public |
| Type | event.type | enum | yes | in enum | write | public |
| Cover image | event.cover_image | string | no | image type, <=2MB | write | public |
| Chapter | event.chapter_id | uuid | yes | CHAPTER_LEADER fixed to own | write | internal |
| Venue or online | derived | enum | yes | exactly one of the two | write | public |
| Venue name | event.venue_name | string | cond | required if venue | write | public |
| Venue address | event.venue_address | string | cond | required if venue | write | public |
| Online URL | event.online_url | url | cond | required if online, https | write | public |
| Starts at | event.starts_at | timestamptz | yes | future for publish | write | public |
| Ends at | event.ends_at | timestamptz | yes | after starts_at | write | public |
| Timezone | event.timezone | string | yes | IANA zone | write | public |
| Capacity | event.capacity | int | no | >=1 or blank | write | internal |
| Free or paid | derived | bool | yes | — | write | internal |
| Tier name | tier.name | string | yes | 2-60 chars | write | public |
| Tier price | tier.price_minor | bigint | yes | >=0, integer | write | public |
| Tier currency | tier.currency | char(3) | yes | ISO 4217 | write | public |
| Tier quantity | tier.quantity | int | no | >=1 or blank | write | internal |
| Tier sales open | tier.sales_open | timestamptz | no | — | write | internal |
| Tier sales close | tier.sales_close | timestamptz | no | before event starts | write | internal |

**Money rule:** `price_minor` is an integer minor unit plus an explicit
currency code. The form never produces a float. Display formatting goes
through `formatCurrency()`; parsing uses a minor-unit-safe input that accepts
"1,500.00" and stores `150000` with currency `KES`.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Save draft | Footer secondary | create/edit | none | `saveEventDraft(data)` | Toast + stay | Toast error | no |
| 2 | Publish | Footer primary | create/edit | none | `publishEvent(data)` | Toast + navigate to ADM-092 | Inline errors | yes |
| 3 | Save changes | Footer primary on edit | edit | none | `updateEvent(id, data)` | Toast + stay | Inline errors | yes |
| 4 | Cancel | Footer ghost | as screen | Unsaved guard if dirty | — | Navigate to ADM-090 | — | no |
| 5 | Preview | Header link | as screen | none | — | Open SCR-101 in new tab | — | no |
| 6 | Upload cover | FileUploadZone | as screen | none | `uploadCover(file)` | Image preview | Toast error | no |
| 7 | Add tier | TierRepeater | as screen | none | — | New tier appended | — | no |
| 8 | Remove tier | Tier row | as screen | ConfirmDialog if sold > 0 | — | Tier removed | — | yes |
| 9 | Regenerate slug | SlugInput | edit only | ConfirmDialog | — | Slug regenerated | — | yes |

## 9. States

| State | Design |
|---|---|
| Create, blank | Empty form, first tier expanded, publish disabled until minimal fields valid |
| Edit, loading | Skeleton form: header, 5 section cards, footer |
| Edit, populated | Pre-filled, slug read-only, tier rows populated |
| Saving | Footer buttons become loading; form fields disabled; route change blocked |
| Error (load) | error.tsx boundary + "Try again" |
| Error (save) | Inline field errors + a toast summarising; form is not cleared |
| Permission denied | Permission-denied card; no form rendered |
| Success (draft) | Toast "Draft saved." |
| Success (publish) | Toast "Event published." + navigate option |
| Destructive confirmation | Discard unsaved changes; remove tier with sales; regenerate slug |
| Partial | Event loads, tier data fails -> tiers section shows inline retry, rest usable |
| Offline | Banner: "You are offline. Saving is unavailable." Footer disabled. |

## 10. Validation & error handling

Field-level:

| Field | Rule | Message |
|---|---|---|
| Title | required, 3-120 | "Give the event a title (at least 3 characters)." |
| Slug | required, unique, URL-safe | "That slug is already taken. Try another." |
| Description | required, 20-4000 | "Add a short description (at least 20 characters)." |
| Type | required | "Choose an event type." |
| Chapter | required | "Choose a chapter." |
| Venue or online | exactly one | "Choose a venue or an online link." |
| Venue name/address | required if venue | "Add the venue name and address." |
| Online URL | required if online, https | "Add the meeting link (https only)." |
| Starts at | required, future for publish | "The start date must be in the future to publish." |
| Ends at | required, after starts_at | "The end date must be after the start date." |
| Capacity | >=1 or blank | "Capacity must be at least 1, or left blank." |
| Tier name | required, 2-60 | "Name this ticket tier." |
| Tier price | required, >=0, integer | "Enter a valid price." |
| Tier currency | required | "Choose a currency." |
| Tier quantity | >=1 or blank | "Quantity must be at least 1, or left blank." |
| Tier sales close | before event start | "Ticket sales must close before the event starts." |

Form-level:

- Publishing a paid event with no tier: "Add at least one ticket tier before publishing."
- Publishing with tier quantity totalling more than capacity: "Tier quantities exceed event capacity."
- Publishing a webinar with no online URL: "Add the meeting link before publishing."

Error codes: `EVENT_VALIDATION_FAILED`, `EVENT_SLUG_TAKEN`, `EVENT_PUBLISH_BLOCKED`,
`EVENT_TIER_EXCEEDS_CAPACITY`, `EVENT_SAVE_FAILED`.

Errors are inline at field level and summarised in a toast at form level. The
form is never cleared on save failure.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Single column | Sections stacked; sticky bottom action bar; tiers as accordion |
| sm >=640 | Single column | As xs, wider gutters |
| md >=768 | Single column, 720px max | Sticky footer returns |
| lg >=1024 | Single column, 720px max | Sidebar visible; no form change |
| xl >=1280 | Single column, 720px max | Comfortable spacing |

Touch targets >=44x44. Date pickers render as native inputs on xs where possible.

## 12. Accessibility

- Heading structure: `h1` page title, `h2` per section, `h3` per tier row.
- Every input has a `<label>` with `htmlFor`; hints and errors are linked via
  `aria-describedby`.
- Required fields are marked with `aria-required="true"` and a visible asterisk.
- Errors are announced via `role="alert"` on the field's error message.
- The sticky footer is reachable by keyboard; focus is not trapped.
- The tier repeater supports keyboard reordering; drag handle is not the only
  method.
- SlugInput announces when it is auto-deriving vs user-controlled.
- Colour is never the only signal for errors; an icon and text are present.
- Focus moves to the first invalid field on publish attempt.
- The unsaved-changes dialog traps focus and defaults to "Keep editing".

## 13. Performance

- Form payload on submit <= 50 KB.
- Cover image is uploaded separately from the form save; the form stores the
  resulting URL.
- Date pickers use native inputs on mobile; a custom picker loads lazily on
  desktop.
- Tier repeater renders collapsed rows without their inputs until expanded.
- No heavy libraries on this route; Recharts is not loaded here.
- Autosave is not implemented for R2. A future enhancement could add a 30s
  draft save for drafts only.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.events.create_opened` | role |
| `admin.events.edit_opened` | event_id, role |
| `admin.events.draft_saved` | event_id_or_new, field_count |
| `admin.events.published` | event_id, type, chapter_id, tier_count, is_paid |
| `admin.events.publish_blocked` | reason_code |
| `admin.events.tier_added` | tier_index |
| `admin.events.tier_removed` | tier_index, had_sales |
| `admin.events.slug_regenerated` | event_id |
| `admin.events.cover_uploaded` | mime, size_bucket |
| `admin.events.discarded` | dirty_field_count |

No cover image content, no attendee data.

## 15. Copy

- Page title (create): "Create event"
- Page title (edit): "Edit event"
- Subtitle: "Fill in the details members will see."
- Primary action (create): "Publish"
- Primary action (edit): "Save changes"
- Secondary action: "Save draft"
- Ghost action: "Cancel"
- Preview link: "Preview member page"
- Section headings: Basics, Where and when, Capacity, Ticket tiers, Visibility
- Free/paid toggle label: "This is a paid event"
- Tier repeater empty: "No tiers yet" / "Add your first ticket tier."
- Add tier: "Add tier"
- Remove tier dialog: "Remove this tier?" / "Sold tickets will not be refunded automatically."
- Slug locked help: "The slug is used in the member-facing URL and in QR codes. Changing it will break existing links."
- Slug regenerate dialog: "Regenerate slug?" / "Existing links to this event will stop working."
- Publish blocked: "This event cannot be published yet. Fix the highlighted fields."
- Save draft toast: "Draft saved."
- Publish toast: "Event published."
- Save changes toast: "Changes saved."
- Discard dialog title: "Discard changes?"
- Discard dialog body: "You have unsaved changes. Leaving now will discard them."
- Discard confirm: "Discard"
- Discard cancel: "Keep editing"
- Offline banner: "You are offline. Saving is unavailable."
- Permission denied: "You do not have access to this screen." / "Contact support"
- i18n keys: `admin.events.form.*`, `admin.events.form.validation.*`, `admin.events.tier.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should the event `type` enum remain CONFERENCE / WEBINAR / MEETUP / TRAINING / FUNDRAISER, per ADM-090 Q1? | Product Lead |
| 2 | Is the timezone field per-event or inherited from the chapter? Proposed: per-event, defaulting to the chapter's timezone. | Product Lead |
| 3 | Can tier pricing be changed after tickets are sold? Proposed: yes for future sales, with an audit entry; existing tickets keep their purchased price. | Finance |
| 4 | Are multi-currency tiers allowed on one event? Proposed: no for R2/R3; single currency per event. | Finance |
| 5 | Should a draft event be visible to CHAPTER_LEADERs of the same chapter, or only to the creator? | Product Lead |
| 6 | Cover image: is a library of reusable event images wanted, or upload-only? | Product Lead |
| 7 | Does the form need a "duplicate event" action to speed recurring meetups? Deferred to R4 if not needed for R2. | Product Lead |