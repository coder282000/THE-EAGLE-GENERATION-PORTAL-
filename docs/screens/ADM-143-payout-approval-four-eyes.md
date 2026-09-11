# SCREEN SPEC: [ADM-143] Payout Approval (four-eyes)

## 1. Identification
- Screen ID: ADM-143
- Route: /admin/savings/payouts
- Layer: Admin Console
- Module: Savings and SACCO
- Release: R4
- Priority: P0
- Related requirements: FR-9.5, RO-7, RO-8, Charter 19.3 four_eyes
- Related panel: PNL-11
- Related gates: G-5

## 2. Purpose
Approve or reject rotational payouts under four-eyes. The approver must not
be the initiator. This is the operational control that makes the four-eyes
rule true for savings circles.

Charter 19.3 defines an `approval_request` table with a database CHECK
constraint `approved_by IS NULL OR approved_by <> initiated_by`. The
database itself refuses a self-approval. This screen is the UI that
respects that constraint.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | Can approve any payout not initiated by themselves |
| FINANCE_OFFICER | Full | Can approve any payout not initiated by themselves |
| ADMIN | Read-only | Can view the queue, cannot approve |
| COMPLIANCE_LEAD | Read-only | All payouts |
| CIRCLE_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

Four-eyes rule: any user who initiated a payout cannot approve it. The
button is disabled with a tooltip "You initiated this payout. A different
approver is required." Server-side enforcement is mandatory.

## 4. Entry and exit points
- Reached from: sidebar (Savings > Payouts), ADM-140 KPI "Payouts pending
  approval", notification when a payout is proposed
- Leads to: ADM-141 (circle detail), member 360, audit trail
- Deep-linkable: yes. URL params: ?status, ?circle

## 5. Layout and regions
- Page header: title, subtitle, notice about four-eyes
- KPI row: four cards
  - Pending approval (n)
  - Pending amount (money, KES)
  - Approved today (n)
  - Oldest pending (hours)
- Filter bar: search circle or recipient, status filter, circle filter
- Data table: reference, circle, recipient, amount, currency, proposed by,
  proposed at, age, status
- Row expansion or click opens a side panel with the full payout detail,
  the four-eyes timeline, and the Approve / Reject / Request info buttons

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| FourEyesNotice | Persistent notice about the rule |
| PayoutDetailPanel | Side panel with full detail and actions |
| FourEyesTimeline | Shows proposed / approved / rejected with actors |
| MoneyCell | Consistent money rendering |
| StatusBadge | Payout status |
| ConfirmDialog | Approve, reject, request info |

FourEyesNotice is a small persistent banner (`role="note"`) at the top of
the page: "You cannot approve a payout you initiated. The database enforces
this."

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Payout id | Payout.id | string | Y | Read | Internal |
| Reference | Payout.reference | string | Y | Read | Internal |
| Circle id | Payout.circleId | string | Y | Read | Internal |
| Circle name | Payout.circleName | string | Y | Read | Internal |
| Recipient id | Payout.recipientId | string | Y | Read | PII |
| Recipient member number | Payout.recipientMemberNumber | string | Y | Read | PII |
| Amount minor | Payout.amountMinor | int | Y | Read | Financial |
| Currency | Payout.currency | char(3) | Y | Read | Internal |
| Proposed by | Payout.initiatedBy | user | Y | Read | Internal |
| Proposed at | Payout.createdAt | timestamp | Y | Read | Internal |
| Status | Payout.status | enum | Y | Read | Internal |
| Reason | Payout.reason | text | Y | Read | Internal |
| Ledger pair (on execute) | Payout.ledgerPairId | string | N | Read | Financial |

