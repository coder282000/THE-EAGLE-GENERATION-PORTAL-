// lib/mock/learning.ts
// PNL-05 Learning — types, seed data, RLS-aware accessors, permission helpers.

import { getCurrentUser } from "./current-user";
import type { MockUser } from "@/components/mock/data";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export type Pillar = "MARKETPLACE" | "GOVERNANCE" | "TECHNOLOGY";
export type CourseLevel = "FOUNDATION" | "INTERMEDIATE" | "ADVANCED";
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PhaseKind = "FOUNDATION" | "SPECIALISATION" | "APPLICATION";
export type LessonKind = "VIDEO" | "TEXT" | "PDF" | "LINK" | "LIVE";

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  pillar: Pillar;
  level: CourseLevel;
  status: CourseStatus;
  instructorIds: string[];
  phaseCount: number;
  lessonCount: number;
  cohortCount: number;
  enrolmentsTotal: number;
  completionRatePct: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CoursePhase {
  id: string;
  courseId: string;
  kind: PhaseKind;
  order: number;
  title: string;
  summary: string;
  lessonIds: string[];
  quizId?: string;
  assignmentId?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  phaseId: string;
  kind: LessonKind;
  title: string;
  order: number;
  durationMinutes: number;
  assetUrl?: string;
  bodyText?: string;
  createdAt: string;
  updatedAt: string;
}

export type QuestionKind = "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctAnswer?: string;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  phaseId: string;
  title: string;
  passMarkPct: number;
  attemptLimit: number;
  timeLimitMinutes: number;
  questions: QuizQuestion[];
  updatedAt: string;
}

export interface AssignmentRubricCriterion {
  id: string;
  label: string;
  description: string;
  weightPct: number;
}

export interface Assignment {
  id: string;
  courseId: string;
  phaseId: string;
  title: string;
  instructions: string;
  submissionKind: "TEXT" | "FILE" | "BOTH";
  dueDays: number;
  rubric: AssignmentRubricCriterion[];
  updatedAt: string;
}

export type CohortStatus = "PLANNED" | "RUNNING" | "COMPLETED" | "ARCHIVED";

export interface Cohort {
  id: string;
  courseId: string;
  courseTitle: string;
  name: string;
  startsOn: string;
  endsOn: string;
  capacity: number;
  enrolled: number;
  facilitatorIds: string[];
  status: CohortStatus;
  currentPhase: PhaseKind;
  completionRatePct: number;
}

export interface Enrollment {
  id: string;
  cohortId: string;
  memberName: string;
  memberNumber: string;
  enrolledAt: string;
  currentPhase: PhaseKind;
  progressPct: number;
  certificateId?: string;
}

export interface Certificate {
  id: string;
  verificationId: string;      // for /verify/[id]
  courseId: string;
  courseTitle: string;
  memberName: string;
  memberNumber: string;
  cohortId: string;
  issuedAt: string;
  status: "ISSUED" | "REVOKED";
  revokedAt?: string;
  revocationReason?: string;
}

export interface Instructor {
  id: string;
  name: string;
  initials: string;
  email: string;
  courseIds: string[];
  activeCohorts: number;
  submissionsGraded30d: number;
  avgGradingHours: number;
  status: "ACTIVE" | "ON_LEAVE" | "OFF_BOARDED";
}

export interface ContentAsset {
  id: string;
  name: string;
  kind: "VIDEO" | "PDF" | "IMAGE" | "AUDIO";
  sizeMb: number;
  url: string;
  usageCount: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface LearningAnalytics {
  period: string;
  enrolments: number;
  completions: number;
  completionRatePct: number;
  dropOffsByLesson: { lessonTitle: string; dropOffPct: number }[];
  avgTimeToCompleteDays: number;
  byPillar: { pillar: Pillar; enrolments: number; completionPct: number }[];
}

// ─────────────────────────────────────────────────────────────
// Label maps
// ─────────────────────────────────────────────────────────────

export const PILLAR_LABELS: Record<Pillar, string> = {
  MARKETPLACE: "Marketplace",
  GOVERNANCE: "Governance",
  TECHNOLOGY: "Technology",
};

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  FOUNDATION: "Foundation",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export const PHASE_LABELS: Record<PhaseKind, string> = {
  FOUNDATION: "Foundation",
  SPECIALISATION: "Specialisation",
  APPLICATION: "Application",
};

export const LESSON_KIND_LABELS: Record<LessonKind, string> = {
  VIDEO: "Video",
  TEXT: "Text",
  PDF: "PDF / document",
  LINK: "External link",
  LIVE: "Live session",
};

export const QUESTION_KIND_LABELS: Record<QuestionKind, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / false",
  SHORT_ANSWER: "Short answer",
};

