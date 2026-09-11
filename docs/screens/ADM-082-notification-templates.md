# SCREEN SPEC: [ADM-082] Notification template management

## 1. Identification
- **Screen ID:** ADM-082
- **Route:** `/admin/notifications/templates`
- **Layer:** Admin Console
- **Panel:** PNL-07 Communications
- **Module:** Notifications (Charter §16.7, §24)
- **Release:** R2
- **Priority:** P1
- **Related requirements:** FR-7.1, FR-7.2
- **Panel overview:** docs/panels/PNL-07-communications.md

## 2. Purpose

The catalogue of message templates used for transactional and lifecycle
notifications: welcome, application received, approval, refund issued,
event reminder, mentoring session reminder, and so on. Each template has
one active version; older versions are retained for audit.

This screen is where the organisation's voice is standardised. A change
here changes every future email, SMS and push that uses the template.
It is an ADMIN-only screen.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Create, edit, activate, deactivate versions |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Denied | Templates are organisation-wide |
| FINANCE_OFFICER | Denied | |
| Others | Denied | Permission-denied card |

Helpers: `getTemplates(user)`, `saveTemplateVersion(user, key, data)` in
`lib/mock/communications.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Notification templates).
- **Leads to:**
  - Template editor (`/admin/notifications/templates/[key]`)
  - Version history (`/admin/notifications/templates/[key]/versions`)
  - Preview render (`/admin/notifications/templates/[key]/preview`)
- **Deep-linkable:** yes. Query parameters: `?channel=EMAIL&q=`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — title "Notification templates", subtitle, no primary
   action (templates are created when a new event needs one, not on
   demand).
2. **Filter bar** — search by key or description; channel filter
   (EMAIL / SMS / PUSH); state filter (active / has draft).
3. **Template list** — a two-column layout: left is the list of template
   keys, right is a preview of the selected template with merge fields
   highlighted.
4. **Detail panel** — shows: key, channel, current version, last updated
   by and at, active status, and actions: Edit (creates a new version),
   Preview with sample data, View version history.

Mobile (xs/sm):
- Single column; the list and the preview become separate routes.
- Selecting a template navigates to the editor rather than showing a
  side panel.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps list and detail |
| 2 | SearchInput | Atom | — | 300ms debounce |
| 3 | Select | Atom | static | Channel, state |
| 4 | StatusBadge | Atom | mapped | active / draft |
| 5 | EmptyState | Molecule | — | No templates matching filter |
| 6 | MergeFieldChip | **New** | — | See §6.1 |
| 7 | TemplatePreview | **New** | — | See §6.2 |

### 6.1 MergeFieldChip (new component)

A small chip rendering a merge field like `{{first_name}}` with a
distinct style. Used inline in the preview to show which parts of the
message are dynamic.

- Props: `field`, `sampleValue`, `onHover`.
- Behaviour: on hover or focus, shows the sample value in a tooltip.
- Accessibility: has an aria-label of the field name plus a short
  description of what it resolves to.

### 6.2 TemplatePreview (new component)

Renders a template body with merge fields replaced by sample values, in
a phone-shaped or email-shaped frame depending on channel.

- Props: `body`, `channel`, `sampleData`.
- SMS: renders in a text message bubble, up to 160 characters,
  truncating beyond with a "2 messages" indicator.
- Email: renders in a simple email frame with subject line at the top.
- Push: renders in an OS-style notification card.
- Accessibility: the preview is decorative and marked `aria-hidden`; the
  plain text version is available in a code block next to it.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Key | template.key | string | yes | dot-separated, lowercase | read | internal |
| Description | template.description | string | yes | 10-200 chars | read | internal |
| Channel | template.channel | enum | yes | in enum | read | internal |
| Subject | template.subject | string | cond | required if EMAIL | read | internal |
| Body | template.body | text | yes | 10-4000 chars | read | internal |
| Merge fields | template.merge_fields | string[] | derived | extracted from body | read | internal |
| Active | template.active | boolean | yes | — | read | internal |
| Version | template.version | int | yes | — | read | internal |
| Updated by | template.updated_by | uuid | yes | — | read | internal |
| Updated at | template.updated_at | timestamptz | yes | — | read | internal |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Edit template | Row action | ADMIN | none | — | Navigate to editor | — | no |
| 2 | Preview | Row action | ADMIN | none | `renderPreview(key)` | Preview panel updates | — | no |
| 3 | View version history | Detail action | ADMIN | none | — | Navigate to versions | — | no |
| 4 | Save new version | Editor primary | ADMIN | ConfirmDialog if this is the active version | `saveTemplateVersion()` | New version active, toast | Inline errors | yes |
| 5 | Activate a version | Version row | ADMIN | ConfirmDialog | `activateVersion(key, version)` | Version becomes active | Toast error | yes |
| 6 | Restore default | Editor action | SUPER_ADMIN | ConfirmDialog | `restoreTemplateDefault(key)` | Body reset to default | Toast error | yes |

## 9. States

| State | Design |
|---|---|
| Empty (filtered) | "No templates match these filters" + "Clear filters" |
| Loading | Skeleton list, skeleton preview |
| Populated | Default render |
| Error | error.tsx boundary + retry |
| Permission denied | "Templates are administrator-only." |
| Preview error | Inline message: "Preview could not be rendered. Check the merge field names." |
| Success | Toast on save, activate, restore |
| Destructive confirmation | Save as new version when replacing the active one; restore default |

## 10. Validation & error handling

- **Unknown merge field** in body -> inline warning chip with the field
  name; saving is blocked with: "Unrecognised merge field: {{foo}}."
- **Empty subject on an EMAIL template** -> "Subject is required for
  email templates."
- **Empty body** -> "The message body cannot be empty."
- **SMS body over 160 characters** -> warning, not a block: "This
  message will be sent as 2 SMS parts."
- **Save with no changes** -> editor closes with no new version created.

Error codes: `TEMPLATE_VALIDATION_FAILED`, `TEMPLATE_MERGE_FIELD_UNKNOWN`,
`TEMPLATE_SAVE_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Single column | List and preview split into separate routes |
| sm >=640 | Single column | Same |
| md >=768 | Split | List on left, preview on right |
| lg >=1024 | Split | Sidebar visible; list 320px, preview fluid |
| xl >=1280 | Split | Comfortable spacing |

