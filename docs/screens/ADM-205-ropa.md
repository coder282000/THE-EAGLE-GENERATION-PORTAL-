# SCREEN SPEC: [ADM-205] Records of Processing Activities (ROPA)

## 1. Identification
- Screen ID: ADM-205
- Route: /admin/data-protection/ropa
- Layer: Admin Console
- Module: Data Protection
- Release: R1
- Priority: P1
- Related requirements: DPA-9, DPA-11
- Related panel: PNL-16

## 2. Purpose
Maintain the DPA-required register of processing activities.

## 3. Users and permissions
DPO/ADMIN/SUPER_ADMIN Full. COMPLIANCE_LEAD Read-only.

## 4. Entry and exit points
- Reached from: sidebar
- Leads to: ROPA detail, DPIA
- Deep-linkable: yes

## 5. Layout and regions
Header, KPI row (Active entries, DPIA required, Cross-border, Review due 90d),
filter, table.

## 6. Components
StatCard, FilterBar, DataTable, Pagination, ROPADetailDrawer (new), ExportButton.

## 7. Data
processingName, purpose, lawfulBasis, dataCategories, dataSubjects, recipients,
crossBorderTransfers, retentionPeriod, securityMeasures, dpiaRequired,
dpiaCompletedAt, lastReviewedAt, nextReviewAt, status.
Lawful basis: CONSENT/CONTRACT/LEGAL_OBLIGATION/VITAL_INTERESTS/PUBLIC_TASK/
LEGITIMATE_INTERESTS.

## 8. Actions
Create, edit, mark reviewed, link DPIA, export. All audited.

## 9. States
Ten standard.

## 10. Validation
Lawful basis, purpose, retention mandatory. Cross-border requires documented
basis. DPIA required cannot be false when special-category data listed.

## 11. Responsive
xs: cards. md+: table.

## 12. Accessibility
Drawer focus trap. Sortable columns.

## 13. Performance
Payload <200KB.

## 14. Analytics
ropa.viewed, ropa.entry_created, ropa.entry_reviewed, ropa.exported

## 15. Copy
Empty: "No processing activities recorded yet."
DPIA: "This activity processes special-category data. A DPIA is required."

## 16. Open questions
Export format - PDF, JSON, or both.