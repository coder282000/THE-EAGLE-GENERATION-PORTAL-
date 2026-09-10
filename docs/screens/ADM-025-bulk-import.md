# Screen Spec: ADM-025 Bulk Import

**Document ID:** D3.6-ADM-025
**Version:** 1.0.0
**Status:** Baselined
**Panel:** PNL-02

---

## 1. Identification

- **Screen ID:** ADM-025
- **Route:** `/admin/applications/import`
- **Layer:** Admin Console
- **Module:** Applications
- **Release:** R1
- **Priority:** P1
- **Related requirements:** FR-1.3

## 2. Purpose

Import applicants from CSV for migration from existing systems. Validates every row against the current application schema before creating anything.

## 3. Users & permissions

| Role | Access | Notes |
|------|--------|-------|
| ADMIN | Full | — |
| SUPER_ADMIN | Full | — |
| CHAPTER_LEADER | None | 403 |
| FINANCE_OFFICER | None | 403 |

## 4. Entry & exit points

- **Reached from:** ADM-020 "Bulk Import" button
- **Leads to:** ADM-020 on success
- **Deep-linkable:** no

## 5. Layout & regions
+------------------------------------------------------------------+
| ← Back to applications |
+------------------------------------------------------------------+
| |
| Bulk import applicants |
| Upload a CSV of applicants. Max 10,000 rows. |
| |
| +--------------------------------------------------------------+ |
| | | |
| | Drag & drop CSV here | |
| | or click to browse | |
| | | |
| +--------------------------------------------------------------+ |
| |
| Download CSV template |
| |
| -- After upload -- |
| |
| 9,982 valid | 12 invalid | 6 duplicate |
| |
| +--------------------------------------------------------------+ |
| | Row | First | Last | Email | Chapter | Tier | Status | |
| |-----|-------|------|-------|---------|------|-----------------| |
| | 1 | Alice | ... | ... | KU | STU | ok | |
| | 42 | Brian | ... | ... | UNKNOWN | STU | chapter not | |
| | | | | | | | found | |
| +--------------------------------------------------------------+ |
| |
| [ Skip acknowledgement email ] (default: on) |
| |
+------------------------------------------------------------------+
| [Cancel] [Import 9,982 valid rows] |
+------------------------------------------------------------------+

## 6. Components

| # | Component | Source | Behaviour |
|---|-----------|--------|-----------|
| 1 | PageHeader | — | Back + title |
| 2 | FileUploadZone | new | Drag + click; validates MIME |
| 3 | ImportPreviewTable | new | Parsed rows with per-row validation status |
| 4 | Alert | `components/ui/alert` | Summary: valid / invalid / duplicate counts |
| 5 | Checkbox | new | Skip acknowledgement email |
| 6 | ConfirmDialog | `components/ui/confirm-dialog` | Import confirmation |
| 7 | Button | `components/button` | Cancel, Import |

## 7. Data

CSV columns (in order):

| Column | Type | Required | Validation |
|--------|------|----------|------------|
| first_name | string | yes | max 100 |
| last_name | string | yes | max 100 |
| email | string | yes | valid format, unique across applications + members |
| phone | string | no | E.164 |
| date_of_birth | date | yes | ISO 8601; age 18-99 |
| tier | enum | yes | STUDENT / PROFESSIONAL / ASSOCIATE |
| chapter_code | string | yes | must exist in chapters table |
| pillar_interest | string | yes | comma-separated; 1-3 of MARKETPLACE / GOVERNANCE / TECHNOLOGY |
| motivation | text | yes | max 2000 |
| referral_source | string | no | — |

## 8. Actions

| # | Action | Trigger | Permission | Confirmation | API | Success | Failure | Audited |
|---|--------|---------|------------|--------------|-----|---------|---------|---------|
| 1 | Download template | Link | ADMIN, SUPER_ADMIN | none | — | downloads `applicant-template.csv` | — | no |
| 2 | Upload file | Drop / browse | ADMIN, SUPER_ADMIN | none | — | parse + preview | error toast | no |
| 3 | Validate all | Auto on upload | — | none | client + server | shows counts | — | no |
| 4 | Import | Footer button | ADMIN, SUPER_ADMIN | ConfirmDialog | `POST /admin/applications/import` | toast, redirect ADM-020 | error toast | **yes** |

## 9. States

| State | Handling |
|-------|----------|
| Empty | Upload zone with instructions and template download |
| Loading (parsing) | Progress bar "Validating rows..." |
| Populated | Preview table with per-row status |
| Partial | Some rows valid, some invalid; Import only the valid ones (with checkbox to include invalid rejected) |
| Error | Parse error: "The file could not be read. Ensure it is a valid CSV." |
| Permission denied | 403 |
| Success | Toast "{n} applicants imported. {m} skipped." |
| Destructive confirmation | ConfirmDialog before import |

## 10. Validation & error handling

- CSV max 10,000 rows
- Email uniqueness: reject rows with duplicates, show reason
- Chapter code must exist in `chapters` table
- Age 18-99
- Invalid rows retained in preview with reason; not imported
- Import is atomic per batch — if >50% invalid, block the whole import

## 11. Responsive behaviour

| Breakpoint | Layout | Changes |
|------------|--------|---------|
| xs | Card list | Preview rows render as cards |
| md+ | Table | Full table |

## 12. Accessibility

- File drop zone: `role="button"` + `aria-label="Upload CSV file"`
- Preview table: `<caption class="sr-only">`
- Row status: text + colour (never colour alone)
- Error summary: `role="alert"` on load
- Keyboard: file input reachable via Tab; template link keyboard-accessible

## 13. Performance

- Streaming parse (Papa Parse in worker)
- Preview limited to first 200 rows
- Import batches of 500 rows

## 14. Analytics

- `bulk_import_started` (fileName, rowCount)
- `bulk_import_completed` (imported, skipped, durationMs)

## 15. Copy

- **Title:** "Bulk import applicants"
- **Subtitle:** "Upload a CSV of applicants. Max 10,000 rows."
- **Drop zone:** "Drag & drop CSV here or click to browse"
- **Template link:** "Download CSV template"
- **Counts:** "{n} valid | {m} invalid | {k} duplicate"
- **Skip email:** "Skip acknowledgement email"
- **Import button:** "Import {n} valid rows"
- **Confirm:** "Import {n} applicants? Each will be created as a SUBMITTED application."
- **Success:** "{n} applicants imported. {m} skipped."
- **Error:** "The file could not be read. Ensure it is a valid CSV."

## 16. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Import creates DRAFT or SUBMITTED? | Product Lead | RESOLVED — SUBMITTED |
| 2 | Ack email default? | Product Lead | RESOLVED — skip enabled by default |