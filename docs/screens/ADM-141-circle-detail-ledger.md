# SCREEN SPEC: [ADM-141] Circle Detail and Ledger

## 1. Identification
- Screen ID: ADM-141
- Route: /admin/savings/circles/[id]
- Layer: Admin Console
- Module: Savings and SACCO
- Release: R4
- Priority: P0
- Related requirements: FR-9.6, FR-9.7, FR-9.10, RO-5, RO-6
- Related panel: PNL-11
- Related gates: G-5

## 2. Purpose
Full workspace for a single savings circle: members, contribution schedule,
ledger entries, payout history, arrears, and health. This is where a Finance
Officer investigates a circle before approving a payout or pausing it.

The ledger here is the source of truth. Every contribution and payout is a
double-entry pair in ledger_entry. Circle balances are derived, never stored.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All circles |
| FINANCE_OFFICER | Full | All circles |
| ADMIN | Full, read-only | All circles |
| COMPLIANCE_LEAD | Read-only | All circles |
| CIRCLE_LEADER | Own circle only, read-only | No payout approval |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: ADM-140 row click, ADM-143 (from payout), ADM-144 (from
  dispute), member 360 savings tab
- Leads to: ADM-143 (payout approval), ADM-144 (dispute), ADM-142
  (contribution monitoring filtered), member 360
- Deep-linkable: yes. URL params: tab

## 5. Layout and regions
- Header: circle name, type, region, member count, health pill, status
  badge, quick actions (Pause, Propose payout)
- Tab bar: Overview / Members / Contributions / Payouts / Ledger / Disputes
- Overview tab
  - KPI strip: total contributed, total paid out, current balance, next
    payout date, arrears count
  - Health panel: contribution success rate, on-time rate, dispute count
  - Recent activity: last 10 ledger entries with actor and timestamp
- Members tab
  - Table: member, member number, joined, contributions paid, contributions
    due, position in payout order
  - Row click to member 360
- Contributions tab
  - Table: date, member, amount, currency, status, ledger pair reference
  - Filter by status and date range
- Payouts tab
  - Table: date, recipient, amount, status, approved by, ledger pair
    reference
  - Four-eyes timeline per payout
- Ledger tab
  - Full append-only ledger with paired entries
  - Filter by account, date range, entry type
  - "Verify ledger" button runs a balance check and reports drift (should
    always be zero)
- Disputes tab
  - List of disputes with status, opened at, assigned to
  - Link to ADM-144

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI strip |
| HealthPill | Health indicator |
| StatusBadge | Circle status |
| Tabs | Route-based tab navigation |
| LedgerTable | Pairs display with running total |
| ContributionTable | Filterable list |
| PayoutTable | With four-eyes timeline |
| MemberRosterTable | Members with contribution status |
| EmptyState | Per-tab empty states |
| ConfirmDialog | Pause, propose payout |

LedgerTable is a new component. It shows paired debit and credit rows
visually connected, with a running balance column derived from the entries
themselves. It never accepts a stored balance as input.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Circle id | SavingsCircle.id | string | Y | Read | Internal |
| Name | SavingsCircle.name | string | Y | Read | Internal |
| Type | SavingsCircle.type | enum | Y | Read | Internal |
| Region | SavingsCircle.region | string | N | Read | Internal |
| Members | SavingsCircle.members | list | Y | Read | PII (member ids only) |
| Contribution amount | SavingsCircle.contributionMinor | int | Y | Read | Financial |
| Currency | SavingsCircle.currency | char(3) | Y | Read | Internal |
| Frequency | SavingsCircle.frequency | enum | Y | Read | Internal |
| Status | SavingsCircle.status | enum | Y | Read | Internal |
| Ledger entries | LedgerEntry[] | list | Y | Read | Financial |
| Contributions | Contribution[] | list | Y | Read | Financial |
| Payouts | Payout[] | list | Y | Read | Financial |
| Disputes | Dispute[] | list | Y | Read | Internal |
| Health score | SavingsCircle.healthScore | number | Y | Read | Internal |

