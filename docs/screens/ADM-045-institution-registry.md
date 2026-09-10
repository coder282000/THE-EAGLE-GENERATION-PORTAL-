# Screen Spec: ADM-045 Institution Registry

**Document ID:** D3.6-ADM-045
**Version:** 1.0.0
**Status:** Draft
**Panel:** PNL-04 Chapters

## 1. Identification

- **Screen ID:** ADM-045
- **Route:** /admin/chapters/institutions
- **Layer:** Admin Console
- **Module:** Chapters
- **Release:** R1
- **Priority:** P1
- **Requirements:** FR-2.1

## 2. Purpose

Partner universities and institutions with MOU status. A chapter of type CAMPUS references one institution; the registry is the source of truth for partner count (Charter §3.4: 25+ partner universities).

## 3. Users and permissions

| Role | Access |
|------|--------|
| ADMIN, SUPER_ADMIN | Full |
| CHAPTER_LEADER | Read-only |
| Others | 403 |

## 4. Entry and exit points

- Reached from: ADM-040 header link, ADM-041 institution field
- Leads to: linked chapters
- Deep-linkable: yes

## 5. Layout and regions

- PageHeader: title, "New institution" button
- FilterBar: SearchInput, MOU status dropdown (Signed, Pending, Expired, None)
- DataTable: name, city, country, MOU status badge, linked chapters count, action
- Row click: opens edit drawer

## 6. Data

- Entity: Institution (new)
- Fields: id, name, city, country, mouStatus, mouSignedAt, mouExpiresAt, contactName, contactEmail, notes
- Link: chapter.institutionId

## 7. Actions

| # | Action | Permission | API | Audited |
|---|--------|-----------|-----|---------|
| 1 | Create | ADMIN, SUPER_ADMIN | POST /admin/institutions | yes |
| 2 | Edit | ADMIN, SUPER_ADMIN | PATCH /admin/institutions/:id | yes |
| 3 | Delete | SUPER_ADMIN | DELETE /admin/institutions/:id | yes |

## 8. States

- Empty: "No institutions registered."
- Loading: skeleton rows
- Populated: default
- Error: banner

## 9. Accessibility

- MOU badges have aria-label with full status and date
- Drawer: focus trap, ESC closes

## 10. Open questions

| # | Question | Owner | Status |
|---|----------|-------|--------|
| 1 | Is Institution a new entity or expanded Chapter fields? | Tech Lead | OPEN — leaning new entity |
| 2 | Required for chapters of type CAMPUS? | Product Lead | OPEN |