export const COHORT_STATUS_LABELS: Record<CohortStatus, string> = {
  PLANNED: "Planned",
  RUNNING: "Running",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const INSTRUCTOR_STATUS_LABELS: Record<Instructor["status"], string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On leave",
  OFF_BOARDED: "Off-boarded",
};

// ─────────────────────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────────────────────

const now = new Date();
const iso = (daysAgo: number, hoursAgo = 0) =>
  new Date(now.getTime() - daysAgo * 86400000 - hoursAgo * 3600000).toISOString();
const future = (daysAhead: number) =>
  new Date(now.getTime() + daysAhead * 86400000).toISOString();

export const seedCourses: Course[] = [
  {
    id: "crs-001",
    slug: "kingdom-marketplace-foundations",
    title: "Kingdom Marketplace Foundations",
    summary:
      "The foundational programme for Kingdom-driven marketplace leaders. Three phases from biblical framework to applied business ethics.",
    pillar: "MARKETPLACE",
    level: "FOUNDATION",
    status: "PUBLISHED",
    instructorIds: ["inst-001", "inst-002"],
    phaseCount: 3,
    lessonCount: 18,
    cohortCount: 2,
    enrolmentsTotal: 148,
    completionRatePct: 71,
    createdAt: iso(180),
    updatedAt: iso(14),
    publishedAt: iso(150),
  },
  {
    id: "crs-002",
    slug: "governance-integrity-in-public-service",
    title: "Governance and Integrity in Public Service",
    summary:
      "For Kingdom leaders in government and civil service. Covers ethical frameworks, anti-corruption, and public accountability.",
    pillar: "GOVERNANCE",
    level: "INTERMEDIATE",
    status: "PUBLISHED",
    instructorIds: ["inst-003"],
    phaseCount: 3,
    lessonCount: 15,
    cohortCount: 1,
    enrolmentsTotal: 62,
    completionRatePct: 68,
    createdAt: iso(120),
    updatedAt: iso(21),
    publishedAt: iso(100),
  },
  {
    id: "crs-003",
    slug: "technology-with-moral-grounding",
    title: "Technology with Moral Grounding",
    summary:
      "For Christian technologists building in Africa. Ethical AI, data stewardship, and technology that serves people.",
    pillar: "TECHNOLOGY",
    level: "INTERMEDIATE",
    status: "PUBLISHED",
    instructorIds: ["inst-004"],
    phaseCount: 3,
    lessonCount: 12,
    cohortCount: 1,
    enrolmentsTotal: 43,
    completionRatePct: 74,
    createdAt: iso(90),
    updatedAt: iso(7),
    publishedAt: iso(70),
  },
  {
    id: "crs-004",
    slug: "advanced-kingdom-economics",
    title: "Advanced Kingdom Economics",
    summary:
      "Advanced programme for marketplace leaders ready to shape economic systems. In draft pending content completion.",
    pillar: "MARKETPLACE",
    level: "ADVANCED",
    status: "DRAFT",
    instructorIds: ["inst-001"],
    phaseCount: 2,
    lessonCount: 8,
    cohortCount: 0,
    enrolmentsTotal: 0,
    completionRatePct: 0,
    createdAt: iso(30),
    updatedAt: iso(3),
  },
];

