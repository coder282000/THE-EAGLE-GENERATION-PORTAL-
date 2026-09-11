# SCREEN SPEC: [ADM-231] Feature Flags

## 1. Identification
- Screen ID: ADM-231
- Route: /admin/settings/feature-flags
- Release: R1
- Priority: P0
- Related charter: 23.3
- Related panel: PNL-19

## 2. Purpose
Manage compliance-gated feature flags. Compliance Lead controls; every change audited
against the gate it depends on.

## 3. Users and permissions
SUPER_ADMIN full. COMPLIANCE_LEAD full (this screen only).

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
Header. Notice about compliance gating. List of flag cards, each with key, name,
description, required gate, gate status, current state, toggle, last-changed info.

## 6. Components
Button, plain toggle, inline confirm for toggling on.

## 7. Data
key, name, description, enabled, requiresGate, gateApproved, controlledBy,
lastChangedAt, lastChangedBy.

## 8. Actions
Toggle flag (audited; refuses if gate not approved). View gate detail.

## 9. States
Ten standard. Special: gate-not-approved disables toggle.

## 10. Validation
Cannot enable FEATURE_VIRTUAL_ASSETS without G-6.
Cannot enable FEATURE_COMMERCE without G-4.
Cannot enable FEATURE_SAVINGS_CIRCLES without G-5.
Cannot enable FEATURE_DIRECT_MESSAGING without G-2.

## 11. Responsive
Cards stack on xs.

## 12. Accessibility
Toggle is a native checkbox styled. aria-describedby for gate status.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.flags.viewed, settings.flags.toggled

## 15. Copy
"Requires gate: G-6. Not yet approved."
"Enabling this flag is audited."

## 16. Open questions
Who approves gate status - Compliance Lead only or Steering.