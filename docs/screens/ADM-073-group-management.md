# SCREEN SPEC: [ADM-073] Group Management

## 1. Identification
- Screen ID: ADM-073
- Route: /admin/moderation/groups
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P1
- Related requirements: FR-4.3 (groups)
- Related panel: PNL-06
- Related gates: G-2 (safeguarding)

## 2. Purpose
Oversight and administrative control of all groups: study groups, chapter
groups, mentorship groups, and interest groups. Moderators review group
health, intervene when a group is misused, transfer ownership, archive or
delete groups, and verify that closed and secret groups still meet community
guidelines.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All groups |
| SUPER_ADMIN | Full | All groups |
| COMPLIANCE_LEAD | Read-only | All groups |
| CHAPTER_LEADER | Own-chapter groups only | No archive/delete |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Moderation), dashboard alert, notification
- Leads to: group home (public route), ADM-074 if group is a safeguarding
  context, ADM-031 (member 360) via member links
- Deep-linkable: yes. URL params: ?type, ?visibility, ?chapter, ?status, ?owner

## 5. Layout and regions
- Page header: title, subtitle
- KPI row: four cards — Total groups, Active (30d), Flagged, Archived
- Filter bar: search, type filter, visibility filter, chapter filter, status
  filter
- Data table: name, type, visibility, owner, member count, reports (30d),
  last activity, status
- Bulk action bar (conditional): archive, flag for review, transfer ownership
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable columns, row click |
| Pagination | Cursor-based |
| BulkActionBar | Conditional on selection |
| StatusBadge | Group status |
| EmptyState | No results |
| GroupHealthPill | Compact "healthy / watched / at risk" indicator |

GroupHealthPill is a thin wrapper around StatusBadge with a tone map. It
derives from reports (30d) plus last activity.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Group id | Group.id | string | Y | Read | Internal |
| Name | Group.name | string | Y | Read | Internal |
| Type | Group.type | enum | Y | Read | Internal |
| Visibility | Group.visibility | enum | Y | Read | Internal |
| Owner | Group.ownerId | ref | Y | Read | PII |
| Member count | Group.memberCount | int | Y | Read | Internal |
| Reports (30d) | Group.reports30d | int | Y | Read | Internal |
| Last activity | Group.lastActivityAt | timestamp | Y | Read | Internal |
| Status | Group.status | enum | Y | Read | Internal |
| Chapter | Group.chapterId | ref | N | Read | Internal |

Group type: STUDY, CHAPTER, MENTORSHIP, INTEREST.
Visibility: OPEN, CLOSED, SECRET.
Status: ACTIVE, WATCHED, ARCHIVED, DELETED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open group | Row click | ADMIN+ | No | GET /groups/:id | No |
| Archive group | Bulk / row | ADMIN+ | Yes | PATCH /groups/:id | Yes |
| Flag for review | Bulk | ADMIN+ | No | PATCH /groups/:id | Yes |
| Transfer ownership | Row | ADMIN+ | Yes (select new owner) | PATCH /groups/:id/owner | Yes |
| Delete group | Row | SUPER_ADMIN | Yes (typed name) | DELETE /groups/:id | Yes |
| Export list | Toolbar | ADMIN+ | No | GET /groups.csv | Yes |

Deletion is soft. Never orphan members or history (Charter 16.2 business
rules).

## 9. States
- Empty: "No groups yet." with link to create one in PNL-05.
- Loading: skeleton rows.
- Populated: typical 20–100 groups.
- Populated extreme: pagination caps at 25 per page.
- Partial: member counts loading; the rest of the row is visible.
- Error: full-page error card with Retry.
- Permission denied: 403 card for MENTOR / MEMBER / GUEST.
- Offline: cached list visible; all mutating actions disabled.
- Success: toast confirms action; row updates in place.
- Destructive confirmation: archive, transfer, and delete.

## 10. Validation and error handling
- Archive requires a reason from a fixed list.
- Transfer ownership requires selecting an active member of the group.
- Delete requires typing the group name exactly. Never available for groups
  with an open safeguarding case.
- If a group has an open safeguarding case, delete is disabled and the reason
  shown inline.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Name and health pill prominent. |
| md (>=768) | Full table, first six columns. |
| xl (>=1280) | Full table, all columns. |

## 12. Accessibility
- Semantic table, `aria-sort` on sortable columns
- Row navigation via Enter
- Health pill uses text and colour, not colour alone
- Archive confirmation dialog is a focus trap
- Delete confirmation requires typing; the field is labelled and the confirm
  button stays disabled until the name matches

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 25 per page
- Member counts cached server-side, refreshed at most every 60 seconds
- Search debounced at 300 ms

## 14. Analytics
- `moderation.groups.viewed`
- `moderation.groups.archived`
- `moderation.groups.flagged`
- `moderation.groups.owner_transferred`
- `moderation.groups.deleted`

## 15. Copy
- Title: "Group management"
- Subtitle: "Oversight for every community group."
- Empty: "No groups yet."
- Health pill labels: "Healthy", "Watched", "At risk"
- Archive confirmation: "Archive this group? Members keep their history. The group becomes read-only."
- Transfer confirmation: "Transfer ownership to {name}? They will gain full control of the group."
- Delete confirmation: "Type the group name to confirm deletion. This is a soft delete. History is retained."
- Toast: "Group archived." / "Ownership transferred." / "Group deleted."

## 16. Open questions
- Q1: Do secret groups appear in this list by default, or only when flagged?
  Product Lead.
- Q2: When a group is archived, are scheduled events and messages paused?
  Product Lead.
- Q3: Should transfer of ownership notify all group members, or only the
  outgoing and incoming owners? Content and Community Lead.