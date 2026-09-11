# SCREEN SPEC: [ADM-140] Circle List and Oversight

## 1. Identification
- Screen ID: ADM-140
- Route: /admin/savings
- Layer: Admin Console
- Module: Savings and SACCO
- Release: R4
- Priority: P0
- Related requirements: FR-9.1, FR-9.6, FR-9.7
- Related panel: PNL-11
- Related gates: G-5

## 2. Purpose
Single list of every savings circle with its health metrics. The Finance
Officer's home screen for savings oversight. Filters and sorts let them find
circles that need attention: arrears, upcoming payouts, disputes, or
unusually large contributions that may need AML review.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All circles |
| FINANCE_OFFICER | Full | All circles |
| ADMIN | Full, read-only | All circles |
| COMPLIANCE_LEAD | Read-only | All circles |
| CIRCLE_LEADER | Own circle only | Single row, RLS enforced |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Savings), dashboard alert for circle issues
- Leads to: ADM-141 (circle detail), ADM-143 (payout approval), ADM-144
  (dispute), ADM-146 (SASRA returns)
- Deep-linkable: yes. URL params: ?status, ?type, ?region

## 5. Layout and regions
- Page header: title, subtitle
- KPI row: five cards
  - Active circles (n)
  - Total members in circles (n)
  - Total contributions (money, KES)
  - Circles in arrears (n)
  - Payouts pending approval (n, links to ADM-143)
- Filter bar: search, status filter, type filter, region filter
- Data table: circle name, type, region, members, target contribution,
  frequency, next payout date, arrears count, health pill, status
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| Pagination | Cursor-based |
| StatusBadge | Circle status |
| HealthPill | Healthy / Watched / At risk |
| EmptyState | No circles yet |

HealthPill derives from arrears count, disputes count, and last
contribution success rate. Tone map: green (healthy), clay (watched),
red (at risk).

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Circle id | SavingsCircle.id | string | Y | Read | Internal |
| Name | SavingsCircle.name | string | Y | Read | Internal |
| Type | SavingsCircle.type | enum | Y | Read | Internal |
| Region | SavingsCircle.region | string | N | Read | Internal |
| Member count | SavingsCircle.memberCount | int | Y | Read | Internal |
| Target contribution | SavingsCircle.contributionMinor | int | Y | Read | Financial |
| Currency | SavingsCircle.currency | char(3) | Y | Read | Internal |
| Frequency | SavingsCircle.frequency | enum | Y | Read | Internal |
| Next payout date | SavingsCircle.nextPayoutAt | date | N | Read | Internal |
| Arrears count | SavingsCircle.arrearsCount | int | Y | Read | Internal |
| Disputes open | SavingsCircle.disputesOpen | int | Y | Read | Internal |
| Last contribution | SavingsCircle.lastContributionAt | timestamp | N | Read | Internal |
| Status | SavingsCircle.status | enum | Y | Read | Internal |

Type: ROTATING, GOAL_BASED, INVESTMENT_POOL.
Frequency: WEEKLY, BIWEEKLY, MONTHLY.
Status: ACTIVE, PAUSED, COMPLETED, DISSOLVED.
Health: HEALTHY, WATCHED, AT_RISK.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open circle | Row click | ADMIN+ | No | GET /savings/circles/:id | No |
| Create circle | Toolbar | FINANCE+ | Yes | POST /savings/circles | Yes |
| Pause circle | Row action | FINANCE+ | Yes | PATCH /savings/circles/:id | Yes |
| Export list | Toolbar | FINANCE+ | No | GET /savings/circles.csv | Yes |

Pause requires a reason and a scheduled resume date. Notifications go to
circle leaders and members.

## 9. States
- Empty: "No savings circles yet."
- Loading: skeleton rows.
- Populated: typical 10-100 circles.
- Populated extreme: pagination caps at 25 per page.
- Partial: some circles missing ledger-derived totals; row shows "—" for
  affected columns with a tooltip "Ledger totals unavailable."
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-savings roles.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms action; row updates in place.
- Destructive confirmation: pause and create both require confirmation.

## 10. Validation and error handling
- Create requires: name (min 5 chars), type, contribution amount (positive
  integer minor units), frequency, currency, min members.
- Pause requires a reason from a fixed list plus free text (min 20 chars).
- If a circle has an open dispute, pause is available but the reason must
  reference the dispute.
- All amounts are integer minor units with an explicit currency. Never
  floats.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Health pill prominent. Target contribution visible. |
| md (>=768) | Table, first six columns. |
| xl (>=1280) | Table, all columns. |

## 12. Accessibility
- Semantic table with `<caption>` "Savings circles"
- `aria-sort` on sortable columns
- Row navigation via Enter
- Health pill uses text and colour, not colour alone
- Confirmation dialog is a focus trap
- Money values read as text with currency, not as bare numbers

## 13. Performance
- Payload budget: 200 KB
- Cursor pagination, 25 per page
- Arrears and disputes counts cached server-side, refreshed at most every
  60 seconds
- Search debounced at 300 ms

## 14. Analytics
- savings.circles.viewed (properties: filters_count)
- savings.circle.created
- savings.circle.paused
- savings.circles.exported

## 15. Copy
- Title: "Savings circles"
- Subtitle: "Oversight of every savings circle, contribution, and payout."
- Empty: "No savings circles yet. Create the first one."
- Health labels: Healthy, Watched, At risk
- Pause confirmation: "Pause this circle? Members will not be able to
  contribute until it is resumed. A reason is required."
- Create confirmation: "Create this circle? Members will be invited to join.
  All money movements are double-entry and audited."
- Toast pause: "Circle paused. Leaders notified."
- Toast create: "Circle created."

## 16. Open questions
- Q1: Should health status be computed from a score, or from discrete rules
  (arrears > X, disputes > Y)? Finance Officer and Tech Lead.
- Q2: Do we allow bulk pause across multiple circles? Likely no; each circle
  has members who need notification. Product Lead.
- Q3: Should the KPI row include "Total paid out (lifetime)" for funders?
  TEG Leadership.