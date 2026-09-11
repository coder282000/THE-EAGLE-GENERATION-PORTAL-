# SCREEN SPEC: [ADM-232] Roles and Permissions

## 1. Identification
- Screen ID: ADM-232
- Route: /admin/settings/roles
- Release: R1
- Priority: P0
- Related panel: PNL-19

## 2. Purpose
Define the 8 roles and view their permissions. Membership is vetted; roles are
granted, not self-assigned.

## 3. Users and permissions
SUPER_ADMIN full.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
Role list on left, capability matrix on right.

## 6. Components
Plain tables, Button.

## 7. Data
Role.code, Role.name, Role.description. Permission matrix as Y/S/C/A/blank per
Charter section 12.2.

## 8. Actions
View only on this screen. Role assignment happens in PNL-03 (ADM-034).

## 9. States
Ten standard.

## 10. Validation
None - read-only.

## 11. Responsive
xs: role tabs. lg: matrix.

## 12. Accessibility
Matrix uses table with headers.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.roles.viewed

## 15. Copy
Legend: Y full, S self only, C own chapter only, A assigned only.

## 16. Open questions
None.