No member names appear in the ledger. Member references are member numbers.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Pause circle | Header | FINANCE+ | Yes | PATCH /savings/circles/:id | Yes |
| Resume circle | Header | FINANCE+ | Yes | PATCH /savings/circles/:id | Yes |
| Propose payout | Header | FINANCE+ | Yes | POST /savings/payouts | Yes |
| Verify ledger | Ledger tab | FINANCE+, ADMIN | No | GET /savings/circles/:id/verify | Yes |
| Export circle | Toolbar | FINANCE+ | No | GET /savings/circles/:id.csv | Yes |
| Export ledger | Ledger tab | FINANCE+, ADMIN, COMPLIANCE | No | GET /savings/circles/:id/ledger.csv | Yes |

Propose payout sends a request to approval_request with
request_type=PAYOUT. The proposer cannot be the approver.

## 9. States
- Empty (no ledger yet): "No ledger entries yet. Contributions will appear
  here as they are made."
- Loading: skeleton KPIs, skeleton ledger table.
- Populated: full workspace.
- Populated extreme: ledger paginates at 50 entries per page.
- Partial: if a tab's data fails, that tab shows an inline retry; other
  tabs remain usable.
- Error: not-found card if circle id invalid. Server error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-savings roles;
  CIRCLE_LEADER sees own circle read-only.
- Offline: cached summary visible; ledger and mutating actions disabled.
- Success: toast confirms pause/resume; verify ledger shows the result
  inline.
- Destructive confirmation: pause, propose payout.

## 10. Validation and error handling
- Pause requires reason (min 20 chars).
- Resume requires resolution note.
- Propose payout requires: recipient member, amount (positive, <= available
  balance), reason (min 10 chars). Amount is integer minor units with the
  circle currency.
- Verify ledger must report "Balanced" with zero drift. Any non-zero drift is
  a P1 incident and blocks further payouts on the circle.
- Ledger export is watermarked with actor, circle id, timestamp.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. KPIs stack. Tables become cards. Tabs horizontal scroll. |
| md (>=768) | Two-column KPI strip. Full tables. |
| xl (>=1280) | Full layout, ledger with wider columns. |

## 12. Accessibility
- Tabs use role=tablist, role=tab, role=tabpanel with proper aria
- Ledger table pairs are labelled "Debit" and "Credit" in column headers
- Health pill uses text and colour
- Money values read with currency
- Focus order: header actions, tabs, current tab content

## 13. Performance
- Payload budget: 250 KB
- Ledger paginated at 50, cursor-based
- Contributions and payouts paginated at 25
- Health score computed server-side, cached at most 60 seconds
- Verify ledger runs server-side, streams progress

## 14. Analytics
- savings.circle.viewed (properties: tab, health)
- savings.circle.paused
- savings.circle.resumed
- savings.payout.proposed
- savings.ledger.verified (properties: drift)

## 15. Copy
- Title: "{circle name}"
- Subtitle: "{type} / {region} / {members} members"
- Empty ledger: "No ledger entries yet."
- Verify balanced: "Ledger is balanced. Zero drift."
- Verify drift: "Ledger drift of {amount}. This is a P1 incident. Payouts are blocked."
- Propose payout confirmation: "Propose a payout of {amount} to {member}? A second approver is required before execution."
- Pause confirmation: "Pause this circle? Reason (min 20 chars). Members are notified."
- Toast: "Payout proposed. Awaiting approval."

## 16. Open questions
- Q1: Does the member roster show contribution amounts per member, or only
  their paid / due status? Finance Officer and Data Protection Officer (PII
  minimisation).
- Q2: Should the circle leader be able to propose a payout from this screen,
  or is proposing restricted to Finance? Product Lead and Compliance.
- Q3: When a circle is paused, do pending payouts stay in the approval queue
  or are they withdrawn? Finance Officer.