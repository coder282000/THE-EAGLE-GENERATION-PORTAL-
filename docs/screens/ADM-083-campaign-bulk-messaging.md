# SCREEN SPEC: [ADM-083] Campaign / bulk messaging

## 1. Identification
- **Screen ID:** ADM-083
- **Routes:** `/admin/notifications/campaigns`,
  `/admin/notifications/campaigns/new`,
  `/admin/notifications/campaigns/[id]`
- **Layer:** Admin Console
- **Panel:** PNL-07 Communications
- **Module:** Notifications (Charter §16.7, §24)
- **Release:** R3
- **Priority:** P1
- **Related requirements:** FR-7.1, DPA-1 (marketing consent)
- **Panel overview:** docs/panels/PNL-07-communications.md

## 2. Purpose

Send a bulk message to a saved segment. The screen makes three things
unambiguous before a message goes out:

1. **Who** is going to receive it — exact count, filterable breakdown.
2. **What** they will receive — subject, body, channel.
3. **When** it will go — now, scheduled, or queued.

Campaigns are the highest-risk surface in PNL-07 because a mistake is
sent. The screen blocks sending unless the admin has seen the count, the
preview, and the consent state of the segment.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Any segment |
| SUPER_ADMIN | Full | As ADMIN |
| CHAPTER_LEADER | Denied | Campaigns are organisation-wide |
| FINANCE_OFFICER | Denied | |
| Others | Denied | Permission-denied card |

Helpers: `getCampaigns(user)`, `getCampaignById(user, id)`,
`canSendCampaign(user)`, `previewCampaignAudience(segmentId)` in
`lib/mock/communications.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (Content -> Campaigns).
- **Leads to:**
  - Segment builder (PNL-03, `/admin/members/segments`)
  - Delivery log filtered by this campaign (ADM-084)
  - Preview render (SCR-045 in a new tab, or inline preview)
- **Deep-linkable:** yes. `/admin/notifications/campaigns/[id]` opens
  either the editor (draft) or the sent-campaign summary.

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Campaigns" title on the list, "New campaign" on
   the editor. Primary action "Send" or "Schedule".
2. **List view** — table of past campaigns: name, segment, channels,
   recipients, status, sent at, actions.
3. **Editor view** — three columns on `xl`, two on `lg`, one on `md`:
   - Left: audience selection and count preview.
   - Middle: message composition.
   - Right: channel toggles, schedule, and a send-summary card.
4. **Send summary card** — a sticky panel that lists: segment name,
   recipient count, channels, estimated cost, and send time.

Mobile (xs/sm): single column; the send-summary card becomes a sticky
footer.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps each column |
| 2 | FormField | Atom | — | Label, hint, error |
| 3 | Input | Atom | — | Campaign name, subject |
| 4 | Textarea | Atom | — | Body |
| 5 | Select | Atom | — | Segment picker, template picker |
| 6 | Button | Atom | — | Primary, secondary, ghost |
| 7 | ConfirmDialog | Dialog | — | Send confirmation |
| 8 | Toast | Molecule | — | Send, schedule, error |
| 9 | StatusBadge | Atom | mapped | DRAFT / SCHEDULED / SENDING / SENT / CANCELLED |
| 10 | AudienceBreakdown | **New** | — | See §6.1 |
| 11 | SendSummaryCard | **New** | — | See §6.2 |
| 12 | ConsentWarning | **New** | — | See §6.3 |

### 6.1 AudienceBreakdown (new component)

Renders a breakdown of the selected segment: total recipients, by
chapter, by tier, and — critically — how many are opted out per
channel.

- Props: `segmentId`, `channels`.
- Behaviour: fetches a summary from
  `previewCampaignAudience(segmentId, channels)`.
- Display:
  - Total recipients: "1,247 members"
  - Breakdown by chapter: a small bar or list of top 5 chapters + Other
  - Opt-out count: "38 members have opted out of marketing email"
- Accessibility: numbers have accessible labels including their
  denominators.

### 6.2 SendSummaryCard (new component)

Sticky panel summarising what will happen when the admin presses Send.

- Props: `segment`, `channels`, `scheduledAt`, `estimatedCostMinor`,
  `currency`.
- Display:
  - Segment name
  - Recipient count per channel (email N, SMS M)
  - Estimated cost: "KES 12,470 (SMS only; email free)"
  - Send time: "Now" or a formatted datetime
- Accessibility: a `role="region"` with an `aria-label` "Send summary".

### 6.3 ConsentWarning (new component)

Shown when the segment includes members whose consent state does not
cover the selected channel. Not a block — a warning.

- Props: `excluded`, `channel`.
- Display: "38 members will be excluded from this send because they
  have not opted in to marketing SMS."
- Includes a "View excluded" link to the delivery log.

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Name | campaign.name | string | yes | 3-120 chars | write | internal |
| Segment | campaign.segment_id | uuid | yes | must exist | write | internal |
| Channels | campaign.channels | enum[] | yes | at least one | write | internal |
| Template | campaign.template_key | string | no | if chosen | write | internal |
| Subject | campaign.subject | string | cond | required if EMAIL | write | internal |
| Body | campaign.body | text | yes | 10-4000 chars | write | internal |
| Schedule | campaign.scheduled_at | timestamptz | no | future or null | write | internal |
| Recipient count | derived | int | derived | — | read | internal |
| Excluded count | derived | int | derived | — | read | internal |
| Estimated cost | derived | bigint | derived | — | read | internal |

Money (estimated cost) is integer minor units plus a currency code.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Select segment | Left column | ADMIN | none | `previewCampaignAudience()` | Count + breakdown update | — | no |
| 2 | Toggle channel | Right column | ADMIN | none | — | Cost and count update | — | no |
| 3 | Preview as member | Editor action | ADMIN | none | `renderPreview()` | Preview panel updates | — | no |
| 4 | Save draft | Footer | ADMIN | none | `saveCampaignDraft(data)` | Toast + stay | Inline errors | no |
| 5 | Send now | Primary | ADMIN | ConfirmDialog with count | `sendCampaign(id)` | Toast + navigate to summary | Toast error | yes |
| 6 | Schedule | Primary (scheduled) | ADMIN | ConfirmDialog | `scheduleCampaign(id, at)` | Toast + navigate to list | Toast error | yes |
| 7 | Cancel a scheduled campaign | Row action | ADMIN | ConfirmDialog | `cancelCampaign(id)` | Toast + status update | Toast error | yes |

## 9. States

| State | Design |
|---|---|
| Empty (no campaigns) | "No campaigns yet" + "Create the first one" |
| Empty (no segments) | "You need a saved segment first." + link to PNL-03 |
| Loading | Skeleton form and skeleton summary |
| Populated | Default render |
| Segment with 0 recipients | Send disabled with tooltip "This segment has no members." |
| Segment with all recipients opted out | Warning banner + send allowed but recipient count shows 0 |
| Error (send) | Inline error + toast; the campaign stays draft |
| Permission denied | "Campaigns are administrator-only." |
| Success | Toast, redirect to summary |
| Destructive confirmation | Send; cancel scheduled |

## 10. Validation & error handling

- **No segment selected** -> inline error: "Choose a segment."
- **No channel selected** -> inline error: "Choose at least one channel."
- **No body** -> inline error: "Write the message."
- **Subject missing on EMAIL channel** -> inline error: "Add a subject
  line for email."
- **Schedule in the past** -> inline error: "The schedule time must be
  in the future."
- **Consent exclusion leaves 0 recipients on the chosen channels** ->
  send disabled: "All members in this segment have opted out of the
  selected channels."
- **Segments larger than 10,000** -> warning: "This will send to N
  members. Estimated cost KES X. Continue?"

Error codes: `CAMPAIGN_VALIDATION_FAILED`, `CAMPAIGN_SEGMENT_EMPTY`,
`CAMPAIGN_SEND_FAILED`, `CAMPAIGN_SCHEDULE_FAILED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Single column | Send summary becomes sticky footer |
| sm >=640 | Single column | Same |
| md >=768 | Two columns | Audience left, message right; summary below |
| lg >=1024 | Two columns | Sidebar visible; columns wider |
| xl >=1280 | Three columns | Audience, message, summary side by side |

