# Screen Spec: ADM-035 Member Merge

**Document ID:** D3.6-ADM-035
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-03 Members

## 1. Identification

- **Screen ID:** ADM-035
- **Route:** /admin/members/merge
- **Layer:** Admin Console
- **Module:** Members
- **Release:** R2
- **Priority:** P2
- **Requirements:** FR-1.3

## 2. Purpose

Resolve duplicates by merging two member records. Preserves history from both.

## 3. Users and permissions

| Role | Access |
|------|--------|
| SUPER_ADMIN | Full |
| Others | 403 |

## 4. Entry and exit points

- Reached from: ADM-030 bulk action "Merge", or ADM-031 "This might be a duplicate"
- Leads to: merged member detail

## 5. Layout and regions

- Step 1: Select primary and secondary member
- Step 2: Field-by-field resolution (choose A or B for each conflicting field)
- Step 3: Preview (what will be kept, what will be reattached)
- Step 4: Confirm with reason

## 6. Data

- Relationships reattached: applications, enrolments, orders, transactions, posts, messages, mentorship, sessions
- Lossy: secondary member becomes `status = 'MERGED'`, `mergedInto = primary.id`

## 7. Actions

| # | Action | Permission | Confirmation | API | Audited |
|---|--------|-----------|--------------|-----|---------|
| 1 | Merge | SUPER_ADMIN | 2-step confirm with reason | POST /admin/members/merge | yes (irreversible) |

## 8. States

- Search / select
- Field resolution
- Preview
- Confirm
- Success: redirect to merged member
- Error: rollback message

## 9. Accessibility

- Step wizard has aria-current="step"
- Confirmation requires typing the primary member number

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Is merge reversible? | Compliance Lead | OPEN |
| 2 | What happens to member numbers of merged records? | Product Lead | OPEN |