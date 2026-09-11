# PNL-10 — Credit (Admin Console)

**Panel ID:** PNL-10
**Release:** R4 (gate G-5)
**Layer:** Admin Console
**Screens:** 12
**Route prefix:** /admin/credit

---

## 1. Purpose

Operate the credit book: triage loan applications, assess affordability, recommend and approve decisions under four-eyes, service performing loans, manage arrears and collections with compliant procedures, restructure when a member cannot pay as originally agreed, write off when recovery is not viable, manage guarantor exposure, submit to the Credit Reference Bureau, and evidence credit control to regulators.

This panel holds a lender's obligations. Every decision is defensible. Every variation to a loan requires four-eyes. Every collection action must comply with the CBK Prudential Guidelines and the lender's conduct standards. The Total Cost of Credit disclosure the member accepts in R4 is generated from the product configuration in this panel.

## 2. Users

| Role | Access | Notes |
|---|---|---|
| CREDIT_OFFICER | Full (own actions four-eyes) | Assessment, recommend, service, arrears |
| CREDIT_ANALYST | Read + assessment | Cannot approve decisions |
| FINANCE_OFFICER | Read + reporting | Portfolio, revenue recognition |
| COMPLIANCE_LEAD | Read + compliance actions | Regulatory returns, conduct review |
| ADMIN | Read only | Member context only |
| SUPER_ADMIN | Full | Override, audited |
| CHAPTER_LEADER | None | Not a financial role |
| MENTOR / MEMBER | None | Member-facing credit lives at /credit |

## 3. Workflows

### W1 — Loan application lifecycle
SUBMITTED → ASSESSMENT → RECOMMENDED → APPROVED / DECLINED / WITHDRAWN → OFFER_ISSUED → ACCEPTED → DISBURSED → ACTIVE → (CLOSED / ARREARS / RESTRUCTURED / WRITTEN_OFF)

### W2 — Credit decision (four-eyes)
CREDIT_OFFICER reviews application, runs affordability and scoring, records a recommendation (APPROVE / DECLINE / APPROVE_WITH_CONDITIONS). A second CREDIT_OFFICER or the Credit Manager confirms. The confirming officer cannot be the recommending officer.

### W3 — Loan servicing
Active loans accumulate scheduled repayments. Each repayment writes to the ledger as a double-entry pair. Every manual adjustment (waive a fee, capitalise interest, reschedule a single instalment) requires four-eyes and a reason.

### W4 — Arrears and collections
When an instalment is missed, the loan enters ARREARS. The collections workspace tracks the age bucket (1-30, 31-60, 61-90, 90+), the contact history, and the next action. Compliant collections only — no harassment, no third-party disclosure, no contacting outside agreed hours.

### W5 — Restructure / reschedule (four-eyes)
A member who cannot pay as originally agreed is offered a restructure: extended tenor, reduced instalment, or a payment holiday. A CREDIT_OFFICER proposes, a second CREDIT_OFFICER approves. Every restructure writes to the credit file and is disclosed in the member-facing loan detail.

### W6 — Write-off (four-eyes)
When recovery is not viable, a write-off is proposed by a CREDIT_OFFICER and approved by the Credit Manager plus FINANCE_OFFICER. Write-off does not erase the debt — it moves it to a separate ledger account for tax and audit purposes.

### W7 — Guarantor management
Guarantors are members who back a loan. The panel tracks who guaranteed what, current exposure, and outstanding guarantees. A guarantor cannot be called without prior notification and a documented demand.

### W8 — CRB submission
Every loan and every material credit event (missed instalment, restructuring, write-off) is submitted to the Credit Reference Bureau. Enquiry log records every CRB check the platform makes on a member.

## 4. Entity model

- **LoanProduct** — one product with interest rate, tenor range, fees, eligibility rules
- **LoanApplication** — one application, tied to a member
- **CreditDecision** — one decision, with recommendation and confirmation
- **Loan** — one disbursed loan, tied to a member and a product
- **RepaymentSchedule** — one instalment plan per loan
- **Repayment** — one instalment event, posted to the ledger
- **ArrearsCase** — one collections case, per loan, per ageing bucket
- **RestructureRequest** — one variation request
- **WriteOffRequest** — one write-off proposal
- **Guarantee** — one guarantee per member per loan
- **CRBSubmission** — one submission or enquiry
- **CRBEnquiry** — one check the platform made
- **CreditAnalytics** — one aggregation per period

## 5. Non-negotiables

1. **Four-eyes on credit decisions.** Recommender ≠ confirmer.
2. **Four-eyes on restructures.** Proposer ≠ approver.
3. **Four-eyes on write-offs.** Proposer ≠ approver; final approval requires Finance Officer.
4. **Four-eyes on manual ledger adjustments** to any loan account.
5. **Total Cost of Credit disclosure is generated from the product config**, never hand-calculated.
6. **Compliant collections only.** No third-party disclosure, no contact outside 08:00–20:00, no threats.
7. **Every repayment posts to the ledger as a double-entry pair.** Corrections are reversing entries.
8. **Every guarantee has a demand path.** Guarantors must be notified before a demand is issued.
9. **CRB submissions are per-loan and append-only.** A submission cannot be edited; a correction is a new submission.
10. **All money in integer minor units + ISO 4217.** Never floats.

## 6. Cross-panel links

- PNL-03 Members — Member 360, KYC tier, savings history (feeds affordability)
- PNL-09 Commerce & Finance — ledger, reconciliation, refunds
- PNL-11 Savings / SACCO — a member's savings history contributes to affordability
- PNL-15 Compliance — AML alerts, risk register, regulatory returns
- PNL-16 Data Protection — DSR handling for credit records
- PNL-17 Analytics & Reporting — loan book analytics

## 7. Acceptance criteria

- A CREDIT_OFFICER can take an application from SUBMITTED to APPROVED, and a second officer must confirm.
- A restructure cannot be approved by the same officer who proposed it.
- A write-off requires both a Credit Manager approval and a Finance Officer approval, distinct users.
- A manual adjustment to a loan ledger account requires two distinct users.
- A guarantor demand requires a recorded notification to the guarantor first.
- A CRB submission is recorded with a reference number and cannot be edited afterwards.
- Arrears age buckets update automatically from the repayment schedule.
- Every decision carries a recorded reason.

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Interest rate basis — reducing balance or flat? | Finance |
| Q2 | Maximum tenor per product? | Credit Manager |
| Q3 | Age bucket boundaries — CBK standard or product-specific? | Compliance Lead |
| Q4 | Collections contact hours — 08:00–20:00 or narrower? | Compliance Lead |
| Q5 | CRB submissions via API or batch? | Tech Lead |
| Q6 | Are guarantors required on all loans or only above a threshold? | Credit Manager |