## 12. Accessibility

- Every control has a label or `aria-label`.
- The recipient count and cost update in an `aria-live="polite"` region.
- Consent warning uses `role="status"`.
- Send confirmation dialog traps focus; the confirm button requires the
  admin to see the count again.
- Colour is not the only signal for opt-out status.

## 13. Performance

- Segment count computed with a 250ms debounce.
- Recipient breakdown for segments > 5,000 uses an approximate count.
- Preview render is local; no round trip.
- Payload for the list view <= 30 KB for 25 rows.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.campaigns.list_viewed` | role |
| `admin.campaigns.segment_selected` | segment_id, recipient_count |
| `admin.campaigns.channel_toggled` | channel, enabled |
| `admin.campaigns.preview_opened` | campaign_id |
| `admin.campaigns.draft_saved` | recipient_count, channels |
| `admin.campaigns.sent` | recipient_count, channels, estimated_cost_minor |
| `admin.campaigns.scheduled` | recipient_count, scheduled_at |
| `admin.campaigns.cancelled` | campaign_id |

## 15. Copy

- Page title: "Campaigns"
- Subtitle: "Bulk messages to saved segments."
- Primary action: "New campaign"
- Editor sections: Audience, Message, Delivery
- Segment picker placeholder: "Choose a segment"
- Recipients label: "1,247 members"
- Excluded label: "38 members opted out"
- Cost label: "Estimated cost: KES 12,470"
- Channels: "Email", "SMS"
- Send button: "Send now"
- Schedule button: "Schedule"
- Save draft: "Save draft"
- Confirm send dialog: "Send to 1,247 members?" / "This cannot be undone." / "Send"
- Confirm schedule dialog: "Schedule this campaign?" / "It will send on <date>." / "Schedule"
- Cancel scheduled dialog: "Cancel this campaign?" / "It will not send." / "Cancel campaign"
- Segment empty: "This segment has no members."
- All opted out: "All members in this segment have opted out."
- Permission denied: "Campaigns are administrator-only."
- i18n keys: `admin.campaigns.*`, `admin.campaigns.validation.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Is there a rate cap per member per day across all campaigns? Proposed: yes, one marketing message per member per 24 hours. | Product Lead |
| 2 | Is the estimated cost billing-relevant, or just informational? Proposed: informational in R3; billing via PSP in a later release. | Finance |
| 3 | Can a scheduled campaign be edited before it sends, or is the schedule a lock? Proposed: editable until 30 minutes before send. | Product Lead |
| 4 | Should the admin see the actual sample email render (with their own name), or an abstract preview? Proposed: abstract preview in R3. | Product Lead |
| 5 | Are campaigns allowed to non-members (leads, applicants)? Proposed: no, members only in R3. | Compliance Lead |
| 6 | Should there be a "test send to me" action? Proposed: yes, in R3 as a small secondary button. | Product Lead |