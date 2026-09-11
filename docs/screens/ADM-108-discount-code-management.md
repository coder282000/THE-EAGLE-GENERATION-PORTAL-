# SCREEN SPEC: [ADM-108] Discount and Code Management

## 1. Identification
- Screen ID: ADM-108
- Route: /admin/finance/codes
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P1
- Related requirements: FR-8.4 (paid courses with scholarship and
  sponsorship codes)
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Manage discount codes, scholarship codes, and sponsorship codes. These are
the coupons and grants that let someone pay less than list price: a
scholarship for a course, a sponsor covering a cohort, a launch discount on
a shop item.

Every redemption is auditable. Every code has a defined validity window, a
defined scope, and a usage cap. Codes cannot be silently extended or reused
beyond their terms.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All codes, all actions |
| FINANCE_OFFICER | Full | All codes, all actions |
| ADMIN | Full except value edits | Can create and manage non-value fields |
| COMPLIANCE_LEAD | Read-only | All codes |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

The value of a code (percent, amount, or full waiver) is editable only by
SUPER_ADMIN and FINANCE_OFFICER. ADMIN can create a code, change its
validity window, edit its scope, and revoke it, but cannot change what it
discounts.

## 4. Entry and exit points
- Reached from: sidebar (Finance > Codes), ADM-107 product editor Codes
  tab, campaign link from PNL-07
- Leads to: product detail (ADM-107), redemption history filtered to the
  code, member 360 for a redeemer
- Deep-linkable: yes. URL params: ?surface, ?status, ?type

## 5. Layout and regions
- Page header: title, subtitle, "Create code" action
- KPI row: five cards
  - Active codes (n)
  - Redemptions (30d) (n)
  - Total discount issued (30d) (money, KES)
  - Codes expiring in 7 days (n)
  - Codes at cap (n)
- Filter bar: search code or description, surface filter, type filter,
  status filter
- Data table: code, type, scope, value, currency, valid from, valid to,
  cap, redemptions, status
- Row click opens the code editor panel with tabs: Basic / Value / Scope /
  Validity / Redemptions

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| CodeEditorPanel | Side panel with tabs |
| CodePreview | Shows how the code will render to the member |
| RedemptionTable | Per-code redemption history |
| MoneyCell | Consistent money rendering |
| StatusBadge | Code status |
| ConfirmDialog | Revoke, delete |

CodePreview is a small component that renders the code as the member will
see it on the checkout page: code text, description, savings amount or
percentage, validity.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Code id | DiscountCode.id | string | Y | Read | Internal |
| Code | DiscountCode.code | string | Y | Read | Internal |
| Description | DiscountCode.description | string | Y | Read | Internal |
| Type | DiscountCode.type | enum | Y | Read | Internal |
| Value percent | DiscountCode.valuePercent | int | N | Read | Financial |
| Value minor | DiscountCode.valueMinor | int | N | Read | Financial |
| Currency | DiscountCode.currency | char(3) | N | Read | Internal |
| Scope | DiscountCode.scope | enum | Y | Read | Internal |
| Surface | DiscountCode.surface | enum | N | Read | Internal |
| Product ids | DiscountCode.productIds | list | N | Read | Internal |
| Member tier | DiscountCode.memberTier | enum | N | Read | Internal |
| Member ids | DiscountCode.memberIds | list | N | Read | PII |
| Valid from | DiscountCode.validFrom | date | Y | Read | Internal |
| Valid to | DiscountCode.validTo | date | Y | Read | Internal |
| Usage cap | DiscountCode.usageCap | int | N | Read | Internal |
| Redemptions count | DiscountCode.redemptions | int | Y | Read | Internal |
| Status | DiscountCode.status | enum | Y | Read | Internal |
| Created by | DiscountCode.createdBy | user | Y | Read | Internal |
| Created at | DiscountCode.createdAt | timestamp | Y | Read | Internal |

