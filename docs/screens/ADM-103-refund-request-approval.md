# SCREEN SPEC: [ADM-103] Refund Request and Approval

## 1. Identification
- Screen ID: ADM-103
- Route: /admin/finance/refunds
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P0
- Related requirements: FR-8.9 (refunds with four-eyes), RO-7, RO-8,
  Charter 19.3 approval_request
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Request, review, approve, or reject refunds under four-eyes. The requester
and approver must be different users. This is the operational control that
makes the four-eyes rule true for money leaving the platform.

Charter 19.3 defines an `approval_request` table with a database CHECK
constraint `approved_by IS NULL OR approved_by <> initiated_by`. The
database itself refuses a self-approval. This screen is the UI that
respects that constraint.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | Can approve any refund not initiated by themselves |
| FINANCE_OFFICER | Full | Can approve any refund not initiated by themselves |
| ADMIN | Read-only | Can view the queue, cannot approve |
| COMPLIANCE_LEAD | Read-only | All refunds |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

Four-eyes rule: any user who initiated a refund cannot approve it. The
button is disabled with a tooltip "You initiated this refund. A different
approver is required." Server-side enforcement is mandatory.

## 4. Entry and exit points
- Reached from: sidebar (Finance > Refunds), ADM-101 "Initiate refund",
  ADM-102 cancel-order prompt, notification when a refund is proposed
- Leads to: ADM-101 (source transaction), ADM-102 (order), member 360,
  audit trail
- Deep-linkable: yes. URL params: ?status, ?surface

## 5. Layout and regions
- Page header: title, subtitle, notice about four-eyes
- KPI row: four cards
  - Pending approval (n)
  - Pending amount (money, KES)
  - Approved today (n)
  - Oldest pending (hours)
- Filter bar: search reference, member, transaction; status filter; surface
  filter
- Data table: reference, transaction reference, member number, surface,
  amount, currency, requested by, requested at, age, status
- Row click opens a side panel with the full refund detail, the four-eyes
  timeline, and Approve / Reject / Request info buttons

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| FourEyesNotice | Persistent notice about the rule |
| RefundDetailPanel | Side panel with full detail and actions |
| FourEyesTimeline | Proposed / Approved / Rejected with actors |
| MoneyCell | Consistent money rendering |
| StatusBadge | Refund status |
| ConfirmDialog | Approve, reject, request info |

FourEyesNotice is a persistent banner (`role="note"`) at the top of the
page: "You cannot approve a refund you requested. The database enforces
this."

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Refund id | Refund.id | string | Y | Read | Internal |
| Reference | Refund.reference | string | Y | Read | Internal |
| Transaction id | Refund.transactionId | string | Y | Read | Financial |
| Transaction reference | Refund.transactionReference | string | Y | Read | Internal |
| Order id | Refund.orderId | string | N | Read | Internal |
| Member id | Refund.memberId | string | Y | Read | PII |
| Member number | Refund.memberNumber | string | Y | Read | PII |
| Surface | Refund.surface | enum | Y | Read | Internal |
| Amount minor | Refund.amountMinor | int | Y | Read | Financial |
| Currency | Refund.currency | char(3) | Y | Read | Internal |
| Reason | Refund.reason | text | Y | Read | Internal |
| Requested by | Refund.initiatedBy | user | Y | Read | Internal |
| Requested at | Refund.createdAt | timestamp | Y | Read | Internal |
| Status | Refund.status | enum | Y | Read | Internal |
| Approved by | Refund.approvedBy | user | N | Read | Internal |
| Approved at | Refund.approvedAt | timestamp | N | Read | Internal |
| Rejected by | Refund.rejectedBy | user | N | Read | Internal |
| Rejected at | Refund.rejectedAt | timestamp | N | Read | Internal |
| Rejection reason | Refund.rejectionReason | text | N | Read | Internal |
| Reversing ledger pair | Refund.ledgerPairId | string | N | Read | Financial |
| PSP refund reference | Refund.pspRefundReference | string | N | Read | Internal |

