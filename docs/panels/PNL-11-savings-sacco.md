# PANEL SPEC: PNL-11 Savings and SACCO

## 1. Identification
- Panel ID: PNL-11
- Layer: Admin Console
- Owner: Finance Officer (day-to-day), Compliance Lead (SASRA returns)
- Release: R4
- Priority: P0
- Related charter sections: 16.9 (Savings Circles, FR-9.1 to FR-9.10),
  9.2 (SACCO business, covered), 9.3 (gate G-5), 19.3 (ledger_entry),
  19.3 (approval_request four_eyes constraint)
- Related gates: G-5 (co-operative vehicle confirmed and SASRA authorisation
  obtained, or written legal confirmation that it is not required)

## 2. Purpose
Oversight of every savings circle: contributions, payouts, arrears, disputes,
and member-fund segregation. This panel is where the Finance Officer monitors
circle health, approves rotational payouts under four-eyes, resolves
disputes, and produces the SACCO regulatory returns required by SASRA.

The member-facing savings experience lives in R4 member screens
(SCR-140 to SCR-148). This panel is the back office that oversees it.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | All circles, all actions |
| FINANCE_OFFICER | Full on finance, read-only on membership | Full payout approval |
| ADMIN | Full, except payout approval | Monitors, cannot approve payouts |
| COMPLIANCE_LEAD | Read-only | All circles, all data, for SASRA returns |
| CIRCLE_LEADER | Own circle only | Monitor own circle, raise dispute |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

Four-eyes rule: the initiator of a payout cannot be the approver. Enforced
by the approval_request database constraint (Charter 19.3).

## 4. Screens
| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-140 | Circle list and oversight | /admin/savings | P0 |
| ADM-141 | Circle detail and ledger | /admin/savings/circles/[id] | P0 |
| ADM-142 | Contribution monitoring | /admin/savings/contributions | P1 |
| ADM-143 | Payout approval (four-eyes) | /admin/savings/payouts | P0 |
| ADM-144 | Dispute resolution workspace | /admin/savings/disputes | P1 |
| ADM-145 | Member-fund segregation dashboard | /admin/savings/segregation | P0 |
| ADM-146 | SACCO regulatory returns | /admin/savings/returns | P0 |

## 5. Core workflows
- W1 Circle creation and member management
- W2 Contribution collection and arrears tracking
- W3 Rotational payout: propose, approve (four-eyes), execute, reconcile
- W4 Dispute raised by member or circle leader: triage, investigate, resolve
- W5 Daily member-fund segregation reconciliation
- W6 SACCO regulatory return production and submission

## 6. Entity model
SavingsCircle, CircleMembership, Contribution, Payout, PayoutApproval,
Dispute, SegregationSnapshot, SaccoReturn.

Every value movement is a double-entry pair in ledger_entry (append-only).
Circle balances are derived from the ledger, never stored as a mutable
column. A stored balance that can drift from its entries is the classic
failure mode and is explicitly forbidden by Charter 16.9 engineering
constraints.

## 7. Non-negotiables (from Charter)
- Every contribution and payout is a double-entry pair in ledger_entry
- Circle balances are derived from the ledger, never stored
- Daily reconciliation against the external account is mandatory (RO-5)
- Four-eyes on every payout. Initiator != approver. Enforced by DB CHECK
- Member funds are ring-fenced from operating funds
- Money is integer minor units with an explicit ISO 4217 currency
- ledger_entry is append-only; corrections are reversing entries

## 8. Related panels
PNL-03 (Members) for member 360 and suspend.
PNL-09 (Commerce & Finance) for the PSP rails that fund contributions.
PNL-15 (Compliance) for AML screening on large contributions.
PNL-16 (Data Protection) for erasure tension on retained ledger entries.
PNL-18 (Audit & Security) for the audit trail on every action.

## 9. Acceptance criteria
- A Finance Officer can approve a payout end-to-end under four-eyes
- Every contribution and payout is traceable to its ledger pair
- Segregation dashboard reconciles to zero exceptions daily
- Dispute resolution is recorded with a full audit trail
- SACCO returns can be produced for a given period without manual data entry
- No circle balance is stored anywhere; all balances are derived

## 10. Open questions
- Q1: Is "Young Eagles of Transformation SACCO" the R4 vehicle? (Charter Q-14)
  TEG and YET Kenya.
- Q2: Which SASRA return formats are required at launch, and at what cadence?
  Compliance Lead.
- Q3: Circle capacity limits per the co-operative vehicle's bylaws? Compliance
  Lead and TEG Leadership.
- Q4: Can a member belong to more than one circle at a time? Charter 16.9
  doesn't specify. Product Lead.