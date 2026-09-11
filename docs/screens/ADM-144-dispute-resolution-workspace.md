# SCREEN SPEC: [ADM-144] Dispute Resolution Workspace

## 1. Identification
- Screen ID: ADM-144
- Route: /admin/savings/disputes
- Layer: Admin Console
- Module: Savings and SACCO
- Release: R4
- Priority: P1
- Related requirements: FR-9.8
- Related panel: PNL-11
- Related gates: G-5

## 2. Purpose
Handle disputes raised by members or circle leaders about contributions,
payouts, or circle governance. Record the investigation, the decision, and
the resolution. Every action is audited. The workspace gives both parties
visibility of the resolution.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All disputes |
| FINANCE_OFFICER | Full | All disputes |
| ADMIN | Full | All disputes |
| COMPLIANCE_LEAD | Read-only | All disputes |
| CIRCLE_LEADER | Own circle disputes | Can comment, cannot resolve |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Savings > Disputes), ADM-141 disputes tab,
  notification
- Leads to: ADM-141 (circle detail), member 360, ledger entry for the
  disputed transaction
- Deep-linkable: yes. URL params: ?status, ?circle, ?priority

## 5. Layout and regions
- Page header: title, subtitle
- KPI row: four cards
  - Open (n)
  - High priority (n)
  - Median time to resolve (hours) - denominator: resolved in range
  - Closed (30d) (n)
- Filter bar: search reference or member, status filter, priority filter,
  circle filter
- Data table: reference, circle, raised by, subject, priority, opened,
  age, assigned to, status
- Row click opens the dispute workspace (same route, side panel or full
  view depending on breakpoint)

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| DisputeWorkspace | Detail with narrative, actions, and audit |
| CaseTimeline | Sequence of events and notes |
| MoneyCell | Consistent money rendering for disputed amounts |
| ConfirmDialog | Resolve, escalate, reassign |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Dispute id | Dispute.id | string | Y | Read | Internal |
| Reference | Dispute.reference | string | Y | Read | Internal |
| Circle id | Dispute.circleId | string | Y | Read | Internal |
| Circle name | Dispute.circleName | string | Y | Read | Internal |
| Raised by | Dispute.raisedById | string | Y | Read | PII |
| Raised by member number | Dispute.raisedByMemberNumber | string | Y | Read | PII |
| Subject | Dispute.subject | string | Y | Read | Internal |
| Description | Dispute.description | text | Y | Read | Internal |
| Related ledger entry | Dispute.ledgerEntryId | string | N | Read | Financial |
| Disputed amount | Dispute.amountMinor | int | N | Read | Financial |
| Currency | Dispute.currency | char(3) | N | Read | Internal |
| Priority | Dispute.priority | enum | Y | Read | Internal |
| Status | Dispute.status | enum | Y | Read | Internal |
| Assigned to | Dispute.assignedTo | user | N | Read | Internal |
| Opened at | Dispute.createdAt | timestamp | Y | Read | Internal |
| Resolved at | Dispute.resolvedAt | timestamp | N | Read | Internal |
| Resolution | Dispute.resolution | text | N | Read | Internal |
| Narrative | Dispute.narrative | list | N | Read | Internal |

Priority: HIGH, MEDIUM, LOW.
Status: OPEN, INVESTIGATING, AWAITING_RESPONSE, RESOLVED, WITHDRAWN.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Assign | Row action | FINANCE+ | No | PATCH /savings/disputes/:id | Yes |
| Reassign | Workspace | FINANCE+ | Yes | PATCH /savings/disputes/:id | Yes |
| Add narrative note | Workspace | FINANCE+, ADMIN, CIRCLE_LEADER own | No | POST /savings/disputes/:id/notes | Yes |
| Request info | Workspace | FINANCE+ | No | POST /savings/disputes/:id/request-info | Yes |
| Resolve | Workspace | FINANCE+ | Yes (typed) | POST /savings/disputes/:id/resolve | Yes |
| Withdraw | Workspace | Raised-by only | Yes | POST /savings/disputes/:id/withdraw | Yes |
| Escalate to compliance | Workspace | FINANCE+ | Yes | POST /savings/disputes/:id/escalate | Yes |

Resolve records: resolution text, resolution type, and any compensating
ledger entries required. If a compensating entry is created, it is a
reversing pair, never an edit.

## 9. States
- Empty: "No disputes in this period."
- Loading: skeleton rows.
- Populated: typical 5-30 open disputes.
- Populated extreme: pagination caps at 25.
- Partial: some disputes missing the related ledger entry; row shows the
  amount without a link.
- Error: full-page error card with Retry.
- Permission denied: 403 card for non-savings roles. CIRCLE_LEADER sees own
  circle disputes only.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms; row updates; workspace closes.
- Destructive confirmation: resolve, withdraw, escalate.

## 10. Validation and error handling
- Resolve requires a resolution type from a fixed list plus free text (min
  30 chars). Typed confirmation of the reference is required.
- Withdraw requires a reason (min 10 chars) and can only be done by the
  raiser.
- Escalate requires a reason (min 20 chars) and routes the case to the
  compliance team.
- If the dispute relates to a payout that has already been executed,
  resolution cannot alter the ledger entry directly; it must create a
  compensating entry.
- Amounts are integer minor units with the circle currency.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Workspace opens full-screen. |
| md (>=768) | Table with key columns. Workspace opens as side panel. |
| xl (>=1280) | Table with all columns. Workspace as side panel, wider. |

## 12. Accessibility
- Semantic table with `<caption>` "Savings disputes"
- Workspace uses `<article>` with `<header>` and sections
- Narrative entries as `<article>` with `<header>` showing actor and
  timestamp
- Money amounts read with currency
- Confirmation dialogs are focus traps
- Focus order: filters, KPIs, table, workspace

## 13. Performance
- Payload budget: 220 KB
- Cursor pagination, 25 per page
- Workspace loads detail lazily on row click
- Attachments or evidence files (if any) load on demand

## 14. Analytics
- savings.disputes.viewed (properties: filters_count)
- savings.dispute.assigned
- savings.dispute.note_added
- savings.dispute.resolved (properties: resolution_type, age_hours)
- savings.dispute.withdrawn
- savings.dispute.escalated

## 15. Copy
- Title: "Disputes"
- Subtitle: "Resolve member and leader disputes on savings circles."
- Empty: "No disputes in this period."
- KPI denominators:
  - "median over {n} disputes resolved"
- Resolve confirmation: "Resolve this dispute? Type the reference to confirm. Resolution is audited and both parties are notified."
- Withdraw confirmation: "Withdraw this dispute? Reason required (min 10 chars). Only the raiser can withdraw."
- Escalate confirmation: "Escalate to compliance? This is audited and routed to the Compliance Lead. Reason required."
- Toast resolve: "Dispute resolved. Both parties notified."

## 16. Open questions
- Q1: Should the raiser be able to see the internal narrative, or only the
  final resolution? Product Lead and Compliance Lead.
- Q2: Can a resolved dispute be reopened? If yes, by whom, and what is the
  time limit? Finance Officer and Compliance Lead.
- Q3: Do we retain dispute evidence (screenshots, receipts) and for how
  long? DPO and Compliance Lead.