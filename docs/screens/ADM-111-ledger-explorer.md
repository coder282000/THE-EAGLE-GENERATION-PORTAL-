# SCREEN SPEC: [ADM-111] Chart of Accounts and Ledger Explorer

## 1. Identification
- Screen ID: ADM-111
- Route: /admin/finance/ledger
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P0
- Related requirements: FR-8.8, RO-6, RO-8, Charter 19.3 ledger_entry
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
The single view of every ledger entry ever written. This is where an
auditor, the Finance Officer, or the Compliance Lead inspects the
append-only double-entry ledger that all money movements land in.

The chart of accounts defines the structure: member accounts, circle
accounts, org accounts, treasury accounts. Every transaction is two entries
in ledger_entry, one debit and one credit, that sum to zero. Balances are
derived from these entries, never stored.

An unbalanceable ledger is a P0. This screen makes that impossible to hide.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All entries, all exports |
| FINANCE_OFFICER | Full | All entries, all exports |
| COMPLIANCE_LEAD | Full, read-only | Regulator-facing evidence |
| ADMIN | Read-only | All entries |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Finance > Ledger), ADM-101 ledger card link,
  ADM-105 reconciliation drill, ADM-214 ledger drill, savings ADM-141
  ledger tab cross-link
- Leads to: ADM-101 (transaction detail), ADM-141 (circle detail), member
  360, audit trail
- Deep-linkable: yes. URL params: ?account, ?account_type, ?entry_type,
  ?pair, ?from, ?to

## 5. Layout and regions
- Page header: title, subtitle, "Verify ledger" action
- Alert banner: red if the last verification detected drift; green status
  otherwise
- KPI row: four cards
  - Entries in range (n)
  - Balanced (green) / Drift amount (red)
  - Accounts active (n)
  - Last verification at (relative time)
- Filter bar: account selector, account type filter, entry type filter,
  date range, search by reference or pair id
- Data table: entry id, date, account, account type, entry type (debit /
  credit), amount, currency, pair id, counterparty account, reference
- Row click opens the pair detail panel showing both entries of the pair
  together, plus any related transaction
- Pagination

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| AlertBanner | Drift detection notice |
| LedgerTable | Paired entries with running totals |
| LedgerPairPanel | Side panel with both entries and related records |
| AccountSelector | Account picker with search |
| FilterBar | Type and date filters |
| MoneyCell | Integer minor units + currency |
| StatusBadge | Entry status (POSTED / REVERSED) |
| ConfirmDialog | Verify ledger, export |

LedgerTable is the same component used on ADM-141 (circle ledger). It
visually pairs debit and credit rows and never accepts a stored balance as
input; the running total is derived from the entries themselves.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Entry id | LedgerEntry.id | string | Y | Read | Financial |
| Date | LedgerEntry.createdAt | timestamp | Y | Read | Internal |
| Account id | LedgerEntry.accountId | string | Y | Read | Internal |
| Account type | LedgerEntry.accountType | enum | Y | Read | Internal |
| Entry type | LedgerEntry.entryType | enum | Y | Read | Financial |
| Amount minor | LedgerEntry.amountMinor | int | Y | Read | Financial |
| Currency | LedgerEntry.currency | char(3) | Y | Read | Internal |
| Pair id | LedgerEntry.pairId | string | Y | Read | Financial |
| Counterparty account | LedgerEntry.counterpartyAccountId | string | Y | Read | Internal |
| Reference | LedgerEntry.reference | string | Y | Read | Internal |
| Reverses entry | LedgerEntry.reversesEntryId | string | N | Read | Financial |
| Reversed by entry | LedgerEntry.reversedByEntryId | string | N | Read | Financial |
| Posted by | LedgerEntry.postedBy | user | Y | Read | Internal |

