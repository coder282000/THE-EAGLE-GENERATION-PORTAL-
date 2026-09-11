# SCREEN SPEC: [ADM-072] Content Search and Removal

## 1. Identification
- Screen ID: ADM-072
- Route: /admin/moderation/content
- Layer: Admin Console
- Module: Community and Moderation
- Release: R2
- Priority: P1
- Related requirements: FR-4.7 (moderation), FR-4.6 (report)
- Related panel: PNL-06
- Related gates: G-2 (safeguarding)

## 2. Purpose
Find and act on content directly, without waiting for a report. Used when a
moderator needs to remove a specific post, comment, or message identified out
of band, or to audit content across a date range or author.

This is not a search engine for member data. It searches posts, comments, and
group messages only. Direct messages are searchable only when they have been
reported (see ADM-071) or when the search is performed by an ADMIN acting on
a safeguarding case (see ADM-074).

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | All content |
| SUPER_ADMIN | Full | All content |
| COMPLIANCE_LEAD | Read-only | All content |
| CHAPTER_LEADER | Own chapter content only | Remove own-chapter only |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Moderation), ADM-071 (link out to "search similar")
- Leads to: content permalink (if public), ADM-071 if reported, ADM-031 (member 360)
- Deep-linkable: yes. URL params: ?q, ?type, ?author, ?chapter, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, notice about direct-message scope
- Search bar (large, prominent, debounced 300 ms)
- Filter row: type, author, chapter, date range, status (visible/removed)
- Results list: each row is a content card showing author, type, snippet,
  posted time, report count, removal state
- Bulk action bar (conditional): remove, mark for review, export
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| SearchInput | Debounced search |
| FilterBar | Type, author, chapter, date range |
| ContentResultCard | Single content row with preview |
| BulkActionBar | Conditional on selection |
| Pagination | Cursor-based |
| EmptyState | No results, no query yet |
| ConfirmDialog | Removal confirmation |

ContentResultCard is new. It wraps ContentPreview from ADM-071 in a compact
form and adds selection checkbox and metadata line.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Content id | Content.id | string | Y | Read | Internal |
| Type | Content.type | enum | Y | Read | Internal |
| Snippet | Content.snippet | string | Y | Read | Internal |
| Full body | Content.body | text | Y | Read | Internal |
| Author | Content.authorId | ref | Y | Read | PII |
| Chapter | Content.chapterId | ref | N | Read | Internal |
| Posted at | Content.createdAt | timestamp | Y | Read | Internal |
| Report count | Content.reportCount | int | Y | Read | Internal |
| Removed | Content.removedAt | timestamp | N | Read | Internal |
| Removed by | Content.removedBy | user | N | Read | Internal |

Content type: POST, COMMENT, MESSAGE.
Search matches on: body text, author display name, author member number.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open content | Row click | ADMIN+ | No | GET /content/:id | No |
| Remove | Bulk / row | ADMIN+, CL own-chapter | Yes | POST /moderation/remove | Yes |
| Mark for review | Bulk | ADMIN+ | No | PATCH /content/:id | Yes |
| Export results | Toolbar | ADMIN+ | No | GET /content.csv | Yes |
| View author 360 | Row link | ADMIN+ | No | GET /members/:id | No |

Removing content that is part of an open report links the removal to that
report and closes the report as "actioned."

## 9. States
- Empty (no query): instructional message "Enter a search term to find content."
- Empty (no results): "No content matched your search."
- Loading: three skeleton content cards.
- Populated: typical 10–50 results.
- Populated extreme: pagination caps at 20 per page.
- Partial: results loaded but author 360 lookups failed; cards degrade gracefully.
- Error: full-page error card with Retry.
- Permission denied: 403 card for MENTOR / MEMBER / GUEST.
- Offline: cached recent results only, search disabled.
- Success: toast confirms removal, row updates to show removed state.
- Destructive confirmation: removal only.

## 10. Validation and error handling
- Query must be at least 3 characters before search fires.
- Date range must have from <= to.
- Removal requires a reason from a fixed list plus optional free text.
- If the content is already removed, the Remove action is disabled and shows
  "Already removed by {name} on {date}."
- Server errors surface as a toast with a request ID.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. Search bar full width. Filters collapse into a sheet. Cards stacked. |
| md (>=768) | Search bar + filters visible inline. Cards full width. |
| xl (>=1280) | Same as md, wider content area. |

## 12. Accessibility
- Search input labelled "Search content"
- Filters in a fieldset with a legend
- Result cards reachable by keyboard, focus ring visible
- Removal dialog is a focus trap; Escape cancels
- Results count announced with `aria-live="polite"` when the list updates
- The DM scope notice is `role="note"` and is read before filters

## 13. Performance
- Payload budget: 200 KB
- Search debounced at 300 ms
- Server-side search; no client-side full-text index in the browser
- Result snippets max 200 characters; full body loads on row click
- Images in result cards lazy-load

## 14. Analytics
- `moderation.content.searched` (properties: query_length, type, has_filters)
- `moderation.content.removed`
- `moderation.content.marked_for_review`
- `moderation.content.exported`

## 15. Copy
- Title: "Content search"
- Subtitle: "Find and act on posts, comments, and group messages."
- Scope notice: "Direct messages are only searchable when reported or as part of a safeguarding case."
- Empty (no query): "Enter a search term to find content."
- Empty (no results): "No content matched your search."
- Remove confirmation: "Remove this {type}? The author will be notified and the removal is audited."
- Already removed: "Already removed by {name} on {date}."
- Toast: "Content removed. Report closed as actioned."

## 16. Open questions
- Q1: Should the search cover a member's private group messages if the
  moderator is a group admin? Currently no, only reported content. Compliance
  Lead.
- Q2: What is the retention policy on removed content — hard delete, soft
  delete, or retained for audit only? Compliance Lead and DPO.
- Q3: Should export include full content bodies, or only metadata? DPO and
  Compliance Lead.