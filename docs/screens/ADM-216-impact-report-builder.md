# SCREEN SPEC: [ADM-216] Impact Report Builder

## 1. Identification
- Screen ID: ADM-216
- Route: /admin/analytics/impact
- Layer: Admin Console
- Module: Analytics and Reporting
- Release: R2
- Priority: P0
- Related requirements: FR-10.7 (exportable impact report for funders), FR-10.6
- Related panel: PNL-17
- Related gates: G-3 (public figures labelled as targets, not achieved)

## 2. Purpose
Produce a funder-facing impact report that states what has actually been
achieved, with real denominators, over a chosen period. This is the artefact
TEG sends to donors and partners. It replaces the "aspirations presented as
results" problem stated in the Charter.

The report is not a dashboard. It is a document. Every figure is dated,
sourced, and carries its denominator. Targets are labelled as targets.

## 3. Users and permissions
| Role | Access | Notes |
|---|---|---|
| SUPER_ADMIN | Full | Can generate, edit, export, and send |
| ADMIN | Full | Can generate, edit, export |
| COMPLIANCE_LEAD | Read-only | Can view and export |
| FINANCE_OFFICER | Denied | 403 card |
| CHAPTER_LEADER | Denied | 403 card |
| Others | Denied | 403 card |

## 4. Entry and exit points
- Reached from: sidebar (Analytics, "Impact report"), ADM-210 CTA
  "Generate impact report"
- Leads to: report preview, PDF download, CSV download, shareable link
  (optionally password-protected)
- Deep-linkable: yes. URL params: ?from, ?to, ?template, ?run

## 5. Layout and regions
- Page header: title, subtitle, status pill (Draft / Generated / Sent)
- Left column (2/3):
  - Report metadata form: title, period, audience (donor / partner /
    public), prepared by, prepared for
  - Section list: draggable to reorder
    1. Cover
    2. Executive summary
    3. Membership
    4. Chapters
    5. Learning
    6. Financial
    7. Compliance
    8. Appendix: methodology and sources
  - Each section card: enabled toggle, title override, notes
- Right column (1/3):
  - Options: include targets (toggle), include per-chapter detail (toggle),
    redact member identifiers (locked on), include source notes (toggle)
  - Primary action: Generate report
  - Recent runs list with download links
- Below: Report preview (renders the current report as it will appear in
  the PDF)

## 6. Components
| Component | Purpose |
|---|---|
| StatCard | Summary KPIs in the preview |
| SectionCard | One report section, with toggle and title override |
| DateRangePicker | Report period |
| ReportPreview | Read-only render of the report |
| RunHistoryTable | Recent report runs, download links |
| EmptyState | No runs yet |
| ConfirmDialog | Regenerate a report with the same inputs |

ReportPreview is a new component. It renders the same JSX used for the PDF
export, so the on-screen preview and the downloaded PDF cannot drift.

## 7. Data
| Field | Entity.attribute | Type | Required | Permission | Sensitivity |
|---|---|---|---|---|---|
| Report title | Report.title | string | Y | Read | Internal |
| Period from | Report.from | date | Y | Read | Internal |
| Period to | Report.to | date | Y | Read | Internal |
| Audience | Report.audience | enum | Y | Read | Internal |
| Prepared by | Report.preparedBy | user | Y | Read | Internal |
| Prepared for | Report.preparedFor | string | N | Read | Internal |
| Section enabled | Report.section.enabled | bool | Y | Read | Internal |
| Section title override | Report.section.titleOverride | string | N | Read | Internal |
| Options | Report.options | map | Y | Read | Internal |
| Status | Report.status | enum | Y | Read | Internal |
| Generated at | Report.generatedAt | timestamp | N | Read | Internal |
| PDF url | Report.pdfUrl | string | N | Read | Internal |
| CSV url | Report.csvUrl | string | N | Read | Internal |

Audience: DONOR, PARTNER, PUBLIC.
Status: DRAFT, GENERATED, SENT.

