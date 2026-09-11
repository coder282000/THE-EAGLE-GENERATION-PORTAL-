# SCREEN SPEC: [ADM-080] Announcement composer

## 1. Identification
- **Screen ID:** ADM-080
- **Routes:** `/admin/announcements/new`, `/admin/announcements/[id]/edit`
- **Layer:** Admin Console
- **Panel:** PNL-07 Communications
- **Module:** Announcements and Governance (Charter §16.7, FR-7.1 to FR-7.3)
- **Release:** R1
- **Priority:** P0
- **Related requirements:** FR-7.1, FR-7.2, FR-7.3
- **Panel overview:** docs/panels/PNL-07-communications.md

## 2. Purpose

The composer for a single announcement. It captures the message, the
audience, the priority and the schedule, and it previews how the
announcement will appear to a member before publishing. It is used by
administrators and by chapter leaders within their own scope.

This is one of the highest-traffic admin screens in the panel. A
well-designed composer produces a well-run communications stream; a
clumsy one produces either silence or fatigue.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Any audience |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Scoped | Audience fixed to own chapter |
| FINANCE_OFFICER | Denied | Redirected to ADM-081 with permission message |
| Others | Denied | Permission-denied card |

Helpers: `canCreateAnnouncement(user)`, `canEditAnnouncement(user, item)`
in `lib/mock/communications.ts`. The audience selector is disabled and
forced to CHAPTER for a CHAPTER_LEADER, with the chapter pre-selected.

## 4. Entry & exit points

- **Reached from:**
  - ADM-081 announcement list -> "New announcement"
  - ADM-081 announcement list -> row action "Edit" (draft only)
  - PNL-01 dashboard queue widget
- **Leads to:**
  - ADM-081 on Save draft, Publish, or Cancel
  - Member preview (SCR-045) in a new tab
- **Deep-linkable:** edit only, `/admin/announcements/[id]/edit`.
- **Unsaved changes guard:** navigating away with unsaved edits triggers a
  ConfirmDialog with "Discard changes?", "Keep editing", "Discard".

## 5. Layout & regions

Single column, max-width 720px, centred. Sections in cards, sticky footer.

Desktop (lg+):

1. **Page header** — title "New announcement" / "Edit announcement",
   breadcrumb back to ADM-081, primary actions right-aligned: "Preview
   as member", "Save draft", "Publish".
2. **Section 1 — Message:** title, body (rich text or plain textarea in
   R1; rich text in R2).
3. **Section 2 — Audience:** audience type selector (ALL / CHAPTER /
   TIER / COHORT) and a dependent reference picker.
4. **Section 3 — Priority:** radio LOW / MEDIUM / HIGH with a short
   explanation of what each does.
5. **Section 4 — Schedule:** publish immediately or schedule; optional
   expiry.
6. **Sticky footer bar:** Cancel, Save draft, Publish. On edit, the
   primary action becomes "Save changes".

Mobile (xs/sm): same sections stacked; sticky footer becomes a bottom
action bar with safe-area padding.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps each section |
| 2 | FormField | Atom | — | Label, hint, error, required |
| 3 | Input | Atom | — | Title, reference picker |
| 4 | Textarea | Atom | — | Body |
| 5 | RadioGroup | Atom | — | Audience type, priority |
| 6 | Select | Atom | — | Reference picker (chapter / tier / cohort) |
| 7 | Button | Atom | — | Primary, secondary, ghost |
| 8 | ConfirmDialog | Dialog | — | Discard changes |
| 9 | Toast | Molecule | — | Save, publish |
| 10 | AudiencePreview | **New** | computed | See §6.1 |
| 11 | ScheduleInput | **New** | — | See §6.2 |

### 6.1 AudiencePreview (new component)

Renders a live count of members who will receive this announcement,
based on the current audience selection. Reads from the segment
helpers in `lib/mock/members.ts`.

- Props: `audience`, `audienceRef`, `user`.
- Behaviour: recomputes when audience changes; debounced 250ms.
- Display: "Sending to N members" plus a breakdown by chapter when
  audience = ALL.
- Edge cases: audience = ALL with no chapters selected shows the full
  count; audience = COHORT with no cohort selected shows "Choose a
  cohort".
- Accessibility: live region announces the count when it changes.

### 6.2 ScheduleInput (new component)

Radio between "Publish now" and "Schedule for later", plus a
`datetime-local` input when scheduling. Also captures an optional
expiry date.

- Validation: schedule must be in the future; expiry must be after
  publish.
- If priority = HIGH and no expiry is set, warns that HIGH
  announcements surface in member dashboards indefinitely.
- Default: publish now; no expiry for LOW and MEDIUM, 7 days for HIGH.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Title | announcement.title | string | yes | 3-120 chars | write | public |
| Body | announcement.body | text | yes | 10-4000 chars | write | public |
| Audience | announcement.audience | enum | yes | in enum | write | internal |
| Audience ref | announcement.audience_ref | string | cond | required if audience != ALL | write | internal |
| Priority | announcement.priority | enum | yes | in enum | write | internal |
| Publish at | announcement.publish_at | timestamptz | no | future or null | write | internal |
| Expires at | announcement.expires_at | timestamptz | no | after publish_at | write | internal |
| Status | announcement.status | enum | derived | — | read | internal |

