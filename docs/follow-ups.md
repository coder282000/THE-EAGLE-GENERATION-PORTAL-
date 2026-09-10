# Follow-ups

Deferred items discovered during build. Not blocking. Fix when the file is next touched.

## Chapter display name migration

`Member.chapter` holds a code (`'KU'`, `'UON'`, `'Strathmore'`, `'Nairobi Professional'`, `'Kisumu'`), not a display name. Sixteen sites currently render the code directly. All should wrap with `getChapterName(member.chapter)` from `lib/mock/members.ts`.

| File | Line(s) | Context |
|------|---------|---------|
| `app/(member)/chapter/page.tsx` | 46, 53 | `CURRENT_USER.chapter` comparisons — these are *correct* as-is (codes match codes). No change needed. |
| `app/(member)/community/directory/page.tsx` | 44, 70, 71, 140, 271 | Filter values (correct); display at 271 needs wrapping |
| `app/(member)/dashboard/page.tsx` | 13 | "My Chapter" stat card |
| `app/(member)/profile/[id]/page.tsx` | 68, 92 | Profile card + detail |
| `app/(member)/profile/me/page.tsx` | 74 | Profile header |
| `app/(member)/search/page.tsx` | 65, 133 | Search matching + result subtitle |
| `app/community/messages/new/page.tsx` | 55, 103 | Member picker list + filter |
| `app/mentorship/mentors/[id]/page.tsx` | 320 | Mentor profile subtitle |
| `app/mentorship/my-mentees/page.tsx` | 67 | Mentee card |
| `app/mentorship/sessions/page.tsx` | 80 | Session partner label |

Estimated effort: 30 minutes for a careful pass. Defer until the member portal's next change.

## Other

- `app/(admin)/admin/members/page.tsx` had a duplicated `"use client"` directive (line 1 unquoted, line 2 quoted). Fixed during ADM-030 rebuild.