## 8. Actions
| Action | Trigger | Permission | Confirmation | API call | Audited |
|---|---|---|---|---|---|
| Update metadata | Form | ADMIN+ | No | local state | No |
| Toggle section | Section toggle | ADMIN+ | No | local state | No |
| Reorder sections | Drag | ADMIN+ | No | local state | No |
| Regenerate preview | Auto | ADMIN+ | No | POST /reports/impact/preview | No |
| Generate report | Button | ADMIN+ | Yes | POST /reports/impact | Yes |
| Download PDF | Run row | ADMIN+ | No | GET /reports/impact/:id.pdf | Yes |
| Download CSV | Run row | ADMIN+ | No | GET /reports/impact/:id.csv | Yes |
| Send to recipients | Run row | SUPER_ADMIN | Yes | POST /reports/impact/:id/send | Yes |

Send records recipients, delivery method, and timestamp. Every export and
send is audited.

## 9. States
- Empty (no runs): "No reports generated yet. Build one above."
- Loading: skeleton preview.
- Populated: form and preview.
- Populated extreme: 24-month period; preview PDF page count shown.
- Partial: if a chart fails during preview, that section renders with a
  placeholder and a note in the appendix.
- Error: report generation failed; inline retry on the affected section.
- Permission denied: 403 card for FINANCE_OFFICER and CHAPTER_LEADER.
- Offline: read-only; generation disabled.
- Success: preview refreshes; run appears in Recent runs with download
  links.
- Destructive confirmation: generate and send both require confirmation if
  a matching run already exists.

## 10. Validation and error handling
- Title required, min 5 chars.
- Period from <= to, max 24 months.
- If any section is enabled but has insufficient data, the preview shows
  "Not enough data to report this section" and the appendix explains why.
- The PDF export is generated server-side from the same preview data.
- The CSV export includes every figure, its period, its denominator, and
  its source metric key.
- Member identifiers are always redacted; the "redact member identifiers"
  option is locked on.

## 11. Responsive behaviour
| Breakpoint | Layout |
|---|---|
| xs (<640) | Single column. Preview collapses under the form. |
| md (>=768) | Single column, wider. Preview below form. |
| lg (>=1024) | Two columns: form left (2/3), options right (1/3). Preview below. |
| xl (>=1280) | Same two-column, wider margins. |

## 12. Accessibility
- All form fields labelled; section toggles reachable by keyboard
- Section reorder supports keyboard: up/down buttons in addition to drag
- Preview is `<article>` with a `<header>` and sectioned `<section>`s
- Charts inside preview have text alternatives
- Focus order: metadata, sections, options, generate, preview, recent runs

## 13. Performance
- Payload budget: 300 KB (preview is heavier)
- Charts in preview lazy-loaded
- PDF generation is a background job; the user sees "Generating..." with a
  link that becomes live when ready
- CSV export streams
- Recent runs limited to 20

## 14. Analytics
- analytics.impact.viewed
- analytics.impact.section_toggled (properties: section_key, enabled)
- analytics.impact.generated (properties: period_days, sections_enabled)
- analytics.impact.pdf_downloaded
- analytics.impact.csv_downloaded
- analytics.impact.sent (properties: audience, recipient_count)

## 15. Copy
- Title: "Impact report"
- Subtitle: "Generate a funder-ready summary of what has been achieved."
- Empty: "No reports generated yet. Build one above."
- Generate confirmation: "Generate this report now? A new PDF and CSV will be created."
- Preview watermark: "Draft. Not for distribution until generated."
- Section labels: Cover, Executive summary, Membership, Chapters, Learning,
  Financial, Compliance, Appendix: methodology and sources
- Insufficient data: "Not enough data to report this section."
- Methodology footer: "All figures in this report are based on {n} days of
  platform data ending {date}. Denominators are stated for every rate.
  Targets are labelled as targets and are not achieved figures."

## 16. Open questions
- Q1: Which metrics must appear in the executive summary? TEG Leadership.
- Q2: Does the report need a fixed visual template (fonts, colours,
  page layout) provided by TEG, or do we define one? TEG Leadership.
- Q3: Should the CSV export mirror the PDF sections exactly, or be a
  flat metric table? Finance Officer and Content Lead.
- Q4: Send mechanism: in-platform only (download link), or do we integrate
  email delivery with a tracking log? Product Lead.