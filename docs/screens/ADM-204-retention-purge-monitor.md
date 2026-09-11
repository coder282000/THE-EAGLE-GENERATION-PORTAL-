# SCREEN SPEC: [ADM-204] Retention Policy and Purge Monitor

## 1. Identification
- Screen ID: ADM-204
- Route: /admin/data-protection/retention
- Layer: Admin Console
- Module: Data Protection
- Release: R1
- Priority: P1
- Related requirements: DPA-8, RO-9
- Related panel: PNL-16

## 2. Purpose
View retention policies per entity, monitor the purge job, surface records
awaiting review, handle the erasure-vs-retention tension from 23.1.

## 3. Users and permissions
DPO/ADMIN/SUPER_ADMIN Full. FINANCE_OFFICER Read-only on financial retention.

## 4. Entry and exit points
- Reached from: sidebar
- Leads to: purge log, exception review
- Deep-linkable: yes

## 5. Layout and regions
Header, KPI row (Active policies, Records eligible, Pending review, Exceptions),
table, purge log drawer, exception section.

## 6. Components
StatCard, FilterBar, DataTable, Drawer, ExceptionList (new).

## 7. Data
entityName, dataCategory, retentionPeriodDays, legalBasis, lastPurgeRunAt,
nextPurgeRunAt, recordsEligible, recordsPendingReview, status, owner.

## 8. Actions
Run purge (typed confirm, audited), pause policy (audited), review exception,
export (audited).

## 9. States
Ten standard.

## 10. Validation
Manual purge requires typed confirm. Status changes audited.

## 11. Responsive
xs: cards. md+: table.

## 12. Accessibility
Drawer focus trap.

## 13. Performance
Payload <200KB.

## 14. Analytics
retention.policy_viewed, retention.purge_run, retention.policy_paused

## 15. Copy
"Member records with financial activity cannot be deleted. Identifying fields
are anonymised; transaction history retained 7 years."

## 16. Open questions
Purge cadence - DevOps + Compliance.