Account type: MEMBER, CIRCLE, ORG, TREASURY.
Entry type: DEBIT, CREDIT.
Status (derived): POSTED (default), REVERSED (if reversedByEntryId is set).

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Open pair detail | Row click | FINANCE+, ADMIN, COMPLIANCE | No | GET /finance/ledger/pairs/:id | No |
| Open transaction | Panel link | FINANCE+ | No | navigates to ADM-101 | No |
| Open account | Panel link | FINANCE+ | No | filtered to account | No |
| Verify ledger | Header | FINANCE+, SUPER_ADMIN, COMPLIANCE | Yes | POST /finance/ledger/verify | Yes |
| Export entries | Toolbar | FINANCE+, SUPER_ADMIN, COMPLIANCE | No | GET /finance/ledger.csv | Yes |
| Export account statement | Panel | FINANCE+, SUPER_ADMIN | No | GET /finance/ledger/accounts/:id.csv | Yes |

There are no direct edits. Ledger entries are append-only. Reversals are
new entries linked to the original via reversesEntryId.

## 9. States
- Empty: "No ledger entries in this range."
- Loading: skeleton rows.
- Populated: typical 1,000-100,000 entries per month.
- Populated extreme: pagination caps at 100 entries per page.
- Partial: if a pair is broken (an entry exists without its counterpart),
  the row shows a warning indicator with a "broken pair" note.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
- Offline: cached list visible; verification and exports disabled.
- Success: verify returns "Balanced" or surfaces drift immediately.
- Destructive confirmation: verify ledger.

## 10. Validation and error handling
- Verify ledger must run server-side across the full ledger, not just the
  visible range.
- If verification reports non-zero drift, the banner is `role="alert"`,
  the status flips to red, and the run is recorded.
- If a pair is broken, verification fails with a specific message naming
  the entry id and its expected counterpart.
- Amounts are integer minor units with the explicit currency. Never floats.
- Exports are watermarked with actor, range, filters, timestamp. Member
  account identifiers are redacted to member numbers.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Date, entry type, amount, reference. |
| md (>=768) | Table, first seven columns. |
| xl (>=1280) | Table with all columns. Panel as side drawer, wider. |

## 12. Accessibility
- Semantic table with `<caption>` "Ledger entries"
- `aria-sort` on sortable columns
- Debit and credit columns labelled in the header
- Money values read with currency, and entry type is spoken as text
- Broken pair indicator uses both colour and an aria-describedby note
- Verification result announced via `aria-live="polite"`
- Focus order: header, alert banner, KPIs, filters, table

## 13. Performance
- Payload budget: 300 KB
- Cursor pagination at 100 per page
- Server-side filtering and sorting
- Verify ledger runs as a background job with a progress indicator; the
  result arrives by refresh or via a short polling loop
- Exports stream server-side

## 14. Analytics
- finance.ledger.viewed (properties: filters_count, range_days)
- finance.ledger.verified (properties: drift_amount_minor, entry_count)
- finance.ledger.broken_pair_detected
- finance.ledger.exported
- finance.account_statement.exported

## 15. Copy
- Title: "Chart of accounts and ledger"
- Subtitle: "Every entry, every pair. Append-only. Balances derived."
- Empty: "No ledger entries in this range."
- Balanced status: "Ledger balanced. Zero drift across {n} entries."
- Drift status: "Ledger drift of {amount}. This is a P0 incident."
- Broken pair: "Broken pair: entry {id} has no counterpart."
- Verify confirmation: "Verify the full ledger? This runs across every entry ever written and may take a moment. It is audited."
- Reversed entry note: "Reversed by entry {id} on {date}."
- Toast verify: "Ledger verified. Balanced."
- Toast drift: "Ledger drift detected. Investigate immediately."

## 16. Open questions
- Q1: Do we expose the chart of accounts as a separate configurable screen
  (an account catalogue the Finance Officer can curate), or is it fixed in
  code? The spec assumes fixed for R3. Finance Officer and Tech Lead.
- Q2: When the ledger is verified and drift is detected, does the platform
  automatically halt new money movements, or only alert? This should be a
  Charter-level decision but is not specified. Compliance Lead and Finance
  Officer.
- Q3: How far back does the on-screen ledger go? Pagination implies the
  full history, but archival data might need a separate access pattern.
  Tech Lead and Finance Officer.
- Q4: Should the ledger explorer be usable by the Compliance Lead without
  restriction, or do we hide member account identifiers for privacy even
  from compliance staff? Compliance Lead and DPO.