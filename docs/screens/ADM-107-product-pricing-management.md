# SCREEN SPEC: [ADM-107] Product and Pricing Management

## 1. Identification
- Screen ID: ADM-107
- Route: /admin/finance/products
- Layer: Admin Console
- Module: Commerce and Finance
- Release: R3
- Priority: P1
- Related requirements: FR-8.2, FR-8.3, FR-8.4, FR-8.5, FR-8.6
- Related panel: PNL-09
- Related gates: G-4

## 2. Purpose
Manage what the platform sells and at what price: event tickets, shop
items, courses, subscriptions, and donation tiers. This screen is the
catalogue behind the public shop, the member shop, and the checkout flow.

Pricing changes here take effect immediately for new orders. Historical
orders keep the price they were placed at.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All products, all actions |
| FINANCE_OFFICER | Full | All products, all actions |
| ADMIN | Full except pricing | Can edit descriptions and visibility |
| COMPLIANCE_LEAD | Read-only | All products |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

Pricing edits are restricted to SUPER_ADMIN and FINANCE_OFFICER. ADMIN can
edit description, imagery, and availability but cannot change the price.

## 4. Entry and exit points
- Reached from: sidebar (Finance > Products), ADM-108 code management
  (linked from a product), public shop cross-link for product detail
- Leads to: product detail, ADM-108 (codes for a product), public shop
  preview
- Deep-linkable: yes. URL params: ?surface, ?status, ?category

## 5. Layout and regions
- Page header: title, subtitle, "Create product" action
- KPI row: five cards
  - Products total (n)
  - Active (n)
  - Draft (n)
  - Archived (n)
  - Products with active codes (n)
- Filter bar: search name, surface filter, status filter, category filter
- Data table: name, surface, category, price, currency, status, active
  codes, last edited, edited by
- Row click opens the product editor (same route, side panel or full view
  depending on breakpoint) with tabs: Basic / Pricing / Visibility /
  Categories / Codes

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| ProductEditorPanel | Side panel with tabs |
| PriceInput | Money input in minor units, with currency selector |
| CategoryPicker | Multi-select categories |
| VisibilityToggle | Public / Member-only / Hidden |
| MoneyCell | Consistent money rendering |
| StatusBadge | Product status |
| ConfirmDialog | Archive, delete |

PriceInput is a new component. It takes an integer, formats it as money on
blur, and never accepts floats. It is the only money input in the admin
console that writes to a price field.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Product id | Product.id | string | Y | Read | Internal |
| Name | Product.name | string | Y | Read | Internal |
| Slug | Product.slug | string | Y | Read | Internal |
| Surface | Product.surface | enum | Y | Read | Internal |
| Category | Product.category | enum | N | Read | Internal |
| Description | Product.description | text | N | Read | Internal |
| Price minor | Product.priceMinor | int | Y | Read | Financial |
| Currency | Product.currency | char(3) | Y | Read | Internal |
| Status | Product.status | enum | Y | Read | Internal |
| Visibility | Product.visibility | enum | Y | Read | Internal |
| Image url | Product.imageUrl | string | N | Read | Internal |
| Active codes | Product.activeCodes | int | Y | Read | Internal |
| Created at | Product.createdAt | timestamp | Y | Read | Internal |
| Last edited at | Product.lastEditedAt | timestamp | Y | Read | Internal |
| Last edited by | Product.lastEditedBy | user | Y | Read | Internal |

