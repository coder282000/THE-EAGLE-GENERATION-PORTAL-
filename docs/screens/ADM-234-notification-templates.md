# SCREEN SPEC: [ADM-234] Notification Templates

## 1. Identification
- Screen ID: ADM-234
- Route: /admin/settings/templates
- Release: R1
- Priority: P1
- Related panel: PNL-19

## 2. Purpose
Manage email, SMS, and push templates. Versioned, not overwritten.

## 3. Users and permissions
SUPER_ADMIN full.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
Filter by channel. Template list. Edit drawer/side panel with preview.

## 6. Components
Button, plain form controls, textarea.

## 7. Data
key, name, channel, subject, body, version, active, updatedAt.

## 8. Actions
Create version (audited), deactivate, preview.

## 9. States
Ten standard.

## 10. Validation
Subject required for EMAIL. Body required. Merge fields must be from the allowed set.

## 11. Responsive
Drawer full-screen on xs.

## 12. Accessibility
Drawer focus trap.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.templates.viewed, settings.templates.version_created

## 15. Copy
"Editing creates a new version. The previous version is retained."

## 16. Open questions
None.