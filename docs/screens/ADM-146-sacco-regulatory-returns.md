# SCREEN SPEC: [ADM-146] SACCO Regulatory Returns

## 1. Identification
- Screen ID: ADM-146
- Route: /admin/savings/returns
- Layer: Admin Console
- Module: Savings and SACCO
- Release: R4
- Priority: P0
- Related requirements: FR-11.15 (adapted), DPA-9 (ROPA references),
  Charter 16.9 SACCO context
- Related panel: PNL-11
- Related gates: G-5

## 2. Purpose
Produce the periodic returns required by the regulator (SASRA) directly from
the platform, not from a spreadsheet. This is what the Charter means by
"First regulatory return produced from the platform, not from a spreadsheet."

Returns are generated from the ledger and the segregation snapshots. They
are version-stamped, watermarked with the producing user, and retained with
the audit trail.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | Generate, review, submit, export |
| COMPLIANCE_LEAD | Full | Generate, review, submit, export |
| FINANCE_OFFICER | Generate and review | Cannot submit |
| ADMIN | Denied | 403 card |
| Others | Denied | 403 card |

Submission is a two-person action: the preparer (Finance Officer or
Compliance Lead) generates and reviews, the submitter (SUPER_ADMIN or
Compliance Lead) submits. Both are recorded.

## 4. Entry and exit points
- Reached from: sidebar (Savings > Regulatory returns), ADM-145 toolbar link
- Leads to: individual return preview, submission log, audit trail
- Deep-linkable: yes. URL params: ?return, ?period

## 5. Layout and regions
- Page header: title, subtitle, next due date
- KPI row: four cards
  - Returns due (30d) (n)
  - Returns overdue (n)
  - Returns submitted (12m) (n)
  - Next due date (date)
- Filter bar: return type, period, status
- Data table: return, period, due date, status, prepared by, submitted by,
  submitted at
- Row click opens the return detail: preview, download, submit action,
  submission log

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | KPI cards |
| FilterBar | Search plus dropdowns |
| DataTable | Sortable, row click |
| ReturnPreview | Renders the return in the regulator's format |
| SubmissionLog | List of submissions with actor, timestamp |
| ConfirmDialog | Generate, submit, revoke |
| MoneyCell | Consistent money rendering |

ReturnPreview is a new component. It renders the same JSX used for the
PDF/CSV export, so on-screen preview and download cannot drift.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Return id | SaccoReturn.id | string | Y | Read | Internal |
| Type | SaccoReturn.type | enum | Y | Read | Internal |
| Period | SaccoReturn.period | string | Y | Read | Internal |
| Due date | SaccoReturn.dueAt | date | Y | Read | Internal |
| Status | SaccoReturn.status | enum | Y | Read | Internal |
| Prepared by | SaccoReturn.preparedBy | user | N | Read | Internal |
| Prepared at | SaccoReturn.preparedAt | timestamp | N | Read | Internal |
| Submitted by | SaccoReturn.submittedBy | user | N | Read | Internal |
| Submitted at | SaccoReturn.submittedAt | timestamp | N | Read | Internal |
| Regulator reference | SaccoReturn.regulatorReference | string | N | Read | Internal |
| File url | SaccoReturn.fileUrl | string | N | Read | Internal |
| Notes | SaccoReturn.notes | text | N | Read | Internal |

Type: MONTHLY_RETURN, QUARTERLY_RETURN, ANNUAL_RETURN, AD_HOC.
Status: DRAFT, REVIEWED, SUBMITTED, ACCEPTED, REJECTED, OVERDUE.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Generate return | Toolbar | FINANCE+ | Yes | POST /savings/returns | Yes |
| Review | Row | FINANCE+, COMPLIANCE | No | PATCH /savings/returns/:id | Yes |
| Submit | Row | SUPER_ADMIN, COMPLIANCE | Yes (typed) | POST /savings/returns/:id/submit | Yes |
| Revoke submission | Row | SUPER_ADMIN | Yes (reason) | POST /savings/returns/:id/revoke | Yes |
| Download | Row | FINANCE+, COMPLIANCE | No | GET /savings/returns/:id.pdf | Yes |
| Export list | Toolbar | FINANCE+, COMPLIANCE | No | GET /savings/returns.csv | Yes |

Submission records the regulator reference number and attaches the
regulator's acknowledgement. If no acknowledgement is recorded within 7
days, the return is flagged for follow-up.

## 9. States
- Empty: "No returns yet. Generate the first return."
- Loading: skeleton rows.
- Populated: typical 4-12 rows (one per month or quarter).
- Populated extreme: pagination caps at 50.
- Partial: some rows missing submission acknowledgement; row shows
  "Awaiting regulator acknowledgement".
- Error: full-page error card with Retry.
- Permission denied: 403 card for ADMIN and non-savings roles.
- Offline: cached list visible; generate and submit disabled.
- Success: toast confirms; row updates.
- Destructive confirmation: generate, submit, revoke.

## 10. Validation and error handling
- Generate requires: type, period. A return cannot be generated twice for
  the same type and period unless the previous one is REJECTED.
- Review requires no outstanding data issues. If any circle has unresolved
  drift, review is blocked.
- Submit requires typed confirmation of the return reference and a
  regulator reference number.
- Revoke requires a reason (min 30 chars) and can only occur within 24
  hours of submission. After that, the regulator must be contacted directly.
- All amounts are integer minor units with explicit currency.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Cards. Preview opens full-screen. |
| md (>=768) | Table with key columns. Preview as side panel. |
| xl (>=1280) | Table with all columns. Preview as side panel, wider. |

## 12. Accessibility
- Semantic table with `<caption>` "SACCO regulatory returns"
- Preview uses `<article>` with a header and sectioned content
- Submit confirmation requires typed field, labelled
- Money values read with currency
- Confirmation dialogs are focus traps

## 13. Performance
- Payload budget: 250 KB
- Returns list paginated at 50
- Preview generated server-side, cached at most 5 minutes
- PDF and CSV exports stream

## 14. Analytics
- savings.returns.viewed (properties: filters_count)
- savings.return.generated (properties: type, period)
- savings.return.reviewed
- savings.return.submitted (properties: type, period)
- savings.return.revoked
- savings.returns.exported

## 15. Copy
- Title: "SACCO regulatory returns"
- Subtitle: "Periodic returns required by SASRA, produced from the platform."
- Empty: "No returns yet. Generate the first return."
- Generate confirmation: "Generate this return? It will be prepared for review. You will not be able to submit it yourself if you are the Finance Officer."
- Review confirmation: "Mark this return as reviewed? It will be ready for submission."
- Submit confirmation: "Submit this return? Type the reference to confirm. Submission is recorded with your identity and the timestamp."
- Revoke confirmation: "Revoke this submission? Reason required (min 30 chars). Revocation is only allowed within 24 hours of submission."
- Toast submit: "Return submitted. Regulator reference recorded."

## 16. Open questions
- Q1: Which regulator is the recipient of these returns? SASRA is the
  primary reference in the Charter, but is there a second regulator for any
  cross-border SACCO activity? Compliance Lead.
- Q2: What is the exact return format required by SASRA? Is there a
  template file, or do we produce the fields and let the regulator's portal
  accept them? Compliance Lead.
- Q3: Should accepted returns be retained indefinitely, or is there a
  retention window after which they can be archived? DPO and Compliance
  Lead.