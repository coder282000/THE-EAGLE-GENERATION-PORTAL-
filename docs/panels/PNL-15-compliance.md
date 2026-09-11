# PNL-15 — Compliance (Admin Console)

**Panel ID:** PNL-15
**Release:** R3 onward (gate G-4 for KYC, G-6 for AML/CFT)
**Layer:** Admin Console
**Screens:** 11
**Route prefix:** /admin/compliance

---

## 1. Purpose

Operate the platform's compliance programme: verify members (KYC/CDD), monitor transactions for financial crime (AML/CFT), screen against sanctions and PEP lists, file suspicious activity reports, satisfy Travel Rule obligations on qualifying transfers, and evidence that every control works.

This is the panel auditors read first. Every action is auditable, every decision is reasoned, every alert has an SLA, and every control has a test. The KYC queue backs onto the member record; the AML queue backs onto the transaction ledger; the sanctions queue backs onto the screening provider; the control evidence dashboard backs onto the D5.8 Compliance Test Evidence Pack.

## 2. Users

| Role | Access | Notes |
|---|---|---|
| COMPLIANCE_LEAD | Full | Sole role that can close SARs and sign off control reviews |
| COMPLIANCE_ANALYST | Full (own actions four-eyes on closures) | Case work, alert triage |
| FINANCE_OFFICER | Read + AML escalation | Cannot close alerts, can raise |
| ADMIN | Read only | KYC queue for member support only |
| SUPER_ADMIN | Full | Override, audited |
| CHAPTER_LEADER | None | Not a compliance role |
| MENTOR / MEMBER | None | DSR self-service is at /profile/privacy |

## 3. Workflows

### W1 — KYC verification
Member submits identity documents on /verify/identity → lands in ADM-180 queue → analyst reviews documents, liveness, and extracted data → approve, reject, or request more information → approved KYC tier is written to the member record and consumed by R5 limits.

### W2 — AML alert triage
Transaction monitoring rules raise alerts → ADM-182 queue → analyst opens the case in ADM-183 with member 360 and transaction graph → investigate → disposition: TRUE_POSITIVE (file SAR), FALSE_POSITIVE (dismiss with reason), ESCALATE (to Compliance Lead).

### W3 — Sanctions/PEP hit resolution
Screening provider returns a possible hit → ADM-184 queue → analyst confirms or clears → true hit escalates to Compliance Lead → possible SAR and account freeze. False positives are added to the whitelist so the same name does not re-alert.

### W4 — SAR/STR preparation and filing
Confirmed suspicious activity → ADM-185 workspace → analyst drafts SAR with structured narrative → Compliance Lead reviews and approves → file with the FRC (Financial Reporting Centre) → record filing reference and date.

### W5 — Transaction monitoring rule changes
Compliance Lead edits a rule's threshold, velocity, or pattern → ADM-186 → change is drafted, previewed against historical alerts, and applied → every change audited with before/after.

### W6 — Risk scoring configuration
Member risk score is built from KYC tier, jurisdiction, transaction velocity, and sanctions history → ADM-187 lets Compliance Lead adjust the weights and view the current member risk register.

### W7 — Travel Rule messages
Every qualifying transfer carries originator and beneficiary data → ADM-188 shows sent, received and failed Travel Rule messages, and the resolution path for failures.

### W8 — Regulatory reporting calendar
Per licence, per regulator, per period → ADM-189 lists every filing with due date, owner, status, and submission reference.

### W9 — Compliance control evidence
Every control has an owner, a last-tested date, and a status → ADM-190 dashboard. Evidence lives in the D8.1 Compliance Evidence Repository; this dashboard is the entry point.

## 4. Entity model

- **KYCCase** — one verification attempt, tied to a member
- **AMLAlert** — one alert raised by transaction monitoring
- **SanctionsHit** — one screening match, resolved or escalated
- **SARCase** — one suspicious activity report, from draft to filed
- **MonitoringRule** — one rule with thresholds and status
- **MemberRiskProfile** — one risk score per member
- **TravelRuleMessage** — one originator/beneficiary data exchange
- **RegulatoryFiling** — one filing, per regulator, per period
- **ControlEvidence** — one control with owner, last tested, status

## 5. Non-negotiables

1. **Every alert has an SLA.** KYC 24h, AML 48h, sanctions 12h, SAR filing 72h from confirmation.
2. **Every decision has a reason.** Approve, reject, request more info, dismiss, escalate — all require a recorded reason.
3. **Four-eyes on SAR filing.** Analyst drafts, Compliance Lead approves.
4. **Four-eyes on control reviews.** Quarterly review requires two sign-offs.
5. **Never disclose SARs.** No member-facing view references a SAR by reference or existence.
6. **Never index SAR narratives or KYC documents in general search.**
7. **All PII and special-category data in this panel is field-level encrypted** and access-restricted to the assigned analyst plus the Compliance Lead.
8. **Every access to a case is logged.** Cases with access logs that include unexpected readers trigger a security event.
9. **Retention is 7 years for AML records.** DSR erasure never deletes AML records; it anonymises identifying fields.

## 6. Cross-panel links

- PNL-03 Members — Member 360, KYC tier, risk flags
- PNL-09 Commerce & Finance — transactions, ledger, refunds
- PNL-12 Treasury & Custody — withdrawals, kill switch
- PNL-13 OTC Desk — OTC orders, disputes, agents
- PNL-14 Remittance Operations — transfers, corridor, Travel Rule origin
- PNL-16 Data Protection — DSR queue, consent, breach register

## 7. Acceptance criteria

- A COMPLIANCE_LEAD can take a KYC case from SUBMITTED to APPROVED, and the tier is written to the member record.
- An AML alert cannot be closed without a reason and a disposition.
- A SAR cannot be filed by the same analyst who drafted it.
- A sanctions hit cannot be dismissed without a documented reason.
- A monitoring rule change is audited with before/after.
- Travel Rule failures appear within 5 minutes of the failed exchange.
- Regulatory filings appear in the calendar 30 days before due date.
- Compliance control evidence shows last-tested date within 1 day of the test.

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Which screening provider — Refinitiv, Dow Jones, ComplyAdvantage? | Compliance Lead |
| Q2 | SAR filing mechanism — FRC portal, batch upload, API? | Compliance Lead |
| Q3 | KYC documents retention — 7 years per AML, or per DPA retention schedule? | Compliance Lead |
| Q4 | Transaction monitoring engine — in-house rules or third-party? | Tech Lead + Compliance Lead |
| Q5 | Are AML alerts visible to FINANCE_OFFICER for escalation only, or hidden entirely? | Compliance Lead |