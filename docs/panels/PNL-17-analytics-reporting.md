# PANEL SPEC: PNL-17 Analytics and Reporting

## 1. Identification
- Panel ID: PNL-17
- Layer: Admin Console
- Owner: Product Lead (metrics), Content and Community Lead (learning), Finance Officer (financial)
- Release: R2 onward (membership, learning, engagement from R2; financial from R3; chapter performance from R1 data)
- Related charter sections: 16.10 (Analytics, FR-10.1 to FR-10.7), 5.2 (O5), 6 (Success criteria)
- Related gates: G-3 (public figures labelled as targets, not results)

## 2. Purpose
Instrument the movement so impact is measured with real denominators, not
aspirations. This panel is where TEG Leadership, funders, and the Steering
Committee see what has actually been achieved. Every metric on every screen
displays its denominator. A rate without its denominator is a claim, not a
measurement (FR-10.6).

## 3. Users and permissions
| Role | Access |
|---|---|
| SUPER_ADMIN | Full |
| ADMIN | Full |
| FINANCE_OFFICER | Financial and revenue analytics only |
| CHAPTER_LEADER | Chapter performance screen, own chapter only |
| COMPLIANCE_LEAD | Read-only, all screens |
| Others | Denied |

Scoping rules: chapter leaders see only their own chapter on ADM-215.
All other screens are org-wide and denied to chapter leaders.

## 4. Screens
| ID | Screen | Route | Priority |
|---|---|---|---|
| ADM-210 | Executive dashboard | /admin/analytics | P0 |
| ADM-211 | Membership analytics | /admin/analytics/membership | P0 |
| ADM-212 | Learning analytics | /admin/analytics/learning | P0 |
| ADM-213 | Engagement analytics | /admin/analytics/engagement | P1 |
| ADM-214 | Financial analytics | /admin/analytics/financial | P0 |
| ADM-215 | Chapter performance | /admin/analytics/chapters | P1 |
| ADM-216 | Impact report builder | /admin/analytics/impact | P0 |
| ADM-217 | Custom report builder | /admin/analytics/reports | P1 |

## 5. Core workflows
- W1 Leadership reviews the executive dashboard monthly
- W2 Funders receive an impact report generated from ADM-216
- W3 Chapter leaders review their chapter on ADM-215
- W4 Finance Officer reviews reconciliation and revenue on ADM-214
- W5 Ad-hoc analysis via ADM-217 custom reports

## 6. Entity model
Metric (definition, denominator, source, calculation). ReportDefinition
(saved query, filters, schedule, recipients). ReportRun (execution, output,
delivery).

## 7. Non-negotiables (from Charter)
- FR-10.6: every metric displays its denominator
- FR-10.7: impact report is exportable for funders
- Charter 5.2 O5: instrument the movement so impact is measured with real
  denominators
- Charter 9.3 G-3: public figures are labelled as targets, not achieved
  results. This panel must not present targets as actuals.
- Every export is audited

## 8. Related panels
PNL-01 (Admin Overview) links here for the "Full Analytics" action.
PNL-03 (Members) provides member counts.
PNL-05 (Learning) provides completion data.
PNL-09 (Commerce & Finance) provides revenue data.
PNL-04 (Chapters) provides roster and activity data.
PNL-15 (Compliance) provides KYC and AML volume for regulator-facing metrics.

## 9. Acceptance criteria
- Every KPI shows value, trend, and denominator
- Every chart has a text alternative describing the trend in words
- Impact report can be generated and exported as PDF and CSV
- Chapter leader sees only their chapter on ADM-215
- Targets are visually distinct from actuals, always
- No member names or member numbers appear in any exported report

## 10. Open questions
- Q1: Which specific metrics must appear in the funder impact report?
  TEG Leadership.
- Q2: Reporting period definitions: calendar month or rolling 30 days?
  Product Lead.
- Q3: Whether custom reports (ADM-217) are available at R2 or deferred to R3.
  Product Lead and Tech Lead.