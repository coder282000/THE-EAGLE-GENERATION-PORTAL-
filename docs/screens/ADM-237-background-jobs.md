# SCREEN SPEC: [ADM-237] Background Jobs

## 1. Identification
- Screen ID: ADM-237
- Route: /admin/settings/jobs
- Release: R1
- Priority: P1
- Related panel: PNL-19

## 2. Purpose
Monitor scheduled and queued jobs: schedule, last run, next run, failure count.

## 3. Users and permissions
SUPER_ADMIN full.

## 4. Entry and exit points
Reached from sidebar. Deep-linkable: yes.

## 5. Layout and regions
KPI row. Job list table. Failure detail drawer.

## 6. Components
Button, plain table.

## 7. Data
name, schedule, lastRunAt, lastRunStatus, nextRunAt, failureCount.

## 8. Actions
Run now (confirm, audited). Retry failed (audited). View failure log.

## 9. States
Ten standard.

## 10. Validation
Cannot trigger a job already running.

## 11. Responsive
Cards on xs. Table on md+.

## 12. Accessibility
Status has colour + text.

## 13. Performance
Payload <150KB.

## 14. Analytics
settings.jobs.viewed, settings.jobs.run_now, settings.jobs.retry

## 15. Copy
"Running a job manually is audited."

## 16. Open questions
Which jobs are safe to trigger manually - DevOps.