# SCREEN SPEC: [ADM-077] Blocked and Banned Register

## 1. Identification
- Screen ID: ADM-077
- Route: /admin/moderation/blocked
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P1
- Related requirements: FR-4.6 (report), FR-4.7 (moderation)
- Related panel: PNL-06

## 2. Purpose
A single register of every block and ban in force. Blocks are member-driven
and bidirectional. Bans are admin-driven and can be time-boxed or permanent.
The register gives moderators visibility of who cannot contact whom, and the
audit trail behind each decision.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All records |
| SUPER_ADMIN | Full | All records |
| COMPLIANCE_LEAD | Read-only | All records |
| CHAPTER_LEADER | Denied | 403 card |
| MENTOR / MEMBER / GUEST | Denied | 403 card |

Members manage their own blocks from /profile/blocked (member side). This
admin register is a read-and-intervene view.

## 4. Entry and exit points
- Reached from: sidebar (Moderation), ADM-071 (block action), dashboard alert
- Leads to: ADM-031 (member 360), ADM-071 (source report), audit trail for
  each action
- Deep-linkable: yes. URL params: ?type, ?status, ?member, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle
- KPI row: four cards - Active blocks, Active bans, Bans expiring (7d),
  Appeals pending
- Tab control: Blocks / Bans
- Filter bar: search, status, chapter, date range
- Blocks table: blocker, blocked, since, source (self / report), still active
- Bans table: member, reason category, duration, issued by, issued at,
  expires at, status
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| Tabs | Blocks vs Bans |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable columns |
| Pagination | Cursor-based |
| StatusBadge | Active / Expired / Revoked |
| ConfirmDialog | For revoke and extend |
| EmptyState | No results |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Block id | Block.id | string | Y | Read | Internal |
| Blocker | Block.blockerId | ref | Y | Read | PII |
| Blocked | Block.blockedId | ref | Y | Read | PII |
| Since | Block.since | timestamp | Y | Read | Internal |
| Source | Block.source | enum | Y | Read | Internal |
| Active | Block.active | bool | Y | Read | Internal |
| Ban id | Ban.id | string | Y | Read | Internal |
| Member | Ban.memberId | ref | Y | Read | PII |
| Reason category | Ban.reasonCategory | enum | Y | Read | Internal |
| Reason note | Ban.reasonNote | text | Y | Read | Sensitive |
| Duration | Ban.duration | enum | Y | Read | Internal |
| Issued by | Ban.issuedBy | user | Y | Read | Internal |
| Issued at | Ban.issuedAt | timestamp | Y | Read | Internal |
| Expires at | Ban.expiresAt | timestamp | N | Read | Internal |
| Status | Ban.status | enum | Y | Read | Internal |
| Appeal status | Ban.appealStatus | enum | N | Read | Internal |

Block source: SELF, REPORT_ACTION.
Ban duration: TEMPORARY_7D, TEMPORARY_30D, TEMPORARY_90D, PERMANENT.
Ban status: ACTIVE, EXPIRED, REVOKED.
Appeal status: NONE, PENDING, UPHELD, DENIED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open member 360 | Row click | ADMIN+ | No | GET /members/:id | No |
| Revoke ban | Row | ADMIN+ | Yes (reason) | PATCH /bans/:id | Yes |
| Extend ban | Row | ADMIN+ | Yes (new duration) | PATCH /bans/:id | Yes |
| Make permanent | Row | SUPER_ADMIN | Yes (typed reason) | PATCH /bans/:id | Yes |
| Review appeal | Row | ADMIN+ | No | GET /bans/:id/appeal | Yes |
| Export register | Toolbar | ADMIN+ | No | GET /moderation/blocked.csv | Yes |

Bans on SAFEGUARDING cases are visible only to assigned handlers and appear
in ADM-074, not here.

## 9. States
- Empty (blocks): "No active blocks."
- Empty (bans): "No active bans."
- Loading: skeleton rows.
- Populated: typical 50-200 blocks, 0-20 bans.
- Populated extreme: pagination caps at 25 per page.
- Partial: appeal data failing; row still renders.
- Error: full-page error card with Retry.
- Permission denied: 403 card for MENTOR / MEMBER / GUEST / CHAPTER_LEADER.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms action; row updates in place.
- Destructive confirmation: revoke, extend, make permanent.

## 10. Validation and error handling
- Revoke requires a reason (min 20 chars).
- Extend requires a target duration longer than the current remaining time.
- Make permanent requires typed confirmation of the member number.
- If a ban is within 24 hours of expiry, extend is still available; revoke
  mid-expiry is still allowed.
- If a member already has an active appeal pending, revoke is available
  but the appeal status must be updated in the same action.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Tabs convert to a segmented control. |
| md (>=768) | Full tables per tab. |
| xl (>=1280) | Full tables, wider columns. |

## 12. Accessibility
- Tabs use role=tablist, role=tab, and role=tabpanel
- Semantic tables with aria-sort
- Status badges use colour and text
- Confirmation dialogs are focus traps
- Tab change announces via aria-live polite

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 25 per page
- Appeal status loaded with the row, not separately
- Search debounced at 300 ms

## 14. Analytics
- moderation.blocked.viewed (properties: tab)
- moderation.ban.revoked
- moderation.ban.extended
- moderation.ban.made_permanent
- moderation.blocked.exported

## 15. Copy
- Title: "Blocked and banned register"
- Subtitle: "Every block and ban in force, with the record behind each decision."
- Empty (blocks): "No active blocks."
- Empty (bans): "No active bans."
- Revoke confirmation: "Revoke this ban? Provide a reason (min 20 chars). The member will be reinstated immediately."
- Extend confirmation: "Extend this ban? Choose a new duration. The member will be notified."
- Make permanent confirmation: "Make this ban permanent? Type the member number to confirm. This is audited."
- Toast revoke: "Ban revoked. Member reinstated."
- Toast extend: "Ban extended to {duration}."
- Toast permanent: "Ban is now permanent."

## 16. Open questions
- Q1: Should blocks appear in member 360 as a count, or as a list with
  identifiers? Product Lead.
- Q2: When a ban is appealed and upheld, is the ban extended as a penalty?
  Compliance Lead.
- Q3: Retention of expired bans: keep indefinitely in the register, or purge
  after a window? DPO.