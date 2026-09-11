# SCREEN SPEC: [ADM-200] Data Subject Request Queue

## 1. Identification
- Screen ID: ADM-200
- Route: /admin/data-protection
- Layer: Admin Console
- Module: Data Protection
- Release: R1
- Priority: P0
- Related requirements: DPA-3, DPA-4, DPA-5, DPA-6
- Related panel: PNL-16

## 2. Purpose
Single queue of every DSR with statutory deadline tracking, assignment, status.

## 3. Users and permissions
| Role | Access |
|---|---|
| DATA_PROTECTION_OFFICER | Full |
| ADMIN | Full (audited) |
| SUPER_ADMIN | Full |
| COMPLIANCE_LEAD | Read-only |
| Others | Denied |

## 4. Entry and exit points
- Reached from: sidebar, dashboard critical alert, notification
- Leads to: ADM-201, member 360
- Deep-linkable: yes. Params: ?status, ?type, ?assigned

## 5. Layout and regions
Header, KPI row (Open, Due in 7d, Overdue, Completed 30d), filter bar,
bulk action bar (conditional), data table, pagination.

## 6. Components
StatCard, FilterBar, DataTable, Pagination, BulkActionBar, StatusBadge, EmptyState.

## 7. Data
| Field | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|
| reference | string | Y | Read | Internal |
| type | enum | Y | Read | Internal |
| memberName | string | Y | Read | PII |
| memberNumber | string | Y | Read | PII |
| receivedAt | timestamp | Y | Read | Internal |
| deadlineAt | timestamp | Y | Read | Internal |
| status | enum | Y | Read | Internal |
| assignedTo | user | N | Read | Internal |

## 8. Actions
Open case, assign, escalate (confirmed, audited), export (audited).

## 9. States
Empty, Loading (skeleton), Populated, Extreme (1000 rows), Partial, Error,
Permission denied (403 card), Offline, Success (toast), Destructive confirmation.

## 10. Validation
Deadline computed server-side. Overdue rows highlighted.

## 11. Responsive
xs: cards. md+: table.

## 12. Accessibility
Semantic table, aria-sort, Enter row navigation, visible focus.

## 13. Performance
Payload <200KB, cursor pagination.

## 14. Analytics
dsr.list.viewed, dsr.list.filtered, dsr.opened

## 15. Copy
Empty: "No data subject requests yet."
Overdue: "Overdue".

## 16. Open questions
30 calendar days vs business days - Compliance Lead.