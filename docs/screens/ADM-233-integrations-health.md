# SCREEN SPEC: [ADM-233] Integrations and Health

## 1. Identification
- Screen ID: ADM-233
- Route: /admin/settings/integrations
- Release: R1
- Priority: P1
- Related panel: PNL-19

## 2. Purpose
Show every external integration, its configuration state, and its current health.

## 3. Users and permissions
SUPER_ADMIN full.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
KPI row (Healthy, Degraded, Down, Not configured). List of integrations by category:
Identity, Email, SMS, Push, Video, Payments, KYC, Analytics, Monitoring, Custody.

## 6. Components
Button, plain table or card list.

## 7. Data
name, category, status, environment, lastCheckedAt, notes.

## 8. Actions
Refresh health (read-only). View config (masked credentials).

## 9. States
Ten standard.

## 10. Validation
None - read-only.

## 11. Responsive
Cards stack on xs.

## 12. Accessibility
Status uses aria-label + colour + text.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.integrations.viewed, settings.integrations.refreshed

## 15. Copy
"Credentials are never displayed in the UI."

## 16. Open questions
Whether to allow credential rotation from this screen (deferred).