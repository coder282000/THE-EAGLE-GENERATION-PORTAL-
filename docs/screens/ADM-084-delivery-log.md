# SCREEN SPEC: [ADM-084] Delivery log and failures

## 1. Identification
- **Screen ID:** ADM-084
- **Route:** `/admin/notifications/deliveries`
- **Layer:** Admin Console
- **Panel:** PNL-07 Communications
- **Module:** Notifications (Charter §16.7, §24)
- **Release:** R3
- **Priority:** P1
- **Related requirements:** FR-7.1, FR-10.5
- **Panel overview:** docs/panels/PNL-07-communications.md

## 2. Purpose

The record of every message TEG has attempted to send through a
provider, and how it went. It is the audit trail for communications and
the operations console for troubleshooting. When a member says "I
never received the refund email", this is the screen that answers the
question.

Three user needs drive the design:

1. **Find an attempt** for a specific member, campaign, or template.
2. **Diagnose a failure** — provider error, wrong address, opt-out.
3. **Retry** — safely, one at a time or in bulk, without duplicating.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Read, retry, export |
| SUPER_ADMIN | Full | As ADMIN |
| FINANCE_OFFICER | Read-only | Can see delivery attempts for refunds |
| CHAPTER_LEADER | Read-only | Scoped to their chapter's members |
| Others | Denied | Permission-denied card |

Helpers: `getDeliveries(user, filters)`, `retryDelivery(id)`,
`retryBulk(ids)` in `lib/mock/communications.ts`. Scoping for
CHAPTER_LEADER reuses the chapter filter pattern from PNL-04 and PNL-08.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Delivery log), PNL-07 campaign
  detail ("View delivery attempts"), announcement performance ("View
  send log"), member detail ("Communications" tab in PNL-03).
- **Leads to:**
  - Member detail (`/admin/members/[id]`)
  - Campaign detail (`/admin/notifications/campaigns/[id]`)
  - Announcement performance (`/admin/announcements/[id]`)
- **Deep-linkable:** yes. Query parameters:
  `?status=FAILED&channel=SMS&provider=africastalking&memberId=&q=&page=2`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Delivery log" title, subtitle, secondary "Export".
2. **Filter bar** — search (email, phone, template key, provider ref),
   status filter, channel filter, provider filter, date range, reset.
3. **Stats row** — four StatTiles: Sent today, Delivered today, Failed
   today, Bounced today. Each with a rate where a denominator exists.
4. **Data table** — columns: Recipient, Channel, Template or Campaign,
   Status, Provider, Attempts, Last attempt, Actions.
5. **Bulk action bar** — appears on selection: Retry selected, Export
   selected.

Mobile (xs/sm):
- Stats 2-up.
- Filters in a Sheet.
- Table becomes a card list below `md`.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatTile | Local | derived | Label + value + rate with denominator |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | Select | Atom | static | Status, channel, provider |
| 5 | DataTable | Pattern | `getDeliveries()` | Manual markup |
| 6 | StatusBadge | Atom | mapped | QUEUED / SENT / DELIVERED / BOUNCED / FAILED / OPTED_OUT |
| 7 | Pagination | Molecule | cursor | xs fallback |
| 8 | EmptyState | Molecule | — | First-use and filtered-empty |
| 9 | ConfirmDialog | Dialog | — | Bulk retry confirmation |
| 10 | Toast | Molecule | — | Retry, export |
| 11 | DeliveryDetailDrawer | **New** | — | See §6.1 |

### 6.1 DeliveryDetailDrawer (new component)

A right-side drawer showing the full record of a single delivery
attempt. Used on desktop and tablet.

- Header: recipient (name + email or phone), channel, provider.
- Body sections:
  - Attempt timeline: queued → sent → delivered / bounced / failed, with
    timestamps.
  - Provider reference and error code.
  - Linked campaign or announcement (with a link).
  - Retry history: every attempt, with who triggered it.
  - A "Retry" button (disabled for OPTED_OUT).
- Accessibility: focus trap; the drawer has `role="dialog"` and
  `aria-modal="true"`; ESC closes.

On mobile the drawer becomes a full-screen sheet.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Recipient name | member.name | string | yes | — | read | PII |
| Recipient email | member.email | string | cond | required if channel = EMAIL | read | PII |
| Recipient phone | member.phone | string | cond | required if channel = SMS | read | PII |
| Channel | delivery.channel | enum | yes | in enum | read | internal |
| Template or campaign | derived | string | no | — | read | internal |
| Status | delivery.status | enum | yes | in enum | read | internal |
| Provider | delivery.provider | string | yes | — | read | internal |
| Provider ref | delivery.provider_ref | string | no | — | read | internal |
| Error code | delivery.error_code | string | cond | set if status = FAILED or BOUNCED | read | internal |
| Attempts | delivery.attempts | int | yes | >=1 | read | internal |
| Last attempt | delivery.last_attempt_at | timestamptz | yes | — | read | internal |

No message bodies are shown on this screen. That respects DPA-7
minimisation: the log records that a message was sent, not what it said.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Open detail | Row click | as read | none | — | Drawer opens | — | no |
| 2 | Retry one | Drawer action | ADMIN | none | `retryDelivery(id)` | Toast + row updates | Toast error | yes |
| 3 | Retry selected | Bulk bar | ADMIN | ConfirmDialog with count | `retryBulk(ids)` | Toast + rows update | Toast error | yes |
| 4 | Export | Header | ADMIN | none | `exportDeliveries(filters)` | CSV download | Toast error | yes |
| 5 | Filter | FilterBar | as read | none | `getDeliveries(filters)` | Table updates | — | no |
| 6 | View member | Drawer link | ADMIN, FINANCE_OFFICER | none | — | Navigate to PNL-03 | — | no |

Retry is blocked for deliveries whose status is `OPTED_OUT` or
`DELIVERED`. The Retry button is hidden in those cases with a tooltip.

## 9. States

| State | Design |
|---|---|
| Empty (no deliveries) | "No messages sent yet." |
| Empty (filtered) | "No deliveries match these filters." + "Clear filters" |
| Loading | Skeleton stats ×4, skeleton rows ×6 |
| Populated | Default render |
| Populated, extreme | Pagination + date filter default to last 30 days |
| Partial | Stats load, table error -> inline retry |
| Error | error.tsx boundary + inline retry |
| Permission denied | "You don't have access to the delivery log." |
| Success | Toast on retry, export |
| Destructive confirmation | Bulk retry |

## 10. Validation & error handling

- **Retry on an OPTED_OUT delivery** -> blocked with tooltip: "This
  member has opted out."
- **Retry on a DELIVERED delivery** -> blocked with tooltip: "This
  message has already been delivered."
- **Bulk retry with mixed eligibility** -> "3 will be skipped (2
  delivered, 1 opted out). Retry 5 of 8?" with a confirm.
