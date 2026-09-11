# SCREEN SPEC: [ADM-224] Access review

## 1. Identification
- **Screen ID:** ADM-224
- **Route:** `/admin/security/access-review`
- **Layer:** Admin Console
- **Panel:** PNL-18 Audit and Security
- **Module:** Audit / Security (Charter §12, §22.2)
- **Release:** R3
- **Priority:** P1
- **Related requirements:** section 12, section 22.2
- **Panel overview:** docs/panels/PNL-18-audit-security.md

## 2. Purpose

The periodic recertification of who holds which role. Every privileged
role in the system is listed against the person who holds it, the date
it was granted, when it was last exercised, and whether it is under
review.

The screen exists so TEG can demonstrate, on a schedule, that every
privileged role still belongs to the person who holds it. Stale access
is the most common finding in a security audit; this screen is the
control that prevents it.

## 3. Users & permissions

| Role | Access | Notes |
|---|---|---|
| ADMIN | Read + flag for revocation | Cannot revoke directly |
| SUPER_ADMIN | Full | Read + revoke directly + mark certified |
| CHAPTER_LEADER | Denied | |
| FINANCE_OFFICER | Denied | |
| Others | Denied | Permission-denied card |

Helpers: `getAccessReviewEntries(user, filters)`,
`certifyAccess(user, id)`, `flagForRevocation(user, id)`,
`revokeAccess(user, id)` in `lib/mock/audit.ts`.

## 4. Entry & exit points

- **Reached from:** sidebar (System -> Access review), PNL-01 dashboard
  queue widget ("Access review due").
- **Leads to:**
  - PNL-03 member detail
  - ADM-220 audit log filtered by `action = role.granted` or `role.revoked`
- **Deep-linkable:** yes. `?role=&state=&stale=90d&page=2`

## 5. Layout & regions

Desktop (lg+):

1. **Page header** — "Access review", subtitle with the next review date
   and days remaining, primary action "Export for review".
2. **Stats row** — four StatTiles: Total role grants, Stale (not used in
   90 days), Pending review, Revoked this quarter.
3. **Filter bar** — search by member, role filter, review status filter,
   stale-only toggle.
4. **Data table** — columns: Member, Role, Granted, Last used, Status,
   Actions.
5. **Bulk action bar** — appears on selection: Certify selected,
   Flag for revocation.

Mobile (xs/sm):
- Stats 2-up.
- Filters in a Sheet.
- Table → card list.

## 6. Components

| # | Component | Type | Data source | Behaviour |
|---|---|---|---|---|
| 1 | AdminCard | Container | — | Wraps stats and table |
| 2 | StatTile | Local | derived | Label + value |
| 3 | SearchInput | Atom | — | 300ms debounce |
| 4 | Select | Atom | static | Role, review status |
| 5 | DataTable | Pattern | `getAccessReviewEntries()` | Manual markup |
| 6 | StatusBadge | Atom | mapped | Review status → StatusKey |
| 7 | Pagination | Molecule | cursor | xs fallback |
| 8 | EmptyState | Molecule | — | First-use and filtered-empty |
| 9 | ConfirmDialog | Dialog | — | Certify bulk; revoke; flag |
| 10 | Toast | Molecule | — | Certify, flag, revoke |

## 7. Data

| Field | Entity.attribute | Type | Required | Validation | Permission | Sensitivity |
|---|---|---|---|---|---|---|
| Member | user.name | string | yes | — | read | internal |
| Member email | user.email | string | yes | — | read | PII |
| Role | entry.role | string | yes | in role list | read | internal |
| Granted at | entry.granted_at | timestamptz | yes | — | read | internal |
| Granted by | entry.granted_by | uuid | yes | — | read | internal |
| Last used at | entry.last_used_at | timestamptz | no | — | read | internal |
| Review status | entry.review_status | enum | yes | — | read | internal |
| Reviewed by | entry.reviewed_by | uuid | cond | required if certified or revoked | read | internal |

"Stale" is computed as `last_used_at < now - 90 days` or `last_used_at
IS NULL` for roles granted more than 90 days ago.

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | Helper call | Success | Failure | Audited |
|---|---|---|---|---|---|---|---|---|
| 1 | Certify | Row action / bulk | SUPER_ADMIN | ConfirmDialog for bulk | `certifyAccess(id)` | Toast + status update | Toast error | yes |
| 2 | Flag for revocation | Row action / bulk | ADMIN, SUPER_ADMIN | none | `flagForRevocation(id)` | Toast + status update | Toast error | yes |
| 3 | Revoke directly | Row action / bulk | SUPER_ADMIN | ConfirmDialog | `revokeAccess(id)` | Toast + status update | Toast error | yes |
| 4 | Export for review | Header | ADMIN, SUPER_ADMIN | none | `exportAccessReview(filters)` | CSV download | Toast error | yes |
| 5 | View member | Row action | as read | none | — | Navigate to PNL-03 | — | no |
| 6 | View grant history | Row action | as read | none | — | Navigate to ADM-220 filtered | — | no |

