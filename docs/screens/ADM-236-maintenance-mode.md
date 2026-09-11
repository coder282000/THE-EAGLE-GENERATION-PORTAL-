# SCREEN SPEC: [ADM-236] Maintenance Mode

## 1. Identification
- Screen ID: ADM-236
- Route: /admin/settings/maintenance
- Release: R1
- Priority: P1
- Related panel: PNL-19

## 2. Purpose
Enable or disable platform-wide maintenance mode. When enabled, non-admin users see
the /maintenance notice.

## 3. Users and permissions
SUPER_ADMIN only.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
Current status banner. Toggle. Scheduled window form. Message textarea.

## 6. Components
Button, plain toggle, datetime inputs.

## 7. Data
maintenanceMode, maintenanceMessage, scheduledStart, scheduledEnd, enabledBy, enabledAt.

## 8. Actions
Enable (typed confirm, audited). Disable (audited). Schedule.

## 9. States
Ten standard. Special: scheduled-pending.

## 10. Validation
Message required when enabling. Scheduled window must be in the future.

## 11. Responsive
Single column.

## 12. Accessibility
Typed confirm required.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.maintenance.viewed, settings.maintenance.enabled, settings.maintenance.disabled

## 15. Copy
"Enabling maintenance mode logs out all non-admin sessions and shows the maintenance page."

## 16. Open questions
None.