## 12. Accessibility

- Every merge field chip has an aria-label with the field name and
  sample value.
- The preview is `aria-hidden`; a plain text alternative sits next to it
  in a `<pre>` block.
- Channel and state filters have `<label>` elements or `aria-label`.
- Version list uses `<table>` with sortable headers.
- Focus order: header -> filters -> template list -> detail panel.

## 13. Performance

- Template list payload <= 20 KB.
- Preview rendering is local; no network call.
- Merge field extraction runs on save, not on every keystroke.
- Debounce for search is 300ms.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.templates.list_viewed` | role |
| `admin.templates.filtered` | channel, state, has_query |
| `admin.templates.preview_opened` | key |
| `admin.templates.saved` | key, was_active, version |
| `admin.templates.activated` | key, version |
| `admin.templates.restored_default` | key |

## 15. Copy

- Page title: "Notification templates"
- Subtitle: "Versioned message bodies for transactional and lifecycle notifications."
- Filters: "All channels", "All states"
- Channel labels: Email, SMS, Push
- State labels: Active, Draft pending
- Row actions: "Edit", "Preview", "Version history"
- Save dialog: "Save as new version?" / "The current version will remain available in history."
- Restore dialog: "Restore default template?" / "The current version will be replaced. History is retained."
- Merge field warning: "Unrecognised merge field: {{field}}."
- SMS long warning: "This message will be sent as N SMS parts."
- Permission denied: "Templates are administrator-only."
- i18n keys: `admin.templates.*`, `admin.templates.channel.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Who can edit the default templates: ADMIN or SUPER_ADMIN only? Proposed: ADMIN for content, SUPER_ADMIN for structure (merge fields). | Compliance Lead |
| 2 | Are merge fields validated against a fixed catalogue, or discovered from data? Proposed: fixed catalogue in R2, discovered in later releases. | Tech Lead |
| 3 | Is there a per-channel default language, or is i18n handled per template version? | Product Lead |
| 4 | Do templates require legal review before activation for regulated messages (refunds, KYC)? Proposed: yes, and the version stores a `reviewed_by` field. | Compliance Lead |
| 5 | Should version history be paginated, or is a 20-version cap reasonable? Proposed: retain all, paginate at 20. | Tech Lead |