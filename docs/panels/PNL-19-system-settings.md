# PANEL SPEC: PNL-19 System Settings

## 1. Identification
- Panel ID: PNL-19
- Layer: Admin Console
- Owner: SUPER_ADMIN (feature flags co-owned by Compliance Lead)
- Release: R1 onward
- Related charter: 17.2 (ADR-010 feature flags), 23.3 (compliance flags), 24 (integrations), 25 (environments)

## 2. Purpose
Configure the platform: general settings, compliance-gated feature flags, roles and
permissions, integrations, notification templates, localisation, maintenance mode,
background jobs, and system health.

## 3. Users and permissions
| Role | Access |
|---|---|
| SUPER_ADMIN | Full |
| COMPLIANCE_LEAD | Feature flags only |
| Others | Denied |

## 4. Screens
| ID | Screen | Route |
|---|---|---|
| ADM-230 | General configuration | /admin/settings/general |
| ADM-231 | Feature flags | /admin/settings/feature-flags |
| ADM-232 | Roles and permissions | /admin/settings/roles |
| ADM-233 | Integrations and health | /admin/settings/integrations |
| ADM-234 | Notification templates | /admin/settings/templates |
| ADM-235 | Localisation and translations | /admin/settings/locales |
| ADM-236 | Maintenance mode | /admin/settings/maintenance |
| ADM-237 | Background jobs | /admin/settings/jobs |
| ADM-238 | System health and environment | /admin/settings/health |

## 5. Core workflows
- W1 Toggle a feature flag (audited, gate check)
- W2 Update a notification template (versioned)
- W3 Review integration health
- W4 Review background job failures
- W5 Enable maintenance mode (audited, logged-out users see notice)

## 6. Entity model
GeneralConfig, FeatureFlag, Role, IntegrationStatus, NotificationTemplate,
Locale, BackgroundJob, SystemHealthComponent.

## 7. Non-negotiables
- Flag state changes audited: who, when, against which gate approval
- FEATURE_VIRTUAL_ASSETS cannot be enabled before G-6
- Maintenance mode is audited and broadcast
- Templates are versioned, not overwritten

## 8. Related panels
PNL-18 (Audit & Security), PNL-16 (Data Protection), PNL-15 (Compliance).

## 9. Acceptance criteria
- A SUPER_ADMIN can update any general config unaided
- A flag cannot be toggled past an unapproved gate
- Integration health refreshes on demand
- Template versions are retained

## 10. Open questions
- Which flags the Compliance Lead can toggle without SUPER_ADMIN
- SMS provider choice (Africa''s Talking confirmed)