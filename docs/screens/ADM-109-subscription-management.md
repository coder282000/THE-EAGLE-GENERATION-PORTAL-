# SCREEN SPEC: [ADM-109] Subscription Management

## 1. Identification
- Screen ID: ADM-109
- Route: /admin/finance/subscriptions
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P1
- Related requirements: FR-8.5 (recurring membership subscriptions)
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Oversight of every recurring subscription: active, paused, in dunning,
cancelled, expired. Subscriptions are the recurring revenue stream that
keeps the platform running. This screen lets the Finance Officer see MRR,
churn, and the state of any individual subscriber.

Subscription renewals are automatic through the licensed PSP. This screen
is not the renewal engine; it is the oversight layer above it.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All subscriptions, all actions |
| FINANCE_OFFICER | Full | All subscriptions, all actions |
| ADMIN | Read-only | Monitoring |
| COMPLIANCE_LEAD | Read-only | All subscriptions |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance > Subscriptions), ADM-102 order link,
  member 360 subscriptions tab
- Leads to: member 360, ADM-100 (transaction list filtered to the
  subscriber), ADM-101 (transaction detail)
- Deep-linkable: yes. URL params: ?status, ?plan, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle
- KPI row: five cards
  - Active subscriptions (n)
  - Monthly recurring revenue (money, KES)
  - New this month (n)
  - Churn this month (%) - denominator: subscriptions active at month start
  - In dunning (n)
- Chart row 1: active subscriptions over time (line, last 12 months)
- Chart row 2: MRR over time (line, last 12 months)
- Chart row 3: subscription mix by plan (stacked bar, last 6 months)
- Filter bar: search member number or plan, status filter, plan filter,
  date range
- Data table: member number, plan, status, amount, currency, frequency,
  next charge at, started at, last charged, status badge
- Row click opens a side panel with the subscriber detail and history

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards with denominators |
| Chart | Recharts wrapper, lazy-loaded |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| SubscriberDetailPanel | Side panel |
| MoneyCell | Integer minor units + currency |
| StatusBadge | Subscription status |
| EmptyState | No subscriptions |

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Subscription id | Subscription.id | string | Y | Read | Internal |
| Member id | Subscription.memberId | string | Y | Read | PII |
| Member number | Subscription.memberNumber | string | Y | Read | PII |
| Plan id | Subscription.planId | string | Y | Read | Internal |
| Plan name | Subscription.planName | string | Y | Read | Internal |
| Amount minor | Subscription.amountMinor | int | Y | Read | Financial |
| Currency | Subscription.currency | char(3) | Y | Read | Internal |
| Frequency | Subscription.frequency | enum | Y | Read | Internal |
| Status | Subscription.status | enum | Y | Read | Internal |
| Started at | Subscription.startedAt | timestamp | Y | Read | Internal |
| Next charge at | Subscription.nextChargeAt | timestamp | N | Read | Internal |
| Last charged at | Subscription.lastChargedAt | timestamp | N | Read | Internal |
| Last charge status | Subscription.lastChargeStatus | enum | N | Read | Internal |
| Cancelled at | Subscription.cancelledAt | timestamp | N | Read | Internal |
| Cancellation reason | Subscription.cancellationReason | text | N | Read | Internal |
| Dunning attempts | Subscription.dunningAttempts | int | Y | Read | Internal |
| Paused until | Subscription.pausedUntil | timestamp | N | Read | Internal |

Frequency: MONTHLY, QUARTERLY, ANNUAL.
Status: ACTIVE, PAUSED, DUNNING, CANCELLED, EXPIRED.
Last charge status: SUCCESS, FAILED, PENDING.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open subscriber | Row click | FINANCE+ | No | GET /finance/subscriptions/:id | No |
| Pause subscription | Panel action | FINANCE+ | Yes | POST /finance/subscriptions/:id/pause | Yes |
| Resume subscription | Panel action | FINANCE+ | No | POST /finance/subscriptions/:id/resume | Yes |
| Cancel subscription | Panel action | FINANCE+ | Yes (reason + typed) | POST /finance/subscriptions/:id/cancel | Yes |
| Retry charge | Panel action | FINANCE+ | Yes | POST /finance/subscriptions/:id/retry | Yes |
| Open member 360 | Panel link | FINANCE+ | No | navigates to member 360 | No |
| Export list | Toolbar | FINANCE+ | No | GET /finance/subscriptions.csv | Yes |

Cancel is a strong action. It stops future charges. The subscriber is
notified. Existing charges are not refunded; a separate refund is required
if the member is entitled to one.

## 9. States
- Empty: "No subscriptions yet."
- Loading: skeleton KPIs and charts.
- Populated: typical 50-5000 active subscriptions.
- Populated extreme: pagination caps at 50.
- Partial: if a subscription's last charge status is unknown, the cell
  shows "—" with a tooltip "Awaiting PSP confirmation".
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms; row updates.
- Destructive confirmation: cancel, retry charge.

## 10. Validation and error handling
- Pause requires a resume date and reason.
- Cancel requires a reason from a fixed list plus free text (min 20 chars),
  and typed confirmation of the member number.
- Retry charge is only available when the last charge failed and no more
  than 3 attempts have been made.
- If a subscription is already cancelled, cancel is disabled.
- All amounts are integer minor units with the explicit currency. Never
  floats.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | KPIs stack. Charts full width, 220px. Table becomes cards. |
| md (>=768) | Two-column KPIs. Charts full width, 260px. |
| xl (>=1280) | Five-column KPI row. Charts in two-column grid. |

## 12. Accessibility
- KPI cards use `<dl>` with value and denominator
- Charts have text alternatives describing the trend in words
- Money values read with currency
- Status badges use text and colour
- Confirmation dialogs are focus traps
- Focus order: filters, KPIs, charts, table, pagination

## 13. Performance
- Payload budget: 250 KB
- Charts lazy-loaded
- Server-side aggregation
- Table paginated at 50 per page
- Panel detail lazy-loads on row click

## 14. Analytics
- finance.subscriptions.viewed (properties: filters_count)
- finance.subscription.paused
- finance.subscription.resumed
- finance.subscription.cancelled (properties: reason_category)
- finance.subscription.charge_retried
- finance.subscriptions.exported

## 15. Copy
- Title: "Subscriptions"
- Subtitle: "Recurring membership revenue and subscriber status."
- Empty: "No subscriptions yet."
- KPI denominators:
  - "of {n} subscriptions active at month start"
- Pause confirmation: "Pause this subscription until {date}? The member is notified. No charge will be attempted during the pause."
- Cancel confirmation: "Cancel this subscription? Type the member number to confirm. The member will not be charged again. Existing charges are not refunded automatically."
- Retry charge confirmation: "Retry the last failed charge? This is audited."
- Disabled cancel tooltip: "This subscription is already cancelled."
- Toast cancel: "Subscription cancelled. Member notified."

## 16. Open questions
- Q1: How many dunning attempts before a subscription is auto-cancelled?
  The spec assumes 3. Finance Officer.
- Q2: When a member pauses a subscription, does the pause extend the
  billing cycle by the pause duration, or does the pause count against the
  paid period? Finance Officer and Product Lead.
- Q3: Are annual subscriptions supported in R3, or is R3 monthly only?
  Finance Officer.
- Q4: Do we surface churn reasons as a chart on this screen, or leave that
  to ADM-110 (Revenue Analytics)? Product Lead.