Every certification, flag, and revocation writes an audit entry with
the actor, the target role, the target member, and the reason if one is
provided.

## 9. States

| State | Design |
|---|---|
| Empty (no grants) | "No role grants recorded." |
| Empty (filtered) | "No grants match these filters." + "Clear filters" |
| Loading | Skeleton stats ×4, skeleton rows ×6 |
| Populated | Default render |
| Populated, extreme | Default filter: stale only; full list is paginated at 25 |
| Partial | Stats load, table error → inline retry |
| Error | error.tsx boundary |
| Permission denied | "Access review is administrator-only." |
| Success | Toast on certify, flag, revoke |

## 10. Validation & error handling

- **Certify without a recent review** — allowed; certification is
  itself the record.
- **Revoke the last SUPER_ADMIN** — blocked: "At least one SUPER_ADMIN
  must remain active."
- **Certify a role that was already revoked** — blocked: "This grant is
  already revoked."
- **Bulk certify with mixed eligibility** — summary "2 rows skipped
  (already certified)."

Error codes: `ACCESS_ENTRY_NOT_FOUND`, `ACCESS_LAST_SUPER_ADMIN`,
`ACCESS_ALREADY_REVOKED`.

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|---|---|---|
| xs <640 | Stacked | Stats 2-up; filters in Sheet; table → cards |
| sm >=640 | Stacked | As xs |
| md >=768 | Table | Table returns; stats 4-up |
| lg >=1024 | Table | Sidebar visible; full width |
| xl >=1280 | Table | Comfortable columns |

## 12. Accessibility

- Table: `<caption>`, `<th scope="col">`.
- Status badges text-based; not colour-only.
- "Stale" rows are marked with both a badge and a text label, not just
  a colour.
- Focus order: header → stats → filters → table.

## 13. Performance

- Table page payload ≤ 40 KB for 25 rows.
- Stale computation is server-side in the real backend; mocked here.
- Search debounce 300ms.

## 14. Analytics

| Event | Properties |
|---|---|
| `admin.access_review.viewed` | role, filters_count |
| `admin.access_review.filtered` | role, state, stale_only |
| `admin.access_review.certified` | entry_id, was_bulk |
| `admin.access_review.flagged` | entry_id |
| `admin.access_review.revoked` | entry_id, was_self |
| `admin.access_review.exported` | row_count |

## 15. Copy

- Page title: "Access review"
- Subtitle: "Recertify who holds which role. Next review: {date}."
- Primary action: "Export for review"
- Filters: "All roles", "All states", "Stale only"
- Stats labels: "Total role grants", "Stale (90+ days)", "Pending review", "Revoked this quarter"
- Column headers: Member, Role, Granted, Last used, Status, Actions
- Row actions: "Certify", "Flag for revocation", "Revoke", "View member", "View grant history"
- Review statuses: Active, Pending review, Certified, Revoke pending, Revoked
- Revoke dialog: "Revoke this role?" / "{Member} will lose {role} access immediately." / "Revoke"
- Last-SUPER_ADMIN block: "At least one SUPER_ADMIN must remain active."
- Permission denied: "Access review is administrator-only."
- i18n keys: `admin.access_review.*`, `admin.access_review.status.*`

## 16. Open questions

| # | Question | Owner |
|---|---|---|
| 1 | Is the review cycle quarterly or every six months? Proposed: quarterly, matching Charter §8.6. | Compliance Lead |
| 2 | Is "certify" a per-role action or a per-member action (all roles at once)? Proposed: per-role, so revocations can be targeted. | Compliance Lead |
| 3 | What happens to a role flagged for revocation but never revoked? Proposed: re-flagged at the next review; no auto-revoke. | Compliance Lead |
| 4 | Does the export include the reviewer's signature line? Proposed: yes, as a column header pre-populated with the date. | Compliance Lead |
| 5 | Can a SUPER_ADMIN certify their own roles? Proposed: yes, but the audit entry marks it as self-certified. | Compliance Lead |