- **Export with no rows** -> button disabled.
- **Date range wider than 90 days** -> warning: "Exports over 90 days
  may take a while. Continue?"

Error codes: `DELIVERY_NOT_FOUND`, `DELIVERY_RETRY_NOT_ELIGIBLE`,
`DELIVERY_RETRY_FAILED`, `DELIVERY_EXPORT_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table → card list; drawer → full-screen |
| sm >=640 | Stacked | Stats 2-up |
| md >=768 | Table | Table returns; stats 4-up; drawer is a side panel |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable columns |

## 12. Accessibility

- Table: `<caption>`, `<th scope="col">`, `aria-sort` on sortable
  headers.
- Drawer: `role="dialog"`, `aria-modal="true"`, focus trap, ESC closes.
- Retry button in the drawer has `aria-disabled` when not eligible and a
  tooltip explaining why.
- Bulk selection: each row checkbox has an accessible name including
  the recipient and template/campaign.
- Colour is not the only signal for delivery status.

## 13. Performance

- Table page payload <= 50 KB for 25 rows.
- Default filter is "last 30 days"; no query is unfiltered.
- Export streams server-side (mock: generates on client).
- Search debounce 300ms.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.deliveries.viewed` | role, has_filters |
| `admin.deliveries.filtered` | status, channel, provider, has_query |
| `admin.deliveries.detail_opened` | delivery_id, status |
| `admin.deliveries.retried_single` | delivery_id |
| `admin.deliveries.retried_bulk` | count, skipped_count |
| `admin.deliveries.exported` | row_count, range_days |

## 15. Copy

- Page title: "Delivery log"
- Subtitle: "Every message we attempted to send, and how it went."
- Filters: "All statuses", "All channels", "All providers", "Last 30 days"
- Stats labels: "Sent today", "Delivered today", "Failed today", "Bounced today"
- Column headers: Recipient, Channel, Template / Campaign, Status, Provider, Attempts, Last attempt, Actions
- Status labels: Queued, Sent, Delivered, Bounced, Failed, Opted out
- Row action: "View"
- Bulk actions: "Retry selected", "Export selected"
- Retry tooltips: "This member has opted out.", "This message has already been delivered."
- Bulk retry dialog: "Retry 5 of 8?" / "3 will be skipped (2 delivered, 1 opted out)." / "Retry"
- Empty (first use): "No messages sent yet."
- Empty (filtered): "No deliveries match these filters." / "Clear filters"
- Permission denied: "You don't have access to the delivery log."
- i18n keys: `admin.deliveries.*`, `admin.deliveries.status.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Should the log include a redacted message preview for debugging, or is the "no bodies" rule absolute? Proposed: no bodies, ever. Content is in the template. | Compliance Lead |
| 2 | Is there an auto-retry policy (e.g. 3 attempts over 24h) or is every retry manual? Proposed: auto-retry for transient errors, manual for hard failures. | Tech Lead |
| 3 | How far back does the log retain? Proposed: 12 months for delivery attempts, with a purge job matching DPA-8. | Compliance Lead |
| 4 | Should CHAPTER_LEADERs see failures for their chapter, or only a summary? Proposed: full rows for their chapter. | Product Lead |
| 5 | What is the recipient identifier shown when a member has been deleted (DPA-5 erasure)? Proposed: hashed member id + "erased". | Compliance Lead |
| 6 | Does the export include error codes and provider refs, or is that restricted to ADMIN? Proposed: yes, ADMIN only. | Compliance Lead |