Surface: EVENTS, SHOP, COURSES, SUBSCRIPTIONS, DONATIONS.
Status: PENDING, APPROVED, REJECTED, EXECUTED, FAILED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Approve | Panel | FINANCE+ (not initiator) | Yes (note optional) | POST /finance/refunds/:id/approve | Yes |
| Reject | Panel | FINANCE+ (not initiator) | Yes (reason required) | POST /finance/refunds/:id/reject | Yes |
| Request info | Panel | FINANCE+ | No | POST /finance/refunds/:id/request-info | Yes |
| Open transaction | Panel link | FINANCE+ | No | navigates to ADM-101 | No |
| Open order | Panel link | FINANCE+ | No | navigates to ADM-102 | No |
| Open member | Panel link | FINANCE+ | No | navigates to member 360 | No |
| Export queue | Toolbar | FINANCE+ | No | GET /finance/refunds.csv | Yes |

On approval, the system:
1. Writes approved_by to approval_request (DB CHECK ensures
   approved_by <> initiated_by)
2. Instructs the licensed PSP to execute the refund
3. Creates the reversing ledger pair on success
4. Records the PSP refund reference
5. Notifies the member

If the PSP instruction fails, the approval is rolled back and the refund
stays PENDING with a note.

## 9. States
- Empty: "No refunds awaiting approval."
- Loading: skeleton rows.
- Populated: typical 1-20 pending refunds.
- Populated extreme: pagination caps at 25.
- Partial: if the transaction link is missing, the row shows the reference
  without a link.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached list visible; approve and reject disabled.
- Success: toast confirms; row updates; ledger pair shown in the panel.
- Destructive confirmation: approve and reject both require confirmation.

## 10. Validation and error handling
- Approve is disabled if the current user is the initiator. Tooltip
  explains why. Server rejects the request with 403 if attempted.
- Reject requires a reason (min 20 chars).
- Approve note is optional.
- If the original transaction has already been fully refunded, the refund
  cannot be approved and shows "Already refunded."
- If the original transaction is REVERSED or FAILED, the refund cannot be
  approved.
- If the PSP instruction endpoint is unavailable, approval is blocked with
  an inline error and a "Retry" option.
- Amount is integer minor units with the explicit currency. Never floats.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Panel becomes a full-screen sheet. |
| md (>=768) | Table, first five columns. Panel as side drawer. |
| xl (>=1280) | Table with all columns. Panel as side drawer, wider. |

## 12. Accessibility
- Four-eyes notice is `role="note"` and read before the table
- Approve and reject buttons have aria-labels including the member number
- Disabled approve button uses `aria-disabled` and `aria-describedby` to
  explain the reason
- Four-eyes timeline uses `<ol>` with `<time>` elements
- Money values read with currency
- Confirmation dialog is a focus trap

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 25 per page
- Refund detail lazy-loads on row click
- PSP instruction on approval is a synchronous call; on timeout, the UI
  shows a "pending confirmation" state

## 14. Analytics
- finance.refunds.viewed
- finance.refund.approved (properties: age_hours, amount_bucket)
- finance.refund.rejected (properties: reason_category)
- finance.refund.info_requested
- finance.refunds.exported

## 15. Copy
- Title: "Refund approvals"
- Subtitle: "Approve refunds. A second approver is required."
- Four-eyes notice: "You cannot approve a refund you requested. The database enforces this."
- Empty: "No refunds awaiting approval."
- KPI denominators:
  - "oldest {hours}h"
- Approve confirmation: "Approve this refund of {amount} to {member}? The PSP will be instructed and the member notified."
- Reject confirmation: "Reject this refund? Reason required (min 20 chars). The requester is notified."
- Request info confirmation: "Request more information? The refund stays pending."
- Disabled tooltip initiator: "You initiated this refund. A different approver is required."
- Disabled tooltip already refunded: "This transaction is already fully refunded."
- Disabled tooltip failed transaction: "Failed transactions cannot be refunded."
- Toast approve: "Refund approved. PSP instructed. Member notified."

## 16. Open questions
- Q1: Should approval require a second factor (TOTP challenge) in addition
  to being a different user? Compliance Lead.
- Q2: If the PSP instruction fails after approval, is the approval rolled
  back automatically, or does it stay approved with a manual retry? Tech
  Lead and Finance Officer.
- Q3: How long can a refund stay PENDING before it expires and is withdrawn
  automatically? Finance Officer.
- Q4: Do we support partial refunds where the amount is less than the
  original transaction, and if so, how is that expressed on this screen?
  Finance Officer and Product Lead.