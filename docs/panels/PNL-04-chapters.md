# Panel Overview: PNL-04 Chapters

**Document ID:** D3.6-PNL-04
**Version:** 1.0.0
**Status:** Draft
**Layer:** Admin Console
**Release:** R1

## Purpose

Model, manage and report on The Eagle Generation's campus and professional chapters. Chapters are first-class entities (Charter §16.2) and the primary scope boundary for RLS. This panel is where chapter identity, leadership, membership and performance are administered.

## Users and primary workflows

| Role | Primary use |
|------|-------------|
| ADMIN, SUPER_ADMIN | Full CRUD, assign leaders, view all chapters |
| CHAPTER_LEADER | Own-chapter detail and roster only |
| FINANCE_OFFICER | Read-only, for reconciliation context |

## Workflows

1. **Create a chapter** — ADM-042, then assign a leader via ADM-043.
2. **Investigate a chapter** — ADM-040 list → ADM-041 detail → ADM-044 performance.
3. **Onboard a partner institution** — ADM-045 institution registry → link to chapter.
4. **Onboard a chapter leader** — from ADM-031 member detail, assign CHAPTER_LEADER role, then link to chapter via ADM-043.

## Screens

| # | Screen | Route | Priority |
|---|--------|-------|----------|
| ADM-040 | Chapter list | /admin/chapters | P0 |
| ADM-041 | Chapter detail and roster | /admin/chapters/[code] | P0 |
| ADM-042 | Create / edit chapter | /admin/chapters/new, /admin/chapters/[code]/edit | P0 |
| ADM-043 | Assign chapter leaders | /admin/chapters/[code]/leaders | P0 |
| ADM-044 | Chapter performance dashboard | /admin/chapters/[code]/performance | P1 |
| ADM-045 | Institution registry | /admin/chapters/institutions | P1 |

## Related panels

- **PNL-03 Members** — roster rows link to member detail.
- **PNL-05 Learning** — chapter performance aggregates cohort progress.
- **PNL-08 Events** — chapter events surface in performance dashboard.

## Data entities

- `Chapter` (components/mock/data.ts) — code, name, type, memberCount, location, leader, description.
- `Institution` — new; partner universities with MOU status.
- `ChapterActivity` — feed of chapter-scoped events (already in mock data).

## Acceptance criteria

- An admin creates a new chapter with a unique code, assigns a leader, and sees it appear in ADM-040.
- A CHAPTER_LEADER scoped to `KU` sees only KU in ADM-040 and only their roster in ADM-041.
- Chapter code is immutable after creation.
- Deleting a chapter is a soft delete; members and history are never orphaned.