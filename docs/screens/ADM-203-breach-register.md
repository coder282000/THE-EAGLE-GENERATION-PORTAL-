# SCREEN SPEC: [ADM-203] Breach Register and Incident Log

## 1. Identification
- Screen ID: ADM-203
- Route: /admin/data-protection/breaches
- Layer: Admin Console
- Module: Data Protection
- Release: R1
- Priority: P0
- Related requirements: DPA-10
- Related panel: PNL-16

## 2. Purpose
Personal-data breaches with the 72-hour ODPC clock, containment, subject
notification.

## 3. Users and permissions
DPO/ADMIN/SUPER_ADMIN Full. COMPLIANCE_LEAD Read-only.

## 4. Entry and exit points
- Reached from: sidebar, dashboard critical alert
- Leads to: breach detail, ADM-221
- Deep-linkable: yes

## 5. Layout and regions
Header, KPI row (Open, 72h active, Notified 30d, Closed 90d), filter, table.

## 6. Components
StatCard, FilterBar, DataTable, Pagination, StatusBadge, BreachClock (new),
EmptyState.

## 7. Data
reference, title, description, severity, category, discoveredAt,
notificationDeadlineAt, notifiedODPCAt, notifiedSubjectsAt, affectedCount,
status.
Severity: LOW/MEDIUM/HIGH/CRITICAL. Category: CONFIDENTIALITY/INTEGRITY/AVAILABILITY.
Status: REPORTED/INVESTIGATING/CONTAINED/NOTIFIED/CLOSED.

## 8. Actions
Report, update status, notify ODPC (immutable), notify subjects, export.
All audited.

## 9. States
Ten standard. Clock colour shifts as deadline approaches.

## 10. Validation
discoveredAt not future. Notification cannot precede discovery. Close requires
resolution summary.

## 11. Responsive
xs: cards. md+: table.

## 12. Accessibility
Clock aria-live polite, role=timer.

## 13. Performance
Payload <200KB.

## 14. Analytics
breach.list.viewed, breach.reported, breach.odpc_notified, breach.closed

## 15. Copy
"72-hour ODPC notification window: N hours remaining."

## 16. Open questions
ODPC form schema - Compliance Lead.