Surface: EVENTS, SHOP, COURSES, SUBSCRIPTIONS, DONATIONS.
Status: DRAFT, ACTIVE, ARCHIVED.
Visibility: PUBLIC, MEMBER_ONLY, HIDDEN.
Category: varies per surface (e.g. for SHOP: MERCHANDISE, RESOURCES,
MEDIA_LEARNING).

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Create product | Header | ADMIN+ | Yes | POST /finance/products | Yes |
| Edit product | Panel | ADMIN+ | No | PATCH /finance/products/:id | Yes |
| Change price | Panel | FINANCE+ | Yes | PATCH /finance/products/:id | Yes |
| Duplicate product | Row action | ADMIN+ | No | POST /finance/products/:id/duplicate | Yes |
| Archive | Row action | FINANCE+ | Yes | PATCH /finance/products/:id | Yes |
| Delete (soft) | Row action | SUPER_ADMIN | Yes (typed) | DELETE /finance/products/:id | Yes |
| Preview in shop | Panel action | ADMIN+ | No | navigates to public shop | No |

Changing the price is audited with the before and after values. A price
change never affects existing orders.

## 9. States
- Empty: "No products yet. Create the first product."
- Loading: skeleton rows.
- Populated: typical 20-200 products.
- Populated extreme: pagination caps at 25.
- Partial: if an image url fails to load, the row shows a placeholder.
- Error: full-page error card with Retry.
- Permission denied: 403 card for CHAPTER_LEADER and non-finance roles.
  ADMIN sees the list but price cells are read-only.
- Offline: cached list visible; mutating actions disabled.
- Success: toast confirms; row updates in place.
- Destructive confirmation: archive, delete.

## 10. Validation and error handling
- Name required, min 3 chars.
- Slug auto-generated from name, must be unique. Can be overridden.
- Price required, positive integer minor units, currency required.
- Category required for SHOP and COURSES.
- Cannot archive a product with active subscriptions without a migration
  plan. The action is blocked with a tooltip.
- Deletion is soft. Historical orders preserve the product snapshot.
- All amounts are integer minor units with the explicit currency.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Name, surface, price, status. Panel full-screen. |
| md (>=768) | Table, first six columns. Panel as side drawer. |
| xl (>=1280) | Table with all columns. Panel as side drawer, wider. |

## 12. Accessibility
- Semantic table with `<caption>` "Products"
- `aria-sort` on sortable columns
- Price input labelled, with a currency select adjacent and `inputmode="numeric"`
- Panel tabs use role=tablist, role=tab, role=tabpanel
- Money values read with currency
- Confirmation dialogs are focus traps
- Focus order: filters, KPIs, table, panel

## 13. Performance
- Payload budget: 220 KB
- Cursor pagination, 25 per page
- Product editor lazy-loads on row click
- Images use `next/image`, lazy-loaded

## 14. Analytics
- finance.products.viewed (properties: filters_count)
- finance.product.created
- finance.product.edited (properties: fields_changed)
- finance.product.price_changed (properties: surface)
- finance.product.archived
- finance.product.deleted

## 15. Copy
- Title: "Products and pricing"
- Subtitle: "The catalogue behind the shop, events, and courses."
- Empty: "No products yet. Create the first product."
- Create confirmation: "Create this product? It will be saved as a draft. Publish it when ready."
- Price change confirmation: "Change the price to {amount}? Existing orders keep their original price. This is audited."
- Archive confirmation: "Archive this product? It disappears from the shop but historical orders are unaffected."
- Delete confirmation: "Type the product name to confirm deletion. This is a soft delete. History is retained."
- Blocked archive: "This product has active subscriptions. Create a migration plan first."
- Toast price change: "Price updated to {amount}."

## 16. Open questions
- Q1: Do we support per-chapter or per-cohort pricing, or is pricing
  global? Charter 16.8 doesn't specify. Product Lead and Finance Officer.
- Q2: Are event tickets products, or a separate entity? The spec assumes
  products cover shop, courses, subscriptions, and donations, while events
  are managed through PNL-08. Confirm with Product Lead.
- Q3: Should price changes require a second approver (four-eyes), or is
  single-user approval with audit enough? Finance Officer and Compliance
  Lead.
- Q4: Do we version products, or only the price field? Versioning the whole
  product would support richer history but adds complexity. Tech Lead.