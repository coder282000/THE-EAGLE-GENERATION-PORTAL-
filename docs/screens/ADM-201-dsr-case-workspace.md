# SCREEN SPEC: [ADM-201] DSR Case Workspace

## 1. Identification
- Screen ID: ADM-201
- Route: /admin/data-protection/[id]
- Layer: Admin Console
- Module: Data Protection
- Release: R1
- Priority: P0
- Related requirements: DPA-3, DPA-4, DPA-5, DPA-6
- Related panel: PNL-16

## 2. Purpose
Full workspace to process a single DSR from identity verification to delivery.

## 3. Users and permissions
DPO: Full. ADMIN: Full audited. SUPER_ADMIN: Full. COMPLIANCE_LEAD: Read-only.

## 4. Entry and exit points
- Reached from: ADM-200 row click, member 360
- Leads to: ADM-031, ADM-221
- Deep-linkable: yes

## 5. Layout and regions
Header (reference, status, deadline, actions). Left: request details, member
context, verification. Right: notes, timeline, audit trail. Status stepper.

## 6. Components
DSRStatusStepper (new), DetailSection, NotesPanel, AuditTrail, ConfirmDialog,
MemberContextCard (new).

## 7. Data
reference, type, scope, identityVerifiedAt, member context, deadlineAt,
extensionReason, completionMethod, deliveryChannel, deliveryProof.

## 8. Actions
Verify identity, request more info, extend (once), export JSON, anonymise
(typed confirm), rectify, complete, reject (reason), escalate. All audited.

## 9. States
All ten standard, plus case-specific: AWAITING_IDENTITY, AWAITING_MEMBER_INFO,
IN_PROGRESS, EXTENDED, COMPLETED_PARTIAL.

## 10. Validation
Extension once, reason mandatory. Anonymise requires typed member number.
Reject requires reason. Cannot complete without delivery proof.

## 11. Responsive
xs: stacked. lg: two columns.

## 12. Accessibility
Stepper uses nav/ol + aria-current. Status updates aria-live polite.

## 13. Performance
Payload <250KB. Member context lazy.

## 14. Analytics
dsr.opened, dsr.identity_verified, dsr.extended, dsr.completed

## 15. Copy
Anonymise: "This cannot be undone. Financial records retained with a
pseudonymous key."

## 16. Open questions
Anonymisation should preserve email hash for matching?