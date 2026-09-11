# SCREEN SPEC: [ADM-235] Localisation and Translations

## 1. Identification
- Screen ID: ADM-235
- Route: /admin/settings/locales
- Release: R1
- Priority: P1
- Related panel: PNL-19

## 2. Purpose
Manage supported locales and translation completeness. English is source; French
(DRC) and Kiswahili are planned.

## 3. Users and permissions
SUPER_ADMIN full.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
Locale list with completeness bar. Add/remove locale controls.

## 6. Components
Button, plain progress bar.

## 7. Data
locale, language, translatedKeys, totalKeys, status.

## 8. Actions
Enable/disable locale (audited), export/import translation file.

## 9. States
Ten standard.

## 10. Validation
Locale code must be ISO 639-1. Cannot disable the source locale.

## 11. Responsive
Cards stack on xs.

## 12. Accessibility
Progress bar uses role=progressbar with aria-valuenow.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.locales.viewed, settings.locales.toggled

## 15. Copy
"Launch with English only is approved. French and Kiswahili are prepared for later."

## 16. Open questions
Q-11 languages at launch - TEG.