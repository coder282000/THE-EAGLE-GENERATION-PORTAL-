# SCREEN SPEC: [ADM-202] Consent Register and Versions

## 1. Identification
- Screen ID: ADM-202
- Route: /admin/data-protection/consent
- Layer: Admin Console
- Module: Data Protection
- Release: R1
- Priority: P1
- Related requirements: DPA-1, DPA-2, DPA-11, DPA-12
- Related panel: PNL-16

## 2. Purpose
Register of member consent per purpose and version, plus management of consent
text versions and re-consent campaigns.

## 3. Users and permissions
DPO/ADMIN/SUPER_ADMIN Full. COMPLIANCE_LEAD Read-only.

## 4. Entry and exit points
- Reached from: sidebar
- Leads to: member 360, consent detail
- Deep-linkable: yes

## 5. Layout and regions
Header, KPI row (Granted, Withdrawn 30d, Pending re-consent, Version count),
tabs (By member / Version history), filter, table.

## 6. Components
Tabs, FilterBar, DataTable, ConsentVersionDrawer (new), ConsentDetailModal (new).

## 7. Data
Consent: memberId, purpose, version, status, grantedAt, withdrawnAt,
consentTextHash, ipAddress, userAgent.
Purposes: MARKETING, ANALYTICS, PRAYER_REQUESTS, DATA_SHARING, RESEARCH,
CROSS_BORDER_TRANSFER.

## 8. Actions
Publish new version (confirm, audited). Trigger re-consent (confirm, audited).
Export (audited).

## 9. States
All ten standard.

## 10. Validation
New version requires label, effective date, change summary.

## 11. Responsive
xs: grouped cards. md+: table.

## 12. Accessibility
role=tablist / role=tabpanel.

## 13. Performance
Payload <200KB.

## 14. Analytics
consent.viewed, consent.version_published, consent.reconsent_triggered

## 15. Copy
Re-consent: "This will notify all members who have not consented to vN."

## 16. Open questions
Separate prayer-request consent from community guidelines?