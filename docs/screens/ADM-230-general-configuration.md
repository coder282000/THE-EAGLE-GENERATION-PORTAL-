# SCREEN SPEC: [ADM-230] General Configuration

## 1. Identification
- Screen ID: ADM-230
- Route: /admin/settings/general
- Release: R1
- Priority: P1
- Related panel: PNL-19

## 2. Purpose
Platform-wide settings: name, support contact, currency, timezone, membership open/closed.

## 3. Users and permissions
SUPER_ADMIN full. Others denied.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
Form grouped into: Platform, Contact, Financial defaults, Membership control.
Save and Reset buttons.

## 6. Components
Button, plain HTML form controls, inline save toast.

## 7. Data
platformName, supportEmail, defaultCurrency, defaultTimezone, newMemberApplicationOpen.

## 8. Actions
Save (audited). Reset (discard).

## 9. States
All ten standard.

## 10. Validation
Email format. Currency must be ISO 4217. Timezone must be IANA.

## 11. Responsive
xs: single column. lg: two columns.

## 12. Accessibility
Form labels associated. Required fields marked.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.general.viewed, settings.general.saved

## 15. Copy
Save toast: "Settings saved."

## 16. Open questions
None.