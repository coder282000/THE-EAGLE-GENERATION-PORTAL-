# SCREEN SPEC: [ADM-238] System Health and Environment

## 1. Identification
- Screen ID: ADM-238
- Route: /admin/settings/health
- Release: R1
- Priority: P1
- Related panel: PNL-19

## 2. Purpose
Read-only view of environment info and component health: API, DB, cache, queue,
storage, payments, screening, kill switch.

## 3. Users and permissions
SUPER_ADMIN full.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
Environment header (name, region, version, deployedAt). Component list with status.

## 6. Components
Plain table.

## 7. Data
component, status, detail, metric. environment, region, version, commit.

## 8. Actions
None - read-only. Refresh.

## 9. States
Ten standard.

## 10. Validation
None.

## 11. Responsive
Cards on xs.

## 12. Accessibility
Status uses colour + text.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.health.viewed

## 15. Copy
"Read-only. No configuration here."

## 16. Open questions
None.