# PANEL SPEC: PNL-16 Data Protection

## 1. Identification
- Panel ID: PNL-16
- Layer: Admin Console
- Owner: Data Protection Officer (DPO)
- Related charter sections: 23.1 (DPA-1 to DPA-12), 22.5, 9.3
- Related gates: G-1
- Release: R1 (register), R3+ (workflow), R5 (breach + cross-border)

## 2. Purpose
Operationalise the Kenya Data Protection Act 2019 obligations that apply from R1.
The DPO's primary workspace: lawful processing, data subject rights within
statutory deadlines, the 72-hour breach clock, retention policy, and ROPA.

## 3. Users and permissions
| Role | Access |
|---|---|
| DATA_PROTECTION_OFFICER | Full |
| ADMIN | Full (audited) |
| SUPER_ADMIN | Full |
| COMPLIANCE_LEAD | Read-only on breaches + ROPA |
| Others | Denied |

## 4. Screens
| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-200 | DSR queue | /admin/data-protection | P0 |
| ADM-201 | DSR case workspace | /admin/data-protection/[id] | P0 |
| ADM-202 | Consent register | /admin/data-protection/consent | P1 |
| ADM-203 | Breach register | /admin/data-protection/breaches | P0 |
| ADM-204 | Retention and purge monitor | /admin/data-protection/retention | P1 |
| ADM-205 | ROPA | /admin/data-protection/ropa | P1 |

## 5. Core workflows
- W1 DSR: receive -> verify identity -> action -> deliver -> close (30-day clock)
- W2 Breach: detect -> assess -> contain -> ODPC 72h -> subjects -> close
- W3 Retention: purge job -> surface exceptions -> review
- W4 ROPA: activity added/changed -> review -> publish
- W5 Consent: text change -> new version -> re-consent on material change

## 6. Entity model
DataSubjectRequest, ConsentRecord, ConsentVersion, BreachIncident,
RetentionPolicy, ROPAEntry.

## 7. Statutory deadlines
- DSR: 30 days, one 30-day extension with reason
- Breach: 72 hours to ODPC notification
- Retention: per-policy purge cadence

## 8. Related panels
PNL-15 (Compliance), PNL-18 (Audit & Security), PNL-19 (System Settings),
PNL-03 (Members).

## 9. Acceptance criteria
- DPO takes a DSR from receipt to closure unaided
- Every DSR transition audited
- Breach ODPC notification time-stamped, immutable
- Erasure is anonymisation when financial retention applies
- ROPA exportable and version-stamped

## 10. Open questions
- ODPC notification form schema - Compliance Lead
- DSR self-service timing (R3 vs R5)
- Retention durations per entity - Compliance + Finance