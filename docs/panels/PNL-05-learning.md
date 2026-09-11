# PNL-05 — Learning (Admin Console)

**Panel ID:** PNL-05
**Release:** R2 onward
**Layer:** Admin Console
**Screens:** 13
**Route prefix:** /admin/learning

---

## 1. Purpose

Operate the learning platform: author courses, structure them into the three-phase programme, build lessons, quizzes and assignments, run cohorts, grade submissions, issue and revoke certificates, manage instructors, and evidence learning outcomes to funders and regulators.

The taxonomy is fixed: Marketplace, Governance, Technology. Never generic categories. Courses carry a pillar (or pillars), a level, and a status (draft/published/archived). Enrolment is into a cohort, never a bare course. Phase gates are enforced server-side — the client never grants progression.

## 2. Users

| Role | Access | Notes |
|---|---|---|
| ADMIN | Full | Course authoring, cohort management, certificates |
| SUPER_ADMIN | Full | Override, audited |
| MENTOR | Grading, own cohort roster | Cannot author courses or publish |
| INSTRUCTOR | Own courses only | Author, edit, grade own cohorts |
| CHAPTER_LEADER | Chapter cohort visibility | Read only, own chapter |
| MEMBER | None | Member-facing learning lives at /learning |

## 3. Workflows

### W1 — Course authoring
Create course → set pillar, level, outline, prerequisites → add phases (Foundation, Specialisation, Application) → add lessons per phase → attach quiz per phase gate → attach assignment for the Application phase → publish. A course with no open cohort shows "notify me" on the member side.

### W2 — Cohort lifecycle
Create cohort (course + start/end dates + capacity + facilitators) → roster fills with enrolments → cohort runs through the three phases → phase gates enforced → certificates issued on completion.

### W3 — Grading
Mentor/instructor opens the grading queue → sees assignments awaiting grading → grades one with rubric-based feedback → submission marked graded; member notified. Batch grading for a cohort is available.

### W4 — Certificate issuance
On phase-3 completion, certificate is generated with a public verification URL (/verify/[id]). Issued certificates are immutable; revocation is a separate audited action.

### W5 — Instructor management
Assign instructors to courses with capacity limits. Track their grading throughput and cohort performance. Off-board instructors by reassigning open cohorts.

### W6 — Content library
Reusable assets (video, PDF, images) that can be attached to multiple lessons. Versioned, with usage tracking.

## 4. Entity model

- **Course** — title, slug, pillar, level, status, outline, prerequisites
- **CoursePhase** — one of Foundation / Specialisation / Application, ordered
- **Lesson** — video / text / PDF / link / live session, ordered within phase
- **Quiz** — one per phase gate, question bank, pass mark, attempt limits
- **QuizQuestion** — multiple choice / true-false / short answer
- **Assignment** — one per Application phase, file or text, rubric
- **AssignmentRubric** — criteria and weights
- **Cohort** — course + dates + capacity + facilitators + status
- **Enrollment** — member + cohort + progress per phase
- **Certificate** — member + course + issued date + verification URL
- **Instructor** — user + assigned courses + capacity
- **ContentAsset** — reusable media / document
- **LearningAnalytics** — enrolments, completions, drop-off per lesson

## 5. Non-negotiables

1. **Taxonomy is Marketplace, Governance, Technology.** Never generic.
2. **Enrolment is into a cohort**, never a bare course.
3. **Phase gates are server-side.** The client never grants progression.
4. **Certificates are immutable once issued.** Revocation is a separate audited action.
5. **Video is hosted externally** (Mux, Cloudflare Stream, unlisted YouTube). Never served from the app.
6. **A course with no open cohort shows "notify me"** on the member side, not "enrol".
7. **Instructor sees only their own courses** (RLS enforced).
8. **Grading requires feedback text**, not just a score.
9. **Publishing requires a complete phase structure** (all three phases with at least one lesson each).

## 6. Cross-panel links

- PNL-03 Members — Member 360, learning progress
- PNL-17 Analytics & Reporting — learning analytics rollup
- PNL-07 Communications — cohort announcements, notifications
- PNL-19 System Settings — feature flags for the LMS

## 7. Acceptance criteria

- An admin can author a course, structure it into 3 phases, add lessons, attach a quiz and assignment, and publish it.
- A course cannot be published without all three phases populated.
- A cohort cannot be created without dates, capacity, and at least one facilitator.
- Grading requires both a score and feedback text.
- Issued certificates appear immediately on /verify/[id] on the member side.
- An instructor sees only their own courses (RLS enforced).
- Every course, cohort, certificate, and grading action is audited.
- Drop-off analytics surface by lesson, not just by phase.

## 8. Open questions

| # | Question | Owner |
|---|---|---|
| Q1 | Maximum lessons per phase? | Content Lead |
| Q2 | Are phase gates self-marked or instructor-confirmed? | Content Lead |
| Q3 | Certificate validity period? | Content Lead |
| Q4 | Instructor capacity — courses or cohorts? | Content Lead |
| Q5 | Quiz retakes — per phase or per quiz? | Content Lead |