export const seedPhases: CoursePhase[] = [
  // crs-001
  { id: "ph-001", courseId: "crs-001", kind: "FOUNDATION", order: 1, title: "Biblical Foundations", summary: "Six foundational lessons on the theology of marketplace work.", lessonIds: ["les-001","les-002","les-003","les-004","les-005","les-006"], quizId: "qz-001" },
  { id: "ph-002", courseId: "crs-001", kind: "SPECIALISATION", order: 2, title: "Applied Business Ethics", summary: "Six lessons on running a business with integrity.", lessonIds: ["les-007","les-008","les-009","les-010","les-011","les-012"], quizId: "qz-002" },
  { id: "ph-003", courseId: "crs-001", kind: "APPLICATION", order: 3, title: "Applied Project", summary: "Six lessons guiding a real applied project, ending in a mentor-reviewed submission.", lessonIds: ["les-013","les-014","les-015","les-016","les-017","les-018"], assignmentId: "as-001" },
  // crs-002
  { id: "ph-004", courseId: "crs-002", kind: "FOUNDATION", order: 1, title: "Ethical Frameworks", summary: "Five lessons on ethical governance frameworks.", lessonIds: ["les-019","les-020","les-021","les-022","les-023"], quizId: "qz-003" },
  { id: "ph-005", courseId: "crs-002", kind: "SPECIALISATION", order: 2, title: "Anti-Corruption Practice", summary: "Five lessons on anti-corruption and accountability.", lessonIds: ["les-024","les-025","les-026","les-027","les-028"], quizId: "qz-004" },
  { id: "ph-006", courseId: "crs-002", kind: "APPLICATION", order: 3, title: "Public Service Project", summary: "Five lessons guiding a public service project.", lessonIds: ["les-029","les-030","les-031","les-032","les-033"], assignmentId: "as-002" },
  // crs-003
  { id: "ph-007", courseId: "crs-003", kind: "FOUNDATION", order: 1, title: "Theology of Technology", summary: "Four lessons on ethics and technology.", lessonIds: ["les-034","les-035","les-036","les-037"], quizId: "qz-005" },
  { id: "ph-008", courseId: "crs-003", kind: "SPECIALISATION", order: 2, title: "Applied Data Stewardship", summary: "Four lessons on data stewardship and AI ethics.", lessonIds: ["les-038","les-039","les-040","les-041"], quizId: "qz-006" },
  { id: "ph-009", courseId: "crs-003", kind: "APPLICATION", order: 3, title: "Applied Technology Project", summary: "Four lessons guiding a moral-grounding technology project.", lessonIds: ["les-042","les-043","les-044","les-045"], assignmentId: "as-003" },
];