Type: PERCENT, FIXED_AMOUNT, FULL_WAIVER.
Scope: ALL, SURFACE, PRODUCT, TIER, MEMBER_LIST.
Surface: EVENTS, SHOP, COURSES, SUBSCRIPTIONS, DONATIONS.
Member tier: STUDENT, PROFESSIONAL, ASSOCIATE.
Status: DRAFT, ACTIVE, EXPIRED, EXHAUSTED, REVOKED.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Create code | Header | ADMIN+ | Yes | POST /finance/codes | Yes |
| Edit code | Panel | ADMIN+ | No | PATCH /finance/codes/:id | Yes |
| Change value | Panel | FINANCE+ | Yes | PATCH /finance/codes/:id | Yes |
| Revoke code | Row action | ADMIN+ | Yes (reason) | POST /finance/codes/:id/revoke | Yes |
| Duplicate code | Row action | ADMIN+ | No | POST /finance/codes/:id/duplicate | Yes |
| Delete code | Row action | SUPER_ADMIN | Yes (typed) | DELETE /finance/codes/:id | Yes |
| Export redemptions | Panel | FINANCE+ | No | GET /finance/codes/:id/redemptions.csv | Yes |

Revoking a code prevents new redemptions. It does not reverse past
redemptions. Reversing a past redemption requires a separate refund via
ADM-103.

## 9. States
- Empty: "No codes yet. Create the first code."
- Loading: skeleton rows.
- Populated: typical 5-50 codes.
- Populated extreme: pagination caps at 25.
- Partial: if a code has redemptions but the redemption table is failing,
  the code row still shows the count with a note.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
  ADMIN sees value cells read-only.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms; row updates.
- Destructive confirmation: revoke, delete.

## 10. Validation and error handling
- Code required, uppercase alphanumeric, 4-20 chars, unique across the
  platform.
- Code cannot be a reserved word or confusingly similar to another active
  code.
- Value required: percent 1-100, fixed amount positive minor units, or
  full waiver with no amount.
- Valid from and valid to required; valid to must be after valid from.
- Scope requires the corresponding field: product ids if scope is PRODUCT,
  member tier if TIER, member list if MEMBER_LIST.
- Usage cap optional; if set, must be a positive integer.
- If a code is already exhausted (redemptions = cap), further edits to
  extend the cap require FINANCE+ and are audited.
- All amounts are integer minor units with the explicit currency.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Code, type, value, status. Panel full-screen. |
| md (>=768) | Table, first six columns. Panel as side drawer. |
| xl (>=1280) | Table with all columns. Panel as side drawer, wider. |

## 12. Accessibility
- Semantic table with `<caption>` "Discount codes"
- `aria-sort` on sortable columns
- Code input uses `inputmode="text"` and uppercase auto-formatting
- Value input labelled with type and currency
- Panel tabs use role=tablist, role=tab, role=tabpanel
- Money values read with currency
- Confirmation dialogs are focus traps
- Focus order: filters, KPIs, table, panel

## 13. Performance
- Payload budget: 220 KB
- Cursor pagination, 25 per page
- Redemption history lazy-loads on panel tab open, paginated at 25
- Code preview recomputes only on value change

## 14. Analytics
- finance.codes.viewed (properties: filters_count)
- finance.code.created (properties: type, scope)
- finance.code.edited
- finance.code.value_changed
- finance.code.revoked (properties: reason_category)
- finance.code.deleted
- finance.code.redemptions_exported

## 15. Copy
- Title: "Discount codes"
- Subtitle: "Coupons, scholarship codes, and sponsorship codes."
- Empty: "No codes yet. Create the first code."
- Create confirmation: "Create this code? It will be saved as a draft. Activate it when ready."
- Value change confirmation: "Change the value to {value}? Existing redemptions are unaffected. This is audited."
- Revoke confirmation: "Revoke this code? Reason required. Existing redemptions are unaffected; new redemptions will be blocked."
- Delete confirmation: "Type the code to confirm deletion. This is a soft delete. Redemption history is retained."
- Exhausted note: "Code has reached its usage cap."
- Preview header: "How the member sees this code:"
- Toast revoke: "Code revoked. No new redemptions."

## 16. Open questions
- Q1: Are scholarship and sponsorship codes structurally the same as
  discounts, or is there a distinction (e.g. sponsorship codes generate an
  invoice to the sponsor)? The spec treats them as the same entity with
  different descriptions, which may not match the business need.
  Finance Officer and Product Lead.
- Q2: Can a member redeem multiple codes on one order? Most platforms say
  no; the spec assumes no until told otherwise. Product Lead.
- Q3: Do expired codes remain visible for reference, or are they archived
  automatically after 90 days? Finance Officer.
- Q4: Should a code require approval before activation if it exceeds a
  threshold (e.g. > 50% discount)? Finance Officer and Compliance Lead.