No money. No PII beyond what appears in the body, which is authored
content.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Save draft | Footer secondary | create/edit | none | `saveAnnouncementDraft(data)` | Toast + stay | Inline errors | no |
| 2 | Publish | Footer primary | create/edit | none | `publishAnnouncement(data)` | Toast + navigate to ADM-081 | Inline errors | yes |
| 3 | Save changes | Primary on edit | edit | none | `updateAnnouncement(id, data)` | Toast + stay | Inline errors | yes |
| 4 | Preview as member | Header link | as screen | none | — | Open SCR-045 in new tab | — | no |
| 5 | Cancel | Footer ghost | as screen | Unsaved guard if dirty | — | Navigate to ADM-081 | — | no |
| 6 | Change audience | Radio / select | as screen | none | `previewAudience()` | Count updates | — | no |

## 9. States

| State | Design |
|---|---|
| Create, blank | Empty form; audience = ALL; priority = MEDIUM; publish = now |
| Edit, loading | Skeleton form: header, 4 cards, footer |
| Edit, populated | Pre-filled; a published announcement is read-only with a "Duplicate" action instead of Edit |
| Saving | Footer buttons loading; form disabled |
| Error (load) | error.tsx boundary + "Try again" |
| Error (save) | Inline field errors + toast summary; form is not cleared |
| Permission denied | Card: "You don't have access to announcements." |
| Success (draft) | Toast "Draft saved." |
| Success (publish) | Toast "Announcement published." + navigate |
| Destructive confirmation | Discard changes |
| Partial | Body loaded, audience count failed -> count shows "—"; publish still allowed with a warning |

## 10. Validation & error handling

Field-level:

| Field | Rule | Message |
|---|---|---|
| Title | required, 3-120 | "Give the announcement a title." |
| Body | required, 10-4000 | "Write at least a sentence or two." |
| Audience type | required | "Choose who should receive this." |
| Audience reference | required if not ALL | "Choose a chapter, tier or cohort." |
| Priority | required | "Choose a priority." |
| Publish at | if set, must be future | "The publish time must be in the future." |
| Expires at | if set, must be after publish | "Expiry must be after publish." |

Form-level:

- Publishing an announcement with HIGH priority and no expiry:
  warning, not a block. "This will appear on member dashboards until read."
- Publishing a CHAPTER-scoped announcement with no chapter selected:
  block. "Choose a chapter."

Error codes: `ANNOUNCEMENT_VALIDATION_FAILED`, `ANNOUNCEMENT_NOT_EDITABLE`,
`ANNOUNCEMENT_AUDIENCE_EMPTY`, `ANNOUNCEMENT_SAVE_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Sections stacked; sticky bottom action bar |
| sm >=640 | Stacked | As xs, wider gutters |
| md >=768 | Centred 720px | Sticky footer returns |
| lg >=1024 | Centred 720px | Sidebar visible; no form change |
| xl >=1280 | Centred 720px | Comfortable spacing |

Touch targets >=44x44. No horizontal scroll.

## 12. Accessibility

- Heading structure: `h1` page title, `h2` per section.
- Every input has a visible label; hints and errors via
  `aria-describedby`.
- Required fields marked with `aria-required` and a visible asterisk.
- Errors announced via `role="alert"` on the field's error message.
- Audience count is a live region (`aria-live="polite"`).
- Focus moves to the first invalid field on publish attempt.
- Unsaved-changes dialog traps focus, defaults to "Keep editing".
- Priority radio has fieldset + legend.

## 13. Performance

- Form payload <= 20 KB.
- Audience count computed locally with a 250ms debounce.
- No rich text editor in R1; plain textarea. R2 may add a rich text
  editor loaded lazily.
- No charts. No heavy libraries.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.announcements.composer_opened` | mode (create/edit), role |
| `admin.announcements.draft_saved` | has_audience_ref |
| `admin.announcements.published` | audience, priority, scheduled (bool) |
| `admin.announcements.preview_opened` | announcement_id |
| `admin.announcements.audience_changed` | from_audience, to_audience |
| `admin.announcements.discarded` | dirty_field_count |

## 15. Copy

- Page title (create): "New announcement"
- Page title (edit): "Edit announcement"
- Subtitle: "Compose a message for members."
- Primary action: "Publish" / "Save changes"
- Secondary action: "Save draft"
- Ghost action: "Cancel"
- Preview link: "Preview as member"
- Section headings: Message, Audience, Priority, Schedule
- Audience options: "All members", "Chapter", "Tier", "Cohort"
- Priority options: "Low — appears in the announcements inbox",
  "Medium — inbox and email", "High — inbox, email, and member dashboard until read"
- Schedule options: "Publish now", "Schedule for later"
- Expiry help: "Announcements auto-hide after this date."
- Audience count: "Sending to N members."
- Empty count: "No members match this audience."
- Success draft: "Draft saved."
- Success publish: "Announcement published."
- Discard dialog: "Discard changes?" / "You have unsaved changes. Leaving now will discard them." / "Discard" / "Keep editing"
- Permission denied: "You don't have access to announcements."
- Error: "We couldn't save this announcement." / "Try again"
- i18n keys: `admin.announcements.composer.*`, `admin.announcements.validation.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Rich text editor for the body in R1, or plain text only? Proposed: plain text only for R1; rich text in R2. | Product Lead |
| 2 | Can an announcement be duplicated? Proposed: yes, on the list screen for published items. | Product Lead |
| 3 | What is the default expiry for HIGH priority if not specified? Proposed: 7 days. | Product Lead |
| 4 | Is the audience count exact or approximate? Exact for R1 (small numbers). Approximate when member count exceeds 10,000. | Tech Lead |
| 5 | Does the chapter leader see a member-level recipient list, or only the count? Proposed: only the count. | Compliance Lead |
| 6 | Is there an "unpublish" action for a published announcement, distinct from "expires at"? Proposed: not in R1. Expiry is the mechanism. | Product Lead |