export const seedLessons: Lesson[] = [
  // crs-001 foundation
  { id: "les-001", courseId: "crs-001", phaseId: "ph-001", kind: "VIDEO", title: "Called to the marketplace", order: 1, durationMinutes: 12, assetUrl: "https://stream.example/lesson-001", createdAt: iso(180), updatedAt: iso(180) },
  { id: "les-002", courseId: "crs-001", phaseId: "ph-001", kind: "TEXT", title: "The theology of work", order: 2, durationMinutes: 8, bodyText: "Reading: theology of work in the Kingdom context.", createdAt: iso(180), updatedAt: iso(180) },
  { id: "les-003", courseId: "crs-001", phaseId: "ph-001", kind: "VIDEO", title: "Wealth, poverty and stewardship", order: 3, durationMinutes: 14, assetUrl: "https://stream.example/lesson-003", createdAt: iso(180), updatedAt: iso(180) },
  { id: "les-004", courseId: "crs-001", phaseId: "ph-001", kind: "PDF", title: "Kingdom economics reading", order: 4, durationMinutes: 20, assetUrl: "https://assets.example/kingdom-economics.pdf", createdAt: iso(180), updatedAt: iso(180) },
  { id: "les-005", courseId: "crs-001", phaseId: "ph-001", kind: "VIDEO", title: "The marketplace as mission field", order: 5, durationMinutes: 11, assetUrl: "https://stream.example/lesson-005", createdAt: iso(180), updatedAt: iso(180) },
  { id: "les-006", courseId: "crs-001", phaseId: "ph-001", kind: "LIVE", title: "Live Q&A with instructor", order: 6, durationMinutes: 45, createdAt: iso(180), updatedAt: iso(180) },
  // crs-001 specialisation
  { id: "les-007", courseId: "crs-001", phaseId: "ph-002", kind: "VIDEO", title: "Pricing with integrity", order: 1, durationMinutes: 13, assetUrl: "https://stream.example/lesson-007", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-008", courseId: "crs-001", phaseId: "ph-002", kind: "VIDEO", title: "Hiring and treating people well", order: 2, durationMinutes: 15, assetUrl: "https://stream.example/lesson-008", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-009", courseId: "crs-001", phaseId: "ph-002", kind: "TEXT", title: "Case study: fair trade", order: 3, durationMinutes: 10, bodyText: "Case study.", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-010", courseId: "crs-001", phaseId: "ph-002", kind: "VIDEO", title: "Tax, compliance and conscience", order: 4, durationMinutes: 12, assetUrl: "https://stream.example/lesson-010", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-011", courseId: "crs-001", phaseId: "ph-002", kind: "VIDEO", title: "When the market pressures you", order: 5, durationMinutes: 14, assetUrl: "https://stream.example/lesson-011", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-012", courseId: "crs-001", phaseId: "ph-002", kind: "LIVE", title: "Peer workshop", order: 6, durationMinutes: 60, createdAt: iso(150), updatedAt: iso(150) },
  // crs-001 application
  { id: "les-013", courseId: "crs-001", phaseId: "ph-003", kind: "VIDEO", title: "Scoping your applied project", order: 1, durationMinutes: 10, assetUrl: "https://stream.example/lesson-013", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-014", courseId: "crs-001", phaseId: "ph-003", kind: "TEXT", title: "Project template", order: 2, durationMinutes: 5, bodyText: "Template.", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-015", courseId: "crs-001", phaseId: "ph-003", kind: "VIDEO", title: "Working with a mentor", order: 3, durationMinutes: 9, assetUrl: "https://stream.example/lesson-015", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-016", courseId: "crs-001", phaseId: "ph-003", kind: "TEXT", title: "Writing the report", order: 4, durationMinutes: 8, bodyText: "Guide.", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-017", courseId: "crs-001", phaseId: "ph-003", kind: "VIDEO", title: "Presenting outcomes", order: 5, durationMinutes: 11, assetUrl: "https://stream.example/lesson-017", createdAt: iso(150), updatedAt: iso(150) },
  { id: "les-018", courseId: "crs-001", phaseId: "ph-003", kind: "LIVE", title: "Cohort presentations", order: 6, durationMinutes: 90, createdAt: iso(150), updatedAt: iso(150) },
  // crs-002 (just first few, keep seed lighter)
  { id: "les-019", courseId: "crs-002", phaseId: "ph-004", kind: "VIDEO", title: "Why governance matters", order: 1, durationMinutes: 12, assetUrl: "https://stream.example/lesson-019", createdAt: iso(120), updatedAt: iso(120) },
  { id: "les-020", courseId: "crs-002", phaseId: "ph-004", kind: "VIDEO", title: "Frameworks for integrity", order: 2, durationMinutes: 14, assetUrl: "https://stream.example/lesson-020", createdAt: iso(120), updatedAt: iso(120) },
  { id: "les-021", courseId: "crs-002", phaseId: "ph-004", kind: "TEXT", title: "Case: procurement", order: 3, durationMinutes: 10, bodyText: "Case study.", createdAt: iso(120), updatedAt: iso(120) },
  { id: "les-022", courseId: "crs-002", phaseId: "ph-004", kind: "VIDEO", title: "Conflict of interest", order: 4, durationMinutes: 11, assetUrl: "https://stream.example/lesson-022", createdAt: iso(120), updatedAt: iso(120) },
  { id: "les-023", courseId: "crs-002", phaseId: "ph-004", kind: "LIVE", title: "Guest speaker", order: 5, durationMinutes: 45, createdAt: iso(120), updatedAt: iso(120) },
];

export const seedQuizzes: Quiz[] = [
  {
    id: "qz-001",
    courseId: "crs-001",
    phaseId: "ph-001",
    title: "Foundation gate",
    passMarkPct: 70,
    attemptLimit: 3,
    timeLimitMinutes: 30,
    questions: [
      {
        id: "qq-001",
        kind: "MULTIPLE_CHOICE",
        prompt: "Which verse most directly speaks to work as calling?",
        options: ["Genesis 1:28", "Psalm 23", "Matthew 5:3", "Revelation 21"],
        correctIndex: 0,
        explanation: "Genesis 1:28 is the creation mandate — the first commission to work.",
        points: 1,
      },
      {
        id: "qq-002",
        kind: "TRUE_FALSE",
        prompt: "Marketplace work is a lower calling than vocational ministry.",
        correctAnswer: "false",
        explanation: "The whole creation mandate sanctifies work in every sphere.",
        points: 1,
      },
      {
        id: "qq-003",
        kind: "SHORT_ANSWER",
        prompt: "In your own words, describe what stewardship of wealth looks like in a business setting.",
        correctAnswer: "open",
        explanation: "Assessed against the rubric in the cohort discussion.",
        points: 2,
      },
    ],
    updatedAt: iso(180),
  },
  {
    id: "qz-002",
    courseId: "crs-001",
    phaseId: "ph-002",
    title: "Specialisation gate",
    passMarkPct: 70,
    attemptLimit: 3,
    timeLimitMinutes: 30,
    questions: [
      {
        id: "qq-004",
        kind: "MULTIPLE_CHOICE",
        prompt: "What is the primary ethical risk in pricing decisions?",
        options: ["Under-pricing", "Exploiting information asymmetry", "Tax exposure", "Currency risk"],
        correctIndex: 1,
        explanation: "Exploiting information asymmetry is a recurring market failure.",
        points: 1,
      },
      {
        id: "qq-005",
        kind: "SHORT_ANSWER",
        prompt: "Describe one case where you faced market pressure that conflicted with your ethics.",
        correctAnswer: "open",
        explanation: "Assessed against the rubric.",
        points: 2,
      },
    ],
    updatedAt: iso(150),
  },
];

export const seedAssignments: Assignment[] = [
  {
    id: "as-001",
    courseId: "crs-001",
    phaseId: "ph-003",
    title: "Applied Kingdom Marketplace Project",
    instructions:
      "Design and describe one concrete intervention in your business or community that puts the Kingdom marketplace framework into practice. Include evidence, outcomes, and reflection.",
    submissionKind: "BOTH",
    dueDays: 21,
    rubric: [
      { id: "rb-001", label: "Clarity of problem", description: "Problem is well defined and contextualised.", weightPct: 25 },
      { id: "rb-002", label: "Framework alignment", description: "The intervention draws on course material.", weightPct: 25 },
      { id: "rb-003", label: "Evidence and outcomes", description: "Evidence or plausible outcomes described.", weightPct: 30 },
      { id: "rb-004", label: "Reflection", description: "Personal reflection demonstrates growth.", weightPct: 20 },
    ],
    updatedAt: iso(150),
  },
  {
    id: "as-002",
    courseId: "crs-002",
    phaseId: "ph-006",
    title: "Public Service Integrity Project",
    instructions:
      "Design one intervention in your public service context that strengthens integrity or accountability. Evidence and reflection required.",
    submissionKind: "BOTH",
    dueDays: 21,
    rubric: [
      { id: "rb-005", label: "Context", description: "Context well defined.", weightPct: 25 },
      { id: "rb-006", label: "Framework alignment", description: "Draws on course material.", weightPct: 25 },
      { id: "rb-007", label: "Measurable outcome", description: "Evidence of outcome.", weightPct: 30 },
      { id: "rb-008", label: "Reflection", description: "Personal reflection.", weightPct: 20 },
    ],
    updatedAt: iso(100),
  },
];

export const seedCohorts: Cohort[] = [
  {
    id: "co-001",
    courseId: "crs-001",
    courseTitle: "Kingdom Marketplace Foundations",
    name: "Foundation Cohort 2026-Q2",
    startsOn: iso(30),
    endsOn: future(60),
    capacity: 60,
    enrolled: 58,
    facilitatorIds: ["inst-001", "inst-002"],
    status: "RUNNING",
    currentPhase: "SPECIALISATION",
    completionRatePct: 71,
  },
  {
    id: "co-002",
    courseId: "crs-001",
    courseTitle: "Kingdom Marketplace Foundations",
    name: "Foundation Cohort 2026-Q3",
    startsOn: future(30),
    endsOn: future(120),
    capacity: 80,
    enrolled: 12,
    facilitatorIds: ["inst-001"],
    status: "PLANNED",
    currentPhase: "FOUNDATION",
    completionRatePct: 0,
  },
  {
    id: "co-003",
    courseId: "crs-002",
    courseTitle: "Governance and Integrity in Public Service",
    name: "Governance Cohort 2026-Q1",
    startsOn: iso(90),
    endsOn: iso(10),
    capacity: 50,
    enrolled: 47,
    facilitatorIds: ["inst-003"],
    status: "COMPLETED",
    currentPhase: "APPLICATION",
    completionRatePct: 68,
  },
  {
    id: "co-004",
    courseId: "crs-003",
    courseTitle: "Technology with Moral Grounding",
    name: "Technology Cohort 2026-Q2",
    startsOn: iso(14),
    endsOn: future(76),
    capacity: 40,
    enrolled: 43,
    facilitatorIds: ["inst-004"],
    status: "RUNNING",
    currentPhase: "FOUNDATION",
    completionRatePct: 74,
  },
];

export const seedEnrollments: Enrollment[] = [
  { id: "en-001", cohortId: "co-001", memberName: "Grace Wanjiru", memberNumber: "TEG-26-KU-0042", enrolledAt: iso(30), currentPhase: "SPECIALISATION", progressPct: 55 },
  { id: "en-002", cohortId: "co-001", memberName: "David Ochieng", memberNumber: "TEG-26-UON-0088", enrolledAt: iso(30), currentPhase: "SPECIALISATION", progressPct: 48 },
  { id: "en-003", cohortId: "co-001", memberName: "Faith Njeri", memberNumber: "TEG-26-STR-0014", enrolledAt: iso(30), currentPhase: "APPLICATION", progressPct: 82 },
  { id: "en-004", cohortId: "co-001", memberName: "James Kariuki", memberNumber: "TEG-26-NRB-0031", enrolledAt: iso(29), currentPhase: "FOUNDATION", progressPct: 22 },
  { id: "en-005", cohortId: "co-001", memberName: "Mercy Achieng", memberNumber: "TEG-26-KSM-0007", enrolledAt: iso(29), currentPhase: "SPECIALISATION", progressPct: 61, certificateId: "cert-001" },
  { id: "en-006", cohortId: "co-003", memberName: "Peter Mwangi", memberNumber: "TEG-26-KU-0091", enrolledAt: iso(90), currentPhase: "APPLICATION", progressPct: 100, certificateId: "cert-002" },
  { id: "en-007", cohortId: "co-004", memberName: "Esther Wambui", memberNumber: "TEG-26-UON-0122", enrolledAt: iso(14), currentPhase: "FOUNDATION", progressPct: 18 },
];

export const seedCertificates: Certificate[] = [
  {
    id: "cert-001",
    verificationId: "TEG-2026-001482",
    courseId: "crs-001",
    courseTitle: "Kingdom Marketplace Foundations",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    cohortId: "co-001",
    issuedAt: iso(20),
    status: "ISSUED",
  },
  {
    id: "cert-002",
    verificationId: "TEG-2026-001411",
    courseId: "crs-002",
    courseTitle: "Governance and Integrity in Public Service",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    cohortId: "co-003",
    issuedAt: iso(10),
    status: "ISSUED",
  },
  {
    id: "cert-003",
    verificationId: "TEG-2026-001398",
    courseId: "crs-001",
    courseTitle: "Kingdom Marketplace Foundations",
    memberName: "Samuel Otieno",
    memberNumber: "TEG-26-NRB-0044",
    cohortId: "co-001",
    issuedAt: iso(28),
    status: "REVOKED",
    revokedAt: iso(12),
    revocationReason: "Academic integrity violation — plagiarism confirmed by instructor review.",
  },
];

export const seedInstructors: Instructor[] = [
  {
    id: "inst-001",
    name: "Pastor James Mwangi",
    initials: "JM",
    email: "james@teg.org",
    courseIds: ["crs-001", "crs-004"],
    activeCohorts: 2,
    submissionsGraded30d: 48,
    avgGradingHours: 22,
    status: "ACTIVE",
  },
  {
    id: "inst-002",
    name: "Dr. Elizabeth Karanja",
    initials: "EK",
    email: "elizabeth@teg.org",
    courseIds: ["crs-001"],
    activeCohorts: 1,
    submissionsGraded30d: 31,
    avgGradingHours: 18,
    status: "ACTIVE",
  },
  {
    id: "inst-003",
    name: "Hon. Peter Njoroge",
    initials: "PN",
    email: "peter.n@teg.org",
    courseIds: ["crs-002"],
    activeCohorts: 1,
    submissionsGraded30d: 24,
    avgGradingHours: 26,
    status: "ACTIVE",
  },
  {
    id: "inst-004",
    name: "Grace Otieno",
    initials: "GO",
    email: "grace.o@teg.org",
    courseIds: ["crs-003"],
    activeCohorts: 1,
    submissionsGraded30d: 18,
    avgGradingHours: 20,
    status: "ACTIVE",
  },
  {
    id: "inst-005",
    name: "Rev. Daniel Kip",
    initials: "DK",
    email: "daniel@teg.org",
    courseIds: [],
    activeCohorts: 0,
    submissionsGraded30d: 0,
    avgGradingHours: 0,
    status: "ON_LEAVE",
  },
];

export const seedContentLibrary: ContentAsset[] = [
  { id: "ca-001", name: "Called to the marketplace.mp4", kind: "VIDEO", sizeMb: 84.2, url: "https://stream.example/lesson-001", usageCount: 1, uploadedBy: "inst-001", uploadedAt: iso(180) },
  { id: "ca-002", name: "Kingdom economics reading.pdf", kind: "PDF", sizeMb: 2.4, url: "https://assets.example/kingdom-economics.pdf", usageCount: 1, uploadedBy: "inst-001", uploadedAt: iso(180) },
  { id: "ca-003", name: "TEG brand banner.png", kind: "IMAGE", sizeMb: 0.8, url: "https://assets.example/banner.png", usageCount: 6, uploadedBy: "u-admin-01", uploadedAt: iso(120) },
  { id: "ca-004", name: "Ethics case study.pdf", kind: "PDF", sizeMb: 1.1, url: "https://assets.example/ethics.pdf", usageCount: 3, uploadedBy: "inst-003", uploadedAt: iso(100) },
  { id: "ca-005", name: "Guest lecture — data stewardship.mp4", kind: "VIDEO", sizeMb: 128.5, url: "https://stream.example/guest-01", usageCount: 2, uploadedBy: "inst-004", uploadedAt: iso(60) },
];

export const seedAnalytics: LearningAnalytics[] = [
  {
    period: "Last 30 days",
    enrolments: 62,
    completions: 34,
    completionRatePct: 55,
    dropOffsByLesson: [
      { lessonTitle: "Called to the marketplace", dropOffPct: 2 },
      { lessonTitle: "The theology of work", dropOffPct: 4 },
      { lessonTitle: "Wealth, poverty and stewardship", dropOffPct: 7 },
      { lessonTitle: "Kingdom economics reading", dropOffPct: 18 },
      { lessonTitle: "The marketplace as mission field", dropOffPct: 9 },
      { lessonTitle: "Live Q&A", dropOffPct: 6 },
    ],
    avgTimeToCompleteDays: 71,
    byPillar: [
      { pillar: "MARKETPLACE", enrolments: 34, completionPct: 71 },
      { pillar: "GOVERNANCE", enrolments: 14, completionPct: 68 },
      { pillar: "TECHNOLOGY", enrolments: 14, completionPct: 74 },
    ],
  },
];

// ─────────────────────────────────────────────────────────────
// Permission helpers
// ─────────────────────────────────────────────────────────────

type AllowedRole = MockUser["role"];

const LEARNING_READERS: AllowedRole[] = [
  "ADMIN",
  "SUPER_ADMIN",
  "MENTOR",
  "INSTRUCTOR",
  "CHAPTER_LEADER",
];

const LEARNING_AUTHORS: AllowedRole[] = ["ADMIN", "SUPER_ADMIN", "INSTRUCTOR"];
const LEARNING_GRADERS: AllowedRole[] = ["ADMIN", "SUPER_ADMIN", "MENTOR", "INSTRUCTOR"];
const LEARNING_COHORT_MANAGERS: AllowedRole[] = ["ADMIN", "SUPER_ADMIN", "INSTRUCTOR"];
const LEARNING_CERT_MANAGERS: AllowedRole[] = ["ADMIN", "SUPER_ADMIN"];

function hasRole(user: MockUser | null, roles: AllowedRole[]): boolean {
  return user !== null && roles.includes(user.role);
}

export function canViewLearning(): boolean {
  return hasRole(getCurrentUser(), LEARNING_READERS);
}

export function canAuthorCourses(): boolean {
  return hasRole(getCurrentUser(), LEARNING_AUTHORS);
}

export function canGrade(): boolean {
  return hasRole(getCurrentUser(), LEARNING_GRADERS);
}

export function canManageCohorts(): boolean {
  return hasRole(getCurrentUser(), LEARNING_COHORT_MANAGERS);
}

export function canManageCertificates(): boolean {
  return hasRole(getCurrentUser(), LEARNING_CERT_MANAGERS);
}

// ─────────────────────────────────────────────────────────────
// RLS-aware accessors
// ─────────────────────────────────────────────────────────────

export function getCourses(): Course[] {
  if (!canViewLearning()) return [];
  return [...seedCourses].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCourseById(id: string): Course | null {
  if (!canViewLearning()) return null;
  return seedCourses.find((c) => c.id === id) ?? null;
}

export function getPhasesByCourse(courseId: string): CoursePhase[] {
  if (!canViewLearning()) return [];
  return seedPhases
    .filter((p) => p.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getLessonsByCourse(courseId: string): Lesson[] {
  if (!canViewLearning()) return [];
  return seedLessons
    .filter((l) => l.courseId === courseId)
    .sort((a, b) => a.order - b.order);
}

export function getQuizByPhase(phaseId: string): Quiz | null {
  if (!canViewLearning()) return null;
  return seedQuizzes.find((q) => q.phaseId === phaseId) ?? null;
}

export function getAssignmentByPhase(phaseId: string): Assignment | null {
  if (!canViewLearning()) return null;
  return seedAssignments.find((a) => a.phaseId === phaseId) ?? null;
}

export function getCohorts(): Cohort[] {
  if (!canViewLearning()) return [];
  return [...seedCohorts].sort((a, b) => b.startsOn.localeCompare(a.startsOn));
}

export function getCohortById(id: string): Cohort | null {
  if (!canViewLearning()) return null;
  return seedCohorts.find((c) => c.id === id) ?? null;
}

export function getEnrollmentsByCohort(cohortId: string): Enrollment[] {
  if (!canViewLearning()) return [];
  return seedEnrollments.filter((e) => e.cohortId === cohortId);
}

export function getCertificates(): Certificate[] {
  if (!canViewLearning()) return [];
  return [...seedCertificates].sort((a, b) =>
    b.issuedAt.localeCompare(a.issuedAt)
  );
}

export function getInstructors(): Instructor[] {
  if (!canViewLearning()) return [];
  return [...seedInstructors].sort((a, b) => a.name.localeCompare(b.name));
}

export function getContentLibrary(): ContentAsset[] {
  if (!canViewLearning()) return [];
  return [...seedContentLibrary].sort((a, b) =>
    b.uploadedAt.localeCompare(a.uploadedAt)
  );
}

export function getAnalytics(): LearningAnalytics[] {
  if (!canViewLearning()) return [];
  return [...seedAnalytics];
}

// ─────────────────────────────────────────────────────────────
// Derived counts
// ─────────────────────────────────────────────────────────────

export function getCourseCounts() {
  const courses = canViewLearning() ? seedCourses : [];
  return {
    total: courses.length,
    published: courses.filter((c) => c.status === "PUBLISHED").length,
    draft: courses.filter((c) => c.status === "DRAFT").length,
    archived: courses.filter((c) => c.status === "ARCHIVED").length,
  };
}

export function getCohortCounts() {
  const cohorts = canViewLearning() ? seedCohorts : [];
  return {
    total: cohorts.length,
    planned: cohorts.filter((c) => c.status === "PLANNED").length,
    running: cohorts.filter((c) => c.status === "RUNNING").length,
    completed: cohorts.filter((c) => c.status === "COMPLETED").length,
    archived: cohorts.filter((c) => c.status === "ARCHIVED").length,
  };
}

export function getCertificateCounts() {
  const certs = canViewLearning() ? seedCertificates : [];
  return {
    total: certs.length,
    issued: certs.filter((c) => c.status === "ISSUED").length,
    revoked: certs.filter((c) => c.status === "REVOKED").length,
  };
}

export function getInstructorCounts() {
  const inst = canViewLearning() ? seedInstructors : [];
  return {
    total: inst.length,
    active: inst.filter((i) => i.status === "ACTIVE").length,
    onLeave: inst.filter((i) => i.status === "ON_LEAVE").length,
    offBoarded: inst.filter((i) => i.status === "OFF_BOARDED").length,
  };
}

// Grading queue: submissions awaiting grading (mocked as a fixed set)
export interface GradingSubmission {
  id: string;
  reference: string;
  assignmentId: string;
  assignmentTitle: string;
  cohortId: string;
  cohortName: string;
  memberName: string;
  memberNumber: string;
  submittedAt: string;
  attempt: number;
  kind: "TEXT" | "FILE" | "BOTH";
  status: "AWAITING_GRADING" | "GRADED";
  gradePct?: number;
  feedback?: string;
  gradedBy?: string;
  gradedAt?: string;
}

export const seedGradingQueue: GradingSubmission[] = [
  {
    id: "sub-001",
    reference: "SUB-26-00248",
    assignmentId: "as-001",
    assignmentTitle: "Applied Kingdom Marketplace Project",
    cohortId: "co-001",
    cohortName: "Foundation Cohort 2026-Q2",
    memberName: "Faith Njeri",
    memberNumber: "TEG-26-STR-0014",
    submittedAt: iso(0, 4),
    attempt: 1,
    kind: "BOTH",
    status: "AWAITING_GRADING",
  },
  {
    id: "sub-002",
    reference: "SUB-26-00247",
    assignmentId: "as-001",
    assignmentTitle: "Applied Kingdom Marketplace Project",
    cohortId: "co-001",
    cohortName: "Foundation Cohort 2026-Q2",
    memberName: "Mercy Achieng",
    memberNumber: "TEG-26-KSM-0007",
    submittedAt: iso(1, 2),
    attempt: 1,
    kind: "BOTH",
    status: "AWAITING_GRADING",
  },
  {
    id: "sub-003",
    reference: "SUB-26-00246",
    assignmentId: "as-002",
    assignmentTitle: "Public Service Integrity Project",
    cohortId: "co-003",
    cohortName: "Governance Cohort 2026-Q1",
    memberName: "Peter Mwangi",
    memberNumber: "TEG-26-KU-0091",
    submittedAt: iso(3),
    attempt: 1,
    kind: "BOTH",
    status: "GRADED",
    gradePct: 82,
    feedback: "Strong context and clear outcome. Reflection could go deeper.",
    gradedBy: "inst-003",
    gradedAt: iso(2),
  },
];

export function getGradingQueue(): GradingSubmission[] {
  if (!canViewLearning()) return [];
  return [...seedGradingQueue].sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt)
  );
}

export function getGradingCounts() {
  const subs = canViewLearning() ? seedGradingQueue : [];
  return {
    total: subs.length,
    awaiting: subs.filter((s) => s.status === "AWAITING_GRADING").length,
    graded: subs.filter((s) => s.status === "GRADED").length,
  };
}