Status: PENDING, APPROVED, REJECTED, EXECUTED, FAILED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Approve | Panel | FINANCE+ (not initiator) | Yes (reason optional) | POST /savings/payouts/:id/approve | Yes |
| Reject | Panel | FINANCE+ (not initiator) | Yes (reason required) | POST /savings/payouts/:id/reject | Yes |
| Request info | Panel | FINANCE+ | No | POST /savings/payouts/:id/request-info | Yes |
| Open circle | Row / panel link | FINANCE+ | No | navigates to ADM-141 | No |
| Open member | Panel link | FINANCE+ | No | navigates to member 360 | No |
| Export queue | Toolbar | FINANCE+ | No | GET /savings/payouts.csv | Yes |

On approval, the system:
1. Writes approved_by to approval_request (DB CHECK ensures
   approved_by <> initiated_by)
2. Creates the ledger debit entry on the circle account
3. Creates the ledger credit entry on the member account
4. Records the ledger_pair_id on the payout
5. Notifies the recipient and the circle leader

If the ledger write fails, the approval is rolled back. No partial state.

## 9. States
- Empty: "No payouts awaiting approval."
- Loading: skeleton rows.
- Populated: typical 1-20 pending payouts.
- Populated extreme: pagination caps at 25.
- Partial: some rows missing recipient detail; row shows member number only
  with an inline retry.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER, CIRCLE_LEADER, and
  non-savings roles.
- Offline: cached list visible; approve and reject disabled.
- Success: toast confirms; row updates; ledger pair shown in the panel.
- Destructive confirmation: approve and reject both require confirmation.

## 10. Validation and error handling
- Approve is disabled if the current user is the initiator. Tooltip
  explains why. Server rejects the request with 403 if attempted.
- Reject requires a reason (min 20 chars).
- Approve reason is optional.
- If the circle is paused, all payouts on it are blocked. Approve is
  disabled with tooltip "Circle is paused."
- If the ledger balance check fails, approve is blocked and the panel shows
  "Ledger imbalance detected. Fix before approval."
- Amount is integer minor units with the circle's currency. Never floats.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Panel becomes a full-screen sheet. |
| md (>=768) | Table, first five columns. Panel as side drawer. |
| xl (>=1280) | Table with all columns. Panel as side drawer, wider. |

## 12. Accessibility
- Four-eyes notice is `role="note"` and read before the table
- Approve and reject buttons have aria-labels including the recipient
  member number
- Disabled approve button uses `aria-disabled` and `aria-describedby` to
  explain the reason
- Four-eyes timeline uses `<ol>` with `<time>` elements
- Money values read with currency
- Confirmation dialog is a focus trap

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 25 per page
- Payout detail lazy-loads on row click
- Ledger balance check runs server-side on approval, not on every render

## 14. Analytics
- savings.payouts.viewed
- savings.payout.approved (properties: age_hours)
- savings.payout.rejected (properties: reason_category)
- savings.payout.info_requested
- savings.payouts.exported

## 15. Copy
- Title: "Payout approvals"
- Subtitle: "Approve rotational payouts. A second approver is required."
- Four-eyes notice: "You cannot approve a payout you initiated. The database enforces this."
- Empty: "No payouts awaiting approval."
- KPI denominators:
  - "{n} pending, oldest {hours}h"
- Approve confirmation: "Approve this payout of {amount} to {member}? The ledger will be updated and the recipient notified."
- Reject confirmation: "Reject this payout? Reason required (min 20 chars). The initiator is notified."
- Request info confirmation: "Request more information? The payout stays pending."
- Disabled tooltip initiator: "You initiated this payout. A different approver is required."
- Disabled tooltip paused: "Circle is paused. Resume before approving."
- Disabled tooltip imbalance: "Ledger imbalance detected. Fix before approval."
- Toast approve: "Payout approved. Ledger pair created. Recipient notified."

## 16. Open questions
- Q1: Should approval require a second factor (TOTP challenge) in addition
  to being a different user? Compliance Lead.
- Q2: If the initiator leaves the organisation, does the payout become
  approvable by anyone, or is it withdrawn and re-initiated? Finance Officer.
- Q3: How long can a payout stay PENDING before auto-expiring? Finance
  Officer.