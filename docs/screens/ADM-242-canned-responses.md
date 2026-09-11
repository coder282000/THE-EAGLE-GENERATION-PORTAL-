# SCREEN SPEC: [ADM-242] Canned responses and knowledge base

## 1. Identification
- **Screen ID:** ADM-242
- **Route:** `/admin/support/canned`
- **Layer:** Admin Console
- **Panel:** PNL-20 Support Desk
- **Module:** Support
- **Release:** R1
- **Priority:** P1
- **Panel overview:** docs/panels/PNL-20-support-desk.md

## 2. Purpose

The library of pre-written responses agents insert into tickets. It
serves a dual purpose: it standardises the voice of support and it
saves agents time on the common cases (password resets, refund
questions, verification follow-ups).

The screen is simple: a searchable list of canned responses, with a
form for creating and editing them.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Create, edit, delete, tag |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Read-only | Can use but not modify |
| FINANCE_OFFICER | Read-only | |
| Others | Denied | Permission-denied card |

Helpers: `getCannedResponses(user, filters)`,
`saveCannedResponse(user, data)`, `deleteCannedResponse(user, id)` in
`lib/mock/support.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Canned responses), the ticket
  detail page's "Insert canned response" picker (opens in a modal on
  that screen).
- **Leads to:** ticket detail after inserting.
- **Deep-linkable:** yes. `?category=BILLING&q=`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Canned responses", subtitle, primary action "New response".
2. **Filter bar** — search by title, body or tag; category filter.
3. **Response list** — cards. Each card shows title, category chip,
   tags, body preview (3 lines, truncated), and actions Edit / Delete.
4. **Create/edit form** — a modal (or side sheet on desktop) with:
   title, category, body, tags.
5. **Empty state** — "No canned responses yet."

Mobile (xs/sm):
- Single column; cards stack.
- Create/edit form is a full-screen sheet.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps list |
| 2 | SearchInput | Atom | — | 300ms debounce |
| 3 | Select | Atom | static | Category |
| 4 | Button | Atom | — | New, Edit, Delete |
| 5 | StatusBadge | Atom | mapped | Category chip |
| 6 | Modal / Drawer | Dialog | — | Create and edit form |
| 7 | ConfirmDialog | Dialog | — | Delete response |
| 8 | Toast | Molecule | — | Save, delete |
| 9 | EmptyState | Molecule | — | First-use and filtered-empty |

No new design-system components required.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Title | response.title | string | yes | 3–120 chars | write | internal |
| Category | response.category | enum | yes | in enum | write | internal |
| Body | response.body | text | yes | 10–2000 chars | write | internal |
| Tags | response.tags | string[] | no | ≤10 tags | write | internal |
| Created by | response.created_by | uuid | yes | — | read | internal |
| Updated at | response.updated_at | timestamptz | yes | — | read | internal |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | New response | Primary | ADMIN | none | — | Modal opens | — | no |
| 2 | Edit response | Card action | ADMIN | none | — | Modal opens | — | no |
| 3 | Save | Modal primary | ADMIN | none | `saveCannedResponse(data)` | Toast + list updates | Inline errors | yes |
| 4 | Delete response | Card action | ADMIN | ConfirmDialog | `deleteCannedResponse(id)` | Toast + row removed | Toast error | yes |

## 9. States

| State | Design |
|---|---|
| Empty (first use) | "No canned responses yet." + "Create the first one" |
| Empty (filtered) | "No responses match these filters." + "Clear filters" |
| Loading | Skeleton cards ×4 |
| Populated | Default render |
| Error | error.tsx boundary |
| Permission denied | "Canned responses are administrator-only." |
| Success | Toast on save, delete |
| Destructive confirmation | Delete response |

## 10. Validation & error handling

- **Title empty** — inline error.
- **Body empty** — inline error.
- **Duplicate title** — warning, not a block: "A response with this
  title already exists. Save anyway?"
- **Delete a response used in the last 30 days** — warning in confirm:
  "This response was used 12 times in the last 30 days. Delete anyway?"

Error codes: `CANNED_RESPONSE_VALIDATION_FAILED`, `CANNED_RESPONSE_DUPLICATE_TITLE`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Single column | Cards stack; form is full-screen sheet |
| sm >=640 | Single column | As xs |
| md >=768 | Single column | Form is a centred modal |
| lg >=1024 | Single column | Sidebar visible |
| xl >=1280 | Comfortable spacing | No behavioural change |

## 12. Accessibility

- Every card is a `<article>` with an `<h3>`.
- Body preview uses `line-clamp` with `title` attribute for full text.
- Modal traps focus, ESC closes, focus returns to the "Edit" button on
  close.
- Delete confirm dialog defaults to Cancel.

## 13. Performance

- Response list payload ≤ 40 KB for all responses.
- Search debounce 300ms.
- No pagination needed for typical library sizes (<100).

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.canned.viewed` | role |
| `admin.canned.filtered` | category, has_query |
| `admin.canned.created` | response_id |
| `admin.canned.updated` | response_id |
| `admin.canned.deleted` | response_id, recent_usage_count |

## 15. Copy

- Page title: "Canned responses"
- Subtitle: "Pre-written replies for common cases."
- Primary action: "New response"
- Filters: "All categories", "Search title, body or tag"
- Category labels: Account, Billing, Verification, Technical, Other
- Card actions: "Edit", "Delete"
- Form labels: "Title", "Category", "Body", "Tags"
- Delete dialog: "Delete this canned response?" / "It will be removed from the library." / "Delete"
- Duplicate warning: "A response with this title already exists. Save anyway?"
- Empty (first use): "No canned responses yet." / "Create the first one"
- Empty (filtered): "No responses match these filters." / "Clear filters"
- Permission denied: "Canned responses are administrator-only."
- i18n keys: `admin.canned.*`, `admin.canned.category.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Can tags be created inline, or chosen from a fixed list? Proposed: inline, autocompleted from existing tags. | Tech Lead |
| 2 | Are responses versioned? Proposed: no in R1. | Compliance Lead |
| 3 | Can a response include merge fields ({{first_name}})? Proposed: yes in R2. | Product Lead |
| 4 | Should there be a usage counter per response? Proposed: yes; it aids prioritisation of edits. | Product Lead |
| 5 | Is there a shared "hidden" library for deprecated responses, or does delete remove them permanently? Proposed: soft-delete, hidden from UI, still referenced in audit log. | Compliance Lead |