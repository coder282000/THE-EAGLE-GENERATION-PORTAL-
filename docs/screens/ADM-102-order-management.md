# SCREEN SPEC: [ADM-102] Order Management

## 1. Identification
- Screen ID: ADM-102
- Route: /admin/finance/orders
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P1
- Related requirements: FR-8.2 (events), FR-8.3 (shop), FR-8.4 (paid
  courses), FR-8.5 (subscriptions), FR-8.6 (donations), FR-8.7 (order
  management, receipts, history)
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Every order placed through the platform: event tickets, shop purchases,
course enrolments, subscriptions, and donations. The Finance Officer uses
this to check fulfilment status, resolve order-level issues, and reconcile
against the transaction ledger.

Order management is order-level. The financial movement is on the linked
transaction (ADM-101). This screen is about what was bought, for whom, and
whether it was delivered.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All orders |
| FINANCE_OFFICER | Full | All orders |
| ADMIN | Full | Order management, no refunds |
| COMPLIANCE_LEAD | Read-only | All orders |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance > Orders), ADM-100 transaction detail
  order link, member 360 orders tab
- Leads to: ADM-101 (transaction detail), member 360, ADM-103 (refund
  approval)
- Deep-linkable: yes. URL params: ?status, ?surface, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, date range (default current month)
- KPI row: five cards
  - Orders in range (n)
  - Fulfilled (n) - denominator: orders in range
  - Pending fulfilment (n)
  - Cancelled (n)
  - Total order value (money, KES)
- Filter bar: search by order reference, member number; status filter;
  surface filter; date range
- Data table: order reference, date, member, surface, items count, total
  value, currency, payment status, fulfilment status
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| DateRangePicker | From/to filter |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| StatusBadge | Payment status + fulfilment status |
| MoneyCell | Integer minor units + currency |
| EmptyState | No orders |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Order id | Order.id | string | Y | Read | Internal |
| Reference | Order.reference | string | Y | Read | Internal |
| Member id | Order.memberId | string | Y | Read | PII |
| Member number | Order.memberNumber | string | Y | Read | PII |
| Surface | Order.surface | enum | Y | Read | Internal |
| Items count | Order.itemsCount | int | Y | Read | Internal |
| Total minor | Order.totalMinor | int | Y | Read | Financial |
| Currency | Order.currency | char(3) | Y | Read | Internal |
| Payment status | Order.paymentStatus | enum | Y | Read | Internal |
| Fulfilment status | Order.fulfilmentStatus | enum | Y | Read | Internal |
| Created at | Order.createdAt | timestamp | Y | Read | Internal |
| Fulfilled at | Order.fulfilledAt | timestamp | N | Read | Internal |
| Transaction id | Order.transactionId | string | N | Read | Financial |

Surface: EVENTS, SHOP, COURSES, SUBSCRIPTIONS, DONATIONS.
Payment status: PENDING, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED.
Fulfilment status: NOT_STARTED, IN_PROGRESS, FULFILLED, CANCELLED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open order | Row click | FINANCE+, ADMIN | No | GET /finance/orders/:id | No |
| Mark fulfilled | Row action | FINANCE+, ADMIN | Yes | PATCH /finance/orders/:id | Yes |
| Cancel order | Row action | FINANCE+ | Yes (reason) | POST /finance/orders/:id/cancel | Yes |
| Open transaction | Row link | FINANCE+ | No | navigates to ADM-101 | No |
| Export list | Toolbar | FINANCE+ | No | GET /finance/orders.csv | Yes |

Cancellation on an already-paid order requires an accompanying refund. The
UI links the Finance Officer straight into ADM-103 with the order
pre-filled.

## 9. States
- Empty: "No orders in this period."
- Loading: skeleton rows.
- Populated: typical 200-2000 orders per month.
- Populated extreme: pagination caps at 50.
- Partial: if a row's transaction link is missing, the cell shows "—".
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms status change; row updates in place.
- Destructive confirmation: cancel order.

## 10. Validation and error handling
- Cancel requires a reason from a fixed list plus free text (min 20 chars).
- Cancelling a paid order surfaces a "create refund" prompt.
- Mark fulfilled requires no reason.
- If the order is already fully fulfilled, mark fulfilled is disabled.
- All amounts are integer minor units with the explicit currency.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Reference, member, surface, total value. |
| md (>=768) | Table, first seven columns. |
| xl (>=1280) | Table, all columns. |

## 12. Accessibility
- Semantic table with `<caption>` "Orders"
- `aria-sort` on sortable columns
- Money values read with currency
- Status badges use text and colour, and both statuses are labelled
- Confirmation dialogs are focus traps
- Focus order: date range, filters, KPIs, table, pagination

## 13. Performance
- Payload budget: 220 KB
- Cursor pagination, 50 per page
- Search debounced at 300 ms
- Order detail lazy-loads on row click

## 14. Analytics
- finance.orders.viewed (properties: filters_count)
- finance.order.fulfilled
- finance.order.cancelled
- finance.orders.exported

## 15. Copy
- Title: "Orders"
- Subtitle: "Every order placed on the platform."
- Empty: "No orders in this period."
- KPI denominators:
  - "of {n} orders in range"
- Cancel confirmation: "Cancel this order? A reason is required. If the order is already paid, a refund will be initiated."
- Cancel paid prompt: "This order is paid. Cancel will open a refund request. Continue?"
- Toast fulfilled: "Order marked as fulfilled."
- Toast cancelled: "Order cancelled. Refund request created."

## 16. Open questions
- Q1: For events, does fulfilment mean the ticket was issued, or the
  attendee checked in? If both, do we need two fulfilment stages? Product
  Lead and Finance Officer.
- Q2: Are subscriptions handled on this screen as orders, or only on
  ADM-109? The spec assumes orders cover the initial subscription purchase
  and ADM-109 covers renewals and cancellations. Confirm.
- Q3: For donations, is there a fulfilment step, or does paid = complete?
  Product Lead.